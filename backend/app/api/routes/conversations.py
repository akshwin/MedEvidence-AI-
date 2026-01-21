"""
Conversation routes: save, load, list, search, delete, share conversations
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel
import json
import secrets

from app.database import get_db
from app.models.user import User
from app.models.conversation import Conversation, Message
from app.api.routes.auth import get_current_user

router = APIRouter()


# Pydantic models
class MessageCreate(BaseModel):
    role: str  # 'user' or 'assistant'
    content: str
    citations: Optional[List[dict]] = None


class ConversationCreate(BaseModel):
    title: Optional[str] = None
    messages: List[MessageCreate]


class ConversationResponse(BaseModel):
    id: str
    title: Optional[str]
    created_at: datetime
    updated_at: datetime
    message_count: int
    is_archived: bool
    is_shared: bool
    share_token: Optional[str] = None

    class Config:
        from_attributes = True


class ConversationDetailResponse(BaseModel):
    id: str
    title: Optional[str]
    created_at: datetime
    updated_at: datetime
    is_archived: bool
    is_shared: bool
    share_token: Optional[str] = None
    messages: List[dict]

    class Config:
        from_attributes = True


class ConversationUpdate(BaseModel):
    title: Optional[str] = None
    is_archived: Optional[bool] = None


def generate_share_token() -> str:
    """Generate a unique share token"""
    return secrets.token_urlsafe(32)


@router.post("/", response_model=ConversationResponse, status_code=status.HTTP_201_CREATED)
async def create_conversation(
    conversation_data: ConversationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new conversation with messages"""
    # Generate title from first user message if not provided
    title = conversation_data.title
    if not title and conversation_data.messages:
        first_user_message = next((m for m in conversation_data.messages if m.role == 'user'), None)
        if first_user_message:
            title = first_user_message.content[:100] + ('...' if len(first_user_message.content) > 100 else '')
    
    # Create conversation
    conversation = Conversation(
        user_id=current_user.id,
        title=title or "New Conversation"
    )
    db.add(conversation)
    db.flush()  # Get the conversation ID
    
    # Create messages
    for msg_data in conversation_data.messages:
        citations_json = None
        if msg_data.citations:
            citations_json = json.dumps(msg_data.citations)
        
        message = Message(
            conversation_id=conversation.id,
            role=msg_data.role,
            content=msg_data.content,
            citations_json=citations_json
        )
        db.add(message)
    
    db.commit()
    db.refresh(conversation)
    
    return ConversationResponse(
        id=conversation.id,
        title=conversation.title,
        created_at=conversation.created_at,
        updated_at=conversation.updated_at,
        message_count=len(conversation_data.messages),
        is_archived=conversation.is_archived,
        is_shared=conversation.is_shared,
        share_token=conversation.share_token
    )


@router.get("/", response_model=List[ConversationResponse])
async def list_conversations(
    archived: Optional[bool] = Query(None, description="Filter by archived status"),
    search: Optional[str] = Query(None, description="Search in titles and messages"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List user's conversations"""
    query = db.query(Conversation).filter(Conversation.user_id == current_user.id)
    
    # Filter by archived status
    if archived is not None:
        query = query.filter(Conversation.is_archived == archived)
    else:
        # By default, don't show archived
        query = query.filter(Conversation.is_archived == False)
    
    # Search functionality
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                Conversation.title.ilike(search_term),
                Conversation.id.in_(
                    db.query(Message.conversation_id).filter(
                        Message.content.ilike(search_term)
                    ).distinct()
                )
            )
        )
    
    # Order by updated_at descending
    conversations = query.order_by(Conversation.updated_at.desc()).offset(offset).limit(limit).all()
    
    # Get message counts
    result = []
    for conv in conversations:
        message_count = db.query(Message).filter(Message.conversation_id == conv.id).count()
        result.append(ConversationResponse(
            id=conv.id,
            title=conv.title,
            created_at=conv.created_at,
            updated_at=conv.updated_at,
            message_count=message_count,
            is_archived=conv.is_archived,
            is_shared=conv.is_shared,
            share_token=conv.share_token
        ))
    
    return result


@router.get("/{conversation_id}", response_model=ConversationDetailResponse)
async def get_conversation(
    conversation_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific conversation with all messages"""
    conversation = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.user_id == current_user.id
    ).first()
    
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )
    
    # Get messages
    messages = db.query(Message).filter(
        Message.conversation_id == conversation_id
    ).order_by(Message.created_at).all()
    
    # Format messages
    formatted_messages = []
    for msg in messages:
        message_dict = {
            "role": msg.role,
            "content": msg.content,
            "created_at": msg.created_at.isoformat()
        }
        if msg.citations_json:
            try:
                message_dict["citations"] = json.loads(msg.citations_json)
            except:
                message_dict["citations"] = []
        formatted_messages.append(message_dict)
    
    return ConversationDetailResponse(
        id=conversation.id,
        title=conversation.title,
        created_at=conversation.created_at,
        updated_at=conversation.updated_at,
        is_archived=conversation.is_archived,
        is_shared=conversation.is_shared,
        share_token=conversation.share_token,
        messages=formatted_messages
    )


@router.put("/{conversation_id}", response_model=ConversationResponse)
async def update_conversation(
    conversation_id: str,
    update_data: ConversationUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update conversation (title, archived status)"""
    conversation = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.user_id == current_user.id
    ).first()
    
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )
    
    if update_data.title is not None:
        conversation.title = update_data.title
    if update_data.is_archived is not None:
        conversation.is_archived = update_data.is_archived
    
    conversation.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(conversation)
    
    message_count = db.query(Message).filter(Message.conversation_id == conversation.id).count()
    
    return ConversationResponse(
        id=conversation.id,
        title=conversation.title,
        created_at=conversation.created_at,
        updated_at=conversation.updated_at,
        message_count=message_count,
        is_archived=conversation.is_archived,
        is_shared=conversation.is_shared,
        share_token=conversation.share_token
    )


@router.delete("/{conversation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_conversation(
    conversation_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a conversation"""
    conversation = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.user_id == current_user.id
    ).first()
    
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )
    
    db.delete(conversation)
    db.commit()
    
    return None


@router.post("/{conversation_id}/share", response_model=dict)
async def share_conversation(
    conversation_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate a share token for a conversation"""
    conversation = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.user_id == current_user.id
    ).first()
    
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )
    
    # Generate share token if not exists
    if not conversation.share_token:
        conversation.share_token = generate_share_token()
        conversation.is_shared = True
        db.commit()
    
    return {
        "share_token": conversation.share_token,
        "share_url": f"/shared/{conversation.share_token}"
    }


@router.delete("/{conversation_id}/share", response_model=dict)
async def unshare_conversation(
    conversation_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Remove share token from a conversation"""
    conversation = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.user_id == current_user.id
    ).first()
    
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )
    
    conversation.share_token = None
    conversation.is_shared = False
    db.commit()
    
    return {"message": "Conversation unshared successfully"}


@router.get("/shared/{share_token}", response_model=ConversationDetailResponse)
async def get_shared_conversation(
    share_token: str,
    db: Session = Depends(get_db)
):
    """Get a shared conversation (no authentication required)"""
    conversation = db.query(Conversation).filter(
        Conversation.share_token == share_token,
        Conversation.is_shared == True
    ).first()
    
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shared conversation not found"
        )
    
    # Get messages
    messages = db.query(Message).filter(
        Message.conversation_id == conversation.id
    ).order_by(Message.created_at).all()
    
    # Format messages
    formatted_messages = []
    for msg in messages:
        message_dict = {
            "role": msg.role,
            "content": msg.content,
            "created_at": msg.created_at.isoformat()
        }
        if msg.citations_json:
            try:
                message_dict["citations"] = json.loads(msg.citations_json)
            except:
                message_dict["citations"] = []
        formatted_messages.append(message_dict)
    
    return ConversationDetailResponse(
        id=conversation.id,
        title=conversation.title,
        created_at=conversation.created_at,
        updated_at=conversation.updated_at,
        is_archived=conversation.is_archived,
        is_shared=conversation.is_shared,
        share_token=conversation.share_token,
        messages=formatted_messages
    )







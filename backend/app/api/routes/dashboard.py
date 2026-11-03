"""
Dashboard routes: user dashboard features including saved queries, bookmarks, reading lists, notes, alerts, activity, and statistics
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, and_, Integer, cast
from typing import List, Optional
from datetime import datetime, timedelta
from pydantic import BaseModel
import json

from app.database import get_db
from app.models.user import User
from app.models.conversation import Conversation, Message
from app.models.dashboard import (
    SavedQuery,
    Bookmark,
    ReadingList,
    ReadingListPaper,
    PaperNote,
    Alert,
    UserActivity,
    ApiUsage,
    PerformanceMetric,
    PaperAnnotation,
    PaperComparison,
    PaperRecommendation,
)
from app.api.routes.auth import get_current_user

router = APIRouter()


# ==================== Pydantic Models ====================


class SavedQueryCreate(BaseModel):
    query_text: str
    query_type: str = "search"  # 'search' or 'chat'
    results_count: Optional[int] = None
    metadata: Optional[dict] = None


class SavedQueryResponse(BaseModel):
    id: str
    query_text: str
    query_type: str
    results_count: Optional[int]
    created_at: datetime
    metadata: Optional[dict] = None

    class Config:
        from_attributes = True


class BookmarkCreate(BaseModel):
    paper_id: str  # PMID
    paper_title: Optional[str] = None
    paper_authors: Optional[List[str]] = None
    paper_year: Optional[int] = None
    paper_journal: Optional[str] = None
    notes: Optional[str] = None


class BookmarkResponse(BaseModel):
    id: str
    paper_id: str
    paper_title: Optional[str]
    paper_authors: Optional[List[str]]
    paper_year: Optional[int]
    paper_journal: Optional[str]
    notes: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class ReadingListCreate(BaseModel):
    name: str
    description: Optional[str] = None
    is_public: bool = False


class ReadingListResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]
    created_at: datetime
    updated_at: datetime
    is_public: bool
    paper_count: int = 0

    class Config:
        from_attributes = True


class ReadingListPaperAdd(BaseModel):
    paper_id: str  # PMID
    paper_title: Optional[str] = None
    paper_authors: Optional[List[str]] = None
    paper_year: Optional[int] = None
    paper_journal: Optional[str] = None
    notes: Optional[str] = None


class ReadingListDetailResponse(ReadingListResponse):
    papers: List[dict] = []


class PaperNoteCreate(BaseModel):
    paper_id: str  # PMID
    paper_title: Optional[str] = None
    title: Optional[str] = None
    content: str
    tags: Optional[List[str]] = None


class PaperNoteResponse(BaseModel):
    id: str
    paper_id: str
    paper_title: Optional[str]
    title: Optional[str]
    content: str
    tags: Optional[List[str]]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AlertCreate(BaseModel):
    name: str
    query: str
    frequency: str = "daily"  # 'daily', 'weekly', 'monthly'
    filters: Optional[dict] = None


class AlertResponse(BaseModel):
    id: str
    name: str
    query: str
    is_active: bool
    frequency: str
    last_checked: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    filters: Optional[dict] = None

    class Config:
        from_attributes = True


class ActivityResponse(BaseModel):
    id: str
    activity_type: str
    activity_data: dict
    created_at: datetime

    class Config:
        from_attributes = True


class DashboardStatsResponse(BaseModel):
    total_conversations: int
    total_messages: int
    total_bookmarks: int
    total_reading_lists: int
    total_notes: int
    total_saved_queries: int
    total_alerts: int
    recent_activity_count: int
    conversations_this_week: int
    messages_this_week: int


# ==================== Saved Queries ====================


@router.post("/queries", response_model=SavedQueryResponse, status_code=status.HTTP_201_CREATED)
async def save_query(
    query_data: SavedQueryCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Save a query/search"""
    metadata_json = json.dumps(query_data.metadata) if query_data.metadata else None

    saved_query = SavedQuery(
        user_id=current_user.id,
        query_text=query_data.query_text,
        query_type=query_data.query_type,
        results_count=query_data.results_count,
        metadata_json=metadata_json,
    )

    db.add(saved_query)

    # Log activity
    activity = UserActivity(
        user_id=current_user.id,
        activity_type="saved_query",
        activity_data_json=json.dumps(
            {"query_text": query_data.query_text, "query_type": query_data.query_type}
        ),
    )
    db.add(activity)

    db.commit()
    db.refresh(saved_query)

    return SavedQueryResponse(
        id=saved_query.id,
        query_text=saved_query.query_text,
        query_type=saved_query.query_type,
        results_count=saved_query.results_count,
        created_at=saved_query.created_at,
        metadata=json.loads(saved_query.metadata_json) if saved_query.metadata_json else None,
    )


@router.get("/queries", response_model=List[SavedQueryResponse])
async def list_saved_queries(
    query_type: Optional[str] = Query(None, description="Filter by query type"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List saved queries"""
    query = db.query(SavedQuery).filter(SavedQuery.user_id == current_user.id)

    if query_type:
        query = query.filter(SavedQuery.query_type == query_type)

    queries = query.order_by(desc(SavedQuery.created_at)).offset(offset).limit(limit).all()

    result = []
    for q in queries:
        result.append(
            SavedQueryResponse(
                id=q.id,
                query_text=q.query_text,
                query_type=q.query_type,
                results_count=q.results_count,
                created_at=q.created_at,
                metadata=json.loads(q.metadata_json) if q.metadata_json else None,
            )
        )

    return result


@router.delete("/queries/{query_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_saved_query(
    query_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    """Delete a saved query"""
    query = (
        db.query(SavedQuery)
        .filter(and_(SavedQuery.id == query_id, SavedQuery.user_id == current_user.id))
        .first()
    )

    if not query:
        raise HTTPException(status_code=404, detail="Saved query not found")

    db.delete(query)
    db.commit()

    return None


# ==================== Bookmarks ====================


@router.post("/bookmarks", response_model=BookmarkResponse, status_code=status.HTTP_201_CREATED)
async def create_bookmark(
    bookmark_data: BookmarkCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Bookmark a paper"""
    # Check if already bookmarked
    existing = (
        db.query(Bookmark)
        .filter(
            and_(Bookmark.user_id == current_user.id, Bookmark.paper_id == bookmark_data.paper_id)
        )
        .first()
    )

    if existing:
        raise HTTPException(status_code=400, detail="Paper already bookmarked")

    authors_json = json.dumps(bookmark_data.paper_authors) if bookmark_data.paper_authors else None

    bookmark = Bookmark(
        user_id=current_user.id,
        paper_id=bookmark_data.paper_id,
        paper_title=bookmark_data.paper_title,
        paper_authors=authors_json,
        paper_year=bookmark_data.paper_year,
        paper_journal=bookmark_data.paper_journal,
        notes=bookmark_data.notes,
    )

    db.add(bookmark)

    # Log activity
    activity = UserActivity(
        user_id=current_user.id,
        activity_type="bookmark",
        activity_data_json=json.dumps(
            {"paper_id": bookmark_data.paper_id, "paper_title": bookmark_data.paper_title}
        ),
    )
    db.add(activity)

    db.commit()
    db.refresh(bookmark)

    return BookmarkResponse(
        id=bookmark.id,
        paper_id=bookmark.paper_id,
        paper_title=bookmark.paper_title,
        paper_authors=json.loads(bookmark.paper_authors) if bookmark.paper_authors else None,
        paper_year=bookmark.paper_year,
        paper_journal=bookmark.paper_journal,
        notes=bookmark.notes,
        created_at=bookmark.created_at,
    )


@router.get("/bookmarks", response_model=List[BookmarkResponse])
async def list_bookmarks(
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List bookmarked papers"""
    bookmarks = (
        db.query(Bookmark)
        .filter(Bookmark.user_id == current_user.id)
        .order_by(desc(Bookmark.created_at))
        .offset(offset)
        .limit(limit)
        .all()
    )

    result = []
    for b in bookmarks:
        result.append(
            BookmarkResponse(
                id=b.id,
                paper_id=b.paper_id,
                paper_title=b.paper_title,
                paper_authors=json.loads(b.paper_authors) if b.paper_authors else None,
                paper_year=b.paper_year,
                paper_journal=b.paper_journal,
                notes=b.notes,
                created_at=b.created_at,
            )
        )

    return result


@router.delete("/bookmarks/{bookmark_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_bookmark(
    bookmark_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    """Remove a bookmark"""
    bookmark = (
        db.query(Bookmark)
        .filter(and_(Bookmark.id == bookmark_id, Bookmark.user_id == current_user.id))
        .first()
    )

    if not bookmark:
        raise HTTPException(status_code=404, detail="Bookmark not found")

    db.delete(bookmark)
    db.commit()

    return None


@router.get("/bookmarks/check/{paper_id}", response_model=dict)
async def check_bookmark(
    paper_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    """Check if a paper is bookmarked"""
    bookmark = (
        db.query(Bookmark)
        .filter(and_(Bookmark.user_id == current_user.id, Bookmark.paper_id == paper_id))
        .first()
    )

    return {"is_bookmarked": bookmark is not None, "bookmark_id": bookmark.id if bookmark else None}


# ==================== Reading Lists ====================


@router.post(
    "/reading-lists", response_model=ReadingListResponse, status_code=status.HTTP_201_CREATED
)
async def create_reading_list(
    list_data: ReadingListCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a reading list"""
    reading_list = ReadingList(
        user_id=current_user.id,
        name=list_data.name,
        description=list_data.description,
        is_public=list_data.is_public,
    )

    db.add(reading_list)

    # Log activity
    activity = UserActivity(
        user_id=current_user.id,
        activity_type="reading_list",
        activity_data_json=json.dumps({"action": "created", "list_name": list_data.name}),
    )
    db.add(activity)

    db.commit()
    db.refresh(reading_list)

    return ReadingListResponse(
        id=reading_list.id,
        name=reading_list.name,
        description=reading_list.description,
        created_at=reading_list.created_at,
        updated_at=reading_list.updated_at,
        is_public=reading_list.is_public,
        paper_count=0,
    )


@router.get("/reading-lists", response_model=List[ReadingListResponse])
async def list_reading_lists(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    """List reading lists"""
    lists = (
        db.query(ReadingList)
        .filter(ReadingList.user_id == current_user.id)
        .order_by(desc(ReadingList.updated_at))
        .all()
    )

    result = []
    for lst in lists:
        paper_count = (
            db.query(ReadingListPaper).filter(ReadingListPaper.reading_list_id == lst.id).count()
        )

        result.append(
            ReadingListResponse(
                id=lst.id,
                name=lst.name,
                description=lst.description,
                created_at=lst.created_at,
                updated_at=lst.updated_at,
                is_public=lst.is_public,
                paper_count=paper_count,
            )
        )

    return result


@router.get("/reading-lists/{list_id}", response_model=ReadingListDetailResponse)
async def get_reading_list(
    list_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    """Get reading list details with papers"""
    reading_list = (
        db.query(ReadingList)
        .filter(and_(ReadingList.id == list_id, ReadingList.user_id == current_user.id))
        .first()
    )

    if not reading_list:
        raise HTTPException(status_code=404, detail="Reading list not found")

    papers = (
        db.query(ReadingListPaper)
        .filter(ReadingListPaper.reading_list_id == list_id)
        .order_by(desc(ReadingListPaper.added_at))
        .all()
    )

    papers_data = []
    for p in papers:
        papers_data.append(
            {
                "id": p.id,
                "paper_id": p.paper_id,
                "paper_title": p.paper_title,
                "paper_authors": json.loads(p.paper_authors) if p.paper_authors else None,
                "paper_year": p.paper_year,
                "paper_journal": p.paper_journal,
                "notes": p.notes,
                "added_at": p.added_at.isoformat(),
            }
        )

    return ReadingListDetailResponse(
        id=reading_list.id,
        name=reading_list.name,
        description=reading_list.description,
        created_at=reading_list.created_at,
        updated_at=reading_list.updated_at,
        is_public=reading_list.is_public,
        paper_count=len(papers_data),
        papers=papers_data,
    )


@router.post(
    "/reading-lists/{list_id}/papers", response_model=dict, status_code=status.HTTP_201_CREATED
)
async def add_paper_to_reading_list(
    list_id: str,
    paper_data: ReadingListPaperAdd,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Add a paper to a reading list"""
    reading_list = (
        db.query(ReadingList)
        .filter(and_(ReadingList.id == list_id, ReadingList.user_id == current_user.id))
        .first()
    )

    if not reading_list:
        raise HTTPException(status_code=404, detail="Reading list not found")

    # Check if paper already in list
    existing = (
        db.query(ReadingListPaper)
        .filter(
            and_(
                ReadingListPaper.reading_list_id == list_id,
                ReadingListPaper.paper_id == paper_data.paper_id,
            )
        )
        .first()
    )

    if existing:
        raise HTTPException(status_code=400, detail="Paper already in reading list")

    authors_json = json.dumps(paper_data.paper_authors) if paper_data.paper_authors else None

    list_paper = ReadingListPaper(
        reading_list_id=list_id,
        paper_id=paper_data.paper_id,
        paper_title=paper_data.paper_title,
        paper_authors=authors_json,
        paper_year=paper_data.paper_year,
        paper_journal=paper_data.paper_journal,
        notes=paper_data.notes,
    )

    db.add(list_paper)
    reading_list.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(list_paper)

    return {"id": list_paper.id, "message": "Paper added to reading list"}


@router.delete("/reading-lists/{list_id}/papers/{paper_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_paper_from_reading_list(
    list_id: str,
    paper_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Remove a paper from a reading list"""
    reading_list = (
        db.query(ReadingList)
        .filter(and_(ReadingList.id == list_id, ReadingList.user_id == current_user.id))
        .first()
    )

    if not reading_list:
        raise HTTPException(status_code=404, detail="Reading list not found")

    list_paper = (
        db.query(ReadingListPaper)
        .filter(
            and_(ReadingListPaper.reading_list_id == list_id, ReadingListPaper.paper_id == paper_id)
        )
        .first()
    )

    if not list_paper:
        raise HTTPException(status_code=404, detail="Paper not found in reading list")

    db.delete(list_paper)
    reading_list.updated_at = datetime.utcnow()
    db.commit()

    return None


@router.delete("/reading-lists/{list_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_reading_list(
    list_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    """Delete a reading list"""
    reading_list = (
        db.query(ReadingList)
        .filter(and_(ReadingList.id == list_id, ReadingList.user_id == current_user.id))
        .first()
    )

    if not reading_list:
        raise HTTPException(status_code=404, detail="Reading list not found")

    db.delete(reading_list)
    db.commit()

    return None


# ==================== Paper Notes ====================


@router.post("/notes", response_model=PaperNoteResponse, status_code=status.HTTP_201_CREATED)
async def create_note(
    note_data: PaperNoteCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a note on a paper"""
    tags_json = json.dumps(note_data.tags) if note_data.tags else None

    note = PaperNote(
        user_id=current_user.id,
        paper_id=note_data.paper_id,
        paper_title=note_data.paper_title,
        title=note_data.title,
        content=note_data.content,
        tags_json=tags_json,
    )

    db.add(note)

    # Log activity
    activity = UserActivity(
        user_id=current_user.id,
        activity_type="note",
        activity_data_json=json.dumps({"paper_id": note_data.paper_id, "action": "created"}),
    )
    db.add(activity)

    db.commit()
    db.refresh(note)

    return PaperNoteResponse(
        id=note.id,
        paper_id=note.paper_id,
        paper_title=note.paper_title,
        title=note.title,
        content=note.content,
        tags=json.loads(note.tags_json) if note.tags_json else None,
        created_at=note.created_at,
        updated_at=note.updated_at,
    )


@router.get("/notes", response_model=List[PaperNoteResponse])
async def list_notes(
    paper_id: Optional[str] = Query(None, description="Filter by paper ID"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List notes"""
    query = db.query(PaperNote).filter(PaperNote.user_id == current_user.id)

    if paper_id:
        query = query.filter(PaperNote.paper_id == paper_id)

    notes = query.order_by(desc(PaperNote.updated_at)).offset(offset).limit(limit).all()

    result = []
    for n in notes:
        result.append(
            PaperNoteResponse(
                id=n.id,
                paper_id=n.paper_id,
                paper_title=n.paper_title,
                title=n.title,
                content=n.content,
                tags=json.loads(n.tags_json) if n.tags_json else None,
                created_at=n.created_at,
                updated_at=n.updated_at,
            )
        )

    return result


@router.put("/notes/{note_id}", response_model=PaperNoteResponse)
async def update_note(
    note_id: str,
    note_data: PaperNoteCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update a note"""
    note = (
        db.query(PaperNote)
        .filter(and_(PaperNote.id == note_id, PaperNote.user_id == current_user.id))
        .first()
    )

    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    note.paper_id = note_data.paper_id
    note.paper_title = note_data.paper_title
    note.title = note_data.title
    note.content = note_data.content
    note.tags_json = json.dumps(note_data.tags) if note_data.tags else None
    note.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(note)

    return PaperNoteResponse(
        id=note.id,
        paper_id=note.paper_id,
        paper_title=note.paper_title,
        title=note.title,
        content=note.content,
        tags=json.loads(note.tags_json) if note.tags_json else None,
        created_at=note.created_at,
        updated_at=note.updated_at,
    )


@router.delete("/notes/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_note(
    note_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    """Delete a note"""
    note = (
        db.query(PaperNote)
        .filter(and_(PaperNote.id == note_id, PaperNote.user_id == current_user.id))
        .first()
    )

    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    db.delete(note)
    db.commit()

    return None


# ==================== Alerts ====================


@router.post("/alerts", response_model=AlertResponse, status_code=status.HTTP_201_CREATED)
async def create_alert(
    alert_data: AlertCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create an alert for new papers"""
    filters_json = json.dumps(alert_data.filters) if alert_data.filters else None

    alert = Alert(
        user_id=current_user.id,
        name=alert_data.name,
        query=alert_data.query,
        frequency=alert_data.frequency,
        filters_json=filters_json,
    )

    db.add(alert)
    db.commit()
    db.refresh(alert)

    return AlertResponse(
        id=alert.id,
        name=alert.name,
        query=alert.query,
        is_active=alert.is_active,
        frequency=alert.frequency,
        last_checked=alert.last_checked,
        created_at=alert.created_at,
        updated_at=alert.updated_at,
        filters=json.loads(alert.filters_json) if alert.filters_json else None,
    )


@router.get("/alerts", response_model=List[AlertResponse])
async def list_alerts(
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List alerts"""
    query = db.query(Alert).filter(Alert.user_id == current_user.id)

    if is_active is not None:
        query = query.filter(Alert.is_active == is_active)

    alerts = query.order_by(desc(Alert.created_at)).all()

    result = []
    for a in alerts:
        result.append(
            AlertResponse(
                id=a.id,
                name=a.name,
                query=a.query,
                is_active=a.is_active,
                frequency=a.frequency,
                last_checked=a.last_checked,
                created_at=a.created_at,
                updated_at=a.updated_at,
                filters=json.loads(a.filters_json) if a.filters_json else None,
            )
        )

    return result


@router.put("/alerts/{alert_id}/toggle", response_model=AlertResponse)
async def toggle_alert(
    alert_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    """Toggle alert active status"""
    alert = (
        db.query(Alert).filter(and_(Alert.id == alert_id, Alert.user_id == current_user.id)).first()
    )

    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    alert.is_active = not alert.is_active
    alert.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(alert)

    return AlertResponse(
        id=alert.id,
        name=alert.name,
        query=alert.query,
        is_active=alert.is_active,
        frequency=alert.frequency,
        last_checked=alert.last_checked,
        created_at=alert.created_at,
        updated_at=alert.updated_at,
        filters=json.loads(alert.filters_json) if alert.filters_json else None,
    )


@router.delete("/alerts/{alert_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_alert(
    alert_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    """Delete an alert"""
    alert = (
        db.query(Alert).filter(and_(Alert.id == alert_id, Alert.user_id == current_user.id)).first()
    )

    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    db.delete(alert)
    db.commit()

    return None


# ==================== Activity Feed ====================


@router.get("/activity", response_model=List[ActivityResponse])
async def get_recent_activity(
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get recent user activity"""
    activities = (
        db.query(UserActivity)
        .filter(UserActivity.user_id == current_user.id)
        .order_by(desc(UserActivity.created_at))
        .limit(limit)
        .all()
    )

    result = []
    for a in activities:
        result.append(
            ActivityResponse(
                id=a.id,
                activity_type=a.activity_type,
                activity_data=json.loads(a.activity_data_json) if a.activity_data_json else {},
                created_at=a.created_at,
            )
        )

    return result


# ==================== Statistics ====================


@router.get("/stats", response_model=DashboardStatsResponse)
async def get_dashboard_stats(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    """Get dashboard statistics"""
    # Calculate date range for "this week"
    now = datetime.utcnow()
    week_ago = now - timedelta(days=7)

    # Total counts
    total_conversations = (
        db.query(Conversation).filter(Conversation.user_id == current_user.id).count()
    )

    total_messages = (
        db.query(Message).join(Conversation).filter(Conversation.user_id == current_user.id).count()
    )

    total_bookmarks = db.query(Bookmark).filter(Bookmark.user_id == current_user.id).count()

    total_reading_lists = (
        db.query(ReadingList).filter(ReadingList.user_id == current_user.id).count()
    )

    total_notes = db.query(PaperNote).filter(PaperNote.user_id == current_user.id).count()

    total_saved_queries = db.query(SavedQuery).filter(SavedQuery.user_id == current_user.id).count()

    total_alerts = db.query(Alert).filter(Alert.user_id == current_user.id).count()

    # Recent activity (last 7 days)
    recent_activity_count = (
        db.query(UserActivity)
        .filter(and_(UserActivity.user_id == current_user.id, UserActivity.created_at >= week_ago))
        .count()
    )

    # This week's conversations and messages
    conversations_this_week = (
        db.query(Conversation)
        .filter(and_(Conversation.user_id == current_user.id, Conversation.created_at >= week_ago))
        .count()
    )

    messages_this_week = (
        db.query(Message)
        .join(Conversation)
        .filter(and_(Conversation.user_id == current_user.id, Message.created_at >= week_ago))
        .count()
    )

    return DashboardStatsResponse(
        total_conversations=total_conversations,
        total_messages=total_messages,
        total_bookmarks=total_bookmarks,
        total_reading_lists=total_reading_lists,
        total_notes=total_notes,
        total_saved_queries=total_saved_queries,
        total_alerts=total_alerts,
        recent_activity_count=recent_activity_count,
        conversations_this_week=conversations_this_week,
        messages_this_week=messages_this_week,
    )


# ==================== Usage Analytics ====================


class UsageStatsResponse(BaseModel):
    """Usage statistics response"""

    total_queries: int
    total_searches: int
    queries_today: int
    searches_today: int
    queries_this_week: int
    searches_this_week: int
    queries_this_month: int
    searches_this_month: int
    average_response_time_ms: float
    error_rate: float
    most_used_endpoints: List[dict]
    usage_by_day: List[dict]  # Last 30 days


class EndpointUsageResponse(BaseModel):
    """Endpoint usage details"""

    endpoint: str
    count: int
    avg_response_time_ms: float
    error_count: int
    success_count: int


@router.get("/usage/stats", response_model=UsageStatsResponse)
async def get_usage_stats(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    """Get comprehensive usage statistics for the current user"""
    try:
        # Check if table exists by trying a simple query
        db.query(ApiUsage).limit(1).all()
    except Exception:
        # Table doesn't exist, return empty stats
        return UsageStatsResponse(
            total_queries=0,
            total_searches=0,
            queries_today=0,
            searches_today=0,
            queries_this_week=0,
            searches_this_week=0,
            queries_this_month=0,
            searches_this_month=0,
            average_response_time_ms=0.0,
            error_rate=0.0,
            most_used_endpoints=[],
            usage_by_day=[],
        )

    now = datetime.utcnow()
    today_start = datetime(now.year, now.month, now.day)
    week_ago = now - timedelta(days=7)
    month_ago = now - timedelta(days=30)

    # Total counts
    total_queries = (
        db.query(ApiUsage)
        .filter(and_(ApiUsage.user_id == current_user.id, ApiUsage.endpoint == "/api/query"))
        .count()
    )

    total_searches = (
        db.query(ApiUsage)
        .filter(and_(ApiUsage.user_id == current_user.id, ApiUsage.endpoint == "/api/search"))
        .count()
    )

    # Today's counts
    queries_today = (
        db.query(ApiUsage)
        .filter(
            and_(
                ApiUsage.user_id == current_user.id,
                ApiUsage.endpoint == "/api/query",
                ApiUsage.created_at >= today_start,
            )
        )
        .count()
    )

    searches_today = (
        db.query(ApiUsage)
        .filter(
            and_(
                ApiUsage.user_id == current_user.id,
                ApiUsage.endpoint == "/api/search",
                ApiUsage.created_at >= today_start,
            )
        )
        .count()
    )

    # This week's counts
    queries_this_week = (
        db.query(ApiUsage)
        .filter(
            and_(
                ApiUsage.user_id == current_user.id,
                ApiUsage.endpoint == "/api/query",
                ApiUsage.created_at >= week_ago,
            )
        )
        .count()
    )

    searches_this_week = (
        db.query(ApiUsage)
        .filter(
            and_(
                ApiUsage.user_id == current_user.id,
                ApiUsage.endpoint == "/api/search",
                ApiUsage.created_at >= week_ago,
            )
        )
        .count()
    )

    # This month's counts
    queries_this_month = (
        db.query(ApiUsage)
        .filter(
            and_(
                ApiUsage.user_id == current_user.id,
                ApiUsage.endpoint == "/api/query",
                ApiUsage.created_at >= month_ago,
            )
        )
        .count()
    )

    searches_this_month = (
        db.query(ApiUsage)
        .filter(
            and_(
                ApiUsage.user_id == current_user.id,
                ApiUsage.endpoint == "/api/search",
                ApiUsage.created_at >= month_ago,
            )
        )
        .count()
    )

    # Average response time (last 30 days)
    recent_usage = (
        db.query(ApiUsage)
        .filter(
            and_(
                ApiUsage.user_id == current_user.id,
                ApiUsage.created_at >= month_ago,
                ApiUsage.response_time_ms.isnot(None),
            )
        )
        .all()
    )

    avg_response_time = 0.0
    if recent_usage:
        total_time = sum(u.response_time_ms for u in recent_usage if u.response_time_ms)
        avg_response_time = total_time / len(recent_usage) if recent_usage else 0.0

    # Error rate (last 30 days)
    total_requests = len(recent_usage)
    error_count = sum(1 for u in recent_usage if u.status_code >= 400)
    error_rate = (error_count / total_requests * 100) if total_requests > 0 else 0.0

    # Most used endpoints (last 30 days)
    endpoint_stats = (
        db.query(
            ApiUsage.endpoint,
            func.count(ApiUsage.id).label("count"),
            func.avg(ApiUsage.response_time_ms).label("avg_time"),
        )
        .filter(and_(ApiUsage.user_id == current_user.id, ApiUsage.created_at >= month_ago))
        .group_by(ApiUsage.endpoint)
        .order_by(desc("count"))
        .limit(10)
        .all()
    )

    most_used_endpoints = [
        {
            "endpoint": endpoint,
            "count": count,
            "avg_response_time_ms": float(avg_time) if avg_time else 0.0,
        }
        for endpoint, count, avg_time in endpoint_stats
    ]

    # Usage by day (last 30 days)
    usage_by_day = []
    for i in range(30):
        day_start = datetime(now.year, now.month, now.day) - timedelta(days=i)
        day_end = day_start + timedelta(days=1)

        day_queries = (
            db.query(ApiUsage)
            .filter(
                and_(
                    ApiUsage.user_id == current_user.id,
                    ApiUsage.endpoint == "/api/query",
                    ApiUsage.created_at >= day_start,
                    ApiUsage.created_at < day_end,
                )
            )
            .count()
        )

        day_searches = (
            db.query(ApiUsage)
            .filter(
                and_(
                    ApiUsage.user_id == current_user.id,
                    ApiUsage.endpoint == "/api/search",
                    ApiUsage.created_at >= day_start,
                    ApiUsage.created_at < day_end,
                )
            )
            .count()
        )

        usage_by_day.append(
            {
                "date": day_start.isoformat(),
                "queries": day_queries,
                "searches": day_searches,
                "total": day_queries + day_searches,
            }
        )

    usage_by_day.reverse()  # Most recent first

    return UsageStatsResponse(
        total_queries=total_queries,
        total_searches=total_searches,
        queries_today=queries_today,
        searches_today=searches_today,
        queries_this_week=queries_this_week,
        searches_this_week=searches_this_week,
        queries_this_month=queries_this_month,
        searches_this_month=searches_this_month,
        average_response_time_ms=avg_response_time,
        error_rate=error_rate,
        most_used_endpoints=most_used_endpoints,
        usage_by_day=usage_by_day,
    )


@router.get("/usage/endpoints", response_model=List[EndpointUsageResponse])
async def get_endpoint_usage(
    days: int = Query(30, ge=1, le=365, description="Number of days to analyze"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get detailed usage statistics by endpoint"""
    try:
        # Check if table exists
        db.query(ApiUsage).limit(1).all()
    except Exception:
        # Table doesn't exist, return empty list
        return []

    date_limit = datetime.utcnow() - timedelta(days=days)

    endpoint_stats = (
        db.query(
            ApiUsage.endpoint,
            func.count(ApiUsage.id).label("count"),
            func.avg(ApiUsage.response_time_ms).label("avg_time"),
            func.sum(func.cast(ApiUsage.status_code >= 400, Integer)).label("error_count"),
            func.sum(func.cast(ApiUsage.status_code < 400, Integer)).label("success_count"),
        )
        .filter(and_(ApiUsage.user_id == current_user.id, ApiUsage.created_at >= date_limit))
        .group_by(ApiUsage.endpoint)
        .order_by(desc("count"))
        .all()
    )

    result = []
    for endpoint, count, avg_time, error_count, success_count in endpoint_stats:
        result.append(
            EndpointUsageResponse(
                endpoint=endpoint,
                count=count,
                avg_response_time_ms=float(avg_time) if avg_time else 0.0,
                error_count=int(error_count) if error_count else 0,
                success_count=int(success_count) if success_count else 0,
            )
        )

    return result


@router.get("/usage/recent", response_model=List[dict])
async def get_recent_usage(
    limit: int = Query(50, ge=1, le=200),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get recent API usage logs"""
    try:
        # Check if table exists
        db.query(ApiUsage).limit(1).all()
    except Exception:
        # Table doesn't exist, return empty list
        return []

    usage_logs = (
        db.query(ApiUsage)
        .filter(ApiUsage.user_id == current_user.id)
        .order_by(desc(ApiUsage.created_at))
        .limit(limit)
        .all()
    )

    result = []
    for usage in usage_logs:
        result.append(
            {
                "id": usage.id,
                "endpoint": usage.endpoint,
                "method": usage.method,
                "status_code": usage.status_code,
                "response_time_ms": usage.response_time_ms,
                "error_message": usage.error_message,
                "created_at": usage.created_at.isoformat(),
                "metadata": json.loads(usage.metadata_json) if usage.metadata_json else None,
            }
        )

    return result


# ==================== Paper Annotations ====================


class PaperAnnotationCreate(BaseModel):
    paper_id: str
    paper_title: Optional[str] = None
    annotation_type: str = "highlight"  # 'highlight', 'note', 'comment'
    selected_text: Optional[str] = None
    start_offset: Optional[int] = None
    end_offset: Optional[int] = None
    content: Optional[str] = None
    color: Optional[str] = "yellow"
    tags: Optional[List[str]] = None


class PaperAnnotationResponse(BaseModel):
    id: str
    paper_id: str
    paper_title: Optional[str]
    annotation_type: str
    selected_text: Optional[str]
    start_offset: Optional[int]
    end_offset: Optional[int]
    content: Optional[str]
    color: Optional[str]
    tags: Optional[List[str]]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


@router.post(
    "/annotations", response_model=PaperAnnotationResponse, status_code=status.HTTP_201_CREATED
)
async def create_annotation(
    annotation_data: PaperAnnotationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create an annotation/highlight on a paper"""
    tags_json = json.dumps(annotation_data.tags) if annotation_data.tags else None

    annotation = PaperAnnotation(
        user_id=current_user.id,
        paper_id=annotation_data.paper_id,
        paper_title=annotation_data.paper_title,
        annotation_type=annotation_data.annotation_type,
        selected_text=annotation_data.selected_text,
        start_offset=annotation_data.start_offset,
        end_offset=annotation_data.end_offset,
        content=annotation_data.content,
        color=annotation_data.color,
        tags_json=tags_json,
    )

    db.add(annotation)
    db.commit()
    db.refresh(annotation)

    return PaperAnnotationResponse(
        id=annotation.id,
        paper_id=annotation.paper_id,
        paper_title=annotation.paper_title,
        annotation_type=annotation.annotation_type,
        selected_text=annotation.selected_text,
        start_offset=annotation.start_offset,
        end_offset=annotation.end_offset,
        content=annotation.content,
        color=annotation.color,
        tags=json.loads(annotation.tags_json) if annotation.tags_json else None,
        created_at=annotation.created_at,
        updated_at=annotation.updated_at,
    )


@router.get("/annotations", response_model=List[PaperAnnotationResponse])
async def list_annotations(
    paper_id: Optional[str] = Query(None, description="Filter by paper ID"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List annotations for the current user"""
    query = db.query(PaperAnnotation).filter(PaperAnnotation.user_id == current_user.id)

    if paper_id:
        query = query.filter(PaperAnnotation.paper_id == paper_id)

    annotations = query.order_by(desc(PaperAnnotation.created_at)).offset(offset).limit(limit).all()

    result = []
    for ann in annotations:
        result.append(
            PaperAnnotationResponse(
                id=ann.id,
                paper_id=ann.paper_id,
                paper_title=ann.paper_title,
                annotation_type=ann.annotation_type,
                selected_text=ann.selected_text,
                start_offset=ann.start_offset,
                end_offset=ann.end_offset,
                content=ann.content,
                color=ann.color,
                tags=json.loads(ann.tags_json) if ann.tags_json else None,
                created_at=ann.created_at,
                updated_at=ann.updated_at,
            )
        )

    return result


@router.put("/annotations/{annotation_id}", response_model=PaperAnnotationResponse)
async def update_annotation(
    annotation_id: str,
    annotation_data: PaperAnnotationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update an annotation"""
    annotation = (
        db.query(PaperAnnotation)
        .filter(
            and_(PaperAnnotation.id == annotation_id, PaperAnnotation.user_id == current_user.id)
        )
        .first()
    )

    if not annotation:
        raise HTTPException(status_code=404, detail="Annotation not found")

    tags_json = json.dumps(annotation_data.tags) if annotation_data.tags else None

    annotation.paper_id = annotation_data.paper_id
    annotation.paper_title = annotation_data.paper_title
    annotation.annotation_type = annotation_data.annotation_type
    annotation.selected_text = annotation_data.selected_text
    annotation.start_offset = annotation_data.start_offset
    annotation.end_offset = annotation_data.end_offset
    annotation.content = annotation_data.content
    annotation.color = annotation_data.color
    annotation.tags_json = tags_json

    db.commit()
    db.refresh(annotation)

    return PaperAnnotationResponse(
        id=annotation.id,
        paper_id=annotation.paper_id,
        paper_title=annotation.paper_title,
        annotation_type=annotation.annotation_type,
        selected_text=annotation.selected_text,
        start_offset=annotation.start_offset,
        end_offset=annotation.end_offset,
        content=annotation.content,
        color=annotation.color,
        tags=json.loads(annotation.tags_json) if annotation.tags_json else None,
        created_at=annotation.created_at,
        updated_at=annotation.updated_at,
    )


@router.delete("/annotations/{annotation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_annotation(
    annotation_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete an annotation"""
    annotation = (
        db.query(PaperAnnotation)
        .filter(
            and_(PaperAnnotation.id == annotation_id, PaperAnnotation.user_id == current_user.id)
        )
        .first()
    )

    if not annotation:
        raise HTTPException(status_code=404, detail="Annotation not found")

    db.delete(annotation)
    db.commit()

    return None


# ==================== Paper Comparisons ====================


class PaperComparisonCreate(BaseModel):
    name: Optional[str] = None
    paper_ids: List[str]  # List of paper IDs to compare


class PaperComparisonResponse(BaseModel):
    id: str
    name: Optional[str]
    paper_ids: List[str]
    comparison_data: Optional[dict]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


@router.post(
    "/comparisons", response_model=PaperComparisonResponse, status_code=status.HTTP_201_CREATED
)
async def create_comparison(
    comparison_data: PaperComparisonCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a paper comparison session"""
    if len(comparison_data.paper_ids) < 2:
        raise HTTPException(status_code=400, detail="At least 2 papers are required for comparison")

    paper_ids_json = json.dumps(comparison_data.paper_ids)

    comparison = PaperComparison(
        user_id=current_user.id, name=comparison_data.name, paper_ids_json=paper_ids_json
    )

    db.add(comparison)
    db.commit()
    db.refresh(comparison)

    return PaperComparisonResponse(
        id=comparison.id,
        name=comparison.name,
        paper_ids=json.loads(comparison.paper_ids_json),
        comparison_data=(
            json.loads(comparison.comparison_data_json) if comparison.comparison_data_json else None
        ),
        created_at=comparison.created_at,
        updated_at=comparison.updated_at,
    )


@router.get("/comparisons", response_model=List[PaperComparisonResponse])
async def list_comparisons(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List comparison sessions for the current user"""
    comparisons = (
        db.query(PaperComparison)
        .filter(PaperComparison.user_id == current_user.id)
        .order_by(desc(PaperComparison.updated_at))
        .offset(offset)
        .limit(limit)
        .all()
    )

    result = []
    for comp in comparisons:
        result.append(
            PaperComparisonResponse(
                id=comp.id,
                name=comp.name,
                paper_ids=json.loads(comp.paper_ids_json),
                comparison_data=(
                    json.loads(comp.comparison_data_json) if comp.comparison_data_json else None
                ),
                created_at=comp.created_at,
                updated_at=comp.updated_at,
            )
        )

    return result


@router.delete("/comparisons/{comparison_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_comparison(
    comparison_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a comparison session"""
    comparison = (
        db.query(PaperComparison)
        .filter(
            and_(PaperComparison.id == comparison_id, PaperComparison.user_id == current_user.id)
        )
        .first()
    )

    if not comparison:
        raise HTTPException(status_code=404, detail="Comparison not found")

    db.delete(comparison)
    db.commit()

    return None

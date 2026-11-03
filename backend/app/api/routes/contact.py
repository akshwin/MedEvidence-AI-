"""
Contact endpoint - Send contact form emails
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


class ContactRequest(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str


@router.post("/contact")
async def send_contact_email(request: ContactRequest):
    """
    Send contact form email

    Args:
        request: ContactRequest with name, email, subject, and message

    Returns:
        Success message
    """
    try:
        from app.core.config import settings

        smtp_server = settings.smtp_server or "smtp.gmail.com"
        smtp_port = settings.smtp_port or 587
        smtp_username = settings.smtp_username
        smtp_password = settings.smtp_password
        recipient_email = settings.contact_recipient_email or smtp_username

        # Check if SMTP password is configured
        if not smtp_username or not smtp_password or not recipient_email:
            raise HTTPException(
                status_code=500,
                detail="Email service not configured. Please set SMTP_USERNAME and SMTP_PASSWORD (and optionally CONTACT_RECIPIENT_EMAIL) in backend/.env. See backend/QUICK_EMAIL_SETUP.md for instructions.",
            )

        # Create email
        msg = MIMEMultipart()
        msg["From"] = smtp_username
        msg["To"] = recipient_email
        msg["Subject"] = f"Contact Form: {request.subject}"
        msg["Reply-To"] = request.email

        # Email body
        body = f"""
New contact form submission from MedEvidence AI website:

Name: {request.name}
Email: {request.email}
Subject: {request.subject}

Message:
{request.message}

---
This email was sent from the MedEvidence AI contact form.
        """

        msg.attach(MIMEText(body, "plain"))

        # Send email
        try:
            with smtplib.SMTP(smtp_server, smtp_port) as server:
                server.starttls()
                server.login(smtp_username, smtp_password)
                server.send_message(msg)

            logger.info(f"Email sent successfully to {recipient_email}")
            return {"success": True, "message": "Your message has been sent successfully!"}

        except smtplib.SMTPAuthenticationError as auth_err:
            error_msg = str(auth_err)
            if (
                "Application-specific password required" in error_msg
                or "InvalidSecondFactor" in error_msg
            ):
                raise HTTPException(
                    status_code=500,
                    detail="Gmail App Password required. You need to use a Gmail App Password (not your regular password). Get it from: https://myaccount.google.com/apppasswords and add it to backend/.env as SMTP_PASSWORD",
                )
            else:
                raise HTTPException(
                    status_code=500,
                    detail=f"Email authentication failed: {error_msg}. Please check your SMTP_PASSWORD in backend/.env",
                )
        except Exception as email_err:
            error_msg = str(email_err)
            logger.error(f"Error sending email: {error_msg}")
            raise HTTPException(status_code=500, detail=f"Failed to send email: {error_msg}")

    except HTTPException:
        raise
    except Exception as e:
        import traceback

        traceback.print_exc()
        error_msg = f"Failed to process contact form: {str(e)}"
        logger.error(f"Error: {error_msg}")
        raise HTTPException(status_code=500, detail=error_msg)

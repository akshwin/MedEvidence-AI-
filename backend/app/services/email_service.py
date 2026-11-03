"""
Email service for sending verification and password reset emails
"""

import logging
import re
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
from app.core.config import settings

logger = logging.getLogger(__name__)


class EmailService:
    """Service for sending emails"""

    def __init__(self):
        self.smtp_server = settings.smtp_server
        self.smtp_port = settings.smtp_port
        self.smtp_username = settings.smtp_username
        self.smtp_password = settings.smtp_password
        self.frontend_url = settings.frontend_url

    def _send_email(
        self, to_email: str, subject: str, html_body: str, text_body: Optional[str] = None
    ) -> bool:
        """Send an email"""
        if not self.smtp_server or not self.smtp_username or not self.smtp_password:
            # Log the verification/reset link so local dev works without SMTP
            url_match = re.search(r'href="([^"]+)"', html_body)
            logger.warning(
                f"Email not configured. Would send '{subject}' to {to_email}"
                + (f" (link: {url_match.group(1)})" if url_match else "")
            )
            return False

        try:
            # Create message
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = self.smtp_username
            msg["To"] = to_email

            # Add text and HTML parts
            if text_body:
                part1 = MIMEText(text_body, "plain")
                msg.attach(part1)

            part2 = MIMEText(html_body, "html")
            msg.attach(part2)

            # Send email
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_username, self.smtp_password)
                server.send_message(msg)

            return True
        except Exception as e:
            logger.error(f"Error sending email: {e}")
            return False

    def send_verification_email(
        self, email: str, token: str, full_name: Optional[str] = None
    ) -> bool:
        """Send email verification email"""
        verification_url = f"{self.frontend_url}/verify-email?token={token}"

        name = full_name or "User"
        subject = "Verify your MedEvidence AI account"

        html_body = f"""
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #059669;">Welcome to MedEvidence AI!</h2>
              <p>Hi {name},</p>
              <p>Thank you for signing up! Please verify your email address by clicking the button below:</p>
              <p style="text-align: center; margin: 30px 0;">
                <a href="{verification_url}" 
                   style="background-color: #059669; color: white; padding: 12px 24px; 
                          text-decoration: none; border-radius: 6px; display: inline-block;">
                  Verify Email Address
                </a>
              </p>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #666;">{verification_url}</p>
              <p>This link will expire in 24 hours.</p>
              <p>If you didn't create an account, you can safely ignore this email.</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
              <p style="color: #666; font-size: 12px;">
                MedEvidence AI - Evidence-Based Medical Research Platform
              </p>
            </div>
          </body>
        </html>
        """

        text_body = f"""
        Welcome to MedEvidence AI!
        
        Hi {name},
        
        Thank you for signing up! Please verify your email address by visiting:
        {verification_url}
        
        This link will expire in 24 hours.
        
        If you didn't create an account, you can safely ignore this email.
        
        MedEvidence AI - Evidence-Based Medical Research Platform
        """

        return self._send_email(email, subject, html_body, text_body)

    def send_password_reset_email(
        self, email: str, token: str, full_name: Optional[str] = None
    ) -> bool:
        """Send password reset email"""
        reset_url = f"{self.frontend_url}/reset-password?token={token}"

        name = full_name or "User"
        subject = "Reset your MedEvidence AI password"

        html_body = f"""
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #059669;">Password Reset Request</h2>
              <p>Hi {name},</p>
              <p>We received a request to reset your password. Click the button below to reset it:</p>
              <p style="text-align: center; margin: 30px 0;">
                <a href="{reset_url}" 
                   style="background-color: #059669; color: white; padding: 12px 24px; 
                          text-decoration: none; border-radius: 6px; display: inline-block;">
                  Reset Password
                </a>
              </p>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #666;">{reset_url}</p>
              <p>This link will expire in 1 hour.</p>
              <p>If you didn't request a password reset, you can safely ignore this email.</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
              <p style="color: #666; font-size: 12px;">
                MedEvidence AI - Evidence-Based Medical Research Platform
              </p>
            </div>
          </body>
        </html>
        """

        text_body = f"""
        Password Reset Request
        
        Hi {name},
        
        We received a request to reset your password. Visit this link to reset it:
        {reset_url}
        
        This link will expire in 1 hour.
        
        If you didn't request a password reset, you can safely ignore this email.
        
        MedEvidence AI - Evidence-Based Medical Research Platform
        """

        return self._send_email(email, subject, html_body, text_body)


# Singleton instance
email_service = EmailService()

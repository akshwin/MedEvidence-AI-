"""
Quick script to help set up email configuration
Run this script to create/update your .env file with email settings
"""

import os
from pathlib import Path

def setup_email():
    env_path = Path(__file__).parent / ".env"
    
    print("=" * 60)
    print("Email Configuration Setup")
    print("=" * 60)
    print()
    print("To send emails from the contact form, you need a Gmail App Password.")
    print()
    print("Steps to get Gmail App Password:")
    print("1. Enable 2-Factor Authentication on your Gmail account")
    print("2. Go to: https://myaccount.google.com/apppasswords")
    print("3. Select 'Mail' -> 'Other (Custom name)'")
    print("4. Enter 'MedEvidence AI' as the name")
    print("5. Copy the 16-character password (it looks like: abcd efgh ijkl mnop)")
    print()
    
    smtp_username = input("Enter the Gmail address you want to send from (SMTP_USERNAME): ").strip()
    app_password = input("Enter your Gmail App Password (or press Enter to skip): ").strip()
    
    if not smtp_username or not app_password:
        print("\n[WARNING] Skipping email setup. Contact form will log messages but won't send emails.")
        print("   You can set this up later by editing backend/.env")
        return
    
    # Read existing .env or create new content
    env_content = []
    if env_path.exists():
        with open(env_path, 'r') as f:
            env_content = f.readlines()
    
    # Update or add email settings
    email_settings = {
        'SMTP_SERVER': 'smtp.gmail.com',
        'SMTP_PORT': '587',
        'SMTP_USERNAME': smtp_username,
        'SMTP_PASSWORD': app_password
    }
    
    # Remove old email settings if they exist
    env_content = [line for line in env_content 
                   if not any(key in line for key in email_settings.keys())]
    
    # Add new email settings
    env_content.append('\n# Email Settings for Contact Form\n')
    for key, value in email_settings.items():
        env_content.append(f'{key}={value}\n')
    
    # Write to .env file
    with open(env_path, 'w') as f:
        f.writelines(env_content)
    
    print("\n[SUCCESS] Email configuration saved to backend/.env")
    print("\nNext steps:")
    print("   1. Restart your backend server:")
    print("      cd backend")
    print("      uvicorn app.main:app --reload")
    print("   2. Test the contact form on your website")
    print()

if __name__ == "__main__":
    setup_email()


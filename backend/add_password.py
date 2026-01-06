"""
Quick script to add SMTP password to .env file
"""

from pathlib import Path

# Password provided by user
password = "AKSHwin@2003"

env_path = Path(__file__).parent / ".env"

# Email configuration
env_content = f"""# Email Settings for Contact Form
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=akshwint.2003@gmail.com
SMTP_PASSWORD={password}

# Other settings
GROQ_API_KEY=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
"""

# Write to .env file
with open(env_path, 'w') as f:
    f.write(env_content)

print(f"[SUCCESS] .env file created/updated at: {env_path}")
print("\n[NOTE] If this doesn't work, you may need a Gmail App Password.")
print("   Gmail App Passwords are 16 characters and don't contain @ symbols.")
print("   Get one from: https://myaccount.google.com/apppasswords")
print("\nNext step: Restart your backend server!")


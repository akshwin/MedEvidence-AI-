"""
Quick script to add SMTP password to .env file
"""

import getpass
from pathlib import Path

env_path = Path(__file__).parent / ".env"

smtp_username = input("SMTP_USERNAME (your email, e.g. you@gmail.com): ").strip()
smtp_password = getpass.getpass("SMTP_PASSWORD (Gmail App Password; input hidden): ").strip()
groq_api_key = getpass.getpass("GROQ_API_KEY (optional; input hidden, press Enter to skip): ").strip()

if not smtp_username or not smtp_password:
    raise SystemExit("SMTP_USERNAME and SMTP_PASSWORD are required to configure email.")

# Load existing .env (if present), removing old values for keys we will set
existing_lines: list[str] = []
if env_path.exists():
    existing_lines = env_path.read_text(encoding="utf-8").splitlines(keepends=False)

keys_to_replace = {"SMTP_SERVER", "SMTP_PORT", "SMTP_USERNAME", "SMTP_PASSWORD", "GROQ_API_KEY"}
filtered_lines: list[str] = []
for line in existing_lines:
    stripped = line.strip()
    if not stripped or stripped.startswith("#"):
        filtered_lines.append(line)
        continue
    k = stripped.split("=", 1)[0].strip()
    if k in keys_to_replace:
        continue
    filtered_lines.append(line)

new_lines: list[str] = []
new_lines.extend(filtered_lines)
if new_lines and new_lines[-1].strip() != "":
    new_lines.append("")
new_lines.append("# Email Settings for Contact Form")
new_lines.append("SMTP_SERVER=smtp.gmail.com")
new_lines.append("SMTP_PORT=587")
new_lines.append(f"SMTP_USERNAME={smtp_username}")
new_lines.append(f"SMTP_PASSWORD={smtp_password}")
new_lines.append("")
new_lines.append("# Other settings")
new_lines.append(f"GROQ_API_KEY={groq_api_key}" if groq_api_key else "GROQ_API_KEY=")
new_lines.append("")

env_path.write_text("\n".join(new_lines), encoding="utf-8")

print(f"[SUCCESS] .env file created/updated at: {env_path}")
print("\n[NOTE] If this doesn't work, you may need a Gmail App Password.")
print("   Gmail App Passwords are 16 characters and don't contain @ symbols.")
print("   Get one from: https://myaccount.google.com/apppasswords")
print("\nNext step: Restart your backend server!")


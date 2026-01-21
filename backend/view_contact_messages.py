"""
Quick script to view contact form messages
Run: python view_contact_messages.py
"""

from pathlib import Path
from datetime import datetime

CONTACT_MESSAGES_DIR = Path(__file__).parent / "contact_messages"

def view_messages():
    if not CONTACT_MESSAGES_DIR.exists():
        print("No contact messages folder found.")
        return
    
    messages = sorted(CONTACT_MESSAGES_DIR.glob("contact_*.txt"), reverse=True)
    
    if not messages:
        print("No contact messages found.")
        return
    
    print("=" * 70)
    print(f"📧 Contact Form Messages ({len(messages)} total)")
    print("=" * 70)
    print()
    
    for i, msg_file in enumerate(messages[:10], 1):  # Show last 10
        print(f"\n[{i}] {msg_file.name}")
        print("-" * 70)
        try:
            with open(msg_file, 'r', encoding='utf-8') as f:
                print(f.read())
        except Exception as e:
            print(f"Error reading file: {e}")
    
    if len(messages) > 10:
        print(f"\n... and {len(messages) - 10} more messages")
    
    print("\n" + "=" * 70)
    print(f"All messages saved in: {CONTACT_MESSAGES_DIR}")
    print("=" * 70)

if __name__ == "__main__":
    view_messages()








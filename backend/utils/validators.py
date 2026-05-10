import re
import bleach

def sanitize_input(text):
    if not text:
        return text
    return bleach.clean(str(text))

def validate_username(username):
    if not username:
        return False
    return bool(re.match(r'^[a-zA-Z0-9_]{3,30}$', username))

def validate_pix_key(pix_key):
    # Basic validation for Pix key (can be improved)
    if not pix_key:
        return False
    return len(pix_key) >= 5

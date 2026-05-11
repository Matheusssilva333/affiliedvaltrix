import re
import bleach

USERNAME_REGEX = re.compile(r'^[a-zA-Z0-9_]{3,30}$')
PASSWORD_REGEX = re.compile(r'^\S{8,64}$')
PIX_KEY_REGEX = re.compile(r'^(?:\+?\d{8,15}|\d{11}|[^@\s]+@[^@\s]+\.[^@\s]+)$')


def sanitize_input(value):
    if value is None:
        return value
    cleaned = bleach.clean(str(value), tags=[], attributes={}, strip=True)
    return cleaned.strip()


def validate_username(username):
    if not username:
        return False
    return bool(USERNAME_REGEX.fullmatch(username))


def validate_password(password):
    if not password:
        return False
    return bool(PASSWORD_REGEX.fullmatch(password))


def validate_pix_key(pix_key):
    if not pix_key:
        return False
    pix_key = str(pix_key).strip()
    return bool(PIX_KEY_REGEX.fullmatch(pix_key))

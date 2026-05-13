import os
from datetime import timedelta

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-key-valtrix-please-change-2026')
    # For Supabase: postgresql://user:password@host:5432/postgres
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', 'sqlite:///valtrix.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_size': 10,
        'pool_recycle': 3600,
        'pool_pre_ping': True,  # Verify connection before using
    }

    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'dev-jwt-key-please-change-to-a-strong-secret-2026')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=int(os.environ.get('JWT_ACCESS_TOKEN_EXPIRES', 15)))
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=int(os.environ.get('JWT_REFRESH_TOKEN_EXPIRES', 7)))
    JWT_TOKEN_LOCATION = ['cookies']
    JWT_COOKIE_SECURE = os.environ.get('FLASK_ENV', 'development') == 'production' and os.environ.get('JWT_COOKIE_SECURE', 'False').lower() in ['true', '1', 'yes']
    JWT_COOKIE_SAMESITE = 'Strict'
    JWT_COOKIE_CSRF_PROTECT = True
    JWT_SESSION_COOKIE = False
    JWT_ACCESS_CSRF_COOKIE_NAME = 'csrf_access_token_cookie'
    JWT_REFRESH_CSRF_COOKIE_NAME = 'csrf_refresh_token_cookie'

    MP_ACCESS_TOKEN = os.environ.get('MERCADOPAGO_ACCESS_TOKEN')
    BASE_URL = os.environ.get('BASE_URL', 'http://localhost:5000')

    # Store Configuration
    COMMISSION_RATE = float(os.environ.get('COMMISSION_RATE', 0.10))

    # Rate Limiting - Use in-memory storage for development, Redis for production
    if os.environ.get('FLASK_ENV') == 'production':
        RATELIMIT_STORAGE_URI = os.environ.get('REDIS_URL', 'redis://localhost:6379/0')
    else:
        RATELIMIT_STORAGE_URI = 'memory://'
    RATELIMIT_DEFAULT = os.environ.get('RATELIMIT_DEFAULT', '200 per day;50 per hour')
    RATELIMIT_HEADERS_ENABLED = True

    CORS_ORIGINS = os.environ.get('CORS_ORIGINS', 'http://localhost:5173').split(',')

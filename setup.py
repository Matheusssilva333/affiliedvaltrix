#!/usr/bin/env python
"""
Valtrix Project Setup Helper
Interactive script to set up the project for Supabase
"""
import os
import sys
import shutil
from pathlib import Path

def print_header(text):
    print()
    print("=" * 60)
    print(f"  {text}")
    print("=" * 60)
    print()

def print_step(num, text):
    print(f"[{num}] {text}")

def create_env_file():
    """Create .env file from template"""
    env_file = Path('.env')
    env_example = Path('.env.example')
    
    if env_file.exists():
        print("✓ .env already exists")
        return
    
    if not env_example.exists():
        print("✗ .env.example not found!")
        return
    
    shutil.copy(env_example, env_file)
    print("✓ Created .env from .env.example")

def main():
    print_header("🚀 VALTRIX SUPABASE SETUP")
    
    print("""
This script will help you set up the Valtrix project with Supabase.

Make sure you have:
  1. Created a Supabase account (https://supabase.com)
  2. Created a new project in Supabase
  3. Obtained your Database URL from Settings → Database → Connection strings
    """)
    
    input("Press Enter to continue...")
    
    # Step 1: Create .env
    print_step(1, "Creating .env file...")
    create_env_file()
    
    # Step 2: Instructions
    print()
    print_step(2, "Configure your .env file")
    print("""
    Open .env and update these values:
    
    1. DATABASE_URL
       - Go to: https://app.supabase.com
       - Select your project
       - Settings → Database
       - Copy the URI (postgresql://...)
    
    2. SECRET_KEY & JWT_SECRET_KEY
       - Generate strong random strings (32+ chars)
       - Or use: python -c "import secrets; print(secrets.token_urlsafe(32))"
    
    3. MERCADOPAGO_ACCESS_TOKEN (optional)
       - Your MercadoPago access token
    """)
    
    input("Press Enter after updating .env...")
    
    # Step 3: Virtual environment
    print()
    print_step(3, "Setting up Python virtual environment")
    
    if sys.platform == 'win32':
        activate_cmd = ".venv\\Scripts\\activate"
    else:
        activate_cmd = "source .venv/bin/activate"
    
    print(f"""
    Run these commands:
    
    python -m venv .venv
    {activate_cmd}
    pip install -r requirements.txt
    """)
    
    input("Press Enter after virtual environment is set up...")
    
    # Step 4: Run migrations
    print()
    print_step(4, "Running database migrations")
    print("""
    Run this command:
    
    flask db upgrade
    
    This will create all necessary tables in your Supabase database.
    """)
    
    input("Press Enter after migrations complete...")
    
    # Step 5: Test connection
    print()
    print_step(5, "Testing Supabase connection")
    print("""
    Run this command:
    
    python test_supabase.py
    
    This will verify your connection and show table information.
    """)
    
    input("Press Enter after testing connection...")
    
    # Step 6: Start development
    print()
    print_step(6, "Start development servers")
    print("""
    Open two terminal windows:
    
    Terminal 1 (Backend):
    .venv\\Scripts\\activate (or source .venv/bin/activate)
    python -m flask run
    
    Terminal 2 (Frontend):
    npm run dev
    
    Then visit: http://localhost:5173
    """)
    
    print_header("✨ SETUP COMPLETE")
    print("""
    Next steps:
    ✓ Test the application in browser
    ✓ Create an account and test login
    ✓ Test the store checkout flow
    ✓ Check admin panel features
    
    Documentation:
    - README.md - Project overview
    - SUPABASE_SETUP.md - Detailed Supabase guide
    - backend/routes/*.py - API endpoints
    """)

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print("\n\nSetup cancelled.")
        sys.exit(0)

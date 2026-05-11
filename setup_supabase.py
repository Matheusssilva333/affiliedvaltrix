#!/usr/bin/env python
"""
Supabase Setup Script
Configures the application to work with Supabase PostgreSQL database
"""
import os
import sys
from pathlib import Path

def main():
    print("=" * 60)
    print("VALTRIX SUPABASE SETUP")
    print("=" * 60)
    print()
    
    # Check if .env exists
    env_file = Path('.env')
    
    if not env_file.exists():
        print("✓ Creating .env file from .env.example...")
        if Path('.env.example').exists():
            with open('.env.example', 'r') as f:
                content = f.read()
            with open('.env', 'w') as f:
                f.write(content)
            print("  Created .env - please configure it with your Supabase credentials")
        else:
            print("  ERROR: .env.example not found")
            return False
    else:
        print("✓ .env file already exists")
    
    print()
    print("NEXT STEPS:")
    print("=" * 60)
    print()
    print("1. Get your Supabase Database URL:")
    print("   - Go to: https://app.supabase.com")
    print("   - Select your project")
    print("   - Settings → Database → Connection string")
    print("   - Copy the 'Standard connection' (URI format)")
    print()
    print("2. Update .env with your DATABASE_URL:")
    print("   DATABASE_URL=postgresql://[user]:[password]@[host]:5432/postgres")
    print()
    print("3. Run database migrations:")
    print("   python -m flask db upgrade")
    print()
    print("4. Test the connection:")
    print("   python -c 'from backend.app import create_app; app = create_app(); print(\"✓ Connected!\")'")
    print()
    print("5. Start the backend:")
    print("   python -m flask run")
    print()
    print("=" * 60)

if __name__ == '__main__':
    main()

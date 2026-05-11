#!/usr/bin/env python
"""
Supabase Connection Test and Database Inspector
Verifies connectivity and displays schema information
"""
import os
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent / 'backend'))

def test_connection():
    """Test Supabase connection and display table info"""
    try:
        from dotenv import load_dotenv
        load_dotenv()
        
        from app import create_app, db
        
        app = create_app()
        
        with app.app_context():
            # Test connection
            print("🔗 Testing Supabase connection...")
            
            try:
                # This will trigger a connection
                inspector = db.inspect(db.engine)
                tables = inspector.get_table_names()
                
                print("✅ Connected to Supabase successfully!")
                print()
                print("📊 Database Tables:")
                print("-" * 50)
                
                if not tables:
                    print("No tables found. Run: flask db upgrade")
                    return False
                
                for table in sorted(tables):
                    columns = inspector.get_columns(table)
                    col_str = ", ".join([f"{col['name']} ({col['type']})" for col in columns])
                    print(f"\n📦 {table}")
                    print(f"   Columns: {col_str}")
                
                # Count records
                print()
                print("📈 Record Counts:")
                print("-" * 50)
                
                for table in sorted(tables):
                    try:
                        count = db.session.execute(f"SELECT COUNT(*) FROM \"{table}\"").scalar()
                        print(f"  {table}: {count} records")
                    except Exception as e:
                        print(f"  {table}: Error counting - {e}")
                
                print()
                print("✨ All checks passed! Your Supabase setup is working.")
                return True
                
            except Exception as e:
                print(f"❌ Connection failed: {e}")
                print()
                print("Troubleshooting:")
                print("1. Check your DATABASE_URL in .env")
                print("2. Verify the password is correct")
                print("3. Check if Supabase project is active")
                print("4. Run: python -m flask db upgrade")
                return False
                
    except ImportError as e:
        print(f"❌ Import error: {e}")
        print("Make sure dependencies are installed:")
        print("  pip install -r requirements.txt")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

if __name__ == '__main__':
    success = test_connection()
    sys.exit(0 if success else 1)

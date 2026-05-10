import os
from flask import Flask, send_from_directory
# pyrefly: ignore [missing-import]
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_talisman import Talisman
from flask_migrate import Migrate
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from .utils.logger import setup_logger

setup_logger()

db = SQLAlchemy()
jwt = JWTManager()
migrate = Migrate()
bcrypt = Bcrypt()

def create_app():
    # Configure static folder
    # Assuming backend/app.py is running, dist is at ../dist
    base_dir = os.path.abspath(os.path.dirname(__file__))
    static_folder = os.path.join(base_dir, '..', 'dist')
    
    app = Flask(__name__, static_folder=static_folder, static_url_path='')
    app.config.from_object('backend.config.Config')

    # Security headers
    csp = {
        'default-src': '\'self\'',
        'img-src': ['*', 'data:'],
        'script-src': ['\'self\'', '\'unsafe-inline\'', 'https://sdk.mercadopago.com'],
        'style-src': ['\'self\'', '\'unsafe-inline\'', 'https://fonts.googleapis.com'],
        'font-src': ['\'self\'', 'https://fonts.gstatic.com'],
        'connect-src': ['\'self\'', 'https://api.roblox.com', 'https://catalog.roblox.com', 'https://thumbnails.roblox.com', 'https://api.mercadopago.com']
    }
    Talisman(app, content_security_policy=csp, force_https=False)
    CORS(app, supports_credentials=True)

    db.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)
    bcrypt.init_app(app)

    with app.app_context():
        # Register models first
        from .models.user import User
        from .models.sale import Sale
        
        # Register blueprints
        from .routes.auth import auth_bp
        from .routes.affiliate import affiliate_bp
        from .routes.admin import admin_bp
        from .routes.store import store_bp
        from .routes.seo import seo_bp

        app.register_blueprint(auth_bp, url_prefix='/api/auth')
        app.register_blueprint(affiliate_bp, url_prefix='/api/affiliate')
        app.register_blueprint(admin_bp, url_prefix='/api/admin')
        app.register_blueprint(store_bp, url_prefix='/api/store')
        app.register_blueprint(seo_bp)

        # Create tables
        db.create_all()
        
        # Schema update for SQLite
        try:
            from sqlalchemy import inspect, text
            inspector = inspect(db.engine)
            if 'sales' in inspector.get_table_names():
                columns = [c['name'] for c in inspector.get_columns('sales')]
                if 'preference_id' not in columns:
                    with db.engine.connect() as conn:
                        conn.execute(text("ALTER TABLE sales ADD COLUMN preference_id VARCHAR(100)"))
                        conn.commit()
        except Exception as e:
            app.logger.warning(f"Schema update failed: {e}")

        # Promote admins
        try:
            for username in ['Neguin_carecabrancaa', 'SonGokuReverso7']:
                u = User.query.filter_by(username=username).first()
                if u and u.role != 'admin':
                    u.role = 'admin'
                    db.session.commit()
        except Exception as e:
            app.logger.warning(f"Promotion failed: {e}")

    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve(path):
        if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
            return send_from_directory(app.static_folder, path)
        return send_from_directory(app.static_folder, 'index.html')

    return app

app = create_app()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))

import os
from flask import Flask, send_from_directory
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

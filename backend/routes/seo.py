from flask import Blueprint, render_template_string, request
from ..models.user import User

seo_bp = Blueprint('seo', __name__)

HTML_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>{{ title }}</title>
    <meta name="description" content="{{ description }}">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="{{ url }}">
    <meta property="og:title" content="{{ title }}">
    <meta property="og:description" content="{{ description }}">
    <meta property="og:image" content="{{ image }}">

    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="{{ url }}">
    <meta property="twitter:title" content="{{ title }}">
    <meta property="twitter:description" content="{{ description }}">
    <meta property="twitter:image" content="{{ image }}">

    <script>
        // Redirect to the actual store page
        window.location.href = "/store?ref={{ username }}";
    </script>
</head>
<body>
    <h1>Redirecionando para a loja de {{ username }}...</h1>
</body>
</html>
"""

@seo_bp.route('/share/<username>')
def share(username):
    user = User.query.filter_by(username=username).first()
    
    title = f"Loja Oficial de {username} | Valtrix"
    description = f"Confira os melhores itens do Roblox na loja de {username}. Preços exclusivos e entrega garantida!"
    image = user.avatar_url if user and user.avatar_url else "https://valtrix.com/default-share.png"
    
    return render_template_string(
        HTML_TEMPLATE,
        username=username,
        title=title,
        description=description,
        image=image,
        url=request.url
    )

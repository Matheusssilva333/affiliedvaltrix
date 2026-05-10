import json

def test_register(client):
    response = client.post('/api/auth/register', json={
        "username": "testuser",
        "password": "password123"
    })
    assert response.status_code == 201
    assert b"User registered successfully" in response.data

def test_login(client):
    # First register
    client.post('/api/auth/register', json={
        "username": "testuser",
        "password": "password123"
    })
    
    # Then login
    response = client.post('/api/auth/login', json={
        "username": "testuser",
        "password": "password123"
    })
    assert response.status_code == 200
    assert b"Login successful" in response.data
    # Check if cookies are set
    assert 'access_token_cookie' in [c.name for c in client.cookie_jar]

def test_me_protected(client):
    response = client.get('/api/auth/me')
    assert response.status_code == 401 # Should fail without token

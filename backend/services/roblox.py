import requests
import logging

logger = logging.getLogger(__name__)

def get_roblox_user_id(username):
    try:
        user_resp = requests.post("https://users.roblox.com/v1/usernames/users", json={"usernames": [username]}, timeout=5).json()
        data = user_resp.get("data", [])
        if data:
            return data[0].get("id")
    except Exception as e:
        logger.error(f"Error fetching Roblox user id for {username}: {e}")
    return None

def get_roblox_avatar(user_id, username):
    if not user_id:
        return f'https://api.dicebear.com/7.x/avataaars/svg?seed={username}'
    try:
        thumb_resp = requests.get(f"https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds={user_id}&size=150x150&format=Png", timeout=5).json()
        thumb_data = thumb_resp.get("data", [])
        if thumb_data:
            return thumb_data[0].get("imageUrl")
    except Exception as e:
        logger.error(f"Error fetching Roblox avatar for {user_id}: {e}")
    return f'https://api.dicebear.com/7.x/avataaars/svg?seed={username}'

def get_roblox_item_details(item_ids):
    if not item_ids:
        return []
    try:
        details_resp = requests.post("https://catalog.roblox.com/v1/catalog/items/details", json={
            "items": [{"itemType": "Asset", "id": i} for i in item_ids]
        }, timeout=5).json()
        
        items_data = details_resp.get("data", [])
        
        ids_str = ",".join([str(i) for i in item_ids])
        thumb_resp = requests.get(f"https://thumbnails.roblox.com/v1/assets?assetIds={ids_str}&size=150x150&format=Png", timeout=5).json()
        thumb_data = {str(t['targetId']): t['imageUrl'] for t in thumb_resp.get("data", [])}
        
        enriched_items = []
        for item in items_data:
            asset_id = str(item.get("id"))
            robux_price = item.get("price", 1000)
            brl_price = max(10.0, float(robux_price) * 0.05)
            
            enriched_items.append({
                "id": asset_id,
                "name": item.get("name"),
                "description": item.get("description"),
                "price": brl_price,
                "price_formatted": f"R$ {brl_price:,.2f}".replace('.', 'v').replace(',', '.').replace('v', ','),
                "image": thumb_data.get(asset_id),
                "robux_price": robux_price
            })
        return enriched_items
    except Exception as e:
        logger.error(f"Error fetching Roblox item details: {e}")
        return []

def get_roblox_item_thumbnails(item_ids):
    if not item_ids:
        return {}
    try:
        ids_str = ",".join([str(i) for i in item_ids])
        resp = requests.get(f"https://thumbnails.roblox.com/v1/assets?assetIds={ids_str}&returnPolicy=PlaceHolder&size=150x150&format=Png", timeout=5).json()
        data = resp.get("data", [])
        return {str(item.get("targetId")): item.get("imageUrl") for item in data}
    except Exception as e:
        logger.error(f"Error fetching Roblox item thumbnails: {e}")
    return {}

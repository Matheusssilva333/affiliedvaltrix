import mercadopago
import os
import logging

logger = logging.getLogger(__name__)

def get_mp_sdk():
    access_token = os.environ.get('MERCADOPAGO_ACCESS_TOKEN')
    if not access_token:
        logger.warning("MERCADOPAGO_ACCESS_TOKEN not found in environment")
        return None
    return mercadopago.SDK(access_token)

def create_preference(item_id, item_name, item_price, affiliate_id, host_url, sale_id):
    sdk = get_mp_sdk()
    if not sdk:
        return None
    
    import json
    preference_data = {
        "items": [
            {
                "id": str(item_id),
                "title": item_name,
                "quantity": 1,
                "unit_price": float(item_price),
                "currency_id": "BRL"
            }
        ],
        "external_reference": json.dumps({
            "affiliate_id": affiliate_id,
            "item_id": str(item_id),
            "sale_id": sale_id
        }),
        "notification_url": f"{host_url}/api/store/webhook",
        "back_urls": {
            "success": f"{host_url}/#success",
            "failure": f"{host_url}/#failure",
            "pending": f"{host_url}/#pending"
        },
        "auto_return": "approved"
    }
    
    preference_response = sdk.preference().create(preference_data)
    return preference_response.get("response")

def get_payment(payment_id):
    sdk = get_mp_sdk()
    if not sdk:
        return None
    payment_info = sdk.payment().get(payment_id)
    return payment_info.get("response")

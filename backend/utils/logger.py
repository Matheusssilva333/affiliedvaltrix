import logging
import json
import sys
import os
from datetime import datetime

class JsonFormatter(logging.Formatter):
    def format(self, record):
        log_record = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "message": record.getMessage(),
            "module": record.module,
            "func": record.funcName
        }
        if record.exc_info:
            log_record["exception"] = self.formatException(record.exc_info)
        return json.dumps(log_record)

def setup_logger():
    logger = logging.getLogger()
    logger.setLevel(logging.INFO)
    
    # Standard output handler
    handler = logging.StreamHandler(sys.stdout)
    
    # Use JSON formatting in production (Render), human-readable in dev
    if os.environ.get('FLASK_ENV') == 'production':
        handler.setFormatter(JsonFormatter())
    else:
        formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        handler.setFormatter(formatter)
        
    logger.addHandler(handler)
    return logger

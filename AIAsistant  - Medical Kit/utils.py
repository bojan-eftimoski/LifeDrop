import logging
import os
import json
import psutil
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('first_aid_assistant.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger('FirstAidAssistant')

def load_config():
    """Load configuration from config.json"""
    config_path = os.path.join(os.path.dirname(__file__), 'config.json')
    try:
        with open(config_path, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        logger.warning("Config file not found, using default settings")
        return {
            "camera": {
                "resolution": (640, 480),
                "fps": 30
            },
            "display": {
                "image_display_time": 5000,
                "fullscreen": True
            },
            "detection": {
                "confidence_threshold": 0.7,
                "detection_interval": 2
            },
            "system": {
                "health_check_interval": 300,  # 5 minutes
                "max_cpu_usage": 80,  # percentage
                "max_memory_usage": 80,  # percentage
                "min_disk_space": 1000  # MB
            }
        }

def log_detection(situation, confidence=None):
    """Log detected situations with timestamp"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    log_entry = {
        "timestamp": timestamp,
        "situation": situation,
        "confidence": confidence
    }
    logger.info(f"Detection: {json.dumps(log_entry)}")

def ensure_assets_exist():
    """Ensure required asset directories exist"""
    base_dir = os.path.dirname(__file__)
    required_dirs = [
        os.path.join(base_dir, 'assets'),
        os.path.join(base_dir, 'assets', 'videos'),
        os.path.join(base_dir, 'assets', 'images')
    ]
    
    for directory in required_dirs:
        if not os.path.exists(directory):
            os.makedirs(directory)
            logger.info(f"Created directory: {directory}")

def check_system_health():
    """Check system resources and return health status"""
    config = load_config()
    system_config = config.get('system', {})
    
    health_status = {
        "status": "healthy",
        "issues": [],
        "metrics": {}
    }
    
    try:
        # Check CPU usage
        cpu_percent = psutil.cpu_percent(interval=1)
        health_status["metrics"]["cpu_usage"] = cpu_percent
        if cpu_percent > system_config.get("max_cpu_usage", 80):
            health_status["status"] = "warning"
            health_status["issues"].append(f"High CPU usage: {cpu_percent}%")
        
        # Check memory usage
        memory = psutil.virtual_memory()
        health_status["metrics"]["memory_usage"] = memory.percent
        if memory.percent > system_config.get("max_memory_usage", 80):
            health_status["status"] = "warning"
            health_status["issues"].append(f"High memory usage: {memory.percent}%")
        
        # Check disk space
        disk = psutil.disk_usage('/')
        free_space_mb = disk.free / (1024 * 1024)
        health_status["metrics"]["free_disk_space_mb"] = free_space_mb
        if free_space_mb < system_config.get("min_disk_space", 1000):
            health_status["status"] = "warning"
            health_status["issues"].append(f"Low disk space: {free_space_mb:.2f}MB")
        
        # Log health status
        if health_status["status"] == "warning":
            logger.warning(f"System health check: {json.dumps(health_status)}")
        else:
            logger.info(f"System health check: {json.dumps(health_status)}")
            
        return health_status
        
    except Exception as e:
        logger.error(f"Error during health check: {str(e)}")
        return {
            "status": "error",
            "issues": [f"Health check failed: {str(e)}"],
            "metrics": {}
        } 
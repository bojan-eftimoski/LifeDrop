import time
import sys
from camera import CameraDetector
from display import DisplayManager
from utils import logger, load_config, ensure_assets_exist, check_system_health

def main():
    try:
        # Load configuration
        config = load_config()
        
        # Ensure required directories exist
        ensure_assets_exist()
        
        # Initialize components
        logger.info("Initializing Smart First Aid Kit Assistant...")
        camera = CameraDetector()
        display = DisplayManager()
        
        logger.info("System ready. Starting detection loop...")
        print("Smart First Aid Kit Assistant is running...")
        print("Press Ctrl+C to exit")
        
        last_health_check = time.time()
        
        while True:
            try:
                # Perform periodic health check
                current_time = time.time()
                if current_time - last_health_check >= config['system']['health_check_interval']:
                    health_status = check_system_health()
                    if health_status['status'] == 'warning':
                        logger.warning(f"System health issues detected: {health_status['issues']}")
                    last_health_check = current_time
                
                # Detect situation
                situation, confidence = camera.detect_situation()
                
                if situation:
                    logger.info(f"Detected situation: {situation} (confidence: {confidence:.2f})")
                    
                    # Show appropriate media
                    if situation == "CPR":
                        display.show_video("cpr_guide")
                    elif situation == "Tourniquet":
                        display.show_graphic("tourniquet_steps")
                    elif situation == "Choking":
                        display.show_video("choking_guide")
                    elif situation == "Bleeding":
                        display.show_video("bleeding_guide")
                    elif situation == "Burn":
                        display.show_graphic("burn_treatment")
                    else:
                        logger.warning(f"No media found for situation: {situation}")
                
                # Wait before next detection
                time.sleep(config['detection']['detection_interval'])
                
            except KeyboardInterrupt:
                raise
            except Exception as e:
                logger.error(f"Error in main loop: {str(e)}")
                time.sleep(1)  # Prevent tight loop in case of persistent error
                
    except KeyboardInterrupt:
        logger.info("Shutdown requested by user")
        print("\nShutting down...")
    except Exception as e:
        logger.error(f"Fatal error: {str(e)}")
        print(f"Fatal error: {str(e)}")
        sys.exit(1)
    finally:
        # Clean up resources
        try:
            del camera
            del display
        except Exception as e:
            logger.error(f"Error during cleanup: {str(e)}")
        
        logger.info("Shutdown complete")

if __name__ == "__main__":
    main() 
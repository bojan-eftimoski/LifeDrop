import cv2
import numpy as np
from picamera2 import Picamera2
from utils import logger, load_config, log_detection

class CameraDetector:
    def __init__(self):
        self.config = load_config()
        self.camera_config = self.config['camera']
        self.detection_config = self.config['detection']
        
        # Initialize the camera
        self.camera = Picamera2()
        self.camera.configure(
            self.camera.create_preview_configuration(
                main={
                    "format": 'RGB888',
                    "size": self.camera_config['resolution']
                }
            )
        )
        self.camera.start()
        
        # Load pre-trained model for object detection
        self.model = cv2.dnn.readNetFromTensorflow(
            'models/frozen_inference_graph.pb',
            'models/ssd_mobilenet_v2_coco_2018_03_29.pbtxt'
        )
        
        # Define medical emergency classes
        self.emergency_classes = {
            1: "CPR",
            2: "Tourniquet",
            3: "Choking",
            4: "Bleeding",
            5: "Burn"
        }
        
    def detect_situation(self):
        """
        Detect medical situations using computer vision.
        Returns tuple of (situation, confidence)
        """
        try:
            # Capture frame
            frame = self.camera.capture_array()
            
            # Preprocess frame for detection
            blob = cv2.dnn.blobFromImage(
                frame, 
                size=(300, 300),
                swapRB=True,
                crop=False
            )
            
            # Run detection
            self.model.setInput(blob)
            detections = self.model.forward()
            
            # Process detections
            highest_confidence = 0
            detected_situation = None
            
            for i in range(detections.shape[2]):
                confidence = detections[0, 0, i, 2]
                
                if confidence > self.detection_config['confidence_threshold']:
                    class_id = int(detections[0, 0, i, 1])
                    if class_id in self.emergency_classes:
                        if confidence > highest_confidence:
                            highest_confidence = confidence
                            detected_situation = self.emergency_classes[class_id]
            
            if detected_situation:
                log_detection(detected_situation, highest_confidence)
                return detected_situation, highest_confidence
            else:
                return None, 0
                
        except Exception as e:
            logger.error(f"Error in detection: {str(e)}")
            return None, 0
    
    def __del__(self):
        """Clean up camera resources"""
        try:
            self.camera.stop()
        except Exception as e:
            logger.error(f"Error stopping camera: {str(e)}") 
import pygame
import os
from omxplayer.player import OMXPlayer
from utils import logger, load_config

class DisplayManager:
    def __init__(self):
        self.config = load_config()
        self.display_config = self.config['display']
        
        # Initialize pygame for image display
        pygame.init()
        if self.display_config['fullscreen']:
            self.screen = pygame.display.set_mode((0, 0), pygame.FULLSCREEN)
        else:
            self.screen = pygame.display.set_mode((800, 600))
        pygame.display.set_caption("Smart First Aid Kit Assistant")
        
        # Set up paths
        self.assets_dir = os.path.join(os.path.dirname(__file__), 'assets')
        self.videos_dir = os.path.join(self.assets_dir, 'videos')
        self.images_dir = os.path.join(self.assets_dir, 'images')
        
        # Ensure directories exist
        os.makedirs(self.videos_dir, exist_ok=True)
        os.makedirs(self.images_dir, exist_ok=True)
        
    def show_video(self, video_name):
        """Display a video using OMXPlayer"""
        video_path = os.path.join(self.videos_dir, f"{video_name}.mp4")
        try:
            if os.path.exists(video_path):
                player = OMXPlayer(video_path)
                player.play()
                # Wait for video to finish
                while player.is_playing():
                    # Handle pygame events to prevent freezing
                    for event in pygame.event.get():
                        if event.type == pygame.QUIT:
                            player.quit()
                            return
                    pygame.time.wait(100)
                player.quit()
            else:
                logger.error(f"Video not found: {video_path}")
                self.show_error_message(f"Video not found: {video_name}")
        except Exception as e:
            logger.error(f"Error playing video: {str(e)}")
            self.show_error_message("Error playing video")
            
    def show_graphic(self, image_name):
        """Display an image using Pygame"""
        image_path = os.path.join(self.images_dir, f"{image_name}.png")
        try:
            if os.path.exists(image_path):
                # Load and scale image to fit screen
                image = pygame.image.load(image_path)
                image = pygame.transform.scale(image, self.screen.get_size())
                
                # Display image
                self.screen.blit(image, (0, 0))
                pygame.display.flip()
                
                # Wait for configured time
                start_time = pygame.time.get_ticks()
                while pygame.time.get_ticks() - start_time < self.display_config['image_display_time']:
                    # Handle pygame events
                    for event in pygame.event.get():
                        if event.type == pygame.QUIT:
                            return
                    pygame.time.wait(100)
            else:
                logger.error(f"Image not found: {image_path}")
                self.show_error_message(f"Image not found: {image_name}")
        except Exception as e:
            logger.error(f"Error displaying image: {str(e)}")
            self.show_error_message("Error displaying image")
    
    def show_error_message(self, message):
        """Display an error message on screen"""
        try:
            # Clear screen
            self.screen.fill((0, 0, 0))
            
            # Create font
            font = pygame.font.Font(None, 36)
            text = font.render(message, True, (255, 0, 0))
            text_rect = text.get_rect(center=self.screen.get_rect().center)
            
            # Display text
            self.screen.blit(text, text_rect)
            pygame.display.flip()
            
            # Wait for 3 seconds
            pygame.time.wait(3000)
        except Exception as e:
            logger.error(f"Error showing error message: {str(e)}")
            
    def __del__(self):
        """Clean up pygame resources"""
        try:
            pygame.quit()
        except Exception as e:
            logger.error(f"Error quitting pygame: {str(e)}") 
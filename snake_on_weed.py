#!/usr/bin/env python3
"""
🐍 SNAKE ON WEED 🌿
The trippiest snake game ever created!
"""

import pygame
import random
import math
import sys

# Initialize Pygame
pygame.init()

# Constants
WINDOW_WIDTH = 800
WINDOW_HEIGHT = 600
GRID_SIZE = 20
GRID_WIDTH = WINDOW_WIDTH // GRID_SIZE
GRID_HEIGHT = WINDOW_HEIGHT // GRID_SIZE

# Psychedelic colors!
BLACK = (0, 0, 0)
WHITE = (255, 255, 255)
NEON_GREEN = (57, 255, 20)
NEON_PINK = (255, 20, 147)
NEON_BLUE = (0, 255, 255)
NEON_PURPLE = (191, 64, 191)
NEON_YELLOW = (255, 255, 0)
NEON_ORANGE = (255, 165, 0)

class SnakeOnWeed:
    def __init__(self):
        self.screen = pygame.display.set_mode((WINDOW_WIDTH, WINDOW_HEIGHT))
        pygame.display.set_caption("🐍 SNAKE ON WEED 🌿 - Use Arrow Keys!")
        self.clock = pygame.time.Clock()
        self.font = pygame.font.Font(None, 36)
        self.big_font = pygame.font.Font(None, 72)
        
        # Snake properties
        self.reset_game()
        
        # Psychedelic effects
        self.time = 0
        self.trail = []  # For trippy trail effect
        self.rainbow_mode = False
        self.speed_boost = False
        
    def reset_game(self):
        # Snake starts in the center
        self.snake = [(GRID_WIDTH // 2, GRID_HEIGHT // 2)]
        self.direction = (1, 0)  # Moving right
        self.grow_snake = False
        
        # First munchie
        self.spawn_food()
        
        # Score
        self.score = 0
        self.high_score = 0
        
        # Game state
        self.game_over = False
        self.paused = False
        
    def spawn_food(self):
        while True:
            self.food = (random.randint(0, GRID_WIDTH - 1),
                        random.randint(0, GRID_HEIGHT - 1))
            if self.food not in self.snake:
                break
    
    def get_rainbow_color(self):
        # Creates smooth rainbow transition
        hue = (self.time * 2) % 360
        color = pygame.Color(0)
        color.hsva = (hue, 100, 100, 100)
        return color
    
    def get_psychedelic_color(self, index):
        # Each segment gets a different color
        colors = [NEON_GREEN, NEON_PINK, NEON_BLUE, 
                 NEON_PURPLE, NEON_YELLOW, NEON_ORANGE]
        if self.rainbow_mode:
            return self.get_rainbow_color()
        return colors[index % len(colors)]
    
    def move_snake(self):
        if self.game_over or self.paused:
            return
            
        # Get head position
        head_x, head_y = self.snake[0]
        dx, dy = self.direction
        
        # Calculate new head position
        new_head = ((head_x + dx) % GRID_WIDTH,
                    (head_y + dy) % GRID_HEIGHT)
        
        # Check collision with self
        if new_head in self.snake:
            self.game_over = True
            return
            
        # Add new head
        self.snake.insert(0, new_head)
        
        # Check if we ate food
        if new_head == self.food:
            self.score += 10
            if self.score > self.high_score:
                self.high_score = self.score
            self.spawn_food()
            
            # Special effects at certain scores
            if self.score % 50 == 0:
                self.rainbow_mode = not self.rainbow_mode
            if self.score % 100 == 0:
                self.speed_boost = True
        else:
            # Remove tail if we didn't eat
            if len(self.trail) < 10:  # Keep trail short
                self.trail.append(self.snake[-1])
            self.snake.pop()
    
    def handle_input(self):
        keys = pygame.key.get_pressed()
        
        # Movement (can't go back into yourself)
        if keys[pygame.K_UP] and self.direction != (0, 1):
            self.direction = (0, -1)
        elif keys[pygame.K_DOWN] and self.direction != (0, -1):
            self.direction = (0, 1)
        elif keys[pygame.K_LEFT] and self.direction != (1, 0):
            self.direction = (-1, 0)
        elif keys[pygame.K_RIGHT] and self.direction != (-1, 0):
            self.direction = (1, 0)
    
    def draw_grid_segment(self, x, y, color, size_mod=1.0):
        # Draw with psychedelic effects
        rect = pygame.Rect(x * GRID_SIZE + 2, 
                          y * GRID_SIZE + 2,
                          GRID_SIZE - 4, 
                          GRID_SIZE - 4)
        
        # Pulsing effect
        pulse = math.sin(self.time * 0.1) * 2
        rect.inflate_ip(pulse * size_mod, pulse * size_mod)
        
        pygame.draw.rect(self.screen, color, rect, border_radius=5)
        
        # Glow effect
        glow_rect = rect.inflate(4, 4)
        glow_color = (*color, 50) if len(color) == 3 else color
        pygame.draw.rect(self.screen, glow_color, glow_rect, 
                        width=2, border_radius=7)
    
    def draw(self):
        # Trippy background
        if self.rainbow_mode:
            self.screen.fill(((self.time) % 50, 
                             (self.time * 2) % 50, 
                             (self.time * 3) % 50))
        else:
            self.screen.fill(BLACK)
        
        # Draw trail (fading effect)
        for i, pos in enumerate(self.trail):
            alpha = 50 - (i * 5)
            if alpha > 0:
                color = (*NEON_PURPLE, alpha)
                self.draw_grid_segment(pos[0], pos[1], NEON_PURPLE, 0.5)
        
        # Draw snake with psychedelic colors
        for i, segment in enumerate(self.snake):
            color = self.get_psychedelic_color(i)
            size_mod = 1.2 if i == 0 else 1.0  # Head is bigger
            self.draw_grid_segment(segment[0], segment[1], color, size_mod)
        
        # Draw food (pulsing munchie)
        food_pulse = abs(math.sin(self.time * 0.15)) + 0.5
        self.draw_grid_segment(self.food[0], self.food[1], 
                              NEON_YELLOW, food_pulse)
        
        # Draw score with glow
        score_text = self.font.render(f"Score: {self.score}", True, WHITE)
        self.screen.blit(score_text, (10, 10))
        
        high_text = self.font.render(f"High: {self.high_score}", True, NEON_GREEN)
        self.screen.blit(high_text, (10, 50))
        
        # Special effects text
        if self.rainbow_mode:
            rainbow_text = self.font.render("🌈 RAINBOW MODE 🌈", True, 
                                           self.get_rainbow_color())
            self.screen.blit(rainbow_text, (WINDOW_WIDTH - 250, 10))
        
        # Game over screen
        if self.game_over:
            overlay = pygame.Surface((WINDOW_WIDTH, WINDOW_HEIGHT))
            overlay.set_alpha(128)
            overlay.fill(BLACK)
            self.screen.blit(overlay, (0, 0))
            
            game_over_text = self.big_font.render("GAME OVER!", True, NEON_PINK)
            text_rect = game_over_text.get_rect(center=(WINDOW_WIDTH//2, 
                                                        WINDOW_HEIGHT//2 - 50))
            self.screen.blit(game_over_text, text_rect)
            
            restart_text = self.font.render("Press SPACE to restart", True, WHITE)
            text_rect = restart_text.get_rect(center=(WINDOW_WIDTH//2, 
                                                      WINDOW_HEIGHT//2 + 50))
            self.screen.blit(restart_text, text_rect)
    
    def run(self):
        running = True
        while running:
            # Handle events
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    running = False
                elif event.type == pygame.KEYDOWN:
                    if event.key == pygame.K_SPACE and self.game_over:
                        self.reset_game()
                    elif event.key == pygame.K_p:
                        self.paused = not self.paused
                    elif event.key == pygame.K_ESCAPE:
                        running = False
            
            # Update
            self.handle_input()
            self.move_snake()
            
            # Clean up old trail
            if len(self.trail) > 10:
                self.trail.pop(0)
            
            # Update time for effects
            self.time += 1
            
            # Draw everything
            self.draw()
            pygame.display.flip()
            
            # Control speed (faster when boosted)
            speed = 15 if self.speed_boost else 10
            self.clock.tick(speed)
            
            # Reset boost after a bit
            if self.speed_boost and self.time % 100 == 0:
                self.speed_boost = False
        
        pygame.quit()
        sys.exit()

if __name__ == "__main__":
    print("🐍 SNAKE ON WEED STARTING! 🌿")
    print("Use ARROW KEYS to move!")
    print("Press SPACE to restart after game over!")
    print("Press P to pause, ESC to quit!")
    print("\nGet ready for the trip of your life! 🌈")
    
    game = SnakeOnWeed()
    game.run()

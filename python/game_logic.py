def start_game(canvas, game_frame):
    """Start the game process and render on the canvas."""
    print("Starting the game...")

    # Example: Render a static rectangle
    canvas.create_rectangle(100, 100, 200, 200, fill="blue", outline="white")

    # Start game loop or animations
    render_frame(canvas, game_frame)


def render_frame(canvas, game_frame):
    """Example of a simple game rendering loop."""
    # Example: Move a rectangle across the canvas
    rect = canvas.create_rectangle(100, 100, 150, 150, fill="red", outline="black")

    def move_rect():
        print("Check")
        # Check if the game is paused
        if game_frame.is_paused:
            print(game_frame.is_paused)
            return  # Exit the loop if the game is paused

        # Move the rectangle by 5 pixels right and 5 pixels down
        canvas.move(rect, 5, 5)

        # Continue moving the rectangle if within bounds
        x1, y1, x2, y2 = canvas.coords(rect)
        if x2 < 800 and y2 < 600:  # Check bounds
            canvas.after(50, move_rect)  # Call the function again after 50ms

    move_rect()

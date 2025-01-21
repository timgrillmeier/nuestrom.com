import tkinter as tk
from game_logic import start_game  # Import the external start_game function


class GameFrame(tk.Frame):
    def __init__(self, parent):
        super().__init__(parent)
        self.parent = parent
        self.place(x=0, y=0, relwidth=1, relheight=1)
        self.configure(bg="black")

        # Add widgets for the game screen
        #tk.Label(self, text="Game Screen", font=("Helvetica", 24, "bold"), fg="white", bg="black").pack(pady=20)

        # Create a canvas for rendering game assets
        self.canvas = tk.Canvas(self, width=800, height=600, bg="gray")
        self.canvas.pack()

        # Add a Start button for testing (optional)
        tk.Button(self, text="Start Game", command=self.start_game).pack(pady=10)

        # Pause-related attributes
        self.is_paused = False  # Tracks if the game is paused
        self.pause_menu = None  # Reference to the pause menu frame

        # Bind the Escape key to pause the game
        self.parent.bind("<Escape>", self.toggle_pause)

    def start_game(self):
        """Call the external start_game function."""
        self.is_paused = False  # Ensure the game is not paused when starting
        start_game(self.canvas, self)  # Pass self for control

    def quit_to_desktop(self):
        """Quit the application entirely."""
        self.parent.destroy()  # Destroys the root Tk instance, closing the app


    def toggle_pause(self, event=None):
        """Toggle the paused state."""
        if self.is_paused:
            self.resume_game()
        else:
            self.pause_game()

    def pause_game(self):
        """Pause the game by setting the flag and showing the pause menu."""
        self.is_paused = True

        # Create a pause menu overlay
        if self.pause_menu is None:
            self.pause_menu = tk.Frame(self, bg="white", bd=2, relief="raised")
            self.pause_menu.place(relx=0.3, rely=0.3, relwidth=0.4, relheight=0.4)

            tk.Label(self.pause_menu, text="Paused", font=("Helvetica", 18, "bold"), bg="white").pack(pady=10)
            tk.Button(self.pause_menu, text="Resume", command=self.resume_game).pack(pady=5)
            tk.Button(self.pause_menu, text="Quit to Main Menu", command=lambda: self.parent.show_frame(self.parent.menu_frame)).pack(pady=5)
            tk.Button(self.pause_menu, text="Quit to Desktop", command=self.quit_to_desktop).pack(pady=10)


        self.pause_menu.lift()  # Bring the pause menu to the front

    def resume_game(self):
        """Resume the game by hiding the pause menu and resetting the flag."""
        self.is_paused = False
        start_game(self.canvas, self)
        if self.pause_menu:
            self.pause_menu.lower()  # Hide the pause menu

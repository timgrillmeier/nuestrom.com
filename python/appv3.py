import tkinter as tk
from PIL import Image, ImageTk
from game_frame import GameFrame  # Import the GameFrame class


class App(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("Nuestrom")
        self.geometry("800x600")

        # Initialize frames
        self.menu_frame = MenuFrame(self)
        self.game_frame = GameFrame(self)

        # Show the menu frame initially
        self.show_frame(self.game_frame)

    def show_frame(self, frame):
        """Bring the specified frame to the front."""
        frame.tkraise()
        if frame == self.game_frame:
            frame.start_game()  # Automatically start the game when showing the game frame


class MenuFrame(tk.Frame):
    def __init__(self, parent):
        super().__init__(parent)
        self.place(x=0, y=0, relwidth=1, relheight=1)

        # Load the original background image
        image_path = "assets/background_2.png"  # Replace with your image file
        self.original_image = Image.open(image_path)
        self.original_width, self.original_height = self.original_image.size

        # Convert to PhotoImage for initial display
        self.background_photo = ImageTk.PhotoImage(self.original_image)
        self.background_label = tk.Label(self, image=self.background_photo)
        self.background_label.place(x=0, y=0, relwidth=1, relheight=1)

        # Add widgets
        tk.Label(self, text="NUESTROM", font=("Helvetica", 24, "bold"), bg="white").pack(pady=20)
        tk.Button(self, text="Play", command=lambda: parent.show_frame(parent.game_frame)).pack(pady=10)
        tk.Button(self, text="Quit", command=parent.quit).pack(pady=10)

        # Debounce timer
        self.debounce_timer = None

        # Bind resize event to handle dynamic background resizing
        parent.bind("<Configure>", self.resize_background)

    def resize_background(self, event):
        """Throttle the background resize event."""
        if self.debounce_timer is not None:
            self.after_cancel(self.debounce_timer)
        self.debounce_timer = self.after(100, self.update_background)

    def update_background(self):
        """Resize and update the background image."""
        self.debounce_timer = None  # Reset the timer

        # Get the new window dimensions
        new_width = self.winfo_width()
        new_height = self.winfo_height()

        # Calculate the scaling factor to cover the window
        width_scale = new_width / self.original_width
        height_scale = new_height / self.original_height
        scale = max(width_scale, height_scale)

        # Resize the image
        new_size = (int(self.original_width * scale), int(self.original_height * scale))
        resized_image = self.original_image.resize(new_size, Image.LANCZOS)

        # Update the background
        self.background_photo = ImageTk.PhotoImage(resized_image)
        self.background_label.configure(image=self.background_photo)
        self.background_label.image = self.background_photo


if __name__ == "__main__":
    app = App()
    app.mainloop()

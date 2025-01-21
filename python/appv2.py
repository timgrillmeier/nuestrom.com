import tkinter as tk
from PIL import Image, ImageTk


class App(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("Nuestrom")
        self.geometry("800x600")

        # Initialize frames
        self.menu_frame = MenuFrame(self)
        self.game_frame = GameFrame(self)

        # Show the menu frame initially
        self.show_frame(self.menu_frame)

    def show_frame(self, frame):
        """Bring the specified frame to the front."""
        frame.tkraise()


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
        tk.Label(self, text="NUESTROM", font=("Arial", 32, "bold")).pack(pady=20)
        tk.Button(self, text="Play", relief="flat", bd=0, command=lambda: parent.show_frame(parent.game_frame)).pack(pady=10)
        tk.Button(self, text="Quit", relief="flat", bd=0, command=parent.quit).pack(pady=10)

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


class GameFrame(tk.Frame):
    def __init__(self, parent):
        super().__init__(parent)
        self.place(x=0, y=0, relwidth=1, relheight=1)
        self.configure(bg="black")

        # Add widgets for the game screen
        #tk.Label(self, text="Game Screen", font=("Helvetica", 24, "bold"), fg="white", bg="black").pack(pady=20)

        # Example game canvas
        self.canvas = tk.Canvas(self, width=800, height=600, bg="gray", bd=0)
        self.canvas.pack()

        # Example: Draw a static rectangle
        self.canvas.create_rectangle(100, 100, 200, 200, fill="blue", outline="white")

        # Add an overlay menu (initially hidden)
        self.menu_frame = tk.Frame(self, bd=0)
        self.menu_frame.place(relx=0.3, rely=0.3, relwidth=0.4, relheight=0.4)
        self.menu_frame.lower()  # Hide menu initially

        # Add menu items
        tk.Label(self.menu_frame, text="Game Paused", font=("Helvetica", 18, "bold")).pack(pady=10)
        tk.Button(self.menu_frame, text="Resume", command=self.hide_menu).pack(pady=5)
        tk.Button(self.menu_frame, text="Quit to Main Menu", command=lambda: parent.show_frame(parent.menu_frame)).pack(pady=5)
        tk.Button(self.menu_frame, text="Quit to Desktop", relief="flat", bd=0, command=parent.quit).pack(pady=10)

        # Bind the Escape key to toggle the menu
        parent.bind("<Escape>", self.toggle_menu)

        self.menu_visible = False

    def toggle_menu(self, event=None):
        """Show or hide the pause menu."""
        if self.menu_visible:
            self.hide_menu()
        else:
            self.show_menu()

    def show_menu(self):
        """Show the pause menu."""
        self.menu_frame.lift()  # Bring the menu to the front
        self.menu_visible = True

    def hide_menu(self):
        """Hide the pause menu."""
        self.menu_frame.lower()  # Send the menu to the back
        self.menu_visible = False


if __name__ == "__main__":
    app = App()
    app.mainloop()

import tkinter as tk

def start_game():
    print("Start Game")

def main():
    root = tk.Tk()
    root.title("Nuestrom")

    window_width = 800
    window_height = 600
    root.geometry(f"{window_width}x{window_height}")

    menu_background_image_path = "assets/background_image.jpg"  # Replace with your image file
    menu_background_image = Image.open(menu_background_image_path)

    tk.Label(root, text="NUESTROM", font=("Arial",30,"bold")).pack(pady=50, padx=50)
    tk.Button(root, text="New Game/Continue", command=start_game).pack(pady=10)
    tk.Button(root, text="Quit", command=root.quit).pack(pady=10)
    root.mainloop()

if __name__ == "__main__":
    main()

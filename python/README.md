# Application Setup and Usage Guide

This guide describes how to set up the application environment, pull in dependencies, run the app locally, and create a distributable app or executable for macOS and Windows.

---

## 1. Environment Setup

### Prerequisites
Ensure the following tools are installed on your system:
- **Python 3.10+**: [Download here](https://www.python.org/downloads/)
- **pip**: Comes bundled with Python.
- **venv**: Included in Python standard library for creating virtual environments.
- **PyInstaller**: Used for creating distributable apps or executables.
  
To install PyInstaller globally:
```bash
pip install pyinstaller
```

---

### Create and Activate Virtual Environment
1. Navigate to your project directory:
   ```bash
   cd /path/to/project
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   ```

3. Activate the virtual environment:
   - **macOS/Linux**:
     ```bash
     source venv/bin/activate
     ```
   - **Windows**:
     ```cmd
     venv\Scripts\activate
     ```

4. Verify the virtual environment is active:
   ```bash
   python --version
   ```
   Ensure this points to the Python version inside your virtual environment.

---

## 2. Installing Dependencies

Dependencies are listed in the `requirements.txt` file. To install them:

```bash
pip install -r requirements.txt
```

If `requirements.txt` does not exist, you can generate it based on the current environment:

```bash
pip freeze > requirements.txt
```

---

## 3. Running the Application Locally

### Steps to Run
1. Ensure the virtual environment is active.
2. Run the main application file:
   ```bash
   python app.py
   ```
3. The application window should now open.

---

## 4. Creating a Distributable App or Executable

You can package the application for macOS and Windows using **PyInstaller**.

### Packaging for macOS
1. Ensure your virtual environment is active.
2. Use PyInstaller to create a `.app`:
   ```bash
   pyinstaller --onefile --windowed app.py
   ```
3. The packaged app will be located in the `dist` folder as `app` (e.g., `dist/app.app`).
4. Test the app:
   ```bash
   open dist/app.app
   ```

### Packaging for Windows
1. Ensure your virtual environment is active.
2. Use PyInstaller to create an `.exe`:
   ```bash
   pyinstaller --onefile --windowed app.py
   ```
3. The packaged executable will be located in the `dist` folder as `app.exe`.
4. Test the app by running:
   ```cmd
   dist\app.exe
   ```

---

## 5. Notes
- **Static Assets**: Ensure all static assets (e.g., images, sounds) required by the app are included in the distribution package. You may need to modify the PyInstaller `.spec` file to include these assets.
- **Testing**: Always test the packaged app or executable on the target platform to ensure compatibility.
- **Dependencies**: Double-check that all required dependencies are properly listed in `requirements.txt`.

---

If you encounter any issues, feel free to refer to the [PyInstaller Documentation](https://pyinstaller.org/) for additional details or troubleshooting tips.

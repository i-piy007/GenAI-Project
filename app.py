import importlib
import subprocess
import sys
from pathlib import Path


REPO_ROOT = Path(__file__).parent
MAIN_FILE = REPO_ROOT / "main.py"
REQ_FILE = REPO_ROOT / "requirements.txt"

# Modules your app needs at runtime
REQUIRED_IMPORTS = [
    "flask",   # Flask web framework
    "openai",  # OpenAI client (router compatible)
]


def _missing_modules() -> list[str]:
    missing: list[str] = []
    for mod in REQUIRED_IMPORTS:
        try:
            importlib.import_module(mod)
        except Exception:
            missing.append(mod)
    return missing


def _pip_install_from_requirements(req_path: Path) -> int:
    print(f"Installing dependencies from {req_path}...")
    return subprocess.call([sys.executable, "-m", "pip", "install", "-r", str(req_path)])


def _pip_install_packages(packages: list[str]) -> int:
    if not packages:
        return 0
    print("Installing missing packages:", ", ".join(packages))
    return subprocess.call([sys.executable, "-m", "pip", "install", *packages])


def ensure_dependencies_installed() -> None:
    missing = _missing_modules()
    if not missing:
        return

    if REQ_FILE.exists():
        code = _pip_install_from_requirements(REQ_FILE)
        if code != 0:
            print("pip install -r requirements.txt failed with code", code)
            # Fallback to installing only missing imports by name
            code = _pip_install_packages(missing)
            if code != 0:
                print("Direct install of missing packages failed with code", code)
    else:
        code = _pip_install_packages(missing)
        if code != 0:
            print("Direct install of missing packages failed with code", code)


def run_main() -> int:
    if not MAIN_FILE.exists():
        print(f"Could not find {MAIN_FILE}")
        return 2

    print("Starting main.py (Flask server)...")

    # Launch Flask in a subprocess
    process = subprocess.Popen([sys.executable, str(MAIN_FILE)])

    # Try opening browser automatically when server is ready
    import webbrowser, time, urllib.request
    url = "http://127.0.0.1:5000"
    print("Waiting for server to be ready...")
    for i in range(50):  # ~10 seconds max (50 * 0.2)
        try:
            with urllib.request.urlopen(url, timeout=1) as _:
                print("Server is up.")
                break
        except Exception:
            time.sleep(0.2)
    print(f"Opening {url} in your browser...")
    webbrowser.open(url)

    # Wait for Flask to exit
    return process.wait()



def main():
    # First pass: ensure deps, then run
    ensure_dependencies_installed()
    exit_code = run_main()

    # If it failed with an import error, try once more after attempting install
    if exit_code != 0:
        print(f"main.py exited with code {exit_code}. Attempting one-time dependency recovery...")
        ensure_dependencies_installed()
        exit_code = run_main()

    sys.exit(exit_code)


if __name__ == "__main__":
    main()
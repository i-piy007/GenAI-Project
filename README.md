# GenAI-Project — Multi‑Bot Group Chat (Hackathon)

A lightweight Flask app that lets you chat with multiple AI personas at once (Empath, Rationalist, Challenger, Optimist). Built as a Gen AI hackathon project. The UI is a simple group chat; each bot can see the full shared conversation and respond in turn.

## Quick start

- Windows (PowerShell):

```powershell
# from the repo root
python app.py
```

The launcher installs required packages (via requirements.txt) if missing, then starts the Flask server in debug mode.

Open http://127.0.0.1:5000 in your browser.

## Tech stack

- Python + Flask (backend + templating)
- OpenAI Python SDK (pointed at router.requesty.ai) for LLM calls
- HTML/CSS/JS (frontend), no framework

## Project structure (key files)

- `app.py` — bootstrap runner. Ensures dependencies are installed, then runs `main.py`.
- `main.py` — Flask app, routes, multi‑bot logic, and chat API (`POST /chat`).
- `templates/index.html` — Group chat layout (Jinja2 template).
- `static/styles.css` — Styles for the chat UI.
- `static/script.js` — Frontend logic: send message, render bot replies, theme toggle.
- `requirements.txt` — Python dependencies (Flask, openai).
- `py_test.py` / `ai_api_test.py` — Standalone scripts for API testing and CLI multi‑bot chat.
- `frontend/` (if present) — Scratch space for experimenting with new UI components; not used by Flask at runtime.

## Configuration

- Dev auto‑reload is enabled (Flask debug). Template/static changes show on browser refresh.
- API key: this project currently uses a hardcoded router key in `main.py` for simplicity. Replace it with your own or adapt to use an environment variable.
- Optional: set `FLASK_SECRET_KEY` for sessions in development.

## Notes

- This repo is intended for hackathon prototyping. Do not commit real secrets.
- For production, move secrets to environment variables, add proper logging, and run behind a production WSGI server.

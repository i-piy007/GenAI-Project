# GenAI-Project — Multi‑Bot Group Chat

A lightweight Flask app that lets you chat with multiple AI personas at once — Empath 💙, Rationalist 🧠, Challenger 🔥, and Optimist ✨. All bots see the same conversation and reply in turn, so it feels like a group chat with distinct voices.

The project includes a minimal sign‑up/sign‑in flow (SQLite + hashed passwords), a responsive chat UI with dark/light themes, and router-based LLM calls via the OpenAI Python SDK pointed at Requesty Router.

## Quick start (Windows PowerShell)

```powershell
# From the repo root
python app.py
```

What this does:
- Ensures dependencies from `requirements.txt` are installed
- Starts the Flask server in debug mode
- Opens http://127.0.0.1:5000 in your default browser

If you prefer manual setup:
```powershell
python -m pip install -r requirements.txt
python main.py
```

## Features

- Multi‑bot replies in one thread (Empath, Rationalist, Challenger, Optimist)
- Simple auth: sign up, sign in, logout (SQLite `user_data.db`, password hashing via Werkzeug)
- Clean chat UI with dark/light theme toggle and animated typing indicator
- “Bypass” button on auth screens to jump straight into chat (useful for demos)
- Caching disabled in dev so CSS/JS/template changes show on refresh

## Tech stack

- Backend: Python 3 + Flask (Jinja templates)
- LLM: OpenAI Python SDK configured to call Requesty Router
- Frontend: Vanilla HTML/CSS/JS (no framework)

## Project structure

```
app.py                 # Launcher: installs deps (if needed) and runs main.py
main.py                # Flask app: routes, SQLite auth, multi‑bot logic, /chat API
requirements.txt       # Flask + openai
user_data.db           # SQLite DB (created at runtime)
templates/
	index.html           # Chat UI
	login_index.html     # Sign up page
	sign_in.html         # Sign in page
static/
	style.css            # Chat styles
	script.js            # Chat behavior: send/receive, theme, sidebar, modal
	login_style.css      # Sign up styles
	sign_in_style.css    # Sign in styles
	login_script.js      # (empty placeholder)
	sign_in_script.js    # (empty placeholder)
	assests/             # UI icons (note: folder name spelled "assests" in code)
```

## How it works

- Bots are defined in `main.py` (`BOT_DEFS`) with distinct instructions and names.
- Session‑scoped chat histories are maintained per bot so each model call sees the full context.
- On `POST /chat`, the server calls the router model once per bot and returns all replies.
- `script.js` then renders the messages, groups consecutive replies per bot, and animates appearance.

Model configuration (in `main.py`):
- Router base URL: `https://router.requesty.ai/v1`
- Model: `alibaba/qwen3-30b-a3b-instruct-2507`
- API library: `openai` (v1+ style client)

## Routes and API

- `GET /` → Sign‑up page (`templates/login_index.html`)
- `GET /sign_in` → Sign‑in page (`templates/sign_in.html`)
- `POST /signup` → Create user; on success redirects to `/chat`
- `POST /login` → Log in user; on success redirects to `/chat`
- `GET /logout` → Clear session and redirect to `/`
- `GET /chat` → Render chat UI (`templates/index.html`)
- `POST /chat` → Chat API

Request body for `POST /chat`:

```json
{ "message": "your text" }
```

Response body:

```json
{
	"replies": [
		{ "bot": "Empath 💙", "message": "..." },
		{ "bot": "Rationalist 🧠", "message": "..." },
		{ "bot": "Challenger 🔥", "message": "..." },
		{ "bot": "Optimist ✨", "message": "..." }
	]
}
```

## Configuration

- Secret key for sessions: set `FLASK_SECRET_KEY` (or the app uses a dev default)

```powershell
$env:FLASK_SECRET_KEY = "change-me"
```

- Router API key: currently hardcoded in `main.py` for demo purposes. Replace the `ROUTER_API_KEY` value with your own. For production, move secrets to env vars and don’t commit them.

## Database

- SQLite file: `user_data.db` at repo root
- Table: `users(id, username UNIQUE, password_hash, created_at)`
- To reset: stop the server and delete `user_data.db` (a fresh DB will be created on next run)

## Customize

- Edit `BOT_DEFS` in `main.py` to change the personas, tone, or constraints
- Change the model name or router base URL where `client.chat.completions.create(...)` is called
- Tweak chat UI in `templates/index.html` and `static/style.css`
- Add behavior to `static/login_script.js` or `static/sign_in_script.js` (currently empty)

## Troubleshooting

- “No module named …” on first run:
	- The launcher should install deps automatically. If it fails, run:
		```powershell
		python -m pip install -r requirements.txt
		```

- Server starts but browser shows an error:
	- Check the terminal for a stack trace
	- Verify your router API key is valid (update `ROUTER_API_KEY` in `main.py`)

- Port 5000 in use:
	- Stop the other process or run Flask on a different port by editing `app.run(debug=True)` in `main.py` (e.g., `app.run(debug=True, port=5050)`).

- Static changes aren’t showing:
	- Caching headers are disabled in dev, but a hard refresh (Ctrl+F5) can help

## Notes and limitations

- This is a hackathon‑style prototype: no CSRF protection on forms, no rate limiting, secrets are hardcoded for demo, and error handling is minimal
- Don’t commit real API keys; prefer environment variables in real deployments
- For production, use a proper WSGI server (e.g., gunicorn) and configure logging, secrets, and HTTPS

---

Made for quick demos and experimentation with multi‑persona LLM chats. Have fun hacking! 🚀

# GenAI-Project — Multi‑Bot Group Chat

A small Flask app where four bots — Empath 💙, Rationalist 🧠, Challenger 🔥, Optimist ✨ — chat with you. They answer one after another (random order), so it feels like a group chat.

It has sign‑up/sign‑in (SQLite), a clean UI with light/dark mode, and calls a model through Requesty Router using the OpenAI SDK.

## Quick start (Windows PowerShell)

```powershell
# From the repo root
python app.py
```

What this does:
- Installs dependencies if needed
- Starts Flask (reloader off to avoid double‑start)
- Waits until it’s ready, then opens http://127.0.0.1:5000

Manual setup:
```powershell
python -m pip install -r requirements.txt
python main.py
```

## Features

- Four personas reply in turn (random order)
- Sign up / sign in / logout (SQLite, hashed passwords)
- Dark/light theme and typing indicator
- Logs saved to `logs/` and shown in a History sidebar (click to load)
- “New Chat” card at the top of History, sticky header/footer, scrollable sidebar with ellipsis

## Tech stack

- Backend: Python 3 + Flask (Jinja templates)
- LLM: OpenAI Python SDK configured to call Requesty Router
- Frontend: Vanilla HTML/CSS/JS (no framework)

## Project structure

```
 app.py                 # Launcher: installs deps, waits, opens browser
 main.py                # Flask app: auth, relay, transcripts, logs API
requirements.txt       # Flask + openai
user_data.db           # SQLite DB (created at runtime)
 logs/                  # Session logs (created at runtime)
templates/
	index.html           # Chat UI
	login_index.html     # Sign up page
	sign_in.html         # Sign in page
static/
	 style.css            # Chat styles
	 script.js            # Chat behavior: chat, theme, sidebar, modal
	login_style.css      # Sign up styles
	sign_in_style.css    # Sign in styles
	login_script.js      # (empty placeholder)
	sign_in_script.js    # (empty placeholder)
	assests/             # UI icons (note: folder name spelled "assests" in code)
```

## How it works

- `BOT_DEFS` in `main.py` defines each persona
- `POST /chat` runs a relay: each bot gets the prior context and your prompt
- `TRANSCRIPTS` hold this session’s turns; logs are written to `logs/` live
- Sanitizers stop bots from speaking as others and limit name‑drops to known context
- `script.js` renders messages and loads chats from the History list

Model configuration (in `main.py`):
- Router base URL: `https://router.requesty.ai/v1`
- Model: `alibaba/qwen3-30b-a3b-instruct-2507`
- API library: `openai` (v1+ style client)

## Routes

- `GET /` → Sign up
- `GET /sign_in` → Sign in
- `POST /signup` / `POST /login` → On success go to `/chat`
- `GET /logout` → Clear session → `/`
- `GET /chat` → Chat UI; also resets in‑memory transcript and starts a new log
- `POST /chat` → Chat API
- `GET /logs`, `GET /logs/<name>` → List/read logs

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

- Session secret: set `FLASK_SECRET_KEY` (otherwise a dev default is used)

```powershell
$env:FLASK_SECRET_KEY = "change-me"
```

- Router API key is hardcoded in `main.py` for demo. Replace it with your key. In production, use env vars and do not commit secrets.

## Database

- SQLite file: `user_data.db` (created at runtime)
- Table: `users(id, username UNIQUE, password_hash, created_at)`
- To reset: stop server and delete the file

## Customize

- Edit `BOT_DEFS` (personas and tone)
- Change model/router at `client.chat.completions.create(...)`
- Tweak UI in `templates/index.html` and `static/style.css`

## Troubleshooting

- Missing modules: run `python -m pip install -r requirements.txt`
- Browser error on first load: launcher waits for server; check terminal logs if it persists
- Port 5000 busy: change port in `app.run(..., port=5050)`

## Notes and limitations

- Prototype quality: minimal hardening
- Don’t commit real keys; prefer env vars
- For production, use a proper WSGI server and set up logging, secrets, HTTPS

---

Made for quick demos and experimentation with multi‑persona LLM chats. Have fun hacking! 🚀

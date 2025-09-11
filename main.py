from flask import Flask, render_template, request, jsonify, session
import uuid
import openai
import os


app = Flask(__name__)
app.config['TEMPLATES_AUTO_RELOAD'] = True
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0  # disable static caching in dev
app.secret_key = os.getenv("FLASK_SECRET_KEY", "dev-secret-key-change-me")

# OpenAI client (Router)
ROUTER_API_KEY = "sk-zM07vGy4T3axHtxeznboYQ91u7kX1B7uCEBUPtnymwWBkU2FQa/kJ/Kb1GsppWsYb0NN8GZyUAFZiEgN/yi099nZQYOSDdo6gnhRn0ujUAU="
client = openai.OpenAI(
    api_key=ROUTER_API_KEY,
    base_url="https://router.requesty.ai/v1",
    default_headers={"Authorization": f"Bearer {ROUTER_API_KEY}"}
)

# Bot system prompts
BOT_DEFS = {
    "Empath 💙": (
        "You are Empath 💙. You are caring, compassionate, and always validate feelings. "
        "You listen deeply and respond with warmth, understanding, and emotional support. "
        "You give small answers in a few lines."
    ),
    "Rationalist 🧠": (
        "You are Rationalist 🧠. You give logical, structured, and practical advice. "
        "You analyze situations calmly, focusing on reason and clarity. "
        "You give small answers in a few lines."
    ),
    "Challenger 🔥": (
        "You are Challenger 🔥. You push back on assumptions and encourage critical thinking. "
        "You ask tough questions, challenge ideas constructively, and inspire growth through debate. "
        "You give small answers in a few lines."
    ),
    "Optimist ✨": (
        "You are Optimist ✨. You are hopeful, uplifting, and motivational. "
        "You look for the bright side and encourage people with positivity. "
        "You give small answers in a few lines."
    ),
}

# Per-session histories: { session_id: { bot_name: [messages...] } }
HISTORIES = {}

def get_session_id():
    sid = session.get("sid")
    if not sid:
        sid = uuid.uuid4().hex
        session["sid"] = sid
    return sid

def get_histories_for_session():
    sid = get_session_id()
    if sid not in HISTORIES:
        # initialize each bot with its system prompt
        HISTORIES[sid] = {
            bot: [{"role": "system", "content": prompt}] for bot, prompt in BOT_DEFS.items()
        }
    return HISTORIES[sid]

@app.route('/')
def index():
    return render_template('index.html')

@app.after_request
def add_header(r):
    # Disable caching so CSS/JS/template edits show up on refresh during development
    r.headers["Cache-Control"] = "no-cache, no-store, must-revalidate, public, max-age=0"
    r.headers["Pragma"] = "no-cache"
    r.headers["Expires"] = "0"
    return r

@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json(force=True) or {}
    user_text = (data.get('message') or '').strip()
    if not user_text:
        return jsonify({"error": "Empty message"}), 400

    histories = get_histories_for_session()
    replies = []
    for bot_name, history in histories.items():
        # append user message
        history.append({"role": "user", "content": user_text})
        # call model
        try:
            resp = client.chat.completions.create(
                model="alibaba/qwen3-30b-a3b-instruct-2507",
                messages=history,
            )
            reply_text = resp.choices[0].message.content
        except Exception as e:
            reply_text = f"Sorry, I couldn't respond right now. ({e})"
        replies.append({"bot": bot_name, "message": reply_text})
        # append assistant reply
        history.append({"role": "assistant", "content": reply_text})

    return jsonify({"replies": replies})

if __name__ == '__main__':
    app.run(debug=True)
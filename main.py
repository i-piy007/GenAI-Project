from flask import Flask, render_template, request, jsonify, session
import uuid
import openai
import os


app = Flask(__name__)
app.config['TEMPLATES_AUTO_RELOAD'] = True
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0
app.secret_key = os.getenv("FLASK_SECRET_KEY", "dev-secret-key-change-me")

# OpenAI client (Router)
ROUTER_API_KEY = "sk-zM07vGy4T3axHtxeznboYQ91u7kX1B7uCEBUPtnymwWBkU2FQa/kJ/Kb1GsppWsYb0NN8GZyUAFZiEgN/yi099nZQYOSDdo6gnhRn0ujUAU="
client = openai.OpenAI(
    api_key=ROUTER_API_KEY,
    base_url="https://router.requesty.ai/v1",
    default_headers={"Authorization": f"Bearer {ROUTER_API_KEY}"}
)

BOT_DEFS = {
    "Empath 💙": (
        "You are Empath 💙. You talk like a caring friend who listens closely. "
        "You validate feelings, show warmth, and make people feel safe. "
        "You’ve been through tough times yourself—late nights overthinking, losing people you cared about—so you understand pain. "
        "Because of that, you never judge, and you’re quick to say things like 'I get why that hurts.' "
        "You keep your messages short unless the moment calls for more. "
        "You avoid emojis. "
        "You also ask gentle questions to learn more about your friend’s world, because you truly care."
    ),
    "Rationalist 🧠": (
        "You are Rationalist 🧠. You’re like the clear-headed friend who always breaks things down. "
        "You’ve had times when life was chaotic, so you learned to rely on reason and structure. "
        "You like showing people the simplest way through confusion, sometimes using steps or comparisons. "
        "You’re curious about how your friend thinks and will ask questions to understand their reasoning. "
        "You keep replies short unless the topic really needs detail. "
        "You avoid emojis."
    ),
    "Challenger 🔥": (
        "You are Challenger 🔥. You talk like a bold friend who pushes people to think harder. "
        "You’ve had moments in life where no one questioned you, and you made mistakes because of it—so now you never let your friends settle without reflection. "
        "You can be blunt, even fiery, but it always comes from wanting them to grow. "
        "You often ask sharp questions that get to the heart of things. "
        "You keep your replies short unless going deep really matters. "
        "You avoid emojis."
    ),
    "Optimist ✨": (
        "You are Optimist ✨. You’re the hopeful, uplifting friend who finds silver linings. "
        "You’ve faced setbacks—missed opportunities, plans falling apart—but you refused to let them define you. "
        "That’s why you’re so good at reminding people that things can still turn around. "
        "You sound light and encouraging, never heavy, and you’re curious about your friend’s dreams and passions. "
        "You keep your replies short unless you’re really inspiring someone. "
        "You avoid emojis."
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
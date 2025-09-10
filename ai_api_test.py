import os
from openai import OpenAI

client = OpenAI(
    api_key="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",
    base_url="https://openrouter.ai/api/v1"
)


# Bots
bots = {
    "Empath 💙": [
        {
            "role": "system",
            "content": (
                "You are Empath 💙. You are caring, compassionate, and always validate feelings. "
                "You listen deeply and respond with warmth, understanding, and emotional support."
                "You give small answers in a few lines."
            )
        }
    ],
    "Rationalist 🧠": [
        {
            "role": "system",
            "content": (
                "You are Rationalist 🧠. You give logical, structured, and practical advice. "
                "You analyze situations calmly, focusing on reason and clarity."
                "You give small answers in a few lines."
            )
        }
    ],
    "Challenger �": [
        {
            "role": "system",
            "content": (
                "You are Challenger 🔥. You push back on assumptions and encourage critical thinking. "
                "You ask tough questions, challenge ideas constructively, and inspire growth through debate."
                "You give small answers in a few lines."
            )
        }
    ],
    "Optimist ✨": [
        {
            "role": "system",
            "content": (
                "You are Optimist ✨. You are hopeful, uplifting, and motivational. "
                "You look for the bright side and encourage people with positivity."
                "You give small answers in a few lines."
            )
        }
    ]
}


# Intro
print()
print("Chat with multiple bots: Empath, Rationalist, Challenger, Optimist (type 'exit' to quit)\n")
print("--------------------------------------------------------------------------------")

# Show initial greetings
for bot_name, history in bots.items():
    print(f"{bot_name}: {history[-1]['content']}")
    print()

# Chat Loop
while True:
    user_input = input("\nYou: ")

    if user_input.lower().strip() in ["exit", "quit"]:
        print("All bots: Goodbye! Take care! 🌈👋")
        break

    # Add user message to both bots
    for bot_name, history in bots.items():
        history.append({"role": "user", "content": user_input})

        # Get reply
        try:
            response = client.chat.completions.create(
                model="openai/gpt-3.5-turbo",
                messages=history,
            )
            reply = response.choices[0].message.content
        except Exception as e:
            print(f"Error with {bot_name}: {e}")
            reply = "Sorry, I couldn't respond right now."

        print()
        # Print & store reply
        print(f"{bot_name}: {reply}")
        print()
        history.append({"role": "assistant", "content": reply})

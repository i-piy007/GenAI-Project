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
            )
        }
    ],
    "Rationalist 🧠": [
        {
            "role": "system",
            "content": (
                "You are Rationalist 🧠. You give logical, structured, and practical advice. "
                "You analyze situations calmly, focusing on reason and clarity."
                "You quote facts and keep it short"
            )
        }
    ],
    "Challenger �": [
        {
            "role": "system",
            "content": (
                "You are Challenger 🔥. You push back on assumptions and encourage critical thinking. "
                "You ask tough questions, challenge ideas constructively, and inspire growth through debate."
            )
        }
    ],
    "Optimist ✨": [
        {
            "role": "system",
            "content": (
                "You are Optimist ✨. You are hopeful, uplifting, and motivational. "
                "You look for the bright side and encourage people with positivity."
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
        response = client.chat.completions.create(
            model="openai/gpt-3.5-turbo",
            messages=history,
        )
        reply = response.choices[0].message.content

        print()
        # Print & store reply
        print(f"{bot_name}: {reply}")
        print()
        history.append({"role": "assistant", "content": reply})

# app.py
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Get API key from environment variable
GOOGLE_API_KEY = os.getenv('GEMINI_API_KEY')

if not GOOGLE_API_KEY:
    raise ValueError("Google API Key is missing in environment variables.")

# Configure Google Generative AI
genai.configure(api_key=GOOGLE_API_KEY)

# Initialize the model
model = genai.GenerativeModel('gemini-pro')

# Store active chats and their summaries
active_chats = {}

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        user_message = data.get('userMessage')
        chat_id = data.get('chatId')
        summary = data.get('summary')

        if not user_message or not isinstance(user_message, str):
            return jsonify({
                "error": "Invalid input. Please provide a valid message."
            }), 400

        # Initialize or get existing chat
        if chat_id not in active_chats:
            chat = model.start_chat(history=[])
            active_chats[chat_id] = {
                'chat': chat,
                'summary': summary
            }
        else:
            chat = active_chats[chat_id]['chat']

        # Construct prompt with context
        contextualized_prompt = f"""Based on this lecture summary:
{summary}

User question: {user_message}

Please answer only using information from the lecture summary provided above. If the question cannot be answered using the lecture summary, please respond with "I cannot answer this question based on the lecture content."
"""

        # Generate response using Gemini
        response = chat.send_message(contextualized_prompt)

        return jsonify({"reply": response.text})

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({
            "error": "Failed to get a response from the AI. Please try again later."
        }), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
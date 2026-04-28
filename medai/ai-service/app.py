"""
MedAI Python Flask Service
Handles disease prediction, PDF report analysis, and chatbot
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
import os, logging
from dotenv import load_dotenv

load_dotenv()

from utils.predictor import DiseasePredictor
from utils.report_analyzer import ReportAnalyzer
from utils.chatbot import HealthChatbot

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

predictor = DiseasePredictor()
analyzer = ReportAnalyzer()
chatbot = HealthChatbot()

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'OK', 'service': 'MedAI Python AI Service', 'models_loaded': predictor.models_loaded()})

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        disease_type = data.get('disease_type')
        input_data = data.get('input_data', {})
        if not disease_type:
            return jsonify({'error': 'disease_type is required'}), 400
        result = predictor.predict(disease_type, input_data)
        return jsonify(result)
    except Exception as e:
        logger.error(f'Prediction error: {str(e)}')
        return jsonify({'error': str(e)}), 500

@app.route('/analyze-report', methods=['POST'])
def analyze_report():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        file_path = data.get('file_path')
        file_data = data.get('file_data')
        report_type = data.get('report_type', 'unknown')
        result = analyzer.analyze(file_path=file_path, file_data_b64=file_data, report_type=report_type)
        return jsonify(result)
    except Exception as e:
        logger.error(f'Report analysis error: {str(e)}')
        return jsonify({'error': str(e)}), 500

@app.route('/chatbot', methods=['POST'])
def chatbot_message():
    try:
        data = request.get_json()
        message = data.get('message', '')
        history = data.get('history', [])
        user_context = data.get('user_context', {})
        reply = chatbot.respond(message, history, user_context)
        return jsonify({'reply': reply})
    except Exception as e:
        logger.error(f'Chatbot error: {str(e)}')
        return jsonify({'reply': 'I encountered an error. Please try again.'}), 500

@app.route('/models', methods=['GET'])
def list_models():
    return jsonify({'models': predictor.available_models()})

@app.errorhandler(404)
def not_found(e):
    return jsonify({'error': 'Route not found'}), 404

if __name__ == '__main__':
    port = int(os.getenv('FLASK_PORT', 5001))
    debug = os.getenv('FLASK_ENV', 'development') == 'development'
    logger.info(f'MedAI AI Service starting on port {port}')
    app.run(host='0.0.0.0', port=port, debug=debug)

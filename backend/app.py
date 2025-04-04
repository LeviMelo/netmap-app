# backend/app.py
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
from pythonjsonlogger import jsonlogger

from analysis import run_full_analysis
from utils import parse_graph_data, custom_json_dumps

# --- Logging Setup ---
logger = logging.getLogger("NetmapAppLogger")
logger.setLevel(logging.INFO)
logHandler = logging.StreamHandler()
formatter = jsonlogger.JsonFormatter('%(asctime)s %(levelname)s %(name)s %(message)s')
logHandler.setFormatter(formatter)
logger.addHandler(logHandler)
logger.propagate = False # Prevent duplicate logs if root logger is configured

# --- Flask App Setup ---
app = Flask(__name__)
# Configure CORS - Allow requests from your frontend origin (Vite default is 5173)
# In production, restrict this to your frontend's actual domain
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:5173", "http://127.0.0.1:5173"]}})

# --- API Endpoints ---

@app.route('/api/health', methods=['GET'])
def health_check():
    """Simple health check endpoint."""
    logger.info("Health check endpoint called.")
    return jsonify({"status": "ok"})

@app.route('/api/analyze', methods=['POST'])
def analyze_graph():
    """Analyzes the provided graph data."""
    logger.info("Received request for /api/analyze")
    if not request.is_json:
        logger.error("Request is not JSON")
        return jsonify({"error": "Request must be JSON"}), 400

    data = request.get_json()
    if not data or ('nodes' not in data and 'edges' not in data):
        logger.error("Missing 'nodes' or 'edges' in request data", extra={"request_data": data})
        return jsonify({"error": "Missing 'nodes' or 'edges' in JSON data"}), 400

    try:
        # Log the received raw data structure for debugging
        # Be cautious logging large graphs in production
        # logger.debug("Raw graph data received", extra={"graph_data_keys": list(data.keys()) if isinstance(data, dict) else None})

        # Parse and validate basic structure
        nodes_dict, edges_list = parse_graph_data(data)
        logger.info(f"Parsed graph data: {len(nodes_dict)} nodes, {len(edges_list)} edges")

        # Run the full analysis
        analysis_results = run_full_analysis(nodes_dict, edges_list)
        logger.info("Analysis complete.")

        # Optionally log summary of results
        # logger.info("Analysis results summary", extra={
        #     "validation_errors": len(analysis_results.get("validation", {}).get("errors", [])),
        #     "proposed_edges": len(analysis_results.get("embedding_analysis", {}).get("sentence_transformer", {}).get("proposed_edges", [])),
        # })

        return jsonify(analysis_results), 200

    except ValueError as ve:
            logger.error(f"Value error during parsing/analysis: {ve}", exc_info=True)
            return jsonify({"error": f"Data processing error: {ve}"}), 400
    except ImportError as ie:
            logger.error(f"Import error during analysis: {ie}", exc_info=True)
            return jsonify({"error": f"Server configuration error: Missing dependency - {ie}"}), 500
    except Exception as e:
        # Log the full exception details for debugging
        logger.error(f"Unexpected error during analysis: {e}", exc_info=True)
        return jsonify({"error": f"An unexpected server error occurred: {e}"}), 500

# --- Main Execution ---
if __name__ == '__main__':
    # Use environment variable for port, default to 5001
    port = int(os.environ.get("FLASK_PORT", 5001))
    # Run in debug mode for development (auto-reloads, detailed errors)
    # Set debug=False for production
    app.run(debug=True, port=port, host='0.0.0.0')
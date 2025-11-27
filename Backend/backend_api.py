"""
Flask API Server for AI Model Predictions
Connects Price Prediction and Next Crop Recommendation models with frontend
Runs on port 5001
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import os
import importlib.util

# Add model directories to path
price_model_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '../Models/Price Prediction'))
crop_model_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '../Models/Next Crop'))

sys.path.insert(0, price_model_dir)
sys.path.insert(0, crop_model_dir)

# Change to model directories to load .pkl files
price_model_loaded = False
crop_model_loaded = False

try:
    os.chdir(price_model_dir)
    import importlib.util
    spec = importlib.util.spec_from_file_location("price_predict", os.path.join(price_model_dir, "fast_predict.py"))
    price_module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(price_module)
    price_predict = price_module.predict_price
    get_price_options = price_module.get_available_options
    price_model_loaded = True
    print("✅ Price Prediction model loaded")
except Exception as e:
    price_model_loaded = False
    print(f"⚠️ Price Prediction model not loaded: {e}")

try:
    os.chdir(crop_model_dir)
    spec = importlib.util.spec_from_file_location("crop_predict", os.path.join(crop_model_dir, "fast_predict.py"))
    crop_module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(crop_module)
    predict_next_crop = crop_module.predict_next_crop
    get_crop_options = crop_module.get_available_options
    crop_model_loaded = True
    print("✅ Next Crop model loaded")
except Exception as e:
    crop_model_loaded = False
    print(f"⚠️ Next Crop model not loaded: {e}")

# Change back to backend directory
os.chdir(os.path.dirname(__file__))

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'price_model': price_model_loaded,
        'crop_model': crop_model_loaded,
        'message': 'AI Model API Server Running'
    })

@app.route('/api/predict-price', methods=['POST'])
def predict_price():
    """
    Predict crop price
    
    Request body:
    {
        "date": "2024-03-15",
        "crop": "Tomato",
        "qualityGrade": "A",
        "farmersLocation": "Mumbai",
        "seasonMonth": "March"
    }
    
    Response:
    {
        "success": true,
        "predicted_price": 45.50,
        "min_price": 38.68,
        "max_price": 52.33
    }
    """
    try:
        if not price_model_loaded:
            return jsonify({
                'success': False,
                'error': 'Price prediction model not loaded. Please train the model first.'
            }), 503
        
        data = request.json
        
        # Map frontend field names to model field names
        input_data = {
            'date': data.get('date'),
            'crop': data.get('crop'),
            'quality_grade': data.get('qualityGrade'),
            'farmers_location': data.get('farmersLocation'),
            'season_month': data.get('seasonMonth')
        }
        
        # Validate required fields
        missing_fields = [k for k, v in input_data.items() if not v]
        if missing_fields:
            return jsonify({
                'success': False,
                'error': f'Missing required fields: {", ".join(missing_fields)}'
            }), 400
        
        # Get prediction
        result = price_predict(input_data)
        
        return jsonify(result), 200 if result.get('success') else 400
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Server error: {str(e)}'
        }), 500

@app.route('/api/predict-next-crop', methods=['POST'])
def predict_crop():
    """
    Predict next crop recommendation
    
    Request body:
    {
        "ph": 6.8,
        "soilType": "loam",
        "previousCrop": "Tomato",
        "areaHa": 2.5,
        "rainfall": 800,
        "temperature": 28,
        "month": "Mar",
        "district": "Pune"
    }
    
    Response:
    {
        "success": true,
        "recommended_crop": "Spinach",
        "confidence": 85.5,
        "top_crops": [
            {"crop": "Spinach", "probability": 85.5},
            {"crop": "Cabbage", "probability": 75.2},
            ...
        ],
        "rotation_benefit": "Excellent rotation - Different nutrient requirements"
    }
    """
    try:
        if not crop_model_loaded:
            return jsonify({
                'success': False,
                'error': 'Crop prediction model not loaded. Please train the model first.'
            }), 503
        
        data = request.json
        
        # Map frontend field names to model field names
        input_data = {
            'ph': float(data.get('ph', 6.5)),
            'soil_type': data.get('soilType'),
            'previous_crop': data.get('previousCrop'),
            'area_ha': float(data.get('areaHa', 1.0)),
            'rainfall': float(data.get('rainfall', 500)),
            'temperature': float(data.get('temperature', 25)),
            'month': data.get('month'),
            'district': data.get('district')
        }
        
        # Validate required fields
        required_text_fields = ['soil_type', 'previous_crop', 'month', 'district']
        missing_fields = [k for k in required_text_fields if not input_data.get(k)]
        if missing_fields:
            return jsonify({
                'success': False,
                'error': f'Missing required fields: {", ".join(missing_fields)}'
            }), 400
        
        # Get prediction (with crop rotation - exclude previous crop)
        result = predict_next_crop(input_data, exclude_previous=True)
        
        return jsonify(result), 200 if result.get('success') else 400
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Server error: {str(e)}'
        }), 500

@app.route('/api/options/price', methods=['GET'])
def get_price_dropdown_options():
    """Get available options for price prediction form dropdowns"""
    try:
        if not price_model_loaded:
            return jsonify({
                'success': False,
                'error': 'Model not loaded'
            }), 503
        
        options = get_price_options()
        if options:
            return jsonify({
                'success': True,
                'options': options
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Could not load options'
            }), 500
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/options/crop', methods=['GET'])
def get_crop_dropdown_options():
    """Get available options for crop prediction form dropdowns"""
    try:
        if not crop_model_loaded:
            return jsonify({
                'success': False,
                'error': 'Model not loaded'
            }), 503
        
        options = get_crop_options()
        if options:
            return jsonify({
                'success': True,
                'options': options
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Could not load options'
            }), 500
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    print("\n" + "="*70)
    print("🚀 STARTING AI MODEL API SERVER")
    print("="*70)
    print(f"Price Model: {'✅ Loaded' if price_model_loaded else '❌ Not Loaded'}")
    print(f"Crop Model: {'✅ Loaded' if crop_model_loaded else '❌ Not Loaded'}")
    print(f"\nServer running on: http://localhost:5001")
    print(f"Frontend should connect to: http://localhost:5001/api/predict-price")
    print(f"                          and http://localhost:5001/api/predict-next-crop")
    print("="*70 + "\n")
    
    app.run(host='0.0.0.0', port=5001, debug=True)

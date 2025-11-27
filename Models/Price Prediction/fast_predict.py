"""
Fast Price Prediction using Pre-trained Model
This loads the saved model and makes predictions in <0.5 seconds
"""

import pandas as pd
import numpy as np
import joblib
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')

# Load models once at module import
try:
    model = joblib.load('price_model.pkl')
    encoders = joblib.load('price_encoders.pkl')
    feature_info = joblib.load('price_feature_info.pkl')
    print("✅ Price prediction model loaded successfully!")
except Exception as e:
    print(f"⚠️ Error loading model: {e}")
    print("Please run train_and_save_model.py first!")
    model = None
    encoders = None
    feature_info = None

def predict_price(input_data):
    """
    Predict crop price based on input parameters
    
    Args:
        input_data (dict): {
            'date': 'YYYY-MM-DD',
            'crop': 'crop_name',
            'quality_grade': 'A/B/C/D',
            'farmers_location': 'location_name',
            'season_month': 'month_name'
        }
    
    Returns:
        dict: {
            'success': True/False,
            'predicted_price': float,
            'min_price': float,
            'max_price': float,
            'error': str (if any)
        }
    """
    try:
        if model is None or encoders is None:
            return {
                'success': False,
                'error': 'Model not loaded. Please train the model first.'
            }
        
        # Parse input
        date = input_data.get('date', datetime.now().strftime('%Y-%m-%d'))
        crop = input_data.get('crop', '')
        quality_grade = input_data.get('quality_grade', '')
        farmers_location = input_data.get('farmers_location', '')
        season_month = input_data.get('season_month', '')
        
        # Convert date to datetime
        date_obj = pd.to_datetime(date)
        year = date_obj.year
        month = date_obj.month
        day = date_obj.day
        
        # Encode categorical variables
        try:
            crop_encoded = encoders['crop'].transform([crop])[0]
        except:
            crop_encoded = 0  # Default if not found
            
        try:
            quality_encoded = encoders['quality_grade'].transform([quality_grade])[0]
        except:
            quality_encoded = 0
            
        try:
            location_encoded = encoders['farmers_location'].transform([farmers_location])[0]
        except:
            location_encoded = 0
            
        try:
            month_encoded = encoders['season_month'].transform([season_month])[0]
        except:
            month_encoded = 0
        
        # Create feature array
        features = np.array([[crop_encoded, quality_encoded, location_encoded, 
                            month_encoded, year, month, day]])
        
        # Make prediction
        predicted_price = model.predict(features)[0]
        
        # Calculate min and max (estimated range ±15%)
        min_price = predicted_price * 0.85
        max_price = predicted_price * 1.15
        
        return {
            'success': True,
            'predicted_price': float(round(predicted_price, 2)),
            'min_price': float(round(min_price, 2)),
            'max_price': float(round(max_price, 2))
        }
        
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }

def get_available_options():
    """Get available options for dropdown fields"""
    try:
        if encoders is None:
            return None
            
        return {
            'crops': list(encoders['crop'].classes_),
            'quality_grades': list(encoders['quality_grade'].classes_),
            'locations': list(encoders['farmers_location'].classes_),
            'months': list(encoders['season_month'].classes_)
        }
    except:
        return None

# Test function
if __name__ == "__main__":
    # Test prediction
    test_data = {
        'date': '2024-03-15',
        'crop': 'Tomato',
        'quality_grade': 'A',
        'farmers_location': 'Mumbai',
        'season_month': 'March'
    }
    
    result = predict_price(test_data)
    print("\n🧪 Test Prediction:")
    print(f"Input: {test_data}")
    print(f"Result: {result}")
    
    if result.get('success'):
        print(f"\n💰 Predicted Price: ₹{result['predicted_price']}")
        print(f"📊 Price Range: ₹{result['min_price']} - ₹{result['max_price']}")

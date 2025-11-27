"""
Fast Next Crop Recommendation using Pre-trained Model
Loads saved model and makes predictions in <0.5 seconds
"""

import pandas as pd
import numpy as np
import joblib
import warnings
warnings.filterwarnings('ignore')

# Load model once at module import
try:
    model_data = joblib.load('crop_model.pkl')
    print("✅ Next Crop model loaded successfully!")
except Exception as e:
    print(f"⚠️ Error loading model: {e}")
    print("Please run train_and_save_model.py first!")
    model_data = None

def predict_next_crop(input_data, exclude_previous=True):
    """
    Predict next crop recommendation with crop rotation
    
    Args:
        input_data (dict): {
            'ph': float,
            'soil_type': str,
            'previous_crop': str,
            'area_ha': float,
            'rainfall': float,
            'temperature': float,
            'month': str,
            'district': str
        }
        exclude_previous (bool): Exclude previous crop from recommendations (for rotation)
    
    Returns:
        dict: {
            'success': True/False,
            'recommended_crop': str,
            'confidence': float,
            'top_crops': list of dicts [{'crop': str, 'probability': float}, ...],
            'rotation_benefit': str,
            'error': str (if any)
        }
    """
    try:
        if model_data is None:
            return {
                'success': False,
                'error': 'Model not loaded. Please train the model first.'
            }
        
        model = model_data['model']
        label_encoders = model_data['label_encoders']
        target_encoder = model_data['target_encoder']
        
        # Extract input parameters
        ph = input_data.get('ph', 6.5)
        soil_type = input_data.get('soil_type', '')
        previous_crop = input_data.get('previous_crop', '')
        area_ha = input_data.get('area_ha', 1.0)
        rainfall = input_data.get('rainfall', 500)
        temperature = input_data.get('temperature', 25)
        month = input_data.get('month', '')
        district = input_data.get('district', '')
        
        # Encode categorical variables
        try:
            soil_encoded = label_encoders['soil_type'].transform([soil_type])[0]
        except:
            soil_encoded = 0
            
        try:
            prev_crop_encoded = label_encoders['previous_crop'].transform([previous_crop])[0]
        except:
            prev_crop_encoded = 0
            
        try:
            month_encoded = label_encoders['month'].transform([month])[0]
        except:
            month_encoded = 0
            
        try:
            district_encoded = label_encoders['district'].transform([district])[0]
        except:
            district_encoded = 0
        
        # Prepare features
        features = pd.DataFrame([[
            ph,
            area_ha,
            rainfall,
            temperature,
            soil_encoded,
            prev_crop_encoded,
            month_encoded,
            district_encoded
        ]], columns=['ph', 'area_ha', 'rainfall', 'temperature',
                     'soil_type_encoded', 'previous_crop_encoded',
                     'month_encoded', 'district_encoded'])
        
        # Get prediction probabilities
        prediction_proba = model.predict_proba(features)[0]
        all_crops = target_encoder.classes_
        
        # Handle crop rotation (exclude previous crop)
        if exclude_previous and previous_crop:
            # Find previous crop index
            previous_crop_idx = None
            for idx, crop in enumerate(all_crops):
                if crop.lower() == previous_crop.lower():
                    previous_crop_idx = idx
                    break
            
            # Set previous crop probability to 0
            if previous_crop_idx is not None:
                prediction_proba_modified = prediction_proba.copy()
                prediction_proba_modified[previous_crop_idx] = 0
                
                # Renormalize probabilities
                if prediction_proba_modified.sum() > 0:
                    prediction_proba_modified = prediction_proba_modified / prediction_proba_modified.sum()
            else:
                prediction_proba_modified = prediction_proba
        else:
            prediction_proba_modified = prediction_proba
        
        # Get top prediction
        top_idx = np.argmax(prediction_proba_modified)
        recommended_crop = all_crops[top_idx]
        confidence = prediction_proba_modified[top_idx]
        
        # Get top 5 crops
        top_indices = np.argsort(prediction_proba_modified)[-10:][::-1]
        
        top_crops = []
        for idx in top_indices:
            crop = all_crops[idx]
            prob = prediction_proba_modified[idx]
            
            # Skip previous crop
            if exclude_previous and crop.lower() == previous_crop.lower():
                continue
                
            top_crops.append({
                'crop': crop,
                'probability': float(round(prob * 100, 2))
            })
            
            if len(top_crops) >= 5:
                break
        
        # Get rotation benefit message
        rotation_benefit = get_rotation_benefit(previous_crop, recommended_crop)
        
        return {
            'success': True,
            'recommended_crop': recommended_crop,
            'confidence': float(round(confidence * 100, 2)),
            'top_crops': top_crops,
            'rotation_benefit': rotation_benefit
        }
        
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }

def get_rotation_benefit(previous_crop, recommended_crop):
    """Get crop rotation benefits"""
    if not previous_crop or not recommended_crop:
        return "Good crop selection"
    
    prev = previous_crop.lower()
    rec = recommended_crop.lower()
    
    # Define rotation benefits
    rotation_benefits = {
        ('tomato', 'cabbage'): "Excellent rotation - Different nutrient requirements",
        ('tomato', 'spinach'): "Great choice - Leafy crops follow fruiting crops well",
        ('spinach', 'tomato'): "Good rotation - Balanced soil usage",
        ('coriander', 'beans'): "Excellent - Beans add nitrogen to soil",
        ('cucumber', 'radish'): "Good choice - Different root depths",
        ('cauliflower', 'peas'): "Great rotation - Peas enrich soil",
    }
    
    key = (prev, rec)
    if key in rotation_benefits:
        return rotation_benefits[key]
    
    # Generic benefit if not in specific list
    if prev != rec:
        return "Good crop rotation - Helps maintain soil health"
    else:
        return "Consider rotating with a different crop for better soil health"

def get_available_options():
    """Get available options for dropdown fields"""
    try:
        if model_data is None:
            return None
            
        label_encoders = model_data['label_encoders']
        target_encoder = model_data['target_encoder']
        
        return {
            'soil_types': sorted(list(label_encoders['soil_type'].classes_)),
            'crops': sorted(list(label_encoders['previous_crop'].classes_)),
            'months': list(label_encoders['month'].classes_),
            'districts': sorted(list(label_encoders['district'].classes_)),
            'recommended_crops': sorted(list(target_encoder.classes_))
        }
    except:
        return None

# Test function
if __name__ == "__main__":
    # Test prediction
    test_data = {
        'ph': 6.8,
        'soil_type': 'loam',
        'previous_crop': 'Tomato',
        'area_ha': 2.5,
        'rainfall': 800,
        'temperature': 28,
        'month': 'Mar',
        'district': 'Pune'
    }
    
    result = predict_next_crop(test_data, exclude_previous=True)
    print("\n🧪 Test Prediction:")
    print(f"Input: {test_data}")
    print(f"\nResult:")
    if result.get('success'):
        print(f"✅ Recommended Crop: {result['recommended_crop']}")
        print(f"📊 Confidence: {result['confidence']}%")
        print(f"🔄 Rotation Benefit: {result['rotation_benefit']}")
        print(f"\n📋 Top 5 Recommendations:")
        for crop_info in result['top_crops']:
            print(f"   • {crop_info['crop']}: {crop_info['probability']}%")
    else:
        print(f"❌ Error: {result.get('error')}")

# ============================================================================
# 🌾 CROP PREDICTION MODEL - COMPLETE STANDALONE CODE
# ============================================================================
# Author: Agricultural AI System
# ============================================================================

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
import warnings

warnings.filterwarnings('ignore')


# ============================================================================
# STEP 1: DATA GENERATION
# ============================================================================

def generate_training_data(num_rows=2000, filename='AgroReach_vegetables_2000.csv'):
    """Generate synthetic training data with 20 vegetable crops"""
    print("="*70)
    print("📊 STEP 1: GENERATING TRAINING DATA")
    print("="*70)
    
    vegetables = [
        'Tomato', 'Spinach', 'Coriander', 'Fenugreek Leaves', 'Green Chilies',
        'Cucumber', 'Green Peas', 'Beans', 'Cauliflower', 'Cabbage',
        'Brinjal', 'Ladyfinger', 'Bottle Gourd', 'Ridge Gourd', 'Bitter Gourd',
        'Pumpkin', 'Radish', 'Beetroot', 'Carrot', 'Spring Onion'
    ]
    
    districts = ['Pune', 'Nagpur', 'Nashik', 'Aurangabad', 'Kolhapur', 'Ahmednagar',
                 'Solapur', 'Satara', 'Sangli', 'Latur', 'Beed', 'Parbhani', 'Hingoli',
                 'Jalgaon', 'Buldhana', 'Akola', 'Amravati', 'Yavatmal', 'Wardha',
                 'Chandrapur', 'Gondia', 'Gadchiroli', 'Nanded', 'Osmanabad']
    
    soil_types = ['black', 'clay', 'loam', 'red', 'sandy', 'alluvial']
    months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    
    np.random.seed(42)
    
    data = {
        'index': range(1, num_rows + 1),
        'ph': np.round(np.random.uniform(5.2, 7.9, num_rows), 2),
        'soil_type': np.random.choice(soil_types, num_rows),
        'previous_crop': np.random.choice(vegetables, num_rows),
        'area_ha': np.round(np.random.uniform(0.2, 5.0, num_rows), 2),
        'weather': [f"{np.random.randint(80, 1200)}mm/{np.round(np.random.uniform(15, 35), 1)}C" for _ in range(num_rows)],
        'month': np.random.choice(months, num_rows),
        'district': np.random.choice(districts, num_rows)
    }
    
    df = pd.DataFrame(data)
    df.to_csv(filename, index=False)
    
    print(f"\n✅ Dataset created with {num_rows} rows")
    print(f"📁 File saved: {filename}")
    print(f"\nDataset Summary:")
    print(f"   • Rows: {len(df)}")
    print(f"   • Columns: {', '.join(df.columns)}")
    print(f"   • Unique crops: {df['previous_crop'].nunique()}")
    
    return df


# ============================================================================
# STEP 2: PREPROCESSING & MODEL CLASS
# ============================================================================

class CropPredictor:
    """Complete Crop Prediction Model"""
    
    def __init__(self):
        self.model = None
        self.label_encoders = {}
        self.target_encoder = None
        self.feature_importance = None
    
    def preprocess_data(self, df):
        """Preprocess raw data"""
        print("\n" + "="*70)
        print("🔧 STEP 2: PREPROCESSING DATA")
        print("="*70)
        
        df_processed = df.copy()
        
        # Extract weather components
        df_processed['rainfall'] = df_processed['weather'].str.extract(r'(\d+)mm')[0].astype(float)
        df_processed['temperature'] = df_processed['weather'].str.extract(r'/(\d+\.\d+)C')[0].astype(float)
        df_processed = df_processed.drop('weather', axis=1)
        
        # Encode categorical variables
        categorical_columns = ['soil_type', 'previous_crop', 'month', 'district']
        
        for col in categorical_columns:
            le = LabelEncoder()
            df_processed[col + '_encoded'] = le.fit_transform(df_processed[col])
            self.label_encoders[col] = le
            print(f"   ✓ Encoded {col}: {len(le.classes_)} unique values")
        
        # Encode target variable
        self.target_encoder = LabelEncoder()
        df_processed['crop_encoded'] = self.target_encoder.fit_transform(df_processed['previous_crop'])
        
        print(f"\n✅ Preprocessing completed!")
        return df_processed
    
    def prepare_features(self, df_processed):
        """Prepare X and y"""
        feature_cols = ['ph', 'area_ha', 'rainfall', 'temperature',
                        'soil_type_encoded', 'previous_crop_encoded',
                        'month_encoded', 'district_encoded']
        
        X = df_processed[feature_cols]
        y = df_processed['crop_encoded']
        
        return X, y
    
    def train_model(self, X, y, test_size=0.2):
        """Train Random Forest model"""
        print("\n" + "="*70)
        print("🤖 STEP 3: TRAINING MODEL")
        print("="*70)
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=test_size, random_state=42
        )
        
        print(f"\n   • Training samples: {len(X_train)}")
        print(f"   • Testing samples: {len(X_test)}")
        
        # Train model
        print("\n   🔄 Training Random Forest with 200 trees...")
        self.model = RandomForestClassifier(
            n_estimators=200,
            max_depth=20,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=42,
            n_jobs=-1
        )
        
        self.model.fit(X_train, y_train)
        
        # Evaluate
        train_acc = accuracy_score(y_train, self.model.predict(X_train))
        test_acc = accuracy_score(y_test, self.model.predict(X_test))
        
        print(f"\n✅ Model training completed!")
        print(f"   📊 Training Accuracy: {train_acc*100:.2f}%")
        print(f"   📊 Testing Accuracy: {test_acc*100:.2f}%")
        
        # Feature importance
        self.feature_importance = pd.DataFrame({
            'feature': X.columns,
            'importance': self.model.feature_importances_
        }).sort_values('importance', ascending=False)
        
        print(f"\n   📈 Top 5 Important Features:")
        for idx, row in self.feature_importance.head(5).iterrows():
            print(f"      {row['feature']:25s} → {row['importance']*100:6.2f}%")
        
        return X_test, y_test
    
    def predict_next_crop(self, input_data):
        """Make crop prediction"""
        print("\n" + "="*70)
        print("🌾 CROP PREDICTION")
        print("="*70)
        
        print("\n📋 Input Parameters:")
        for key, value in input_data.items():
            print(f"   {key:20s} → {value}")
        
        try:
            # Encode inputs
            soil_encoded = self.label_encoders['soil_type'].transform([input_data['soil_type']])[0]
            prev_crop_encoded = self.label_encoders['previous_crop'].transform([input_data['previous_crop']])[0]
            month_encoded = self.label_encoders['month'].transform([input_data['month']])[0]
            district_encoded = self.label_encoders['district'].transform([input_data['district']])[0]
            
            # Create feature vector
            features = np.array([[
                input_data['ph'],
                input_data['area_ha'],
                input_data['rainfall'],
                input_data['temperature'],
                soil_encoded,
                prev_crop_encoded,
                month_encoded,
                district_encoded
            ]])
            
            # Predict
            prediction = self.model.predict(features)[0]
            prediction_proba = self.model.predict_proba(features)[0]
            
            predicted_crop = self.target_encoder.inverse_transform([prediction])[0]
            
            # Top 5 recommendations
            top_5_indices = np.argsort(prediction_proba)[-5:][::-1]
            top_5_crops = self.target_encoder.inverse_transform(top_5_indices)
            top_5_probs = prediction_proba[top_5_indices]
            
            print("\n" + "-"*70)
            print("🎯 RECOMMENDATION RESULTS")
            print("-"*70)
            print(f"\n✅ Best Next Crop: {predicted_crop}")
            print(f"   Confidence: {prediction_proba[prediction]*100:.1f}%")
            
            print(f"\n📊 Top 5 Recommendations:")
            for i, (crop, prob) in enumerate(zip(top_5_crops, top_5_probs), 1):
                bar = "█" * int(prob * 40)
                print(f"   {i}. {crop:20s} {bar} {prob*100:5.1f}%")
            
            return {'crop': predicted_crop, 'confidence': prediction_proba[prediction]*100}
        
        except ValueError as e:
            print(f"\n❌ Error: Invalid input value")
            print(f"   {str(e)}")
            return None
    
    def show_valid_values(self):
        """Display valid input values"""
        print("\n" + "="*70)
        print("✓ VALID INPUT VALUES FOR PREDICTIONS")
        print("="*70)
        
        for col in ['soil_type', 'previous_crop', 'month', 'district']:
            values = self.label_encoders[col].classes_
            if col == 'previous_crop':
                print(f"\n{col.upper()}:")
                for val in sorted(values):
                    print(f"   • {val}")
            else:
                print(f"\n{col.upper()}:")
                print(f"   {', '.join(sorted(values))}")


# ============================================================================
# MAIN EXECUTION - RUN
# ============================================================================

if __name__ == "__main__":
    
    print("\n" + "█"*70)
    print("█" + " "*68 + "█")
    print("█" + " "*15 + "🌾 CROP PREDICTION SYSTEM - AGROREACH 🌾" + " "*12 + "█")
    print("█" + " "*68 + "█")
    print("█"*70)
    
    # STEP 1: Generate data
    df = generate_training_data(num_rows=2000)
    
    # STEP 2: Initialize and train model
    predictor = CropPredictor()
    df_processed = predictor.preprocess_data(df)
    X, y = predictor.prepare_features(df_processed)
    X_test, y_test = predictor.train_model(X, y)
    
    # STEP 3: Show valid values
    predictor.show_valid_values()
    
    # STEP 4: Make example predictions
    print("\n\n" + "="*70)
    print("🎯 EXAMPLE PREDICTIONS")
    print("="*70)
    
    # Example 1
    print("\n\n1️⃣  Tomato के बाद कौन सा फसल लगाएं?")
    result1 = predictor.predict_next_crop({
        'ph': 6.5,
        'soil_type': 'black',
        'previous_crop': 'Tomato',
        'area_ha': 3.5,
        'rainfall': 650,
        'temperature': 25.0,
        'month': 'Jun',
        'district': 'Pune'
    })
    
    # Example 2
    print("\n\n2️⃣  Spinach के बाद कौन सा फसल लगाएं?")
    result2 = predictor.predict_next_crop({
        'ph': 7.2,
        'soil_type': 'red',
        'previous_crop': 'Spinach',
        'area_ha': 2.5,
        'rainfall': 450,
        'temperature': 28.5,
        'month': 'Mar',
        'district': 'Nashik'
    })
    
    # Example 3
    print("\n\n3️⃣  Brinjal के बाद कौन सा फसल लगाएं?")
    result3 = predictor.predict_next_crop({
        'ph': 6.8,
        'soil_type': 'loam',
        'previous_crop': 'Brinjal',
        'area_ha': 2.0,
        'rainfall': 550,
        'temperature': 26.5,
        'month': 'Apr',
        'district': 'Nashik'
    })
    
    print("\n\n" + "█"*70)
    print("█" + " "*20 + "✅ MODEL TRAINING COMPLETE!" + " "*19 + "█")
    print("█"*70)
    
    print("\n💡 अब आप अपना खुद का डेटा predict कर सकते हो:")
    print("""
    # अपना prediction करने के लिए:
    
    my_data = {
        'ph': 6.5,                      # मिट्टी की अम्लता (5-8)
        'soil_type': 'black',           # मिट्टी का प्रकार
        'previous_crop': 'Tomato',      # पिछली फसल
        'area_ha': 3.5,                 # क्षेत्र (हेक्टेयर में)
        'rainfall': 650,                # बारिश (mm में)
        'temperature': 25.0,            # तापमान (°C में)
        'month': 'Jun',                 # महीना
        'district': 'Pune'              # जिला
    }
    
    result = predictor.predict_next_crop(my_data)
    
    # Output:
    # result['crop']        → अगली फसल
    # result['confidence']  → विश्वास स्तर (%)
    """)

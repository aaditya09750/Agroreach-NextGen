"""
Train Price Prediction Model and Save for Fast Predictions
This script trains the model ONCE and saves it for reuse
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
import joblib
import warnings
warnings.filterwarnings('ignore')

def train_and_save_model():
    print("Loading dataset...")
    # Load the dataset
    df = pd.read_csv('crop_dummy_1000_rows.csv')
    
    print("Preprocessing data...")
    # Create label encoders
    encoders = {}
    categorical_columns = ['crop', 'quality_grade', 'farmers_location', 'season_month']
    
    for col in categorical_columns:
        encoders[col] = LabelEncoder()
        df[col] = encoders[col].fit_transform(df[col])
    
    # Convert Date to datetime and extract features
    df['date'] = pd.to_datetime(df['date'])
    df['Year'] = df['date'].dt.year
    df['Month'] = df['date'].dt.month
    df['Day'] = df['date'].dt.day
    
    # Features and target
    X = df[['crop', 'quality_grade', 'farmers_location', 'season_month', 'Year', 'Month', 'Day']]
    y = df['Modal Price']
    
    print("Training model...")
    # Split the data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Train Random Forest model
    model = RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1)
    model.fit(X_train, y_train)
    
    # Calculate score
    score = model.score(X_test, y_test)
    print(f"Model R² Score: {score:.4f}")
    
    print("Saving model and encoders...")
    # Save the model
    joblib.dump(model, 'price_model.pkl')
    
    # Save the encoders
    joblib.dump(encoders, 'price_encoders.pkl')
    
    # Save feature names for reference
    feature_info = {
        'feature_names': list(X.columns),
        'categorical_columns': categorical_columns,
        'score': score
    }
    joblib.dump(feature_info, 'price_feature_info.pkl')
    
    print("✅ Model training complete!")
    print(f"✅ Saved: price_model.pkl")
    print(f"✅ Saved: price_encoders.pkl")
    print(f"✅ Saved: price_feature_info.pkl")
    print(f"\n🎯 Model accuracy: {score*100:.2f}%")
    
    return model, encoders

if __name__ == "__main__":
    train_and_save_model()

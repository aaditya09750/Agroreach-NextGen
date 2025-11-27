"""
Train Next Crop Recommendation Model Once and Save
Loads dataset, trains classifier, saves model for fast predictions
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
import joblib
import warnings
warnings.filterwarnings('ignore')

print("="*70)
print("🌾 TRAINING NEXT CROP RECOMMENDATION MODEL")
print("="*70)

# Load dataset
print("\n📂 Loading dataset...")
df = pd.read_csv('AgroReach_vegetables_2000.csv')
print(f"✅ Loaded {len(df)} rows")
print(f"Columns: {list(df.columns)}")

# Preprocess data
print("\n🔧 Preprocessing data...")

# Extract weather components (rainfall and temperature)
df['rainfall'] = df['weather'].str.extract(r'(\d+)mm')[0].astype(float)
df['temperature'] = df['weather'].str.extract(r'/(\d+\.\d+)C')[0].astype(float)
df = df.drop('weather', axis=1)

# Create crop recommendation (simulate by using previous_crop as target)
# In real scenario, this would be the actual recommended crop
df['recommended_crop'] = df['previous_crop']  # Using previous crop as target for training

# Encode categorical variables
label_encoders = {}
categorical_columns = ['soil_type', 'previous_crop', 'month', 'district']

for col in categorical_columns:
    le = LabelEncoder()
    df[f'{col}_encoded'] = le.fit_transform(df[col])
    label_encoders[col] = le

# Encode target
target_encoder = LabelEncoder()
y = target_encoder.fit_transform(df['recommended_crop'])

# Prepare features
feature_columns = ['ph', 'area_ha', 'rainfall', 'temperature',
                   'soil_type_encoded', 'previous_crop_encoded',
                   'month_encoded', 'district_encoded']

X = df[feature_columns]

print(f"✅ Feature columns: {feature_columns}")
print(f"✅ Target classes: {len(target_encoder.classes_)}")

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

print(f"\n📊 Training set: {len(X_train)} samples")
print(f"📊 Test set: {len(X_test)} samples")

# Train model
print("\n🤖 Training RandomForest Classifier...")
model = RandomForestClassifier(
    n_estimators=200,
    max_depth=20,
    min_samples_split=5,
    min_samples_leaf=2,
    random_state=42,
    n_jobs=-1
)

model.fit(X_train, y_train)
print("✅ Model trained successfully!")

# Evaluate model
print("\n📈 Evaluating model...")
y_pred_train = model.predict(X_train)
y_pred_test = model.predict(X_test)

train_accuracy = accuracy_score(y_train, y_pred_train)
test_accuracy = accuracy_score(y_test, y_pred_test)

print(f"Training Accuracy: {train_accuracy*100:.2f}%")
print(f"Test Accuracy: {test_accuracy*100:.2f}%")

# Feature importance
feature_importance = dict(zip(feature_columns, model.feature_importances_))
print("\n🔍 Feature Importance:")
for feature, importance in sorted(feature_importance.items(), key=lambda x: x[1], reverse=True):
    print(f"   {feature}: {importance:.4f}")

# Save model and encoders
print("\n💾 Saving model and encoders...")

model_data = {
    'model': model,
    'label_encoders': label_encoders,
    'target_encoder': target_encoder,
    'feature_columns': feature_columns,
    'feature_importance': feature_importance,
    'train_accuracy': train_accuracy,
    'test_accuracy': test_accuracy
}

joblib.dump(model_data, 'crop_model.pkl')
print("✅ Model saved as 'crop_model.pkl'")

# Save feature info
feature_info = {
    'feature_columns': feature_columns,
    'feature_importance': feature_importance,
    'soil_types': list(label_encoders['soil_type'].classes_),
    'crops': list(label_encoders['previous_crop'].classes_),
    'months': list(label_encoders['month'].classes_),
    'districts': list(label_encoders['district'].classes_),
    'recommended_crops': list(target_encoder.classes_),
    'train_accuracy': float(train_accuracy),
    'test_accuracy': float(test_accuracy),
    'num_samples': len(df)
}

joblib.dump(feature_info, 'crop_feature_info.pkl')
print("✅ Feature info saved as 'crop_feature_info.pkl'")

print("\n" + "="*70)
print("🎉 MODEL TRAINING COMPLETE!")
print("="*70)
print(f"Model Accuracy: {test_accuracy*100:.2f}%")
print(f"Total Crops: {len(target_encoder.classes_)}")
print(f"Files Created:")
print(f"   • crop_model.pkl (trained model + encoders)")
print(f"   • crop_feature_info.pkl (metadata)")
print("\n✅ Ready for fast predictions!")
print("="*70)

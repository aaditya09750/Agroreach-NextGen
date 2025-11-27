# Interactive Crop Prediction System - FIXED VERSION
# Previous crop exclude karun next crop predict karto!

import joblib
import pandas as pd
import numpy as np
import sys


def load_trained_model(model_path='crop_prediction_vegetables_model.pkl'):
    """Load the trained model"""
    try:
        model_data = joblib.load(model_path)
        return model_data
    except FileNotFoundError:
        print("❌ Error: Model file not found!")
        print("Please run 'crop_prediction_model.py' first to train the model.")
        sys.exit(1)


def show_valid_options(model_data):
    """Show all valid options for user input"""
    label_encoders = model_data['label_encoders']

    print("\n" + "=" * 60)
    print("📋 VALID OPTIONS (Tumhi he values use karu shakta)")
    print("=" * 60)

    print("\n🌱 SOIL TYPES:")
    soil_types = sorted(label_encoders['soil_type'].classes_)
    for i, soil in enumerate(soil_types, 1):
        print(f"   {i}. {soil}")

    print("\n🌾 CROPS (Previous Crop):")
    crops = sorted(label_encoders['previous_crop'].classes_)
    for i in range(0, len(crops), 4):
        crop_row = crops[i:i + 4]
        print(f"   {', '.join(crop_row)}")

    print("\n📅 MONTHS:")
    months = sorted(label_encoders['month'].classes_)
    print(f"   {', '.join(months)}")

    print("\n📍 DISTRICTS:")
    districts = sorted(label_encoders['district'].classes_)
    for i in range(0, len(districts), 5):
        dist_row = districts[i:i + 5]
        print(f"   {', '.join(dist_row)}")

    print("\n" + "=" * 60)


def get_user_input(model_data):
    """Get farm details from user"""
    label_encoders = model_data['label_encoders']

    print("\n" + "=" * 60)
    print("🌾 TUMCHYA FARM CHE DETAILS ENTER KARA")
    print("=" * 60)

    farm_data = {}

    # pH
    while True:
        try:
            ph = float(input("\n⚗️  Soil pH (5.3 to 8.0): "))
            if 5.0 <= ph <= 8.5:
                farm_data['ph'] = ph
                break
            else:
                print("   ❌ pH 5.0 te 8.5 chya madhye asava")
        except ValueError:
            print("   ❌ Valid number enter kara!")

    # Soil Type
    print("\n🌱 Soil Type:")
    soil_types = sorted(label_encoders['soil_type'].classes_)
    for i, soil in enumerate(soil_types, 1):
        print(f"   {i}. {soil}")

    while True:
        soil_input = input(f"   Select (1-{len(soil_types)}) or type name: ").strip().lower()
        if soil_input.isdigit() and 1 <= int(soil_input) <= len(soil_types):
            farm_data['soil_type'] = soil_types[int(soil_input) - 1]
            break
        elif soil_input in soil_types:
            farm_data['soil_type'] = soil_input
            break
        else:
            print(f"   ❌ Valid option select kara!")

    # Previous Crop
    print("\n🌾 Previous Crop (Aadhi kon pik hoti?):")
    crops = sorted(label_encoders['previous_crop'].classes_)
    for i in range(0, len(crops), 4):
        crop_row = crops[i:i + 4]
        row_str = ", ".join([f"{crops.index(c) + 1}.{c}" for c in crop_row])
        print(f"   {row_str}")

    while True:
        crop_input = input(f"   Select (1-{len(crops)}) or type name: ").strip().lower()
        if crop_input.isdigit() and 1 <= int(crop_input) <= len(crops):
            farm_data['previous_crop'] = crops[int(crop_input) - 1]
            break
        elif crop_input in crops:
            farm_data['previous_crop'] = crop_input
            break
        else:
            print(f"   ❌ Valid crop select kara!")

    # Area
    while True:
        try:
            area = float(input("\n📏 Farm Area (hectares, 0.2 to 5.0): "))
            if 0.1 <= area <= 10.0:
                farm_data['area_ha'] = area
                break
            else:
                print("   ❌ Area 0.1 te 10.0 hectares madhye asava")
        except ValueError:
            print("   ❌ Valid number enter kara!")

    # Rainfall
    while True:
        try:
            rainfall = float(input("\n🌧️  Expected Rainfall (mm, 80 to 1200): "))
            if 50 <= rainfall <= 1500:
                farm_data['rainfall'] = rainfall
                break
            else:
                print("   ❌ Rainfall 50 te 1500mm madhye asava")
        except ValueError:
            print("   ❌ Valid number enter kara!")

    # Temperature
    while True:
        try:
            temp = float(input("\n🌡️  Average Temperature (°C, 16 to 33): "))
            if 15 <= temp <= 35:
                farm_data['temperature'] = temp
                break
            else:
                print("   ❌ Temperature 15 te 35°C madhye asava")
        except ValueError:
            print("   ❌ Valid number enter kara!")

    # Month
    print("\n📅 Which Month (Planting month)?")
    months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
              'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    for i, month in enumerate(months, 1):
        end = "   " if i % 4 != 0 else "\n"
        print(f"   {i:2d}.{month}", end=end)

    while True:
        month_input = input("\n   Select (1-12) or type month: ").strip()
        if month_input.isdigit() and 1 <= int(month_input) <= 12:
            farm_data['month'] = months[int(month_input) - 1]
            break
        elif month_input in months:
            farm_data['month'] = month_input
            break
        else:
            print(f"   ❌ Valid month select kara!")

    # District
    print("\n📍 District:")
    districts = sorted(label_encoders['district'].classes_)
    for i, dist in enumerate(districts, 1):
        end = "   " if i % 4 != 0 else "\n"
        print(f"   {i:2d}.{dist}", end=end)

    while True:
        dist_input = input(f"\n   Select (1-{len(districts)}) or type name: ").strip()
        if dist_input.isdigit() and 1 <= int(dist_input) <= len(districts):
            farm_data['district'] = districts[int(dist_input) - 1]
            break
        elif dist_input.title() in districts:
            farm_data['district'] = dist_input.title()
            break
        else:
            for dist in districts:
                if dist.lower() == dist_input.lower():
                    farm_data['district'] = dist
                    break
            else:
                print(f"   ❌ Valid district select kara!")
                continue
            break

    return farm_data


def predict_crop_with_rotation(model_data, input_data, exclude_previous=True):
    """
    Predict crop - PREVIOUS CROP EXCLUDE karun!
    Crop rotation sathi important!
    """
    model = model_data['model']
    label_encoders = model_data['label_encoders']
    target_encoder = model_data['target_encoder']

    # Encode categorical variables
    soil_encoded = label_encoders['soil_type'].transform([input_data['soil_type']])[0]
    prev_crop_encoded = label_encoders['previous_crop'].transform([input_data['previous_crop']])[0]
    month_encoded = label_encoders['month'].transform([input_data['month']])[0]
    district_encoded = label_encoders['district'].transform([input_data['district']])[0]

    # Prepare features
    feature_names = ['ph', 'area_ha', 'rainfall', 'temperature',
                     'soil_type_encoded', 'previous_crop_encoded',
                     'month_encoded', 'district_encoded']

    features_df = pd.DataFrame([[
        input_data['ph'],
        input_data['area_ha'],
        input_data['rainfall'],
        input_data['temperature'],
        soil_encoded,
        prev_crop_encoded,
        month_encoded,
        district_encoded
    ]], columns=feature_names)

    # Get all probabilities
    prediction_proba = model.predict_proba(features_df)[0]

    # Get previous crop index
    previous_crop_name = input_data['previous_crop']
    all_crops = target_encoder.classes_

    # EXCLUDE PREVIOUS CROP if needed
    if exclude_previous:
        # Find previous crop index
        previous_crop_idx = None
        for idx, crop in enumerate(all_crops):
            if crop == previous_crop_name:
                previous_crop_idx = idx
                break

        # Set previous crop probability to 0
        if previous_crop_idx is not None:
            prediction_proba_modified = prediction_proba.copy()
            prediction_proba_modified[previous_crop_idx] = 0

            # Renormalize probabilities
            prediction_proba_modified = prediction_proba_modified / prediction_proba_modified.sum()
        else:
            prediction_proba_modified = prediction_proba
    else:
        prediction_proba_modified = prediction_proba

    # Get top crop (excluding previous)
    prediction = np.argmax(prediction_proba_modified)
    predicted_crop = target_encoder.inverse_transform([prediction])[0]

    # Get top 5 predictions (excluding previous crop)
    top_indices = np.argsort(prediction_proba_modified)[-10:][::-1]  # Get top 10

    top_5_crops = []
    top_5_probabilities = []

    for idx in top_indices:
        crop = target_encoder.inverse_transform([idx])[0]
        prob = prediction_proba_modified[idx]

        # Skip previous crop
        if crop != previous_crop_name:
            top_5_crops.append(crop)
            top_5_probabilities.append(prob)

        if len(top_5_crops) >= 5:
            break

    return predicted_crop, prediction_proba_modified[prediction], top_5_crops, top_5_probabilities


def get_crop_rotation_info(previous_crop, recommended_crop):
    """Get crop rotation benefits"""

    rotation_benefits = {
        ('wheat', 'cotton'): "✅ Good rotation - Cotton replenishes soil",
        ('wheat', 'soybean'): "✅ Excellent! Soybean adds nitrogen",
        ('rice', 'wheat'): "✅ Classic rotation - Balances nutrients",
        ('rice', 'chickpea'): "✅ Great! Chickpea improves soil",
        ('cotton', 'wheat'): "✅ Good - Wheat uses residual nutrients",
        ('soybean', 'wheat'): "✅ Perfect! Nitrogen-rich soil",
        ('onion', 'cotton'): "✅ Good spacing change",
        ('onion', 'maize'): "✅ Different root depth - good",
    }

    key = (previous_crop, recommended_crop)
    if key in rotation_benefits:
        return rotation_benefits[key]
    else:
        return "✅ Fresh crop - Good for crop rotation"


def display_results(farm_data, predicted_crop, confidence, top_5_crops, top_5_probabilities):
    """Display prediction results"""
    print("\n" + "=" * 60)
    print("📊 TUMCHYA FARM CHE DETAILS")
    print("=" * 60)
    print(f"📍 District: {farm_data['district']}")
    print(f"📅 Month: {farm_data['month']}")
    print(f"🌱 Soil Type: {farm_data['soil_type']}")
    print(f"⚗️  pH Level: {farm_data['ph']}")
    print(f"🌾 Previous Crop: {farm_data['previous_crop']}")
    print(f"📏 Farm Area: {farm_data['area_ha']} hectares")
    print(f"🌧️  Rainfall: {farm_data['rainfall']} mm")
    print(f"🌡️  Temperature: {farm_data['temperature']} °C")

    print("\n" + "=" * 60)
    print("🎯 PREDICTION RESULTS (CROP ROTATION)")
    print("=" * 60)

    print(f"\n✅ RECOMMENDED NEXT CROP: {predicted_crop.upper()}")
    print(f"   Confidence: {confidence * 100:.2f}%")

    # Confidence bar
    bar_length = int(confidence * 50)
    bar = "█" * bar_length + "░" * (50 - bar_length)
    print(f"   [{bar}]")

    # Crop rotation benefit
    rotation_info = get_crop_rotation_info(farm_data['previous_crop'], predicted_crop)
    print(f"\n🔄 Crop Rotation Benefit:")
    print(f"   {rotation_info}")

    print("\n📊 TOP 5 ALTERNATIVE CROPS:")
    print("-" * 60)
    print("   (Previous crop excluded for proper rotation)")
    print("-" * 60)

    for i, (crop, prob) in enumerate(zip(top_5_crops, top_5_probabilities), 1):
        bar_length = int(prob * 40)
        bar = "█" * bar_length

        if i == 1:
            emoji = "🥇"
        elif i == 2:
            emoji = "🥈"
        elif i == 3:
            emoji = "🥉"
        else:
            emoji = f" {i}."

        print(f"{emoji} {crop:15s} {prob * 100:6.2f}% {bar}")

    print("\n" + "=" * 60)


def main():
    """Main interactive function"""
    print("=" * 60)
    print("🌾 CROP PREDICTION WITH ROTATION 🔄")
    print("   Smart Farming System!")
    print("=" * 60)

    # Load model
    print("\n⏳ Loading trained model...")
    model_data = load_trained_model()
    print("✅ Model loaded successfully!")

    while True:
        # Show menu
        print("\n" + "=" * 60)
        print("MENU")
        print("=" * 60)
        print("1. Predict Next Crop (With Crop Rotation) 🔄")
        print("2. Show Valid Options")
        print("3. Exit")

        choice = input("\nSelect option (1-3): ").strip()

        if choice == "1":
            # Get user input
            farm_data = get_user_input(model_data)

            # Predict with rotation
            print("\n⏳ Predicting best crop for rotation...")
            print("   (Previous crop excluded)")

            predicted_crop, confidence, top_5_crops, top_5_probabilities = \
                predict_crop_with_rotation(model_data, farm_data, exclude_previous=True)

            # Display results
            display_results(farm_data, predicted_crop, confidence, top_5_crops, top_5_probabilities)

            # Save option
            save = input("\n💾 Results save karायचे aahet? (yes/no): ").strip().lower()
            if save in ['yes', 'y', 'हो', 'होय']:
                filename = f"crop_rotation_{farm_data['district']}_{farm_data['month']}.txt"
                with open(filename, 'w', encoding='utf-8') as f:
                    f.write(f"CROP ROTATION RECOMMENDATION\n")
                    f.write(f"=" * 60 + "\n\n")
                    f.write(f"Previous Crop: {farm_data['previous_crop']}\n")
                    f.write(f"Recommended Crop: {predicted_crop.upper()}\n")
                    f.write(f"Confidence: {confidence * 100:.2f}%\n\n")
                    f.write(f"District: {farm_data['district']}\n")
                    f.write(f"Month: {farm_data['month']}\n")
                    f.write(f"Soil: {farm_data['soil_type']}, pH: {farm_data['ph']}\n\n")
                    f.write(f"TOP 5 ALTERNATIVES:\n")
                    for i, (crop, prob) in enumerate(zip(top_5_crops, top_5_probabilities), 1):
                        f.write(f"{i}. {crop:15s} - {prob * 100:.2f}%\n")

                print(f"✅ Report saved as '{filename}'")

            # Continue?
            cont = input("\n🔄 Another prediction? (yes/no): ").strip().lower()
            if cont not in ['yes', 'y', 'हो', 'होय']:
                break

        elif choice == "2":
            show_valid_options(model_data)
            input("\nPress Enter to continue...")

        elif choice == "3":
            print("\n👋 Thank you for using Crop Rotation System!")
            print("🌾 Happy Farming with Smart Rotation! 🚜")
            break

        else:
            print("❌ Invalid option! Please select 1, 2, or 3.")

    print("\n" + "=" * 60)


if __name__ == "__main__":
    main()
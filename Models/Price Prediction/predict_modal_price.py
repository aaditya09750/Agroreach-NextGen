import joblib
import pandas as pd
from datetime import datetime
import sys

MODEL_PATH = "modal_price_model.pkl"

def load_model():
    try:
        print("⏳ Loading model...")
        model = joblib.load(MODEL_PATH)
        print("✅ Model loaded successfully!")
        return model
    except Exception as e:
        print(f"❌ Model loading failed: {e}")
        sys.exit(1)

def get_user_input():
    data = {}

    print("\n📅 Date (YYYY-MM-DD)")
    date_inp = input("   Date: ").strip()
    data["date"] = date_inp if date_inp else datetime.now().strftime("%Y-%m-%d")

    crops = [
        "Tomato", "Spinach (Palak)", "Coriander (Kothimbir)", "Fenugreek Leaves (Methi)",
        "Green Chilies", "Cucumber", "Green Peas", "Beans", "Cauliflower", "Cabbage",
        "Brinjal (Eggplant)", "Ladyfinger (Bhindi / Okra)", "Bottle Gourd (Dudhi)",
        "Ridge Gourd (Dodka)", "Bitter Gourd (Karela)", "Pumpkin", "Radish (Mula)",
        "Beetroot", "Carrot", "Spring Onion"
    ]

    print("\n🌾 Select Crop:")
    for i, c in enumerate(crops, 1):
        print(f"   {i}. {c}")

    while True:
        c = input("   Select: ").strip()
        if c.isdigit() and 1 <= int(c) <= len(crops):
            data["crop"] = crops[int(c) - 1]
            break
        print("❌ Invalid choice!")

    print("\n⭐ Quality Grade")
    print("   1. A\n   2. B\n   3. C")
    while True:
        q = input("   Select (1-3): ").strip()
        if q in ["1", "2", "3"]:
            data["quality_grade"] = ["A", "B", "C"][int(q) - 1]
            break

    print("\n📍 Farmers Location:")
    data["farmers_location"] = input("   Location: ").strip()

    months = ["January","February","March","April","May","June","July",
              "August","September","October","November","December"]

    print("\n🌤 Select Month:")
    for i,m in enumerate(months,1):
        print(f"   {i}. {m}")

    while True:
        m = input("   Select (1-12): ").strip()
        if m.isdigit() and 1 <= int(m) <= 12:
            data["season_month"] = months[int(m) - 1]
            break

    return data

def predict_price(model, data):
    df = pd.DataFrame([data])
    predicted = model.predict(df)[0]

    print("\n==============================")
    print("💰 PREDICTED MODAL PRICE")
    print("==============================")
    print(f"Predicted Price: Rs {predicted:.2f}")
    print(f"Expected Range: Rs {predicted*0.95:.2f} - Rs {predicted*1.05:.2f}")
    print("==============================")

def main():
    model = load_model()

    while True:
        print("\n1. Predict Price")
        print("2. Exit")
        c = input("Select: ").strip()

        if c == "1":
            user_data = get_user_input()
            predict_price(model, user_data)

        elif c == "2":
            print("\n👋 Exiting...")
            break

        else:
            print("❌ Invalid choice!")

if __name__ == "__main__":
    main()

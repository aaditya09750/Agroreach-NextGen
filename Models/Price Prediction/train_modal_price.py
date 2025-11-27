import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestRegressor
import joblib

DATA_PATH = "/Users/vijayshankarshewale/Downloads/crop_dummy_1000_rows.csv"
MODEL_OUT = "modal_price_model.pkl"

def load_data():
    df = pd.read_csv(DATA_PATH)
    return df

def build_model(cat_cols, num_cols):
    preprocessor = ColumnTransformer(
        transformers=[
            ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), cat_cols),
            ("num", StandardScaler(), num_cols),
        ]
    )

    model = RandomForestRegressor(
        n_estimators=300,
        random_state=42
    )

    return Pipeline([
        ("preprocessor", preprocessor),
        ("model", model)
    ])

def main():
    df = load_data()

    # REMOVE price_per_unit
    df = df.drop(columns=["price_per_unit"])

    # Features & target
    X = df.drop(columns=["Modal Price"])
    y = df["Modal Price"]

    # Identify new features
    cat_cols = ["date", "crop", "quality_grade", "farmers_location", "season_month"]
    num_cols = []  # no numerical columns now

    model = build_model(cat_cols, num_cols)

    print("Training model...")
    model.fit(X, y)

    print("Saving model...")
    joblib.dump(model, MODEL_OUT)

    print("\n🎉 MODEL TRAINED & SAVED SUCCESSFULLY!")
    print(f"File: {MODEL_OUT}")

if __name__ == "__main__":
    main()

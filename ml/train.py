import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.pipeline import Pipeline
from sklearn.metrics import mean_squared_error
import joblib

df = pd.read_csv("train.csv")

df = df.drop("Employee_Id", axis=1)

X = df.drop("Stress_Level", axis=1)
y = df["Stress_Level"]

cat_cols = ["Work_From","Work_Life_Balance","Lives_With_Family","Working_State"]
num_cols = [c for c in X.columns if c not in cat_cols]

preprocessor = ColumnTransformer([
    ("cat", OneHotEncoder(handle_unknown="ignore"), cat_cols),
    ("num", "passthrough", num_cols)
])

model = RandomForestRegressor(n_estimators=200, random_state=42)

pipeline = Pipeline([
    ("prep", preprocessor),
    ("model", model)
])

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

pipeline.fit(X_train, y_train)

y_pred = pipeline.predict(X_test)

print("MSE:", mean_squared_error(y_test, y_pred))

joblib.dump(pipeline, "stress_model.pkl")

print("Stress ML model saved")

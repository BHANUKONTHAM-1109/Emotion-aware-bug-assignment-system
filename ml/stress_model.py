import joblib
import pandas as pd

model = joblib.load("stress_model.pkl")

def predict_stress(data):
    df = pd.DataFrame([data])
    return round(float(model.predict(df)[0]),2)

if __name__ == "__main__":
    sample = {
        "Avg_Working_Hours_Per_Day": 8,
        "Work_From": "Office",
        "Work_Pressure": 4,
        "Manager_Support": 2,
        "Sleeping_Habit": 3,
        "Exercise_Habit": 2,
        "Job_Satisfaction": 3,
        "Work_Life_Balance": "Poor",
        "Social_Person": 2,
        "Lives_With_Family": "Yes",
        "Working_State": "Full Time"
    }

    print(predict_stress(sample))

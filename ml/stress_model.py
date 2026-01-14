import joblib

model = joblib.load("stress_model.pkl")

def predict_stress(workload, reopenRate, lateCommits):
    return model.predict([[workload, reopenRate, lateCommits]])[0]

print("ML Stress model ready")

import pandas as pd
from sklearn.linear_model import LinearRegression
import joblib

# Sample training data
data = {
    "workload": [2,4,6,8,5,3,7],
    "reopenRate": [1,2,3,4,2,1,3],
    "lateCommits": [1,3,4,5,2,2,4],
    "stress": [2.1,4.2,6.1,8.0,5.0,3.2,6.5]
}

df = pd.DataFrame(data)

X = df[["workload","reopenRate","lateCommits"]]
y = df["stress"]

model = LinearRegression()
model.fit(X,y)

joblib.dump(model,"stress_model.pkl")

print("Stress model trained and saved")

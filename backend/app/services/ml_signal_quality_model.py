import numpy as np

from sklearn.tree import DecisionTreeClassifier

def train_signal_quality_model():

    # create training feature data named X
    X = np.array([
        [-50, 40],
        [-60, 30],
        [-70, 20],
        [-80, 10],
        [-88, 2],
        [-95, -5],
        [-105, -15],
    ])

    # create training labels named y
    y = np.array([
        "Good",
        "Good",
        "Good",
        "Fair",
        "Fair",
        "Poor",
        "Poor",
    ])

    # create model named model
    model = DecisionTreeClassifier()

    # train model using X and y
    model.fit(X, y)

    # return model
    return model

def predict_signal_quality(received_power_dbm, link_margin_db):

    # train model and store in variable model
    model = train_signal_quality_model()

    # create feature array named input_features
    input_features = np.array([[received_power_dbm, link_margin_db]])

    # use model to predict signal quality
    prediction = model.predict(input_features)[0]

    # return prediction
    return prediction
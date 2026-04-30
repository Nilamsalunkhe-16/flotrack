import numpy as np
from sklearn.linear_model import LogisticRegression

# Anemia Model
X1 = np.array([
    [1,1,1],[1,0,1],[0,1,0],[0,0,0]
])
y1 = np.array([1,1,0,0])

anemia_model = LogisticRegression()
anemia_model.fit(X1, y1)

# PCOS Model
X2 = np.array([
    [1,1,1],[1,1,0],[0,0,0],[0,1,0]
])
y2 = np.array([1,1,0,0])

pcos_model = LogisticRegression()
pcos_model.fit(X2, y2)
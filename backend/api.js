const API = "http://127.0.0.1:8000";

export const signup = (data) =>
  fetch(`${API}/signup`, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify(data)
  });

export const login = (data) =>
  fetch(`${API}/login`, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify(data)
  });

export const predictAnemia = (data) =>
  fetch(`${API}/predict-anemia`, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify(data)
  });



export const predictPCOS = (data) =>
  fetch(`${API}/predict-pcos`, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify(data)
  });


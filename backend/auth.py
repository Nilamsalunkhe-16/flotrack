from passlib.context import CryptContext
from database import users_collection

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password):
    return pwd_context.hash(password)

def verify_password(password, hashed):
    return pwd_context.verify(password, hashed)

def create_user(email, password):
    users_collection.insert_one({
        "email": email,
        "password": hash_password(password)
    })

def authenticate(email, password):
    user = users_collection.find_one({"email": email})
    if not user:
        return None
    if not verify_password(password, user["password"]):
        return None
    return user
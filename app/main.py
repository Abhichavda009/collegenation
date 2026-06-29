from fastapi import FastAPI
from sqlalchemy import text
from app.database import engine

app = FastAPI()

@app.get("/")
def root():
    return {"message": "API Running"}

@app.get("/users")
def get_users():
    with engine.connect() as conn:
        result = conn.execute(text("SELECT id, email FROM users"))

        users = []
        for row in result:
            users.append({
                "id": row.id,
                "email": row.email
            })

        return users
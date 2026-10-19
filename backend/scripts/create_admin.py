"""Usage: python -m scripts.create_admin admin@example.com 'password' [role]"""
import asyncio
import sys

from sqlalchemy import select

from app.core.security import hash_password
from app.database.database import SessionLocal
from app.models.user import User


async def main(email: str, password: str, role: str = "admin") -> None:
    async with SessionLocal() as db:
        if (await db.execute(select(User).where(User.email == email))).scalar_one_or_none():
            print("User already exists")
            return
        db.add(User(email=email, hashed_password=hash_password(password), full_name=email, role=role))
        await db.commit()
        print(f"Created {role}: {email}")


if __name__ == "__main__":
    asyncio.run(main(*sys.argv[1:4]))

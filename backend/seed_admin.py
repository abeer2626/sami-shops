import asyncio
from prisma import Prisma
import auth

async def main():
    db = Prisma()
    await db.connect()
    
    email = auth.SUPER_ADMIN_EMAIL
    password = "admin123"
    name = "Super Admin"
    role = "admin"
    
    hashed_password = auth.get_password_hash(password)
    
    # Check if user exists
    user = await db.user.find_unique(where={"email": email})
    
    if user:
        # Update user to be admin with correct password
        await db.user.update(
            where={"email": email},
            data={
                "name": name,
                "password": hashed_password,
                "role": role
            }
        )
        print(f"Updated existing user {email} to Admin.")
    else:
        # Create new admin user
        await db.user.create(
            data={
                "email": email,
                "name": name,
                "password": hashed_password,
                "role": role
            }
        )
        print(f"Created new admin user {email}.")
    
    await db.disconnect()

if __name__ == "__main__":
    asyncio.run(main())

import asyncio
from prisma import Prisma
import auth

async def main():
    db = Prisma()
    await db.connect()
    
    # 1. Ensure Admin User exists
    email = "samijee24@gmail.com"
    password = "admin123"
    name = "Admin Sami"
    role = "admin"
    
    hashed_password = auth.get_password_hash(password)
    
    user = await db.user.find_unique(where={"email": email})
    if user:
        user = await db.user.update(
            where={"email": email},
            data={"password": hashed_password, "role": role}
        )
        print(f"Updated Admin user: {email}")
    else:
        user = await db.user.create(
            data={
                "email": email,
                "name": name,
                "password": hashed_password,
                "role": role
            }
        )
        print(f"Created Admin user: {email}")

    # 2. Ensure Default Store exists for vendor products
    store_id = "store_1"
    store = await db.store.find_unique(where={"id": store_id})
    if not store:
        await db.store.create(
            data={
                "id": store_id,
                "name": "SamiShops Official Mall",
                "description": "The main marketplace for all your premium needs.",
                "vendorId": user.id
            }
        )
        print(f"Created Default Store: {store_id}")
    
    # 3. Ensure some Categories exist
    categories = ["Electronics", "Fashion", "Home & Garden", "Beauty", "Sports"]
    for i, cat_name in enumerate(categories):
        cat_id = f"cat_{i+1}"
        existing_cat = await db.category.find_unique(where={"id": cat_id})
        if not existing_cat:
            await db.category.create(
                data={
                    "id": cat_id,
                    "name": cat_name,
                    "slug": cat_name.lower().replace(" ", "-")
                }
            )
            print(f"Created Category: {cat_name}")

    await db.disconnect()

if __name__ == "__main__":
    asyncio.run(main())

import asyncio
from prisma import Prisma

async def main():
    db = Prisma()
    try:
        await db.connect()
        print("Successfully connected to the database!")
        users = await db.user.find_many(take=1)
        print(f"Found {len(users)} users.")
    except Exception as e:
        print(f"Failed to connect: {e}")
    finally:
        await db.disconnect()

if __name__ == "__main__":
    asyncio.run(main())

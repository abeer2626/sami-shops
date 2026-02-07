from prisma import Prisma

# Database connection - use a singleton pattern
db = Prisma()
db_connected = False

async def get_db_connection():
    """Lazy database connection for serverless environments"""
    global db_connected
    if not db_connected:
        try:
            await db.connect()
            db_connected = True
        except Exception as e:
            print(f"Database connection error: {e}")
    return db

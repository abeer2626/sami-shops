from fastapi import FastAPI, Depends, HTTPException, status, Response, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from prisma import Prisma
from datetime import datetime, timedelta
import auth
import schemas
import os
import traceback
from typing import List, Optional

# ============================================================================
# Environment Configuration
# ============================================================================

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
IS_PRODUCTION = os.getenv("ENVIRONMENT", "development") == "production"

# ============================================================================
# App Configuration
# ============================================================================

app = FastAPI(
    title="SamiShops API",
    version="1.0.0",
    description="E-commerce API for SamiShops platform",
    docs_url="/docs" if not IS_PRODUCTION else None,
    redoc_url="/redoc" if not IS_PRODUCTION else None,
)

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print(f"ERROR: {type(exc).__name__}: {exc}")
    traceback.print_exc()
    return HTTPException(status_code=500, detail=f"Internal Server Error: {str(exc)}")

# ============================================================================
# CORS Configuration (Production Ready)
# ============================================================================

# Build allowed origins list
allowed_origins = [
    FRONTEND_URL,
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
]

# Add Vercel preview URLs in development
if not IS_PRODUCTION:
    allowed_origins.extend([
        "http://*.vercel.app",
        "https://*.vercel.app",
    ])

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if IS_PRODUCTION else ["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=[
        "Accept",
        "Accept-Language",
        "Content-Language",
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "Origin",
        "Access-Control-Request-Method",
        "Access-Control-Request-Headers",
    ],
    expose_headers=["Content-Length", "Content-Range"],
    max_age=600 if IS_PRODUCTION else None,  # 10 minutes cache for preflight in production
)

# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    print(f"REQUEST: {request.method} {request.url.path}")
    try:
        response = await call_next(request)
        print(f"RESPONSE: {response.status_code}")
        return response
    except Exception as e:
        print(f"ERROR in middleware: {type(e).__name__}: {e}")
        traceback.print_exc()
        raise

# Database connection - use a singleton pattern
db = Prisma()

@app.on_event("startup")
async def startup():
    await db.connect()

@app.on_event("shutdown")
async def shutdown():
    await db.disconnect()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# Ensure database is connected for async operations
async def ensure_db_connected():
    """Ensure the database connection is alive."""
    try:
        # Try a simple query to check connection
        await db.user.find_first()
    except Exception:
        # Connection is closed, reconnect
        await db.connect()

async def get_db():
    """Dependency that ensures database is connected."""
    await ensure_db_connected()
    return db

@app.get("/")
async def root():
    return {"message": "Welcome to SamiShops Backend API", "status": "Online", "version": "1.0.0"}

@app.post("/test")
async def test_endpoint():
    print("TEST ENDPOINT CALLED")
    return {"message": "Test successful"}

@app.post("/test2")
async def test_endpoint2(data: dict):
    print(f"TEST2 ENDPOINT CALLED WITH: {data}")
    return {"message": "Test2 successful", "received": data}

@app.post("/register")
async def register(user: schemas.UserCreate):
    print("=== REGISTER ENDPOINT CALLED ===")
    print(f"User data: {user}")
    # Create a new connection for this request
    request_db = Prisma()
    await request_db.connect()

    try:
        # Check if user exists
        existing_user = await request_db.user.find_unique(where={"email": user.email})
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")

        hashed_password = auth.get_password_hash(user.password)
        new_user = await request_db.user.create(
            data={
                "email": user.email,
                "name": user.name,
                "password": hashed_password,
                "role": user.role
            }
        )
        return new_user
    finally:
        await request_db.disconnect()

@app.post("/login", response_model=schemas.Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    request_db = Prisma()
    await request_db.connect()

    try:
        user = await request_db.user.find_unique(where={"email": form_data.username})
        if not user or not auth.verify_password(form_data.password, user.password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = auth.create_access_token(
            data={"sub": user.email}, expires_delta=access_token_expires
        )
        return {"access_token": access_token, "token_type": "bearer"}
    finally:
        await request_db.disconnect()

@app.get("/me", response_model=schemas.UserOut)
async def get_me(token: str = Depends(oauth2_scheme)):
    request_db = Prisma()
    await request_db.connect()

    try:
        try:
            payload = auth.jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
            email: str = payload.get("sub")
            if email is None:
                raise HTTPException(status_code=401, detail="Invalid token")
        except auth.JWTError:
            raise HTTPException(status_code=401, detail="Invalid token")

        user = await request_db.user.find_unique(where={"email": email})
        if user is None:
            raise HTTPException(status_code=404, detail="User not found")
        return user
    finally:
        await request_db.disconnect()

async def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = auth.jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except auth.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = await db.user.find_unique(where={"email": email})
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# Product & Category Endpoints
@app.post("/api/v1/categories", response_model=schemas.CategoryOut)
async def create_category(category: schemas.CategoryCreate):
    return await db.category.create(data=category.dict())

@app.get("/api/v1/categories", response_model=List[schemas.CategoryOut])
async def get_categories():
    return await db.category.find_many()

@app.post("/api/v1/products", response_model=schemas.ProductOut)
async def create_product(product: schemas.ProductCreate):
    return await db.product.create(data=product.dict())

@app.get("/api/v1/products", response_model=List[schemas.ProductOut])
async def get_products(
    response: Response,
    category_id: Optional[str] = None,
    search: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    sort: Optional[str] = "newest"
):
    response.headers["Cache-Control"] = "public, max-age=60"
    where_clause = {}
    if category_id:
        where_clause["categoryId"] = category_id
    if search:
        where_clause["name"] = {"contains": search, "mode": "insensitive"}
    
    if min_price is not None or max_price is not None:
        price_filter = {}
        if min_price is not None:
            price_filter["gte"] = min_price
        if max_price is not None:
            price_filter["lte"] = max_price
        where_clause["price"] = price_filter

    order_by = {}
    if sort == "low_to_high":
        order_by = {"price": "asc"}
    elif sort == "high_to_low":
        order_by = {"price": "desc"}
    else:
        order_by = {"createdAt": "desc"}

    products = await db.product.find_many(
        where=where_clause,
        order=order_by,
        include={"store": True}
    )
    
    if not products:
        # Return mock products if database is empty and no specific search or category is requested
        # Or filter mock data if search is requested
        mock_data = [
            {
                "id": "mock_1",
                "name": "SamiShops Premium Watch",
                "description": "A high-end luxury watch for all occasions.",
                "price": 2500.0,
                "stock": 50,
                "images": ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500"],
                "categoryId": "cat_1",
                "storeId": "store_1",
                "createdAt": datetime.now(),
                "updatedAt": datetime.now()
            },
            {
                "id": "mock_2",
                "name": "Wireless Noise Cancelling Headphones",
                "description": "Experience pure sound with our latest headphones.",
                "price": 4500.0,
                "stock": 30,
                "images": ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500"],
                "categoryId": "cat_1",
                "storeId": "store_1",
                "createdAt": datetime.now(),
                "updatedAt": datetime.now()
            },
            {
                "id": "mock_3",
                "name": "Minimalist Leather Backpack",
                "description": "Sleek and durable backpack for everyday use.",
                "price": 3200.0,
                "stock": 100,
                "images": ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500"],
                "categoryId": "cat_2",
                "storeId": "store_1",
                "createdAt": datetime.now(),
                "updatedAt": datetime.now()
            },
            {
                "id": "mock_4",
                "name": "Smart Fitness Tracker",
                "description": "Track your health and fitness goals with ease.",
                "price": 1500.0,
                "stock": 200,
                "images": ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500"],
                "categoryId": "cat_1",
                "storeId": "store_1",
                "createdAt": datetime.now(),
                "updatedAt": datetime.now()
            }
        ]
        if search:
            return [p for p in mock_data if search.lower() in p["name"].lower()]
        return mock_data
    return products

@app.get("/api/v1/vendor/products", response_model=List[schemas.ProductOut])
async def get_vendor_products(current_user: schemas.UserOut = Depends(get_current_user)):
    # Find the store owned by this user
    store = await db.store.find_first(where={"vendorId": current_user.id})
    if not store:
        return []
    
    return await db.product.find_many(where={"storeId": store.id})

@app.get("/api/v1/products/{product_id}", response_model=schemas.ProductOut)
async def get_product(product_id: str, response: Response):
    response.headers["Cache-Control"] = "public, max-age=300"
    product = await db.product.find_unique(
        where={"id": product_id},
        include={"store": True}
    )
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@app.patch("/api/v1/products/{product_id}", response_model=schemas.ProductOut)
async def update_product(product_id: str, product_data: schemas.ProductUpdate):
    update_data = product_data.dict(exclude_unset=True)
    return await db.product.update(where={"id": product_id}, data=update_data)

@app.delete("/api/v1/products/{product_id}")
async def delete_product(product_id: str):
    await db.product.delete(where={"id": product_id})
    return {"message": "Product deleted successfully"}


# Order Endpoints
@app.post("/api/v1/orders", response_model=schemas.OrderOut)
async def create_order(order_data: schemas.OrderCreate):
    # Use a transaction to ensure data integrity
    try:
        # 1. Validate stock and items
        total_calculated = 0
        update_tasks = []
        
        for item in order_data.items:
            product = await db.product.find_unique(where={"id": item.productId})
            if not product:
                raise HTTPException(status_code=404, detail=f"Product {item.productId} not found")
            if product.stock < item.quantity:
                raise HTTPException(status_code=400, detail=f"Insufficient stock for {product.name}")
            
            total_calculated += product.price * item.quantity
            # Preparation for decrementing stock
            update_tasks.append(
                db.product.update(
                    where={"id": item.productId},
                    data={"stock": {"decrement": item.quantity}}
                )
            )

        # 2. Save Order and Items
        order = await db.order.create(
            data={
                "userId": order_data.userId,
                "totalAmount": order_data.totalAmount, # Could also use total_calculated
                "status": order_data.status or "pending",
                "items": {
                    "create": [
                        {
                            "productId": item.productId,
                            "quantity": item.quantity,
                            "price": item.price
                        }
                        for item in order_data.items
                    ]
                }
            },
            include={"items": True}
        )

        # 3. Execute inventory updates
        for task in update_tasks:
            await task

        return order
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/orders", response_model=List[schemas.OrderOut])
async def get_orders(user_id: Optional[str] = None):
    where_clause = {}
    if user_id:
        where_clause["userId"] = user_id
    
    return await db.order.find_many(
        where=where_clause,
        include={"items": True},
        order={"createdAt": "desc"}
    )

@app.get("/api/v1/orders/{order_id}", response_model=schemas.OrderOut)
async def get_order(order_id: str):
    order = await db.order.find_unique(
        where={"id": order_id},
        include={"items": True}
    )
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@app.get("/api/v1/vendor/orders", response_model=List[schemas.OrderOut])
async def get_vendor_orders(current_user: schemas.UserOut = Depends(get_current_user)):
    store = await db.store.find_first(where={"vendorId": current_user.id})
    if not store:
        return []
    
    # Get all orders that have items from this store
    orders = await db.order.find_many(
        where={
            "items": {
                "some": {
                    "product": {
                        "storeId": store.id
                    }
                }
            }
        },
        include={"items": True},
        order={"createdAt": "desc"}
    )
    return orders

@app.patch("/api/v1/orders/{order_id}/status", response_model=schemas.OrderOut)
async def update_order_status(
    order_id: str, 
    status_update: schemas.OrderStatusUpdate,
    current_user: schemas.UserOut = Depends(get_current_user)
):
    # For now, allow any authenticated user to update status (ideally check if vendor or admin)
    order = await db.order.update(
        where={"id": order_id},
        data={"status": status_update.status},
        include={"items": True}
    )
    return order

# Reports & Messaging Endpoints
@app.get("/api/v1/vendor/reports", response_model=schemas.SalesReport)
async def get_vendor_reports(current_user: schemas.UserOut = Depends(get_current_user)):
    store = await db.store.find_first(where={"vendorId": current_user.id})
    if not store:
        return {
            "totalRevenue": 0.0,
            "totalOrders": 0,
            "totalProductsSold": 0,
            "recentOrders": [],
            "topProducts": []
        }
    
    # Get all order items for products in this store
    order_items = await db.orderitem.find_many(
        where={"product": {"storeId": store.id}},
        include={"order": True, "product": True}
    )
    
    total_revenue = sum(item.price * item.quantity for item in order_items)
    unique_orders = {item.orderId for item in order_items}
    total_products_sold = sum(item.quantity for item in order_items)
    
    # Recent orders (simplified)
    recent_orders = []
    seen_orders = set()
    for item in sorted(order_items, key=lambda x: x.order.createdAt, reverse=True):
        if item.orderId not in seen_orders and len(recent_orders) < 5:
            recent_orders.append({
                "id": item.orderId,
                "amount": item.order.totalAmount,
                "status": item.order.status,
                "date": str(item.order.createdAt)
            })
            seen_orders.add(item.orderId)
            
    # Top products
    product_stats = {}
    for item in order_items:
        pid = item.productId
        if pid not in product_stats:
            product_stats[pid] = {"name": item.product.name, "sold": 0, "revenue": 0.0}
        product_stats[pid]["sold"] += item.quantity
        product_stats[pid]["revenue"] += item.price * item.quantity
    
    top_products = sorted(product_stats.values(), key=lambda x: x["sold"], reverse=True)[:5]
    
    return {
        "totalRevenue": total_revenue,
        "totalOrders": len(unique_orders),
        "totalProductsSold": total_products_sold,
        "recentOrders": recent_orders,
        "topProducts": top_products
    }

@app.post("/api/v1/messages", response_model=schemas.MessageOut)
async def send_message(msg_data: schemas.MessageCreate, current_user: schemas.UserOut = Depends(get_current_user)):
    return await db.message.create(
        data={
            "senderId": current_user.id,
            "receiverId": msg_data.receiverId,
            "content": msg_data.content,
            "productId": msg_data.productId
        }
    )

@app.get("/api/v1/messages", response_model=List[schemas.MessageOut])
async def get_messages(current_user: schemas.UserOut = Depends(get_current_user)):
    return await db.message.find_many(
        where={
            "OR": [
                {"senderId": current_user.id},
                {"receiverId": current_user.id}
            ]
        },
        order={"createdAt": "desc"}
    )

@app.patch("/api/v1/messages/{msg_id}/read", response_model=schemas.MessageOut)
async def mark_message_read(msg_id: str, current_user: schemas.UserOut = Depends(get_current_user)):
    return await db.message.update(
        where={"id": msg_id},
        data={"isRead": True}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

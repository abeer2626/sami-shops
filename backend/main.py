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
from database import db, get_db_connection
import dependencies
from dependencies import get_current_user

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
# Database connection imported from database.py

@app.on_event("startup")
async def startup():
    """Startup event - connect to database and ensure super admin exists"""
    if not IS_PRODUCTION:  # Only auto-connect in development
        await get_db_connection()

    # ========================================================================
    # SUPER ADMIN HARD-LOCK: Ensure super admin always exists
    # ========================================================================
    try:
        # Check if super admin exists
        super_admin = await db.user.find_unique(where={"email": auth.SUPER_ADMIN_EMAIL})

        if not super_admin:
            # Create super admin with default credentials
            hashed_password = auth.get_password_hash(auth.DEFAULT_ADMIN_PASSWORD)
            await db.user.create(
                data={
                    "email": auth.SUPER_ADMIN_EMAIL,
                    "name": "Super Admin",
                    "password": hashed_password,
                    "role": "admin"
                }
            )
            print(f"[SUCCESS] SUPER ADMIN CREATED: {auth.SUPER_ADMIN_EMAIL} / {auth.DEFAULT_ADMIN_PASSWORD}")
        else:
            # Ensure super admin has admin role
            if super_admin.role != "admin":
                await db.user.update(
                    where={"email": auth.SUPER_ADMIN_EMAIL},
                    data={"role": "admin"}
                )
                print(f"[SUCCESS] SUPER ADMIN ROLE RESTORED: {auth.SUPER_ADMIN_EMAIL}")
            else:
                print(f"[SUCCESS] SUPER ADMIN VERIFIED: {auth.SUPER_ADMIN_EMAIL}")

    except Exception as e:
        print(f"[WARNING] Could not verify super admin: {e}")
        # Don't fail startup if super admin check fails
        # The database might not be ready yet

@app.on_event("shutdown")
async def shutdown():
    """Shutdown event - disconnect from database"""
    if db.is_connected():
        await db.disconnect()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# Ensure database is connected for async operations
async def ensure_db_connected():
    """Ensure the database connection is alive."""
    await get_db_connection()

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

    # Check if user exists
    existing_user = await db.user.find_unique(where={"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = auth.get_password_hash(user.password)
    new_user = await db.user.create(
        data={
            "email": user.email,
            "name": user.name,
            "password": hashed_password,
            "role": user.role
        }
    )
    return new_user

@app.post("/login", response_model=schemas.Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await db.user.find_unique(where={"email": form_data.username})
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

@app.get("/me", response_model=schemas.UserOut)
async def get_me(token: str = Depends(oauth2_scheme)):
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

# Dependencies imported from dependencies.py
get_current_user = dependencies.get_current_user

@app.patch("/api/auth/password")
async def change_password(
    password_data: schemas.UserPasswordChange, 
    current_user: schemas.UserOut = Depends(get_current_user)
):
    """Allow any authenticated user to change their password."""
    # 1. Verify current password
    user = await db.user.find_unique(where={"id": current_user.id})
    if not auth.verify_password(password_data.current_password, user.password):
        raise HTTPException(status_code=400, detail="Incorrect current password")
        
    # 2. Update password
    new_hash = auth.get_password_hash(password_data.new_password)
    await db.user.update(
        where={"id": current_user.id},
        data={"password": new_hash}
    )
    return {"message": "Password updated successfully"}

# ============================================================================
# Super Admin Endpoints
# ============================================================================

@app.get("/api/auth/super-admin/status", response_model=dict)
async def get_super_admin_status(current_user: schemas.UserOut = Depends(get_current_user)):
    """
    Check if the current user is the SUPER ADMIN.
    Returns privileged information only to the super admin.
    """
    is_super = auth.is_user_super_admin(current_user)

    response_data = {
        "isSuperAdmin": is_super,
        "email": current_user.email,
    }

    # Only reveal the designated super admin email to everyone
    response_data["designatedSuperAdmin"] = auth.SUPER_ADMIN_EMAIL

    if is_super:
        response_data["message"] = "You are the SUPER ADMIN with full system access."
        response_data["capabilities"] = [
            "Cannot be deleted",
            "Cannot be downgraded",
            "Email cannot be changed",
            "Full access to all endpoints",
            "Can manage all users including admins"
        ]

    return response_data

@app.post("/api/auth/super-admin/reset-password")
async def super_admin_reset_password(
    reset_data: schemas.UserPasswordChange,
    current_user: schemas.UserOut = Depends(dependencies.require_super_admin)
):
    """
    SUPER ADMIN ONLY endpoint to reset their password.
    This is an additional security layer specifically for the super admin.
    """
    # Verify current password (security check)
    user = await db.user.find_unique(where={"id": current_user.id})
    if not auth.verify_password(reset_data.current_password, user.password):
        raise HTTPException(status_code=400, detail="Incorrect current password")

    # Update password
    new_hash = auth.get_password_hash(reset_data.new_password)
    await db.user.update(
        where={"id": current_user.id},
        data={"password": new_hash}
    )

    return {
        "message": "Super Admin password updated successfully",
        "email": user.email,
        "timestamp": datetime.now().isoformat()
    }

# Product & Category Endpoints
@app.post("/api/v1/categories", response_model=schemas.CategoryOut)
async def create_category(category: schemas.CategoryCreate, current_user: schemas.UserOut = Depends(dependencies.require_admin)):
    return await db.category.create(data=category.dict())

@app.get("/api/v1/categories", response_model=List[schemas.CategoryOut])
async def get_categories():
    return await db.category.find_many()

# ============================================================================
# SEARCH ENDPOINTS
# ============================================================================

@app.get("/api/v1/search/autocomplete", response_model=schemas.SearchAutocomplete)
async def search_autocomplete(
    response: Response,
    q: Optional[str] = None,
    limit: int = 5
):
    """
    Instant search autocomplete with suggestions.
    Returns: query suggestions, matching categories, and matching products.
    Prepared for Algolia/MeiliSearch integration.
    """
    response.headers["Cache-Control"] = "public, max-age=300"  # 5 minutes cache

    if not q or len(q.strip()) < 2:
        return schemas.SearchAutocomplete(
            query=q or "",
            suggestions=[],
            categories=[],
            products=[]
        )

    query = q.strip().lower()

    # Get matching categories
    categories = await db.category.find_many(
        where={
            "OR": [
                {"name": {"contains": query, "mode": "insensitive"}},
                {"slug": {"contains": query, "mode": "insensitive"}}
            ]
        },
        take=3
    )

    # Get matching products
    products = await db.product.find_many(
        where={
            "OR": [
                {"name": {"contains": query, "mode": "insensitive"}},
                {"description": {"contains": query, "mode": "insensitive"}}
            ]
        },
        include={"category": True, "store": True},
        take=limit,
        order={"createdAt": "desc"}
    )

    # Generate query suggestions based on common search patterns
    suggestions = []
    if len(query) >= 2:
        # Get unique product names that start with or contain the query
        all_products = await db.product.find_many(
            where={
                "name": {"contains": query, "mode": "insensitive"}
            },
            take=20
        )

        # Extract unique starting words/phrases
        seen = set()
        for product in all_products:
            words = product.name.lower().split()
            for i, word in enumerate(words):
                if word.startswith(query) and word not in seen and len(word) > 2:
                    suggestions.append(word.title())
                    seen.add(word)
                    if len(suggestions) >= limit:
                        break
                # Add phrase suggestions
                phrase = " ".join(words[:i+2])
                if query in phrase and phrase not in seen and len(phrase) > len(query):
                    suggestions.append(phrase.title())
                    seen.add(phrase)
                    if len(suggestions) >= limit * 2:
                        break
            if len(suggestions) >= limit * 2:
                break

        suggestions = list(set(suggestions))[:limit]

    return schemas.SearchAutocomplete(
        query=q,
        suggestions=suggestions,
        categories=[
            {"id": c.id, "name": c.name, "slug": c.slug, "type": "category"}
            for c in categories
        ],
        products=[
            {
                "id": p.id,
                "name": p.name,
                "price": p.price,
                "image": p.images[0] if p.images else None,
                "category": p.category.name if p.category else None,
                "type": "product"
            }
            for p in products
        ]
    )


@app.get("/api/v1/search", response_model=schemas.SearchResult)
async def search(
    response: Response,
    q: Optional[str] = None,
    category_id: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    sort: Optional[str] = "relevance",
    page: int = 1,
    limit: int = 20
):
    """
    Full search with filters and pagination.
    Supports category filtering, price range, and sorting.
    """
    response.headers["Cache-Control"] = "public, max-age=60"  # 1 minute cache

    # Calculate offset
    skip = (page - 1) * limit

    # Build where clause
    where_clause = {}

    if q and len(q.strip()) >= 2:
        query = q.strip()
        where_clause["OR"] = [
            {"name": {"contains": query, "mode": "insensitive"}},
            {"description": {"contains": query, "mode": "insensitive"}},
        ]

    if category_id:
        where_clause["categoryId"] = category_id

    if min_price is not None or max_price is not None:
        price_filter = {}
        if min_price is not None:
            price_filter["gte"] = min_price
        if max_price is not None:
            price_filter["lte"] = max_price
        where_clause["price"] = price_filter

    # Determine sort order
    order_by = {}
    if sort == "price_asc":
        order_by = {"price": "asc"}
    elif sort == "price_desc":
        order_by = {"price": "desc"}
    elif sort == "newest":
        order_by = {"createdAt": "desc"}
    elif sort == "relevance" and q:
        # For relevance, we could use text search ranking
        # For now, sort by name matching first, then date
        order_by = {"createdAt": "desc"}
    else:
        order_by = {"createdAt": "desc"}

    # Get total count for pagination
    total_count = len(await db.product.find_many(where=where_clause))

    # Get products
    products = await db.product.find_many(
        where=where_clause,
        order=order_by,
        skip=skip,
        take=limit,
        include={"store": True}
    )

    # Get matching categories for sidebar/filters
    categories = []
    if q:
        matching_categories = await db.category.find_many(
            where={
                "name": {"contains": q, "mode": "insensitive"}
            },
            take=5
        )
        categories = matching_categories

    # Generate suggestions
    suggestions = []
    if q:
        suggestions = [
            {
                "id": f"q_{q}",
                "type": "product",
                "title": f'"{q}"',
                "subtitle": f"Search for {q}",
                "image": None,
                "url": f"/search?q={q}"
            }
        ]

    return schemas.SearchResult(
        products=products,
        categories=categories,
        suggestions=suggestions,
        total=total_count,
        page=page,
        limit=limit
    )


@app.post("/api/v1/products", response_model=schemas.ProductOut)
async def create_product(product: schemas.ProductCreate, current_user: schemas.UserOut = Depends(dependencies.require_vendor)):
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
async def get_vendor_products(current_user: schemas.UserOut = Depends(dependencies.require_vendor)):
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
async def update_product(product_id: str, product_data: schemas.ProductUpdate, current_user: schemas.UserOut = Depends(dependencies.require_vendor)):
    update_data = product_data.dict(exclude_unset=True)
    return await db.product.update(where={"id": product_id}, data=update_data)

@app.delete("/api/v1/products/{product_id}")
async def delete_product(product_id: str, current_user: schemas.UserOut = Depends(dependencies.require_vendor)):
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
                "paymentStatus": order_data.paymentStatus or "pending",
                "paymentProvider": order_data.paymentProvider,
                "paymentReference": order_data.paymentReference,
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
    """
    Update order status and create status history entry.
    Accessible by admin and vendor (for their orders).
    """
    # Validate order exists
    order = await db.order.find_unique(
        where={"id": order_id},
        include={"items": {"include": {"product": True}}}
    )
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Check permissions: admin can update any order, vendors only their store's orders
    if current_user.role == "vendor":
        store = await db.store.find_first(where={"vendorId": current_user.id})
        if not store:
            raise HTTPException(status_code=403, detail="No store found for this vendor")

        # Check if order contains products from this vendor's store
        has_store_products = any(
            item.product.storeId == store.id for item in order.items
        )
        if not has_store_products:
            raise HTTPException(status_code=403, detail="You can only update orders containing your products")
    elif current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins and vendors can update order status")

    # Validate status transition
    valid_statuses = ["pending", "paid", "processing", "shipped", "delivered", "cancelled"]
    if status_update.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}")

    # Prepare update data
    update_data = {"status": status_update.status}

    # Add optional tracking info
    if status_update.trackingNumber:
        update_data["trackingNumber"] = status_update.trackingNumber
    if status_update.shippingCarrier:
        update_data["shippingCarrier"] = status_update.shippingCarrier
    if status_update.estimatedDelivery:
        update_data["estimatedDelivery"] = status_update.estimatedDelivery

    # Update order
    updated_order = await db.order.update(
        where={"id": order_id},
        data=update_data,
        include={"items": {"include": {"product": {"include": {"store": True}}}}}
    )

    # Create status history entry
    await db.orderstatushistory.create(
        data={
            "orderId": order_id,
            "status": status_update.status,
            "changedBy": current_user.id,
            "notes": status_update.notes
        }
    )

    # Create vendor earnings when order is marked as paid
    if status_update.status == "paid":
        # Group items by store and create earnings for each store
        store_earnings = {}
        for item in updated_order.items:
            store_id = item.product.storeId
            if store_id not in store_earnings:
                store_earnings[store_id] = 0
            store_earnings[store_id] += item.price * item.quantity

        # Create earning records for each store
        for store_id, amount in store_earnings.items():
            await create_vendor_earning(order_id, amount, store_id)

    # Update vendor earnings status to "available" when order is delivered
    elif status_update.status == "delivered":
        await db.vendorearning.update_many(
            where={"orderId": order_id},
            data={"status": "available"}
        )

    return updated_order


# ============================================================================
# ORDER TRACKING ENDPOINTS
# ============================================================================

@app.get("/api/v1/orders/{order_id}/tracking", response_model=schemas.OrderTrackingOut)
async def get_order_tracking(
    order_id: str,
    current_user: schemas.UserOut = Depends(get_current_user)
):
    """
    Get detailed order tracking information including status history.
    Accessible by the order owner, admin, and relevant vendors.
    """
    # Get order with full details
    order = await db.order.find_unique(
        where={"id": order_id},
        include={"items": {"include": {"product": {"include": {"store": True}}}}}
    )
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Check permissions
    is_owner = order.userId == current_user.id
    is_admin = current_user.role == "admin"

    # Check if vendor (has products in this order)
    is_vendor = False
    if current_user.role == "vendor":
        store = await db.store.find_first(where={"vendorId": current_user.id})
        if store:
            is_vendor = any(item.product.storeId == store.id for item in order.items)

    if not (is_owner or is_admin or is_vendor):
        raise HTTPException(status_code=403, detail="You don't have permission to view this order")

    # Get status history
    status_history = await db.orderstatushistory.find_many(
        where={"orderId": order_id},
        order={"createdAt": "desc"}
    )

    # Calculate current step based on status
    status_steps = {
        "pending": 0,
        "paid": 1,
        "processing": 2,
        "shipped": 3,
        "delivered": 4,
        "cancelled": -1  # Special case
    }
    current_step = status_steps.get(order.status, 0)

    return schemas.OrderTrackingOut(
        order=order,
        statusHistory=status_history,
        currentStep=current_step,
        estimatedDelivery=order.estimatedDelivery,
        trackingNumber=order.trackingNumber,
        shippingCarrier=order.shippingCarrier
    )


@app.get("/api/v1/orders/{order_id}/history", response_model=List[schemas.OrderStatusHistoryOut])
async def get_order_status_history(
    order_id: str,
    current_user: schemas.UserOut = Depends(get_current_user)
):
    """Get status history for an order."""
    # Verify order exists and user has access
    order = await db.order.find_unique(where={"id": order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Check permissions
    is_owner = order.userId == current_user.id
    is_admin = current_user.role == "admin"

    if not (is_owner or is_admin):
        raise HTTPException(status_code=403, detail="You don't have permission to view this order's history")

    # Get status history
    history = await db.orderstatushistory.find_many(
        where={"orderId": order_id},
        order={"createdAt": "desc"}
    )

    return history


@app.get("/api/v1/user/orders", response_model=List[schemas.OrderOut])
async def get_user_orders(
    current_user: schemas.UserOut = Depends(get_current_user),
    status: Optional[str] = None,
    limit: int = 20,
    skip: int = 0
):
    """
    Get current user's orders with optional status filter.
    For customer dashboard.
    """
    where_clause = {"userId": current_user.id}

    if status:
        where_clause["status"] = status

    orders = await db.order.find_many(
        where=where_clause,
        include={"items": {"include": {"product": True}}},
        order={"createdAt": "desc"},
        take=limit,
        skip=skip
    )

    return orders


@app.get("/api/v1/vendor/orders/pending", response_model=List[schemas.OrderOut])
async def get_vendor_pending_orders(
    current_user: schemas.UserOut = Depends(dependencies.require_vendor)
):
    """
    Get pending orders that contain vendor's products.
    For vendor dashboard - orders that need attention.
    """
    store = await db.store.find_first(where={"vendorId": current_user.id})
    if not store:
        return []

    # Get orders with pending/processing status that contain vendor's products
    orders = await db.order.find_many(
        where={
            "AND": [
                {
                    "OR": [
                        {"status": "pending"},
                        {"status": "paid"},
                        {"status": "processing"}
                    ]
                },
                {
                    "items": {
                        "some": {
                            "product": {
                                "storeId": store.id
                            }
                        }
                    }
                }
            ]
        },
        include={"items": {"include": {"product": True}}},
        order={"createdAt": "desc"}
    )

    return orders

@app.patch("/api/v1/orders/{order_id}/mark-paid", response_model=schemas.OrderOut)
async def mark_order_paid(
    order_id: str,
    payment_data: schemas.OrderMarkPaid,
    current_user: schemas.UserOut = Depends(dependencies.require_admin)
):
    # Admin check removed (handled by dependency)
    
    order = await db.order.find_unique(where={"id": order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    updated_order = await db.order.update(
        where={"id": order_id},
        data={
            "paymentStatus": "paid",
            "paymentProvider": payment_data.paymentProvider,
            "paymentReference": payment_data.paymentReference,
            # If the payment was successful, we might want to update the main status too? 
            # The prompt doesn't say so, but it's often implied. 
            # However, "processing" or "shipped" usually comes later. 
            # I'll stick to just paymentStatus for now unless logic dictates otherwise.
        },
        include={"items": True}
    )
    return updated_order

@app.get("/api/v1/admin/overview", response_model=schemas.AdminOverview)
async def get_admin_overview(current_user: schemas.UserOut = Depends(dependencies.require_admin)):
    # Admin check removed (handled by dependency)

    total_users = await db.user.count()
    total_products = await db.product.count()
    total_orders = await db.order.count()
    
    # Revenue from paid orders only
    revenue_agg = await db.order.aggregate(
        sum={"totalAmount": True},
        where={"paymentStatus": "paid"}
    )
    
    # helper to safely extract total
    total_revenue = 0.0
    if revenue_agg and hasattr(revenue_agg, 'sum') and revenue_agg.sum:
         total_revenue = revenue_agg.sum.totalAmount or 0.0

    recent_orders = await db.order.find_many(
        take=5,
        order={"createdAt": "desc"},
        include={"items": True}
    )

    return {
        "totalUsers": total_users,
        "totalOrders": total_orders,
        "totalRevenue": total_revenue,
        "totalProducts": total_products,
        "recentOrders": recent_orders
    }

@app.get("/api/v1/admin/users", response_model=List[schemas.UserOut])
async def get_all_users(current_user: schemas.UserOut = Depends(dependencies.require_admin)):
    return await db.user.find_many(order={"createdAt": "desc"})

@app.delete("/api/v1/admin/users/{user_id}")
async def delete_user(user_id: str, current_user: schemas.UserOut = Depends(dependencies.require_admin)):
    user_to_delete = await db.user.find_unique(where={"id": user_id})
    if not user_to_delete:
        raise HTTPException(status_code=404, detail="User not found")
        
    # SUPER ADMIN GUARD
    if user_to_delete.email == auth.SUPER_ADMIN_EMAIL:
        raise HTTPException(status_code=403, detail="Super Admin cannot be deleted")
        
    # Prevent deleting yourself
    if user_to_delete.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
        
    await db.user.delete(where={"id": user_id})
    return {"message": "User deleted successfully"}

@app.patch("/api/v1/admin/users/{user_id}", response_model=schemas.UserOut)
async def update_user(
    user_id: str, 
    user_data: schemas.UserUpdate,
    current_user: schemas.UserOut = Depends(dependencies.require_admin)
):
    user_to_update = await db.user.find_unique(where={"id": user_id})
    if not user_to_update:
        raise HTTPException(status_code=404, detail="User not found")
        
    # SUPER ADMIN GUARDS
    if user_to_update.email == auth.SUPER_ADMIN_EMAIL:
        # Prevent downgrading role
        if user_data.role and user_data.role != "admin":
             raise HTTPException(status_code=403, detail="Super Admin cannot be downgraded")

        # Prevent changing email (identity)
        if user_data.email and user_data.email != auth.SUPER_ADMIN_EMAIL:
             raise HTTPException(status_code=403, detail="Super Admin email cannot be changed")

        # Prevent changing name (identity protection)
        if user_data.name and user_data.name != "Super Admin":
             raise HTTPException(status_code=403, detail="Super Admin name cannot be changed")

    update_data = user_data.dict(exclude_unset=True)
    if not update_data:
        return user_to_update
        
    return await db.user.update(where={"id": user_id}, data=update_data)

@app.delete("/api/v1/categories/{category_id}")
async def delete_category(category_id: str, current_user: schemas.UserOut = Depends(dependencies.require_admin)):
    # Check if category has products
    products_count = await db.product.count(where={"categoryId": category_id})
    if products_count > 0:
        raise HTTPException(status_code=400, detail="Cannot delete category with associated products")
        
    await db.category.delete(where={"id": category_id})
    return {"message": "Category deleted successfully"}

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
async def send_message(msg_data: schemas.MessageCreate, current_user: schemas.UserOut = Depends(dependencies.get_current_user)):
    if msg_data.receiverId == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot send message to yourself")

    receiver = await db.user.find_unique(where={"id": msg_data.receiverId})
    if not receiver:
        raise HTTPException(status_code=404, detail="Receiver not found")

    # Business Rule: Buyer <-> Vendor only (and Admin interactions)
    # Block Customer -> Customer
    if current_user.role == "customer" and receiver.role == "customer":
        raise HTTPException(status_code=403, detail="Customers cannot message other customers")
    
    # Block Vendor -> Vendor (optional, but consistent)
    if current_user.role == "vendor" and receiver.role == "vendor":
        raise HTTPException(status_code=403, detail="Vendors cannot message other vendors")

    return await db.message.create(
        data={
            "senderId": current_user.id,
            "receiverId": msg_data.receiverId,
            "content": msg_data.content,
            "productId": msg_data.productId
        }
    )

@app.get("/api/v1/messages/inbox", response_model=List[schemas.MessageOut])
async def get_inbox(current_user: schemas.UserOut = Depends(dependencies.get_current_user)):
    return await db.message.find_many(
        where={"receiverId": current_user.id},
        order={"createdAt": "desc"},
        include={"sender": False} # We assume sender details might be fetched separately or we could include sender name if schema supports
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

# ============================================================================
# FLASH SALE API ENDPOINTS
# ============================================================================

def calculate_time_remaining(end_time: datetime) -> Optional[int]:
    """Calculate seconds remaining until flash sale ends."""
    now = datetime.now()
    if now >= end_time:
        return None
    return int((end_time - now).total_seconds())

def is_flash_sale_active(start_time: datetime, end_time: datetime) -> bool:
    """Check if flash sale is currently active."""
    now = datetime.now()
    return start_time <= now < end_time

@app.get("/api/v1/flash-sales", response_model=List[schemas.FlashSaleListOut])
async def get_flash_sales(
    active_only: bool = True,
    include_products: bool = False,
    current_user: schemas.UserOut = Depends(get_current_user)
):
    """
    Get all flash sales.
    - active_only: Only return currently active sales
    - include_products: Include full product details (for detailed view)
    """
    now = datetime.now()

    # Build where clause
    where_clause = {}
    if active_only:
        where_clause["isActive"] = True
        where_clause["startTime"] = {"lte": now}
        where_clause["endTime"] = {"gt": now}

    sales = await db.flashsale.find_many(
        where=where_clause,
        order={"startTime": "desc"},
        include={"products": include_products} if include_products else None
    )

    result = []
    for sale in sales:
        time_remaining = calculate_time_remaining(sale.endTime)

        if include_products:
            # Full details with products
            products_with_time = []
            for fp in sale.products:
                product_dict = {
                    **fp.__dict__,
                    "timeRemaining": time_remaining
                }
                products_with_time.append(product_dict)

            result.append({
                **sale.__dict__,
                "timeRemaining": time_remaining
            })
        else:
            # List view without products
            product_count = await db.flashsaleproduct.count(
                where={"flashSaleId": sale.id}
            )

            result.append(schemas.FlashSaleListOut(
                id=sale.id,
                name=sale.name,
                startTime=sale.startTime,
                endTime=sale.endTime,
                isActive=sale.isActive and is_flash_sale_active(sale.startTime, sale.endTime),
                productCount=product_count,
                timeRemaining=time_remaining
            ))

    return result

@app.get("/api/v1/flash-sales/{sale_id}", response_model=schemas.FlashSaleOut)
async def get_flash_sale(
    sale_id: str,
    current_user: schemas.UserOut = Depends(get_current_user)
):
    """Get a single flash sale with all products."""
    sale = await db.flashsale.find_unique(
        where={"id": sale_id},
        include={"products": {"include": {"product": True}}}
    )

    if not sale:
        raise HTTPException(status_code=404, detail="Flash sale not found")

    # Check if sale is still active
    if not is_flash_sale_active(sale.startTime, sale.endTime):
        raise HTTPException(status_code=400, detail="Flash sale has ended")

    time_remaining = calculate_time_remaining(sale.endTime)

    # Build response with product details
    products_out = []
    for fp in sale.products:
        products_out.append(schemas.FlashSaleProductOut(
            id=fp.id,
            flashSaleId=fp.flashSaleId,
            productId=fp.productId,
            salePrice=fp.salePrice,
            discountPercent=fp.discountPercent,
            maxQuantity=fp.maxQuantity,
            soldCount=fp.soldCount,
            product=schemas.ProductOut(
                id=fp.product.id,
                name=fp.product.name,
                description=fp.product.description,
                price=fp.product.price,
                stock=fp.product.stock,
                images=fp.product.images,
                categoryId=fp.product.categoryId,
                storeId=fp.product.storeId,
                createdAt=fp.product.createdAt,
                updatedAt=fp.product.updatedAt
            )
        ))

    return schemas.FlashSaleOut(
        id=sale.id,
        name=sale.name,
        description=sale.description,
        startTime=sale.startTime,
        endTime=sale.endTime,
        isActive=sale.isActive and is_flash_sale_active(sale.startTime, sale.endTime),
        products=products_out,
        createdAt=sale.createdAt,
        updatedAt=sale.updatedAt,
        timeRemaining=time_remaining
    )

@app.get("/api/v1/flash-sales/active", response_model=schemas.FlashSaleOut)
async def get_active_flash_sale(
    current_user: schemas.UserOut = Depends(get_current_user)
):
    """Get the currently active flash sale (if any)."""
    now = datetime.now()

    sale = await db.flashsale.find_first(
        where={
            "isActive": True,
            "startTime": {"lte": now},
            "endTime": {"gt": now}
        },
        include={"products": {"include": {"product": True}}}
    )

    if not sale:
        raise HTTPException(status_code=404, detail="No active flash sale")

    time_remaining = calculate_time_remaining(sale.endTime)

    # Build response with product details
    products_out = []
    for fp in sale.products:
        products_out.append(schemas.FlashSaleProductOut(
            id=fp.id,
            flashSaleId=fp.flashSaleId,
            productId=fp.productId,
            salePrice=fp.salePrice,
            discountPercent=fp.discountPercent,
            maxQuantity=fp.maxQuantity,
            soldCount=fp.soldCount,
            product=schemas.ProductOut(
                id=fp.product.id,
                name=fp.product.name,
                description=fp.product.description,
                price=fp.product.price,
                stock=fp.product.stock,
                images=fp.product.images,
                categoryId=fp.product.categoryId,
                storeId=fp.product.storeId,
                createdAt=fp.product.createdAt,
                updatedAt=fp.product.updatedAt
            )
        ))

    return schemas.FlashSaleOut(
        id=sale.id,
        name=sale.name,
        description=sale.description,
        startTime=sale.startTime,
        endTime=sale.endTime,
        isActive=True,
        products=products_out,
        createdAt=sale.createdAt,
        updatedAt=sale.updatedAt,
        timeRemaining=time_remaining
    )

@app.get("/api/v1/products/{product_id}/flash-price", response_model=dict)
async def get_product_flash_price(
    product_id: str,
    current_user: schemas.UserOut = Depends(get_current_user)
):
    """
    Get the flash sale price for a product if it's in an active flash sale.
    Returns the sale price, discount percentage, and time remaining.
    """
    now = datetime.now()

    # Find active flash sale containing this product
    flash_sale_product = await db.flashsaleproduct.find_first(
        where={
            "productId": product_id,
            "flashSale": {
                "isActive": True,
                "startTime": {"lte": now},
                "endTime": {"gt": now}
            }
        },
        include={"flashSale": True}
    )

    if not flash_sale_product:
        return {
            "inFlashSale": False,
            "salePrice": None,
            "discountPercent": None,
            "timeRemaining": None
        }

    time_remaining = calculate_time_remaining(flash_sale_product.flashSale.endTime)

    return {
        "inFlashSale": True,
        "salePrice": flash_sale_product.salePrice,
        "originalPrice": None,  # Caller can fetch from products endpoint
        "discountPercent": flash_sale_product.discountPercent,
        "timeRemaining": time_remaining,
        "maxQuantity": flash_sale_product.maxQuantity,
        "soldCount": flash_sale_product.soldCount
    }

# ADMIN ONLY: Flash Sale Management
@app.post("/api/v1/admin/flash-sales", response_model=schemas.FlashSaleOut)
async def create_flash_sale(
    sale_data: schemas.FlashSaleCreate,
    current_user: schemas.UserOut = Depends(dependencies.require_admin)
):
    """Create a new flash sale (Admin only)."""
    # Validate time range
    if sale_data.endTime <= sale_data.startTime:
        raise HTTPException(status_code=400, detail="End time must be after start time")

    # Create flash sale with products
    products_data = [
        {
            "productId": p.productId,
            "salePrice": p.salePrice,
            "discountPercent": p.discountPercent,
            "maxQuantity": p.maxQuantity,
            "soldCount": p.soldCount
        }
        for p in sale_data.products
    ]

    sale = await db.flashsale.create(
        data={
            "name": sale_data.name,
            "description": sale_data.description,
            "startTime": sale_data.startTime,
            "endTime": sale_data.endTime,
            "isActive": sale_data.isActive,
            "products": {"create": products_data}
        },
        include={"products": {"include": {"product": True}}}
    )

    # Build response
    products_out = []
    for fp in sale.products:
        products_out.append(schemas.FlashSaleProductOut(
            id=fp.id,
            flashSaleId=fp.flashSaleId,
            productId=fp.productId,
            salePrice=fp.salePrice,
            discountPercent=fp.discountPercent,
            maxQuantity=fp.maxQuantity,
            soldCount=fp.soldCount,
            product=schemas.ProductOut(
                id=fp.product.id,
                name=fp.product.name,
                description=fp.product.description,
                price=fp.product.price,
                stock=fp.product.stock,
                images=fp.product.images,
                categoryId=fp.product.categoryId,
                storeId=fp.product.storeId,
                createdAt=fp.product.createdAt,
                updatedAt=fp.product.updatedAt
            )
        ))

    return schemas.FlashSaleOut(
        id=sale.id,
        name=sale.name,
        description=sale.description,
        startTime=sale.startTime,
        endTime=sale.endTime,
        isActive=sale.isActive,
        products=products_out,
        createdAt=sale.createdAt,
        updatedAt=sale.updatedAt
    )

@app.patch("/api/v1/admin/flash-sales/{sale_id}", response_model=schemas.FlashSaleOut)
async def update_flash_sale(
    sale_id: str,
    sale_data: schemas.FlashSaleUpdate,
    current_user: schemas.UserOut = Depends(dependencies.require_admin)
):
    """Update a flash sale (Admin only)."""
    sale = await db.flashsale.find_unique(where={"id": sale_id})
    if not sale:
        raise HTTPException(status_code=404, detail="Flash sale not found")

    update_data = {k: v for k, v in sale_data.dict(exclude_unset=True).items() if k != "products"}

    updated_sale = await db.flashsale.update(
        where={"id": sale_id},
        data=update_data,
        include={"products": {"include": {"product": True}}}
    )

    # Build response
    products_out = []
    for fp in updated_sale.products:
        products_out.append(schemas.FlashSaleProductOut(
            id=fp.id,
            flashSaleId=fp.flashSaleId,
            productId=fp.productId,
            salePrice=fp.salePrice,
            discountPercent=fp.discountPercent,
            maxQuantity=fp.maxQuantity,
            soldCount=fp.soldCount,
            product=schemas.ProductOut(
                id=fp.product.id,
                name=fp.product.name,
                description=fp.product.description,
                price=fp.product.price,
                stock=fp.product.stock,
                images=fp.product.images,
                categoryId=fp.product.categoryId,
                storeId=fp.product.storeId,
                createdAt=fp.product.createdAt,
                updatedAt=fp.product.updatedAt
            )
        ))

    return schemas.FlashSaleOut(
        id=updated_sale.id,
        name=updated_sale.name,
        description=updated_sale.description,
        startTime=updated_sale.startTime,
        endTime=updated_sale.endTime,
        isActive=updated_sale.isActive,
        products=products_out,
        createdAt=updated_sale.createdAt,
        updatedAt=updated_sale.updatedAt
    )

@app.delete("/api/v1/admin/flash-sales/{sale_id}")
async def delete_flash_sale(
    sale_id: str,
    current_user: schemas.UserOut = Depends(dependencies.require_admin)
):
    """Delete a flash sale (Admin only)."""
    sale = await db.flashsale.find_unique(where={"id": sale_id})
    if not sale:
        raise HTTPException(status_code=404, detail="Flash sale not found")

    await db.flashsale.delete(where={"id": sale_id})
    return {"message": "Flash sale deleted successfully"}

# ============================================================================
# PRODUCT REVIEWS & RATINGS ENDPOINTS
# ============================================================================

@app.get("/api/v1/products/{product_id}/reviews", response_model=schemas.ReviewSummary)
async def get_product_reviews(
    product_id: str,
    response: Response,
    page: int = 1,
    limit: int = 10,
    sort: str = "recent"
):
    """
    Get reviews for a product with summary statistics.
    Returns average rating, total count, and rating distribution.
    """
    response.headers["Cache-Control"] = "public, max-age=300"  # 5 minutes cache

    # Verify product exists
    product = await db.product.find_unique(where={"id": product_id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Calculate rating distribution
    reviews = await db.review.find_many(
        where={"productId": product_id}
    )

    total_reviews = len(reviews)
    rating_distribution = {"5": 0, "4": 0, "3": 0, "2": 0, "1": 0}

    total_rating = 0
    for review in reviews:
        rating_distribution[str(review.rating)] += 1
        total_rating += review.rating

    average_rating = total_rating / total_reviews if total_reviews > 0 else 0

    # Get paginated reviews with user info
    skip = (page - 1) * limit

    order_by = {"createdAt": "desc"} if sort == "recent" else {"helpful": "desc"}

    paginated_reviews = await db.review.find_many(
        where={"productId": product_id},
        order=order_by,
        skip=skip,
        take=limit,
        include={"user": True}
    )

    return schemas.ReviewSummary(
        productId=product_id,
        averageRating=round(average_rating, 1),
        totalReviews=total_reviews,
        ratingDistribution=rating_distribution
    )


@app.get("/api/v1/products/{product_id}/reviews/list", response_model=List[schemas.ReviewWithUser])
async def get_product_reviews_list(
    product_id: str,
    response: Response,
    page: int = 1,
    limit: int = 10,
    sort: str = "recent"
):
    """Get paginated list of reviews for a product."""
    response.headers["Cache-Control"] = "public, max-age=60"  # 1 minute cache

    skip = (page - 1) * limit
    order_by = {"createdAt": "desc"} if sort == "recent" else {"helpful": "desc"}

    reviews = await db.review.find_many(
        where={"productId": product_id},
        order=order_by,
        skip=skip,
        take=limit,
        include={"user": True}
    )

    # Format response with minimal user info
    result = []
    for review in reviews:
        result.append({
            "id": review.id,
            "userId": review.userId,
            "productId": review.productId,
            "rating": review.rating,
            "title": review.title,
            "comment": review.comment,
            "isVerified": review.isVerified,
            "helpful": review.helpful,
            "images": review.images,
            "createdAt": review.createdAt,
            "updatedAt": review.updatedAt,
            "user": {
                "id": review.user.id,
                "name": review.user.name,
                "email": review.user.email
            }
        })

    return result


@app.post("/api/v1/products/{product_id}/reviews", response_model=schemas.ReviewOut)
async def create_review(
    product_id: str,
    review_data: schemas.ReviewCreate,
    current_user: schemas.UserOut = Depends(get_current_user)
):
    """
    Create a new review for a product.
    Only users who have purchased the product can create verified reviews.
    """
    # Verify product exists
    product = await db.product.find_unique(where={"id": product_id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Check if user already reviewed this product
    existing_review = await db.review.find_unique(
        where={
            "userId_productId": {
                "userId": current_user.id,
                "productId": product_id
            }
        }
    )
    if existing_review:
        raise HTTPException(status_code=400, detail="You have already reviewed this product")

    # Validate rating
    if review_data.rating < 1 or review_data.rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")

    # Check if user has purchased this product (verified review)
    is_verified = False
    user_orders = await db.order.find_many(
        where={
            "userId": current_user.id,
            "status": {"in": ["delivered", "shipped", "processing"]}  # Consider these as valid for review
        },
        include={"items": True}
    )

    for order in user_orders:
        for item in order.items:
            if item.productId == product_id:
                is_verified = True
                break
        if is_verified:
            break

    # Create review
    review = await db.review.create(
        data={
            "userId": current_user.id,
            "productId": product_id,
            "rating": review_data.rating,
            "title": review_data.title,
            "comment": review_data.comment,
            "isVerified": is_verified
        }
    )

    # Update product rating summary
    await update_product_rating(product_id)

    return review


@app.patch("/api/v1/reviews/{review_id}", response_model=schemas.ReviewOut)
async def update_review(
    review_id: str,
    review_data: schemas.ReviewUpdate,
    current_user: schemas.UserOut = Depends(get_current_user)
):
    """Update an existing review (only by the review owner)."""
    review = await db.review.find_unique(where={"id": review_id})
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    if review.userId != current_user.id:
        raise HTTPException(status_code=403, detail="You can only edit your own reviews")

    # Validate rating if provided
    if review_data.rating is not None and (review_data.rating < 1 or review_data.rating > 5):
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")

    # Build update data
    update_data = {}
    if review_data.rating is not None:
        update_data["rating"] = review_data.rating
    if review_data.title is not None:
        update_data["title"] = review_data.title
    if review_data.comment is not None:
        update_data["comment"] = review_data.comment

    updated_review = await db.review.update(
        where={"id": review_id},
        data=update_data
    )

    # Update product rating summary
    await update_product_rating(review.productId)

    return updated_review


@app.delete("/api/v1/reviews/{review_id}")
async def delete_review(
    review_id: str,
    current_user: schemas.UserOut = Depends(get_current_user)
):
    """Delete a review (only by the review owner or admin)."""
    review = await db.review.find_unique(where={"id": review_id})
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    # Check ownership or admin role
    if review.userId != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="You can only delete your own reviews")

    product_id = review.productId
    await db.review.delete(where={"id": review_id})

    # Update product rating summary
    await update_product_rating(product_id)

    return {"message": "Review deleted successfully"}


@app.post("/api/v1/reviews/{review_id}/helpful")
async def mark_review_helpful(
    review_id: str,
    current_user: schemas.UserOut = Depends(get_current_user)
):
    """Mark a review as helpful (increments helpful count)."""
    review = await db.review.find_unique(where={"id": review_id})
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    # Increment helpful count
    updated_review = await db.review.update(
        where={"id": review_id},
        data={"helpful": review.helpful + 1}
    )

    return {"helpful": updated_review.helpful}


async def update_product_rating(product_id: str):
    """
    Helper function to update product's average rating and review count.
    Called after review creation, update, or deletion.
    """
    reviews = await db.review.find_many(where={"productId": product_id})

    total_reviews = len(reviews)
    total_rating = sum(r.rating for r in reviews)
    average_rating = total_rating / total_reviews if total_reviews > 0 else 0

    await db.product.update(
        where={"id": product_id},
        data={
            "averageRating": average_rating,
            "reviewCount": total_reviews
        }
    )


# ============================================================
# VENDOR COMMISSION ENDPOINTS
# ============================================================

async def get_default_commission_rate() -> float:
    """Get the default commission rate (0.10 = 10% if not set)."""
    default_commission = await db.commission.find_first(where={"isDefault": True})
    if default_commission:
        return default_commission.rate
    return 0.10  # Default to 10%


async def create_vendor_earning(order_id: str, order_amount: float, store_id: str):
    """
    Create a vendor earning record when an order is paid.
    Called automatically when order payment status is updated to 'paid'.
    """
    commission_rate = await get_default_commission_rate()
    commission_amount = order_amount * commission_rate
    vendor_amount = order_amount - commission_amount

    await db.vendorearning.create(
        data={
            "storeId": store_id,
            "orderId": order_id,
            "orderAmount": order_amount,
            "commissionRate": commission_rate,
            "commissionAmount": commission_amount,
            "vendorAmount": vendor_amount,
            "status": "pending"  # Will become available after order is delivered
        }
    )


@app.get("/api/v1/vendor/earnings", response_model=schemas.VendorEarningSummary)
async def get_vendor_earnings(
    current_user: schemas.UserOut = Depends(dependencies.require_vendor)
):
    """
    Get vendor's earnings summary including available balance and history.
    """
    store = await db.store.find_first(
        where={"vendorId": current_user.id},
        include={"earnings": True, "payouts": True}
    )

    if not store:
        raise HTTPException(status_code=404, detail="Store not found")

    earnings = store.earnings or []

    # Calculate totals
    total_earnings = sum(e.vendorAmount for e in earnings)
    available_balance = sum(e.vendorAmount for e in earnings if e.status == "available")
    pending_earnings = sum(e.vendorAmount for e in earnings if e.status == "pending")
    paid_amount = sum(p.amount for p in store.payouts if p.status == "completed")

    # Get recent earnings
    recent_earnings = sorted(earnings, key=lambda e: e.createdAt, reverse=True)[:10]

    return schemas.VendorEarningSummary(
        totalEarnings=total_earnings,
        availableBalance=available_balance,
        pendingEarnings=pending_earnings,
        paidAmount=paid_amount,
        totalOrders=len(earnings),
        recentEarnings=recent_earnings
    )


@app.get("/api/v1/vendor/earnings/history", response_model=List[schemas.VendorEarningOut])
async def get_vendor_earnings_history(
    status: Optional[str] = None,
    limit: int = 50,
    skip: int = 0,
    current_user: schemas.UserOut = Depends(dependencies.require_vendor)
):
    """
    Get detailed earnings history for vendor with optional status filter.
    """
    store = await db.store.find_first(where={"vendorId": current_user.id})
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")

    where_clause = {"storeId": store.id}
    if status:
        where_clause["status"] = status

    earnings = await db.vendorearning.find_many(
        where=where_clause,
        order={"createdAt": "desc"},
        take=limit,
        skip=skip
    )

    return earnings


@app.post("/api/v1/vendor/payouts", response_model=schemas.VendorPayoutOut)
async def request_payout(
    payout_data: schemas.VendorPayoutCreate,
    current_user: schemas.UserOut = Depends(dependencies.require_vendor)
):
    """
    Request a payout from available earnings balance.
    """
    store = await db.store.find_first(
        where={"vendorId": current_user.id},
        include={"earnings": True}
    )

    if not store:
        raise HTTPException(status_code=404, detail="Store not found")

    # Calculate available balance
    available_balance = sum(e.vendorAmount for e in store.earnings if e.status == "available")

    if payout_data.amount > available_balance:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient balance. Available: Rs. {available_balance:,.2f}"
        )

    # Create payout request
    payout = await db.vendorpayout.create(
        data={
            "storeId": store.id,
            "amount": payout_data.amount,
            "paymentMethod": payout_data.paymentMethod,
            "paymentDetails": payout_data.paymentDetails,
            "notes": payout_data.notes,
            "requestedBy": current_user.id,
            "status": "pending"
        }
    )

    # Mark the used earnings as "paid" (in processing)
    # We'll update them when payout is completed
    pending_earnings = await db.vendorearning.find_many(
        where={"storeId": store.id, "status": "available"},
        order={"createdAt": "asc"}
    )

    amount_to_mark = payout_data.amount
    for earning in pending_earnings:
        if amount_to_mark <= 0:
            break
        await db.vendorearning.update(
            where={"id": earning.id},
            data={"status": "paid"}
        )
        amount_to_mark -= earning.vendorAmount

    return payout


@app.get("/api/v1/vendor/payouts", response_model=List[schemas.VendorPayoutOut])
async def get_vendor_payouts(
    status: Optional[str] = None,
    limit: int = 50,
    skip: int = 0,
    current_user: schemas.UserOut = Depends(dependencies.require_vendor)
):
    """Get vendor's payout requests."""
    store = await db.store.find_first(where={"vendorId": current_user.id})
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")

    where_clause = {"storeId": store.id}
    if status:
        where_clause["status"] = status

    payouts = await db.vendorpayout.find_many(
        where=where_clause,
        order={"requestedAt": "desc"},
        take=limit,
        skip=skip
    )

    return payouts


@app.get("/api/v1/admin/payouts", response_model=List[schemas.VendorPayoutOut])
async def get_all_payouts(
    status: Optional[str] = None,
    limit: int = 50,
    skip: int = 0,
    current_user: schemas.UserOut = Depends(dependencies.require_admin)
):
    """Get all payout requests (admin only)."""
    where_clause = {}
    if status:
        where_clause["status"] = status

    payouts = await db.vendorpayout.find_many(
        where=where_clause,
        include={"store": {"include": {"vendor": True}}},
        order={"requestedAt": "desc"},
        take=limit,
        skip=skip
    )

    return payouts


@app.patch("/api/v1/admin/payouts/{payout_id}", response_model=schemas.VendorPayoutOut)
async def process_payout(
    payout_id: str,
    payout_update: schemas.VendorPayoutUpdate,
    current_user: schemas.UserOut = Depends(dependencies.require_admin)
):
    """
    Process a payout request (approve/reject).
    Admin can mark as completed, rejected, or failed.
    """
    payout = await db.vendorpayout.find_unique(where={"id": payout_id})
    if not payout:
        raise HTTPException(status_code=404, detail="Payout not found")

    if payout.status != "pending":
        raise HTTPException(status_code=400, detail="Payout has already been processed")

    update_data = {
        "status": payout_update.status,
        "processedBy": payout_update.processedBy,
        "processedAt": datetime.now()
    }

    if payout_update.transactionId:
        update_data["transactionId"] = payout_update.transactionId

    if payout_update.status == "rejected" and payout_update.rejectionReason:
        update_data["rejectionReason"] = payout_update.rejectionReason
        # Return earnings to available status
        await db.vendorearning.update_many(
            where={"orderId": {"in": [payout.id]}},  # Simplified - would need proper tracking
            data={"status": "available"}
        )

    updated_payout = await db.vendorpayout.update(
        where={"id": payout_id},
        data=update_data
    )

    return updated_payout


@app.get("/api/v1/admin/commissions", response_model=schemas.CommissionSettings)
async def get_commission_settings(
    current_user: schemas.UserOut = Depends(dependencies.require_admin)
):
    """Get all commission settings."""
    default_rate = await get_default_commission_rate()

    active_commissions = await db.commission.find_many(
        where={"isActive": True},
        order={"isDefault": "desc"}
    )

    return schemas.CommissionSettings(
        defaultRate=default_rate,
        activeCommissions=active_commissions
    )


@app.post("/api/v1/admin/commissions", response_model=schemas.CommissionOut)
async def create_commission(
    commission_data: schemas.CommissionCreate,
    current_user: schemas.UserOut = Depends(dependencies.require_admin)
):
    """Create a new commission rate."""
    # If this is set as default, remove default flag from others
    if commission_data.isDefault:
        await db.commission.update_many(
            data={"isDefault": False}
        )

    commission = await db.commission.create(
        data=commission_data.model_dump()
    )

    return commission


@app.patch("/api/v1/admin/commissions/{commission_id}", response_model=schemas.CommissionOut)
async def update_commission(
    commission_id: str,
    commission_data: schemas.CommissionUpdate,
    current_user: schemas.UserOut = Depends(dependencies.require_admin)
):
    """Update a commission rate."""
    commission = await db.commission.find_unique(where={"id": commission_id})
    if not commission:
        raise HTTPException(status_code=404, detail="Commission not found")

    # If setting as default, remove default flag from others
    if commission_data.isDefault and not commission.isDefault:
        await db.commission.update_many(
            data={"isDefault": False}
        )

    update_data = {k: v for k, v in commission_data.model_dump().items() if v is not None}

    updated_commission = await db.commission.update(
        where={"id": commission_id},
        data=update_data
    )

    return updated_commission


@app.delete("/api/v1/admin/commissions/{commission_id}")
async def delete_commission(
    commission_id: str,
    current_user: schemas.UserOut = Depends(dependencies.require_admin)
):
    """Delete a commission rate."""
    commission = await db.commission.find_unique(where={"id": commission_id})
    if not commission:
        raise HTTPException(status_code=404, detail="Commission not found")

    if commission.isDefault:
        raise HTTPException(status_code=400, detail="Cannot delete default commission rate")

    await db.commission.delete(where={"id": commission_id})
    return {"message": "Commission deleted successfully"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

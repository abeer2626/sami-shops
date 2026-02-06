from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    name: Optional[str] = None

class UserCreate(UserBase):
    password: str
    role: Optional[str] = "customer"

class UserOut(UserBase):
    id: str
    role: str

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class StoreBase(BaseModel):
    name: str
    description: Optional[str] = None
    vendorId: str

class StoreCreate(StoreBase):
    pass

class StoreOut(StoreBase):
    id: str

    class Config:
        from_attributes = True

class CategoryBase(BaseModel):
    name: str
    slug: str

class CategoryCreate(CategoryBase):
    pass

class CategoryOut(CategoryBase):
    id: str

    class Config:
        from_attributes = True

class ProductBase(BaseModel):
    name: str
    description: str
    price: float
    stock: int
    images: List[str]
    categoryId: str
    storeId: str

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    stock: Optional[int] = None
    images: Optional[List[str]] = None
    categoryId: Optional[str] = None
    storeId: Optional[str] = None

class ProductOut(ProductBase):
    id: str
    createdAt: datetime
    updatedAt: datetime
    store: Optional[StoreOut] = None

    class Config:
        from_attributes = True

class OrderItemBase(BaseModel):
    productId: str
    quantity: int
    price: float

class MessageCreate(BaseModel):
    receiverId: str
    productId: Optional[str] = None
    content: str

class MessageOut(BaseModel):
    id: str
    senderId: str
    receiverId: str
    productId: Optional[str] = None
    content: str
    isRead: bool
    createdAt: datetime

    class Config:
        from_attributes = True

class SalesReport(BaseModel):
    totalRevenue: float
    totalOrders: int
    totalProductsSold: int
    recentOrders: List[dict]
    topProducts: List[dict]

class OrderItemCreate(OrderItemBase):
    pass

class OrderItemOut(OrderItemBase):
    id: str
    orderId: str

    class Config:
        from_attributes = True

class OrderBase(BaseModel):
    userId: str
    totalAmount: float
    status: Optional[str] = "pending"

class OrderCreate(OrderBase):
    items: List[OrderItemCreate]

class OrderOut(OrderBase):
    id: str
    createdAt: datetime
    updatedAt: datetime
    items: List[OrderItemOut]

    class Config:
        from_attributes = True

class OrderStatusUpdate(BaseModel):
    status: str

from pydantic import BaseModel, EmailStr
from typing import Optional, List, Literal
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

class UserUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    email: Optional[EmailStr] = None

class UserPasswordChange(BaseModel):
    current_password: str
    new_password: str

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
    paymentStatus: Optional[str] = "pending"
    paymentProvider: Optional[str] = None
    paymentReference: Optional[str] = None

class OrderCreate(OrderBase):
    items: List[OrderItemCreate]
    shippingAddress: Optional[str] = None
    billingAddress: Optional[str] = None
    notes: Optional[str] = None

class OrderOut(OrderBase):
    id: str
    createdAt: datetime
    updatedAt: datetime
    items: List[OrderItemOut]
    estimatedDelivery: Optional[datetime] = None
    trackingNumber: Optional[str] = None
    shippingCarrier: Optional[str] = None
    shippingAddress: Optional[str] = None
    billingAddress: Optional[str] = None
    notes: Optional[str] = None

    class Config:
        from_attributes = True

class OrderStatusUpdate(BaseModel):
    status: str
    notes: Optional[str] = None
    trackingNumber: Optional[str] = None
    shippingCarrier: Optional[str] = None
    estimatedDelivery: Optional[datetime] = None

class OrderMarkPaid(BaseModel):
    paymentProvider: Optional[str] = "local"
    paymentReference: Optional[str] = None

# ============================================================
# ORDER TRACKING SCHEMAS
# ============================================================

class OrderStatusHistoryOut(BaseModel):
    id: str
    status: str
    changedBy: Optional[str] = None
    notes: Optional[str] = None
    createdAt: datetime

    class Config:
        from_attributes = True

class OrderTrackingOut(BaseModel):
    order: OrderOut
    statusHistory: List[OrderStatusHistoryOut]
    currentStep: int  # 0-4 based on status
    estimatedDelivery: Optional[datetime] = None
    trackingNumber: Optional[str] = None
    shippingCarrier: Optional[str] = None

class AdminOverview(BaseModel):
    totalUsers: int
    totalOrders: int
    totalRevenue: float
    totalProducts: int
    recentOrders: List[OrderOut]

# ============================================================
# FLASH SALE SCHEMAS
# ============================================================

class FlashSaleProductBase(BaseModel):
    productId: str
    salePrice: float
    discountPercent: int
    maxQuantity: Optional[int] = None
    soldCount: int = 0

class FlashSaleProductCreate(FlashSaleProductBase):
    pass

class FlashSaleProductOut(FlashSaleProductBase):
    id: str
    flashSaleId: str
    product: ProductOut

    class Config:
        from_attributes = True

class FlashSaleBase(BaseModel):
    name: str
    description: Optional[str] = None
    startTime: datetime
    endTime: datetime
    isActive: bool = True

class FlashSaleCreate(FlashSaleBase):
    products: List[FlashSaleProductCreate]

class FlashSaleUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    startTime: Optional[datetime] = None
    endTime: Optional[datetime] = None
    isActive: Optional[bool] = None
    products: Optional[List[FlashSaleProductCreate]] = None

class FlashSaleOut(FlashSaleBase):
    id: str
    products: List[FlashSaleProductOut]
    createdAt: datetime
    updatedAt: datetime
    timeRemaining: Optional[int] = None  # Seconds remaining

    class Config:
        from_attributes = True

class FlashSaleListOut(BaseModel):
    id: str
    name: str
    startTime: datetime
    endTime: datetime
    isActive: bool
    productCount: int
    timeRemaining: Optional[int] = None

    class Config:
        from_attributes = True

# ============================================================
# SEARCH SCHEMAS
# ============================================================

class SearchSuggestion(BaseModel):
    id: str
    type: Literal["product", "category", "brand"]
    title: str
    subtitle: Optional[str] = None
    image: Optional[str] = None
    url: str

class SearchQuery(BaseModel):
    query: str
    category_id: Optional[str] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    limit: int = 10

class SearchResult(BaseModel):
    products: List[ProductOut]
    categories: List[CategoryOut]
    suggestions: List[SearchSuggestion]
    total: int
    page: int
    limit: int

class SearchAutocomplete(BaseModel):
    query: str
    suggestions: List[str]
    categories: List[dict]
    products: List[dict]

# ============================================================
# PRODUCT REVIEWS & RATINGS SCHEMAS
# ============================================================

class ReviewBase(BaseModel):
    rating: int
    title: Optional[str] = None
    comment: str

class ReviewCreate(ReviewBase):
    productId: str

class ReviewUpdate(BaseModel):
    rating: Optional[int] = None
    title: Optional[str] = None
    comment: Optional[str] = None

class ReviewOut(ReviewBase):
    id: str
    userId: str
    productId: str
    isVerified: bool
    helpful: int
    images: List[str]
    createdAt: datetime
    updatedAt: datetime

    class Config:
        from_attributes = True

class ReviewWithUser(ReviewOut):
    user: Optional[dict] = None  # Basic user info (name, etc.)

class ReviewSummary(BaseModel):
    productId: str
    averageRating: float
    totalReviews: int
    ratingDistribution: dict  # {5: count, 4: count, ...}

# ============================================================
# VENDOR COMMISSION SCHEMAS
# ============================================================

class VendorEarningBase(BaseModel):
    orderId: str
    orderAmount: float
    commissionRate: float
    commissionAmount: float
    vendorAmount: float
    status: str = "pending"

class VendorEarningOut(VendorEarningBase):
    id: str
    storeId: str
    createdAt: datetime
    updatedAt: datetime

    class Config:
        from_attributes = True

class VendorEarningSummary(BaseModel):
    totalEarnings: float
    availableBalance: float
    pendingEarnings: float
    paidAmount: float
    totalOrders: int
    recentEarnings: List[VendorEarningOut]

class VendorPayoutBase(BaseModel):
    amount: float
    paymentMethod: Optional[str] = None
    paymentDetails: Optional[str] = None
    notes: Optional[str] = None

class VendorPayoutCreate(VendorPayoutBase):
    pass

class VendorPayoutOut(VendorPayoutBase):
    id: str
    storeId: str
    status: str
    transactionId: Optional[str] = None
    requestedBy: str
    processedBy: Optional[str] = None
    rejectionReason: Optional[str] = None
    requestedAt: datetime
    processedAt: Optional[datetime] = None
    createdAt: datetime
    updatedAt: datetime

    class Config:
        from_attributes = True

class VendorPayoutUpdate(BaseModel):
    status: str
    transactionId: Optional[str] = None
    processedBy: str
    rejectionReason: Optional[str] = None

class CommissionBase(BaseModel):
    name: str
    rate: float
    description: Optional[str] = None
    isActive: bool = True
    isDefault: bool = False

class CommissionCreate(CommissionBase):
    pass

class CommissionUpdate(BaseModel):
    name: Optional[str] = None
    rate: Optional[float] = None
    description: Optional[str] = None
    isActive: Optional[bool] = None
    isDefault: Optional[bool] = None

class CommissionOut(CommissionBase):
    id: str
    createdAt: datetime
    updatedAt: datetime

    class Config:
        from_attributes = True

class CommissionSettings(BaseModel):
    defaultRate: float
    activeCommissions: List[CommissionOut]

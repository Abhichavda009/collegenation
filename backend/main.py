import re
import shutil
import uuid
from pathlib import Path
from typing import List, Optional

from fastapi import Depends, FastAPI, File, Form, HTTPException, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from sqlalchemy import func
from sqlalchemy.orm import Session
from sqlalchemy import text

try:
    from .database import engine, get_db
    from .models import Brand, Category, Product, University
except ImportError:
    from database import engine, get_db
    from models import Brand, Category, Product, University

app = FastAPI(title="College Nation API")
UPLOAD_DIR = Path(__file__).resolve().parent / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def ensure_catalog_schema():
    """Keep older deployed catalog databases compatible with the current model."""
    statements = [
        "ALTER TABLE products ADD COLUMN IF NOT EXISTS sku VARCHAR(40)",
        "ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url TEXT",
        "ALTER TABLE products ADD COLUMN IF NOT EXISTS color VARCHAR(40)",
        "ALTER TABLE products ADD COLUMN IF NOT EXISTS sizes VARCHAR[]",
        "ALTER TABLE products ADD COLUMN IF NOT EXISTS gender VARCHAR(40)",
        "ALTER TABLE products ADD COLUMN IF NOT EXISTS department VARCHAR(60)",
        "ALTER TABLE products ADD COLUMN IF NOT EXISTS stock INTEGER NOT NULL DEFAULT 0",
        "ALTER TABLE products ADD COLUMN IF NOT EXISTS in_stock BOOLEAN NOT NULL DEFAULT TRUE",
        "ALTER TABLE products ADD COLUMN IF NOT EXISTS is_best_seller BOOLEAN NOT NULL DEFAULT FALSE",
        "ALTER TABLE products ADD COLUMN IF NOT EXISTS compare_at_price NUMERIC(10, 2)",
        "ALTER TABLE products ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now()",
    ]
    with engine.begin() as conn:
        for statement in statements:
            conn.execute(text(statement))

SORT_OPTIONS = {
    "featured": (Product.id.asc(),),
    "best-selling": (Product.is_best_seller.desc(), Product.id.asc()),
    "newest": (Product.created_at.desc(), Product.id.desc()),
    "price-asc": (Product.price.asc(),),
    "price-desc": (Product.price.desc(),),
    "name-asc": (Product.name.asc(),),
}

ADMIN_EMAIL = "admin123@gmail.com"


class ProductCreate(BaseModel):
    admin_email: str
    name: str = Field(..., min_length=2)
    brand: str = Field(..., min_length=1)
    university: str = Field(..., min_length=1)
    category_slug: str = Field(..., min_length=1)
    price: float = Field(..., ge=0)
    image_url: str = Field(..., min_length=1)
    color: Optional[str] = None
    sizes: List[str] = Field(default_factory=list)
    gender: Optional[str] = None
    department: Optional[str] = None
    stock: int = Field(0, ge=0)
    sku: Optional[str] = None
    is_best_seller: bool = False
    compare_at_price: Optional[float] = Field(None, ge=0)


def slugify(value: str) -> str:
    value = re.sub(r"[^a-zA-Z0-9]+", "-", value).strip("-").lower()
    return re.sub(r"-+", "-", value)


def unique_product_slug(db: Session, name: str) -> str:
    base = slugify(name) or "product"
    slug = base
    n = 1
    while db.query(Product).filter(Product.slug == slug).first():
        n += 1
        slug = f"{base}-{n}"
    return slug


def university_defaults(name: str) -> dict:
    initials = "".join(part[0] for part in name.split() if part).upper()[:3] or "U"
    return {
        "slug": slugify(name),
        "logo": initials,
        "primary_color": "#0d2343",
        "logo_color": "#ffffff",
    }


def get_or_create_university(db: Session, name: str) -> University:
    clean_name = name.strip()
    if not clean_name:
        raise HTTPException(status_code=400, detail="University is required")

    university = (
        db.query(University)
        .filter(func.lower(University.name) == clean_name.lower())
        .first()
    )
    if university:
        return university

    university = University(name=clean_name, **university_defaults(clean_name))
    db.add(university)
    db.flush()
    return university


def get_or_create_category(db: Session, value: str) -> Category:
    clean_value = value.strip()
    if not clean_value:
        raise HTTPException(status_code=400, detail="Category is required")

    clean_slug = slugify(clean_value)
    category = (
        db.query(Category)
        .filter(
            (Category.slug == clean_value)
            | (Category.slug == clean_slug)
            | (func.lower(Category.name) == clean_value.lower())
        )
        .first()
    )
    if category:
        return category

    category = Category(slug=clean_slug, name=clean_value)
    db.add(category)
    db.flush()
    return category


def save_product_image(image: UploadFile) -> str:
    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Upload an image file")

    suffix = Path(image.filename or "").suffix.lower()
    if suffix not in {".jpg", ".jpeg", ".png", ".webp", ".gif"}:
        suffix = ".jpg"

    filename = f"{uuid.uuid4().hex}{suffix}"
    target = UPLOAD_DIR / filename
    with target.open("wb") as out:
        shutil.copyfileobj(image.file, out)
    return f"/uploads/{filename}"


def create_product_row(
    db: Session,
    *,
    name: str,
    brand_name: str,
    university_name: str,
    category_slug: str,
    price: float,
    image_url: str,
    color: Optional[str],
    sizes: List[str],
    gender: Optional[str],
    department: Optional[str],
    stock: int,
    sku: Optional[str],
    is_best_seller: bool,
    compare_at_price: Optional[float],
) -> Product:
    category = get_or_create_category(db, category_slug)
    university = get_or_create_university(db, university_name)

    brand_clean = brand_name.strip()
    brand = db.query(Brand).filter(Brand.name == brand_clean).first()
    if not brand:
        brand = Brand(name=brand_clean)
        db.add(brand)
        db.flush()

    product = Product(
        slug=unique_product_slug(db, name),
        name=name.strip(),
        sku=sku.strip() if sku else None,
        brand_id=brand.id,
        university_id=university.id,
        category_id=category.id,
        price=price,
        image_url=image_url,
        color=(color or "").strip() or None,
        sizes=[s.strip() for s in sizes if s.strip()],
        gender=(gender or "").strip() or None,
        department=(department or "").strip() or None,
        stock=stock,
        in_stock=stock > 0,
        is_best_seller=is_best_seller,
        compare_at_price=compare_at_price,
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


def update_product_row(
    db: Session,
    product: Product,
    *,
    name: str,
    brand_name: str,
    university_name: str,
    category_slug: str,
    price: float,
    image_url: Optional[str],
    color: Optional[str],
    sizes: List[str],
    gender: Optional[str],
    department: Optional[str],
    stock: int,
    sku: Optional[str],
    is_best_seller: bool,
    compare_at_price: Optional[float],
) -> Product:
    category = get_or_create_category(db, category_slug)
    university = get_or_create_university(db, university_name)

    brand_clean = brand_name.strip()
    brand = db.query(Brand).filter(Brand.name == brand_clean).first()
    if not brand:
        brand = Brand(name=brand_clean)
        db.add(brand)
        db.flush()

    product.name = name.strip()
    product.sku = sku.strip() if sku else None
    product.brand_id = brand.id
    product.university_id = university.id
    product.category_id = category.id
    product.price = price
    if image_url:
        product.image_url = image_url
    product.color = (color or "").strip() or None
    product.sizes = [s.strip() for s in sizes if s.strip()]
    product.gender = (gender or "").strip() or None
    product.department = (department or "").strip() or None
    product.stock = stock
    product.in_stock = stock > 0
    product.is_best_seller = is_best_seller
    product.compare_at_price = compare_at_price
    db.commit()
    db.refresh(product)
    return product


def serialize(p: Product) -> dict:
    return {
        "id": p.id,
        "slug": p.slug,
        "name": p.name,
        "sku": p.sku,
        "brand": p.brand.name if p.brand else None,
        "university": p.university.name if p.university else None,
        "category": p.category.name if p.category else None,
        "category_slug": p.category.slug if p.category else None,
        "price": float(p.price),
        "image_url": p.image_url,
        "color": p.color,
        "sizes": p.sizes or [],
        "gender": p.gender,
        "department": p.department,
        "stock": p.stock,
        "in_stock": p.in_stock,
        "is_best_seller": p.is_best_seller,
        "compare_at_price": float(p.compare_at_price)
        if p.compare_at_price is not None
        else None,
    }


def apply_filters(
    q,
    colors: Optional[List[str]],
    sizes: Optional[List[str]],
    genders: Optional[List[str]],
    departments: Optional[List[str]],
    universities: Optional[List[str]],
    brands: Optional[List[str]],
    min_price: Optional[float],
    max_price: Optional[float],
    in_stock: Optional[bool],
):
    if colors:
        q = q.filter(Product.color.in_(colors))
    if sizes:
        q = q.filter(Product.sizes.overlap(sizes))
    if genders:
        q = q.filter(Product.gender.in_(genders))
    if departments:
        q = q.filter(Product.department.in_(departments))
    if universities:
        q = q.filter(University.name.in_(universities))
    if brands:
        q = q.filter(Brand.name.in_(brands))
    if min_price is not None:
        q = q.filter(Product.price >= min_price)
    if max_price is not None:
        q = q.filter(Product.price <= max_price)
    if in_stock:
        q = q.filter(Product.in_stock.is_(True))
    return q


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/categories")
def categories(db: Session = Depends(get_db)):
    rows = db.query(Category).order_by(Category.id).all()
    return [{"slug": c.slug, "name": c.name} for c in rows]


@app.get("/api/universities")
def universities_list(db: Session = Depends(get_db)):
    rows = db.query(University).order_by(University.id).all()
    return [
        {
            "name": u.name,
            "slug": u.slug,
            "logo": u.logo,
            "primary_color": u.primary_color,
            "logo_color": u.logo_color,
        }
        for u in rows
    ]


@app.get("/api/brands")
def brands_list(db: Session = Depends(get_db)):
    rows = db.query(Brand).order_by(Brand.name).all()
    return [{"name": b.name} for b in rows]


@app.get("/api/products")
def products(
    category: Optional[str] = None,
    search: Optional[str] = None,
    color: Optional[List[str]] = Query(None),
    size: Optional[List[str]] = Query(None),
    gender: Optional[List[str]] = Query(None),
    department: Optional[List[str]] = Query(None),
    university: Optional[List[str]] = Query(None),
    brand: Optional[List[str]] = Query(None),
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    in_stock: Optional[bool] = None,
    best_seller: Optional[bool] = None,
    sort: str = "featured",
    page: int = 1,
    page_size: int = 24,
    db: Session = Depends(get_db),
):
    q = (
        db.query(Product)
        .outerjoin(Brand, Product.brand_id == Brand.id)
        .outerjoin(University, Product.university_id == University.id)
        .join(Category, Product.category_id == Category.id)
    )

    if category:
        q = q.filter(Category.slug == category)
    if search:
        q = q.filter(Product.name.ilike(f"%{search.strip()}%"))
    if best_seller:
        q = q.filter(Product.is_best_seller.is_(True))

    q = apply_filters(
        q, color, size, gender, department, university, brand,
        min_price, max_price, in_stock,
    )

    total = q.count()

    order = SORT_OPTIONS.get(sort, SORT_OPTIONS["featured"])
    q = q.order_by(*order)

    page = max(page, 1)
    page_size = min(max(page_size, 1), 96)
    items = q.offset((page - 1) * page_size).limit(page_size).all()

    return {
        "products": [serialize(p) for p in items],
        "total": total,
        "page": page,
        "page_size": page_size,
    }


@app.get("/api/products/{slug}")
def product_detail(slug: str, db: Session = Depends(get_db)):
    p = db.query(Product).filter(Product.slug == slug).first()
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
    return serialize(p)


@app.post("/api/admin/products")
def admin_create_product(payload: ProductCreate, db: Session = Depends(get_db)):
    if payload.admin_email.strip().lower() != ADMIN_EMAIL:
        raise HTTPException(status_code=403, detail="Admin access required")

    product = create_product_row(
        db,
        name=payload.name,
        brand_name=payload.brand,
        university_name=payload.university,
        category_slug=payload.category_slug,
        price=payload.price,
        image_url=payload.image_url.strip(),
        color=payload.color,
        sizes=payload.sizes,
        gender=payload.gender,
        department=payload.department,
        stock=payload.stock,
        sku=payload.sku,
        is_best_seller=payload.is_best_seller,
        compare_at_price=payload.compare_at_price,
    )
    return serialize(product)


@app.post("/api/admin/products/form")
def admin_create_product_form(
    admin_email: str = Form(...),
    name: str = Form(...),
    brand: str = Form(...),
    university: str = Form(...),
    category_slug: str = Form(...),
    price: float = Form(...),
    color: Optional[str] = Form(None),
    sizes: str = Form(""),
    gender: Optional[str] = Form(None),
    department: Optional[str] = Form(None),
    stock: int = Form(0),
    sku: Optional[str] = Form(None),
    is_best_seller: bool = Form(False),
    compare_at_price: Optional[float] = Form(None),
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    if admin_email.strip().lower() != ADMIN_EMAIL:
        raise HTTPException(status_code=403, detail="Admin access required")

    image_url = save_product_image(image)
    product = create_product_row(
        db,
        name=name,
        brand_name=brand,
        university_name=university,
        category_slug=category_slug,
        price=price,
        image_url=image_url,
        color=color,
        sizes=[s.strip() for s in sizes.split(",") if s.strip()],
        gender=gender,
        department=department,
        stock=stock,
        sku=sku,
        is_best_seller=is_best_seller,
        compare_at_price=compare_at_price,
    )
    return serialize(product)


@app.put("/api/admin/products/{product_id}/form")
def admin_update_product_form(
    product_id: int,
    admin_email: str = Form(...),
    name: str = Form(...),
    brand: str = Form(...),
    university: str = Form(...),
    category_slug: str = Form(...),
    price: float = Form(...),
    color: Optional[str] = Form(None),
    sizes: str = Form(""),
    gender: Optional[str] = Form(None),
    department: Optional[str] = Form(None),
    stock: int = Form(0),
    sku: Optional[str] = Form(None),
    is_best_seller: bool = Form(False),
    compare_at_price: Optional[float] = Form(None),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
):
    if admin_email.strip().lower() != ADMIN_EMAIL:
        raise HTTPException(status_code=403, detail="Admin access required")

    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    image_url = save_product_image(image) if image and image.filename else None
    product = update_product_row(
        db,
        product,
        name=name,
        brand_name=brand,
        university_name=university,
        category_slug=category_slug,
        price=price,
        image_url=image_url,
        color=color,
        sizes=[s.strip() for s in sizes.split(",") if s.strip()],
        gender=gender,
        department=department,
        stock=stock,
        sku=sku,
        is_best_seller=is_best_seller,
        compare_at_price=compare_at_price,
    )
    return serialize(product)


@app.delete("/api/admin/products/{product_id}")
def admin_delete_product(
    product_id: int,
    admin_email: str = Query(...),
    db: Session = Depends(get_db),
):
    if admin_email.strip().lower() != ADMIN_EMAIL:
        raise HTTPException(status_code=403, detail="Admin access required")

    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    db.delete(product)
    db.commit()
    return {"deleted": True, "id": product_id}


@app.post("/api/admin/upload")
def admin_upload_image(
    admin_email: str = Query(...),
    image: UploadFile = File(...),
):
    if admin_email.strip().lower() != ADMIN_EMAIL:
        raise HTTPException(status_code=403, detail="Admin access required")
    return {"image_url": save_product_image(image)}


@app.get("/api/filters")
def filters(
    category: Optional[str] = None,
    best_seller: Optional[bool] = None,
    db: Session = Depends(get_db),
):
    """Available filter facets (with counts) for a category."""

    def base():
        q = db.query(Product).join(Category, Product.category_id == Category.id)
        if category:
            q = q.filter(Category.slug == category)
        if best_seller:
            q = q.filter(Product.is_best_seller.is_(True))
        return q

    def facet(column):
        rows = (
            base()
            .with_entities(column, func.count(Product.id))
            .group_by(column)
            .all()
        )
        return [
            {"value": value, "count": count}
            for value, count in rows
            if value is not None
        ]

    # Size lives in an array column -> unnest it.
    size_rows = (
        base()
        .with_entities(func.unnest(Product.sizes).label("sz"), func.count(Product.id))
        .group_by("sz")
        .all()
    )
    sizes = [{"value": v, "count": c} for v, c in size_rows if v is not None]

    brand_rows = (
        base()
        .join(Brand, Product.brand_id == Brand.id)
        .with_entities(Brand.name, func.count(Product.id))
        .group_by(Brand.name)
        .all()
    )
    uni_rows = (
        base()
        .join(University, Product.university_id == University.id)
        .with_entities(University.name, func.count(Product.id))
        .group_by(University.name)
        .all()
    )

    price_min, price_max = base().with_entities(
        func.min(Product.price), func.max(Product.price)
    ).first()

    def sort_facet(items):
        return sorted(items, key=lambda x: str(x["value"]))

    return {
        "total": base().count(),
        "colors": sort_facet(facet(Product.color)),
        "sizes": sizes,
        "genders": sort_facet(facet(Product.gender)),
        "departments": sort_facet(facet(Product.department)),
        "brands": sort_facet([{"value": n, "count": c} for n, c in brand_rows]),
        "universities": sort_facet([{"value": n, "count": c} for n, c in uni_rows]),
        "price": {
            "min": float(price_min) if price_min is not None else 0,
            "max": float(price_max) if price_max is not None else 0,
        },
    }

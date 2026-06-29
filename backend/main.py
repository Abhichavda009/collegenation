from typing import List, Optional

from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func
from sqlalchemy.orm import Session

from database import get_db
from models import Brand, Category, Product, University

app = FastAPI(title="College Nation API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SORT_OPTIONS = {
    "featured": (Product.id.asc(),),
    "newest": (Product.created_at.desc(), Product.id.desc()),
    "price-asc": (Product.price.asc(),),
    "price-desc": (Product.price.desc(),),
    "name-asc": (Product.name.asc(),),
}


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
    color: Optional[List[str]] = Query(None),
    size: Optional[List[str]] = Query(None),
    gender: Optional[List[str]] = Query(None),
    department: Optional[List[str]] = Query(None),
    university: Optional[List[str]] = Query(None),
    brand: Optional[List[str]] = Query(None),
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    in_stock: Optional[bool] = None,
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


@app.get("/api/filters")
def filters(category: Optional[str] = None, db: Session = Depends(get_db)):
    """Available filter facets (with counts) for a category."""

    def base():
        q = db.query(Product).join(Category, Product.category_id == Category.id)
        if category:
            q = q.filter(Category.slug == category)
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

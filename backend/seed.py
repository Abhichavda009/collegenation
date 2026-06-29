"""Create catalog tables and seed realistic College Nation product data.

Run:  python seed.py   (from the backend/ folder, using the project venv)

Idempotent: it truncates the catalog tables (NOT users) and re-inserts.
"""

import re

from database import Base, SessionLocal, engine
from models import Brand, Category, Product, University

# --- Reference data -------------------------------------------------------

CATEGORIES = [
    ("mens", "Men's"),
    ("womens", "Women's"),
    ("kids", "Kids"),
    ("hats", "Hats"),
    ("gifts", "Gifts"),
]

# school -> (mascot, primary color)
SCHOOLS = {
    "Alabama": ("Crimson Tide", "Crimson"),
    "Arizona": ("Wildcats", "Navy"),
    "Clemson": ("Tigers", "Orange"),
    "Kansas": ("Jayhawks", "Blue"),
    "LSU": ("Tigers", "Purple"),
    "Maryland": ("Terrapins", "Red"),
    "Michigan": ("Wolverines", "Navy"),
    "Missouri": ("Tigers", "Gold"),
    "Syracuse": ("Orange", "Orange"),
    "TCU": ("Horned Frogs", "Purple"),
    "Tennessee": ("Volunteers", "Orange"),
    "UCLA": ("Bruins", "Blue"),
    "Virginia": ("Cavaliers", "Navy"),
    "Villanova": ("Wildcats", "Navy"),
    "Washington": ("Huskies", "Purple"),
}

# school -> (logo glyph, brand bg color, logo color)
UNI_STYLE = {
    "Alabama": ("A", "#9e1b32", "#ffffff"),
    "Arizona": ("A", "#0b2341", "#ffffff"),
    "Clemson": ("🐾", "#522d80", "#f56600"),
    "Kansas": ("KU", "#0051ba", "#ffffff"),
    "LSU": ("LSU", "#461d7c", "#fdd023"),
    "Maryland": ("M", "#e03a3e", "#ffffff"),
    "Michigan": ("M", "#00274c", "#ffcb05"),
    "Missouri": ("🐯", "#f1b82d", "#000000"),
    "Syracuse": ("S", "#d44500", "#0b2341"),
    "TCU": ("TCU", "#4d1979", "#ffffff"),
    "Tennessee": ("T", "#f77f00", "#ffffff"),
    "UCLA": ("UCLA", "#2774ae", "#ffffff"),
    "Virginia": ("V", "#232d4b", "#ffffff"),
    "Villanova": ("V", "#132247", "#ffffff"),
    "Washington": ("W", "#4b2e83", "#b7a57a"),
}

# Apparel keyword per department -> drives a topical product image.
DEPT_KEYWORDS = {
    "Quarter Zips": "pullover",
    "Polos": "polo,shirt",
    "Hoodies": "hoodie",
    "Sweatshirts": "sweatshirt",
    "T-Shirts": "tshirt",
    "Pants": "joggers",
    "Outerwear": "jacket",
    "Hats": "cap",
    "Accessories": "wristwatch",
}

GENDER_KEYWORDS = {"Men": "man", "Women": "woman", "Kids": "kids"}


def product_image(department, gender, idx):
    """A clothing/cap image that matches the product type & gender.

    Uses LoremFlickr keyword images; `lock=idx` makes each one unique so no
    two products share an image, while the keywords keep them on-topic.
    """
    parts = [DEPT_KEYWORDS.get(department, "clothing")]
    g = GENDER_KEYWORDS.get(gender)
    if g:
        parts.append(g)
    keywords = ",".join(parts)
    return f"https://loremflickr.com/600/750/{keywords}?lock={idx}"

MENS_SIZES = ["S", "M", "L", "XL", "XXL"]
WOMENS_SIZES = ["XS", "S", "M", "L", "XL"]
KIDS_SIZES = ["YS", "YM", "YL"]
ONE_SIZE = ["OSFA"]

# (suffix, department, brand, base_price, color_override)
MENS_TEMPLATES = [
    ("Peter Millar Crown Comfort Quarter Zip", "Quarter Zips", "Peter Millar", 195, None),
    ("Peter Millar Perth Performance Quarter Zip", "Quarter Zips", "Peter Millar", 174, None),
    ("Peter Millar Performance Polo", "Polos", "Peter Millar", 140, None),
    ("Peter Millar Stripe Polo", "Polos", "Peter Millar", 150, "Gray"),
    ("League Essentials Quarter Zip", "Quarter Zips", "League", 66, None),
    ("Cutter & Buck Adapt Knit Quarter Zip", "Quarter Zips", "Cutter & Buck", 100, "Gray"),
    ("Nike Dri-FIT Polo", "Polos", "Nike", 85, None),
    ("Champion Powerblend Hoodie", "Hoodies", "Champion", 60, None),
    ("Pro Standard Crewneck Sweatshirt", "Sweatshirts", "Pro Standard", 54, "Black"),
    ("Colosseum Logo Tee", "T-Shirts", "Colosseum", 28, "White"),
    ("College Concepts Mainstream Joggers", "Pants", "College Concepts", 52, "Gray"),
    ("Columbia Collegiate Flanker Jacket", "Outerwear", "Columbia", 110, None),
]

WOMENS_TEMPLATES = [
    ("Cutter & Buck Women's Peshastin Fleece Quarter Zip", "Quarter Zips", "Cutter & Buck", 110, "Gray"),
    ("Cutter & Buck Women's Adapt Knit Quarter Zip", "Quarter Zips", "Cutter & Buck", 100, None),
    ("League Boyfriend Tee", "T-Shirts", "League", 34, "White"),
    ("Nike Dri-FIT Hoodie", "Hoodies", "Nike", 75, None),
]

KIDS_TEMPLATES = [
    ("Champion Youth Hoodie", "Hoodies", "Champion", 45, None),
    ("Colosseum Youth Tee", "T-Shirts", "Colosseum", 24, "White"),
]

HATS_TEMPLATES = [
    ("Nike Dri-FIT Hat", "Hats", "Nike", 28, None),
    ("'47 Clean Up Hat", "Hats", "'47 Brand", 30, None),
]

GIFTS_TEMPLATES = [
    ("Logo Web Belt", "Accessories", "Eagles Wings", 24, None),
    ("Stainless Steel Tumbler", "Accessories", "Logo Brands", 30, "Silver"),
]


def slugify(value: str) -> str:
    value = re.sub(r"[^a-zA-Z0-9]+", "-", value).strip("-").lower()
    return re.sub(r"-+", "-", value)


def build_products(categories, brands, universities):
    """Yield Product objects from the templates above."""
    idx = 0

    def make(school, suffix, dept, brand_name, base_price, color_override,
             cat_slug, gender, sizes):
        nonlocal idx
        mascot, school_color = SCHOOLS[school]
        uni_idx = list(SCHOOLS).index(school)
        name = f"{school} {mascot} {suffix}"
        price = base_price + (uni_idx % 3) * 5
        color = color_override or school_color
        stock = 0 if idx % 7 == 0 else (idx % 12) + 2
        sku = f"{(34202898 + idx * 137):09d}"
        is_best_seller = (idx % 3 == 0)
        on_sale = (idx % 4 == 1)
        compare_at_price = round(price * 1.4, 2) if on_sale else None
        product = Product(
            slug=f"{slugify(name)}-{idx}",
            name=name,
            sku=sku,
            brand_id=brands[brand_name].id,
            university_id=universities[school].id,
            category_id=categories[cat_slug].id,
            price=price,
            # Topical clothing/cap image matching the product type & gender,
            # unique per product (no repeats).
            image_url=product_image(dept, gender, idx),
            color=color,
            sizes=sizes,
            gender=gender,
            department=dept,
            stock=stock,
            in_stock=(stock > 0),
            is_best_seller=is_best_seller,
            compare_at_price=compare_at_price,
        )
        idx += 1
        return product

    for s_i, school in enumerate(SCHOOLS):
        # Men's: 4 rotating templates per school
        for t in range(4):
            suffix, dept, brand, price, color = MENS_TEMPLATES[(s_i + t * 3) % len(MENS_TEMPLATES)]
            yield make(school, suffix, dept, brand, price, color, "mens", "Men", MENS_SIZES)

        # Women's: 2 per school
        for t in range(2):
            suffix, dept, brand, price, color = WOMENS_TEMPLATES[(s_i + t) % len(WOMENS_TEMPLATES)]
            yield make(school, suffix, dept, brand, price, color, "womens", "Women", WOMENS_SIZES)

        # Kids: 1 per school
        suffix, dept, brand, price, color = KIDS_TEMPLATES[s_i % len(KIDS_TEMPLATES)]
        yield make(school, suffix, dept, brand, price, color, "kids", "Kids", KIDS_SIZES)

        # Hats: 1 per school
        suffix, dept, brand, price, color = HATS_TEMPLATES[s_i % len(HATS_TEMPLATES)]
        yield make(school, suffix, dept, brand, price, color, "hats", "Unisex", ONE_SIZE)

        # Gifts: 1 per school
        suffix, dept, brand, price, color = GIFTS_TEMPLATES[s_i % len(GIFTS_TEMPLATES)]
        yield make(school, suffix, dept, brand, price, color, "gifts", "Unisex", ONE_SIZE)


def collect_brand_names():
    names = set()
    for tmpls in (MENS_TEMPLATES, WOMENS_TEMPLATES, KIDS_TEMPLATES, HATS_TEMPLATES, GIFTS_TEMPLATES):
        for _, _, brand, _, _ in tmpls:
            names.add(brand)
    return sorted(names)


def main():
    # Recreate the catalog tables so schema changes (new columns) take effect.
    # Only affects the models in this Base -- the users table is untouched.
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        categories = {}
        for slug, name in CATEGORIES:
            c = Category(slug=slug, name=name)
            db.add(c)
            categories[slug] = c

        brands = {}
        for name in collect_brand_names():
            b = Brand(name=name)
            db.add(b)
            brands[name] = b

        universities = {}
        for name in SCHOOLS:
            logo, bg, fg = UNI_STYLE[name]
            u = University(
                name=name,
                slug=slugify(name),
                logo=logo,
                primary_color=bg,
                logo_color=fg,
            )
            db.add(u)
            universities[name] = u

        db.flush()  # assign ids

        products = list(build_products(categories, brands, universities))
        db.add_all(products)
        db.commit()

        print(f"Seeded: {len(categories)} categories, {len(brands)} brands, "
              f"{len(universities)} universities, {len(products)} products")
        by_cat = {}
        for p in products:
            slug = next(s for s, c in categories.items() if c.id == p.category_id)
            by_cat[slug] = by_cat.get(slug, 0) + 1
        print("Products per category:", by_cat)
    finally:
        db.close()


if __name__ == "__main__":
    main()

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from database import Base


class Brand(Base):
    __tablename__ = "brands"

    id = Column(Integer, primary_key=True)
    name = Column(String(120), unique=True, nullable=False)


class University(Base):
    __tablename__ = "universities"

    id = Column(Integer, primary_key=True)
    name = Column(String(120), unique=True, nullable=False)
    slug = Column(String(120))
    logo = Column(String(20))
    primary_color = Column(String(20))
    logo_color = Column(String(20))


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True)
    slug = Column(String(60), unique=True, nullable=False)
    name = Column(String(120), nullable=False)


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True)
    slug = Column(String(200), unique=True, nullable=False)
    name = Column(String(255), nullable=False)
    brand_id = Column(Integer, ForeignKey("brands.id"))
    university_id = Column(Integer, ForeignKey("universities.id"))
    category_id = Column(Integer, ForeignKey("categories.id"))
    price = Column(Numeric(10, 2), nullable=False)
    sku = Column(String(40))
    image_url = Column(Text)
    color = Column(String(40))
    sizes = Column(ARRAY(String))
    gender = Column(String(40))
    department = Column(String(60))
    stock = Column(Integer, default=0, nullable=False)
    in_stock = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    brand = relationship("Brand")
    university = relationship("University")
    category = relationship("Category")

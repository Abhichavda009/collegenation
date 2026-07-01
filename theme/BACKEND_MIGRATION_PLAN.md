# Backend Migration Plan

Phase: 6 - Backend & Business Logic Migration  
Scope: Replace the Python/FastAPI backend with Shopify-native systems where possible.  
Theme root: `C:\collegenation 2\theme`

Shopify themes cannot run Python, maintain a database connection, expose secure admin endpoints, or process server-side uploads. Backend features must move to Shopify objects, Shopify APIs, Shopify Admin, Shopify Flow, webhooks, or a custom Shopify app only where Shopify-native admin workflows are not enough.

## Summary Decision

Most storefront behavior is now handled by Shopify-native theme features:

- Catalog listing: Shopify products, collections, Liquid, Search & Discovery filters.
- Product detail: Shopify product objects, variants, inventory, metafields.
- Cart: Shopify cart object and AJAX Cart API.
- Checkout: Shopify Checkout.
- Customers/orders: Shopify Customer Accounts.
- Contact: Shopify Liquid contact form.
- Universities: Shopify metaobjects/metafields plus collections.

The only feature that may require a custom Shopify app is the old public admin product-management screen if CollegeNation still needs a custom product upload/edit UI outside Shopify Admin.

## Python File Inventory

| File | Purpose | Endpoints | Database Usage | Business Logic | Recommended Shopify Replacement | Complexity | Status |
|---|---|---:|---|---|---|---|---|
| `backend/main.py` | Active FastAPI catalog/admin API. Serves products, filters, categories, brands, universities, uploads, and admin CRUD. | Yes | SQLAlchemy/PostgreSQL | Slug generation, product serialization, filtering, sorting, image upload, admin create/update/delete. | Storefront: Liquid, collection/product objects, Search & Discovery, AJAX Cart API. Admin CRUD: Shopify Admin UI/Admin API. Uploads: Shopify Files/product media. Optional custom app only for custom admin UI. | High | Replace backend; do not run in theme. |
| `backend/models.py` | SQLAlchemy models for `Brand`, `University`, `Category`, `Product`. | No | Defines database schema | Catalog relationships and product attributes. | Shopify products, variants, collections, product vendor, metafields, metaobjects. | Medium | Replace with Shopify data model. |
| `backend/database.py` | Loads `DATABASE_URL`, creates SQLAlchemy engine/session. | No | PostgreSQL connection | DB session lifecycle. | Not needed in theme. Shopify hosts product/customer/order data. | Low | Retire for storefront. |
| `backend/seed.py` | Rebuilds and seeds catalog data for local/backend DB. | No | Drops/creates catalog tables and inserts sample data. | Generates categories, brands, universities, product records, image URLs, inventory, sale flags. | Data migration script outside theme using Shopify Admin API or CSV import. University data to metaobjects/metafields. | High | Use for migration reference only. |
| `app/main.py` | Older/minimal FastAPI stub exposing root and users list. | Yes | Direct SQL query to `users`. | Lists users from a legacy `users` table. | Shopify Customer Accounts. No public user-list endpoint in theme. | Medium | Retire. |
| `app/database.py` | Older DB connection helper. | No | PostgreSQL connection | Loads `DATABASE_URL`; prints it. | Not needed. | Low | Retire. |
| `app/models.py` | Empty placeholder. | No | None | None. | No replacement needed. | Low | Retire. |
| `app/schemas.py` | Empty placeholder. | No | None | None. | No replacement needed. | Low | Retire. |
| `app/crud.py` | Empty placeholder. | No | None | None. | No replacement needed. | Low | Retire. |
| `app/auth.py` | Empty placeholder. | No | None | None. | Shopify Customer Accounts. | Low | Retire. |
| `app/__init__.py` | Empty package marker. | No | None | None. | No replacement needed. | Low | Retire. |

## Endpoint Migration Decisions

| Original Endpoint | Purpose | Shopify Replacement | Reason |
|---|---|---|---|
| `GET /api/health` | Backend health check. | None for theme; Shopify platform availability. | A Shopify theme cannot expose backend health endpoints. |
| `GET /api/categories` | Return category list. | Collections and link lists in Liquid. | Categories map naturally to Shopify collections and menus. |
| `GET /api/universities` | Return university metadata. | Metaobjects for universities; collections/metafields for product association. | Universities are structured editorial/catalog data and should be editable in Shopify Admin. |
| `GET /api/brands` | Return product brands. | Product `vendor`; optional Search & Discovery vendor filter. | Shopify has a native vendor field. |
| `GET /api/products` | Product listing, filtering, sorting, pagination. | Collection templates, `collection.products`, `collection.filters`, Shopify Search & Discovery, `search` template. | Shopify provides native collection/search pagination, sorting, and filters. |
| `GET /api/products/{slug}` | Product detail by slug. | Product template and `product` Liquid object. | Product handles are native Shopify routes. |
| `POST /api/admin/products` | Admin JSON product creation. | Shopify Admin UI or Admin API. | Public theme code must not create products with admin privileges. |
| `POST /api/admin/products/form` | Admin product creation with image upload. | Shopify Admin product media/files or custom app using Admin API. | Secure uploads/product writes require admin-authenticated backend/app. |
| `PUT /api/admin/products/{id}/form` | Admin product update. | Shopify Admin UI/Admin API. | Product writes are Admin API responsibilities. |
| `DELETE /api/admin/products/{id}` | Admin product delete. | Shopify Admin UI/Admin API. | Deleting products cannot happen safely from theme code. |
| `POST /api/admin/upload` | Image upload to local `/uploads`. | Shopify Files/product media via Admin API. | Theme cannot accept secure uploads or write files dynamically. |
| `GET /api/filters` | Facet values and counts. | Shopify Search & Discovery filters through `collection.filters`. | Native Shopify filters include counts and URL handling. |
| `GET /` in `app/main.py` | Stub API status. | None. | Not storefront functionality. |
| `GET /users` in `app/main.py` | Legacy user list. | Shopify Customer Accounts/Admin customer search. | Theme must not expose customer lists publicly. |

## Data Model Mapping

| Python Model/Field | Shopify Equivalent | Notes |
|---|---|---|
| `Brand.name` | Product `vendor` | Already supported by Shopify and filterable. |
| `Category.slug`, `Category.name` | Collection handle/title | Use manual or automated collections. |
| `University.name` | University metaobject field; product metafield reference | Best long-term approach for logos/colors and school landing pages. |
| `University.slug` | Metaobject handle or page/collection handle | Keep handles stable for URLs. |
| `University.logo` | Metaobject text/image field | Current seed uses glyphs; real logos should use image fields. |
| `University.primary_color`, `logo_color` | Metaobject color fields | Used by university cards and detail pages. |
| `Product.slug` | Product handle | Shopify handles replace custom slugs. |
| `Product.name` | Product title | Native. |
| `Product.price` | Variant price | Shopify prices live on variants. |
| `Product.compare_at_price` | Variant compare-at price | Native sale pricing. |
| `Product.sku` | Variant SKU | Native. |
| `Product.image_url` | Product media | Import images to Shopify product media/files. |
| `Product.color` | Product option or metafield | Use option when purchasable variant; metafield/tag if only filter metadata. |
| `Product.sizes` | Product option/variants | Size should be variant option. |
| `Product.gender` | Product metafield/tag/filter | Configure in Search & Discovery. |
| `Product.department` | Product metafield/tag/filter or collection | Configure as filter if important. |
| `Product.stock`, `in_stock` | Shopify inventory | Native inventory and availability. |
| `Product.is_best_seller` | Product tag/metafield or automated collection | Could also use Shopify analytics best-selling sort where applicable. |
| `Product.created_at` | Product created/published date | Native Shopify sorting. |

## Business Logic Decisions

### Product Search, Filtering, Sorting

Use Shopify Liquid collection/search templates, native sort options, and Search & Discovery filters. This replaces `apply_filters`, `SORT_OPTIONS`, `/api/products`, and `/api/filters`.

### Product Creation and Editing

Use Shopify Admin first. If CollegeNation requires the exact old custom admin screen, build a custom Shopify app that writes through the Admin API. Do not put Admin API tokens or product-write logic in the theme.

### Image Uploads

Use Shopify product media/Files. Theme code cannot receive uploaded files and persist them securely.

### Customers and Orders

Use Shopify Customer Accounts and Shopify order objects. The old localStorage login/order flow and legacy `/users` endpoint are not valid for production Shopify.

### University Data

Use Shopify metaobjects for university profile data, plus product metafields or automated collections for associating products with universities. This is more maintainable than hardcoded theme blocks when university records need logos, colors, names, and handles.

### Email and Forms

Use Shopify contact forms for contact submissions and Shopify customer emails for account/password flows. No custom email backend was found in Python.

### Background Jobs and Scheduled Tasks

No background jobs or scheduled tasks were found. Future automated catalog syncs should use Shopify Flow, webhooks, or an external app, depending on the source system.

## Features That Cannot Exist Inside A Shopify Theme

- Python/FastAPI endpoints.
- Direct PostgreSQL access.
- Secure product create/update/delete with Admin API credentials.
- Server-side image upload storage.
- Public admin authentication based only on a hardcoded email.
- Public customer list endpoint.
- Background jobs or scheduled tasks.
- Webhook receivers.

These must live in Shopify Admin, Shopify platform features, or a secure external/custom Shopify app.


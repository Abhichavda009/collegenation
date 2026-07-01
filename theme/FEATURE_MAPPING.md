# Feature Mapping

Phase: 6 - Backend & Business Logic Migration

| Original Feature | Original Source | Shopify Equivalent | Notes |
|---|---|---|---|
| Product listing API | `backend/main.py` `/api/products` | Collection templates, Liquid `collection.products`, search template | Already migrated in Phase 5A with native collection/product rendering. |
| Product detail API | `backend/main.py` `/api/products/{slug}` | Product template and Liquid `product` object | Product handles replace backend slugs. |
| Category API | `backend/main.py` `/api/categories` | Shopify collections and navigation menus | Collections should replace category rows. |
| Brand API | `backend/main.py` `/api/brands` | Product vendor | Vendor can be used in product cards and filters. |
| University API | `backend/main.py` `/api/universities` | Shopify metaobjects plus product metafields/collections | Metaobjects preserve editable logo/color/school data. |
| Facet API | `backend/main.py` `/api/filters` | Shopify Search & Discovery filters | Use `collection.filters`; no custom facet endpoint needed. |
| Sorting | `SORT_OPTIONS` in `backend/main.py` | Shopify sort options | Existing collection section uses native sort options. |
| Price filtering | `min_price`, `max_price` query params | Shopify price filter | Supported by Search & Discovery filter settings. |
| Color/size/gender/department filters | `apply_filters` | Product options, tags, metafields, Search & Discovery filters | Size/color should be options when variants; gender/department can be metafields/tags. |
| Best seller flag | `Product.is_best_seller` | Product metafield/tag or automated collection | Use collection such as `best-sellers`; optionally maintain via Flow/app. |
| Inventory | `stock`, `in_stock` | Shopify inventory and variant availability | Native inventory replaces custom booleans. |
| Compare-at pricing | `compare_at_price` | Shopify variant compare-at price | Native sale pricing. |
| Product image URLs | `image_url`, `/uploads` | Shopify product media/files | Import images into Shopify. |
| Admin product create | `/api/admin/products`, `/api/admin/products/form` | Shopify Admin UI or custom app with Admin API | Theme cannot securely create products. |
| Admin product update/delete | `/api/admin/products/{id}` | Shopify Admin UI or custom app with Admin API | Requires admin authentication and secure server. |
| Admin image upload | `/api/admin/upload` | Shopify Files/Product media through Admin API | Custom app only if custom uploader is needed. |
| Hardcoded admin email auth | `ADMIN_EMAIL` | Shopify Admin auth/OAuth app auth | Hardcoded email auth is not secure. |
| Cart storage | React `localStorage cn_cart` | Shopify cart object and AJAX Cart API | Migrated in Phase 5B. |
| Checkout simulation | React `CheckoutPage.jsx` | Shopify Checkout | Theme redirects to Shopify Checkout; do not replace checkout. |
| Fake customer login/OTP | React `SignIn.jsx` | Shopify Customer Accounts | Migrated in Phase 5B. |
| Fake local orders | React `localStorage cn_orders` | Shopify customer orders | Customer account pages use Shopify order objects. |
| Customer addresses | React placeholder profile UI | Shopify customer addresses | Migrated in Phase 5B. |
| Legacy `/users` endpoint | `app/main.py` | Shopify Customers in Admin/Customer Accounts | Do not expose customer lists in theme. |
| Contact form | React `ContactPage.jsx` | Shopify Liquid `{% form 'contact' %}` | Migrated in Phase 4. |
| FAQ static content | React `FaqPage.jsx` | Editable Shopify FAQ/collapsible section | Migrated in Phase 4. |
| Blog/news | Static/frontend content | Shopify Blog and Article objects | Use native blog objects for future content. |
| Search | `/api/products?search=` | Shopify search and predictive search | Existing Shopify search should be used. |
| Seed catalog | `backend/seed.py` | CSV import or Admin API migration script outside theme | Do not run seed logic inside theme. |
| Database migrations | `ensure_catalog_schema` | Shopify data model/configuration | Shopify owns schema; metafields/metaobjects are configured in Admin. |
| CORS/public API setup | FastAPI middleware | Not needed for theme | Shopify serves theme routes. |
| File serving `/uploads` | FastAPI `StaticFiles` | Shopify CDN product media/files | Uploads should be imported to Shopify. |

## Recommended Shopify Data Setup

1. Create core collections: Men's, Women's, Kids, Hats, Gifts, All Products, Best Sellers, New Arrivals.
2. Use Shopify product vendors for brands.
3. Use variants for size and color when they affect purchase selection.
4. Create product metafields for university, gender, department, and any non-variant filter data.
5. Create a `university` metaobject definition with name, handle, logo/image, logo text fallback, primary color, logo color, description, and optional collection reference.
6. Configure Shopify Search & Discovery filters for availability, price, product type/category, vendor, size, color, university, gender, and department.
7. Import products and images using Shopify CSV or a one-time Admin API script outside the theme.

## Direct Theme Replacement Status

| Area | Status |
|---|---|
| Header/nav/footer | Complete in earlier phase. |
| Homepage dynamic product sections | Complete in earlier phase. |
| Static pages/contact/FAQ/universities | Complete in earlier phase. |
| Collections/products | Complete in Phase 5A. |
| Cart/customers/orders | Complete in Phase 5B. |
| Backend/admin/data migration | Planned here; implementation belongs in Shopify Admin or custom app. |


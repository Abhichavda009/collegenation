# Custom App Requirements

Phase: 6 - Backend & Business Logic Migration

## Is A Custom Shopify App Required?

Not required for the public storefront if Shopify Admin, Shopify collections, products, metafields, metaobjects, Search & Discovery, Customer Accounts, and Shopify Checkout are acceptable.

A custom Shopify app is required only if CollegeNation must keep a custom admin product-management experience similar to the original React/FastAPI `/admin` page.

## Custom App Use Cases

Build a custom app only for these needs:

- Custom product create/edit/delete screen outside Shopify Admin.
- Bulk product import from the old PostgreSQL/FastAPI data model.
- Custom university management UI beyond Shopify metaobject admin.
- Automated synchronization from an external catalog system.
- Custom image upload workflow that creates Shopify product media.
- Automated best-seller/new-arrival tagging beyond Shopify native sorting or Flow.

## APIs Needed

| Need | Shopify API |
|---|---|
| Product create/update/delete | Admin GraphQL API `productCreate`, `productUpdate`, `productDelete` |
| Variant price/SKU/inventory | Admin GraphQL product variants and inventory APIs |
| Product media upload | Admin GraphQL staged uploads and product media APIs |
| Collections | Admin GraphQL collections APIs |
| Metafields | Admin GraphQL metafields APIs |
| Metaobjects for universities | Admin GraphQL metaobject APIs |
| Customers/orders read access | Admin GraphQL customer/order APIs, only if required |
| Storefront display | Liquid/theme first; Storefront API only for custom client-side interactions |

## Authentication

- Use Shopify OAuth for embedded/custom app installation.
- Store access tokens only on the app server, never in Liquid, JavaScript, or theme settings.
- Restrict app access to authorized store staff.
- Do not use the old `ADMIN_EMAIL = "admin123@gmail.com"` pattern.

## Suggested Scopes

Request only the minimum scopes required. Possible scopes:

- `read_products`
- `write_products`
- `read_inventory`
- `write_inventory`
- `read_files`
- `write_files`
- `read_metaobjects`
- `write_metaobjects`
- `read_content`
- `write_content`

Add customer/order scopes only if the app truly needs customer or order data:

- `read_customers`
- `read_orders`

## Data Flow

1. Staff opens the custom Shopify app from Shopify Admin.
2. App authenticates through Shopify OAuth/session token.
3. Staff creates or edits product/university data.
4. App validates required fields: product title, vendor, collection/category, price, SKU, size/color variants, university, inventory, media.
5. App uploads images to Shopify staged upload endpoints.
6. App writes products, variants, metafields, and media through Admin GraphQL API.
7. Shopify theme renders the updated data through Liquid.

## Webhooks

Use webhooks only if the custom app keeps an external database or performs sync tasks.

Recommended webhooks if needed:

- `products/create`
- `products/update`
- `products/delete`
- `collections/create`
- `collections/update`
- `inventory_levels/update`
- `metaobjects/create`
- `metaobjects/update`
- `app/uninstalled`

The app must verify Shopify webhook HMAC signatures.

## Security Considerations

- Never expose Admin API tokens in theme code.
- Validate file type and size for uploads.
- Sanitize staff-entered rich text before writing it to metafields/metaobjects.
- Enforce staff authorization in the app, not in client-side JavaScript.
- Log product write operations for auditability.
- Rate-limit import/write operations.
- Handle Shopify API throttling and retries.
- Delete app tokens and external store data on `app/uninstalled`.

## Features Not To Implement In The Theme

- Product CRUD.
- Image upload processing.
- Admin authentication.
- Customer/order exports.
- Webhook receivers.
- Scheduled sync jobs.
- Direct database queries.

These require Shopify Admin, Shopify Flow, or a secure custom app/server.


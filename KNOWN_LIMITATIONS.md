# Known Limitations

## Features Requiring A Shopify App

A custom Shopify app is required if CollegeNation needs:

- A custom product admin screen outside Shopify Admin.
- Product create/update/delete from a custom UI.
- Custom image upload processing.
- Automated bulk product sync from an external database.
- Webhook receivers.
- Scheduled background jobs.
- Custom reporting or exports beyond Shopify Admin.
- Secure access to Admin API from a custom interface.

These cannot be implemented safely inside a theme.

## Features Requiring Shopify Plus

These areas may require Shopify Plus or checkout extensibility features:

- Deep checkout layout customization.
- Custom checkout business logic beyond shipping/payment/settings.
- Some advanced checkout extensions.
- B2B-specific checkout and company-account workflows.

The migrated theme uses standard Shopify Checkout and does not replace checkout.

## Features Requiring Manual Configuration

Manual Shopify Admin setup is required for:

- Products
- Variants
- Inventory
- Product media
- Collections
- Navigation menus
- Pages
- Policies
- Customer account settings
- Checkout branding
- Shipping rates
- Taxes
- Payment providers
- Search & Discovery filters
- Product metafields
- University metaobjects
- Shopify blogs/articles

## Features Intentionally Omitted

- Python/FastAPI runtime inside the theme.
- PostgreSQL database access from the theme.
- Hardcoded admin email authentication.
- LocalStorage cart as the source of truth.
- Fake localStorage order history.
- Fake OTP login flow.
- Public `/users` endpoint.
- Public product CRUD endpoints.
- React app shell.

These were replaced with Shopify-native storefront and account systems.

## Data Limitations

The theme can render Shopify data, but it does not create the data. Products, collections, university records, metafields, and filters must be configured/imported in Shopify first.

## Validation Limitations

Shopify CLI is not installed in the current local environment, so official `shopify theme check` could not be run here. Run it before publishing.

## Locale File Note

The base theme locale files include Shopify-style inline comments. Basic JSON parsers may flag those files even though they are part of the downloaded theme. Use Shopify CLI validation as the final authority for production readiness.


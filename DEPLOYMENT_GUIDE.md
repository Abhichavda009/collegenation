# Deployment Guide

Theme root: `C:\collegenation 2\theme`

## 1. Install Shopify CLI

Install Node.js first if it is not installed. Then install Shopify CLI:

```bash
npm install -g @shopify/cli @shopify/theme
```

Verify:

```bash
shopify version
```

## 2. Login To Shopify

```bash
shopify auth login
```

Or run a theme command and follow the browser login prompt:

```bash
shopify theme list --store your-store.myshopify.com
```

## 3. Validate Theme Locally

From the theme folder:

```bash
cd "C:\collegenation 2\theme"
shopify theme check
```

Fix all errors before upload. Review warnings before production.

## 4. Preview Locally

```bash
shopify theme dev --store your-store.myshopify.com
```

Open the local preview URL provided by Shopify CLI.

## 5. Upload As Unpublished Theme

```bash
shopify theme push --store your-store.myshopify.com --unpublished
```

Do not publish until testing is complete.

## 6. Preview In Shopify Admin

1. Open Shopify Admin.
2. Go to Online Store > Themes.
3. Find the uploaded unpublished theme.
4. Click Preview.
5. Test with real products, collections, pages, menus, and customer account settings.

## 7. Publish

Only publish after completing `TEST_CHECKLIST.md`.

```bash
shopify theme publish --store your-store.myshopify.com
```

## Required Shopify Settings

- Store name and logo.
- Favicon.
- Social links.
- Currency and market settings.
- Customer account settings.
- Cart type setting.
- Checkout branding.
- Shipping policy.
- Refund policy.
- Privacy policy.
- Terms of service.

## Required Menus

Create these menus in Shopify Admin > Content > Menus:

- Main navigation
- Footer shop menu
- Footer universities menu
- Footer support menu
- Footer legal menu

Assign them in the Theme Editor to the CollegeNation header/footer sections.

## Required Collections

Recommended collection handles:

- `all`
- `all-products`
- `mens`
- `womens`
- `kids`
- `hats`
- `gifts`
- `best-sellers`
- `new-arrivals`

University collections are recommended if each school needs a product landing page.

## Required Products

Each product should include:

- Title
- Vendor
- Product type or collection assignment
- Product media
- Variants
- Size option where applicable
- Color option where applicable
- SKU
- Price
- Compare-at price where applicable
- Inventory quantity
- Product description
- University metafield or tag
- Gender/department metafields or tags if used for filtering

## Required Metafields

Recommended product metafields:

- `custom.university`
- `custom.gender`
- `custom.department`
- `custom.specifications`
- `custom.badge`

Exact namespace/key choices can be adjusted, but the theme and Search & Discovery setup should use the same fields consistently.

## Required Metaobjects

Recommended metaobject definition: `university`

Fields:

- Name
- Handle
- Logo image
- Logo text fallback
- Primary color
- Logo color
- Description
- Collection reference
- Featured image

Use metaobjects for university directory/detail data rather than hardcoding schools forever in section blocks.

## Required Pages

Create Shopify pages and assign templates:

- About -> `page.about`
- Contact -> `page.contact`
- FAQ -> `page.faq`
- Universities -> `page.universities`
- University detail page -> `page.university`
- Privacy Policy -> `page.privacy`
- Terms and Conditions -> `page.terms`
- Policy page -> `page.policy`

## Required Apps/Channels

- Shopify Search & Discovery for filters.
- Shop channel if Shop Pay/Follow on Shop features are desired.
- Email marketing app or Shopify Email for production newsletter workflows.

## Data Migration

Use Shopify CSV import or an Admin API migration script outside the theme.

Do not run Python or connect PostgreSQL from the theme.

## Rollback Plan

1. Keep the current live theme unpublished backup.
2. Upload CollegeNation theme as unpublished.
3. Preview and test.
4. Publish only after sign-off.
5. If issues appear, republish the previous live theme from Shopify Admin.


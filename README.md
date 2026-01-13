# Next.js x Fourthwall

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FFourthwallHQ%2Fvercel-commerce)

Launch your Fourthwall storefront as a high-perfomance, server-rendered Next.js App Router ecommerce application.

⚡️ [Live Demo](https://fw-commerce.vercel.app)

📚 [API docs](https://docs.fourthwall.com/storefront)

## Getting started

There are a few prerequisites to get started with Fourthwall's Storefront API.

1. [Set up a store](https://fourthwall.com/get-started) on Fourthwall.

2. [Make some products](https://my-shop.fourthwall.com/admin/dashboard/products/all/) and [create a collection](https://my-shop.fourthwall.com/admin/dashboard/products/collections/).

3. After you have signed up, [get a storefront token](https://my-shop.fourthwall.com/admin/dashboard/settings/for-developers).

4. Fill out the environment variables below in .env.local.

```bash
NEXT_PUBLIC_FW_STOREFRONT_TOKEN="<your storefront token>" # Example: ptkn_...

NEXT_PUBLIC_FW_CHECKOUT="<your store url>" # Example: vercel-shop.fourthwall.com. Used for checkout
NEXT_PUBLIC_VERCEL_URL="<the url of your vercel site>" # Example: fw-commerce.vercel.app. This is used for sitemap.xml + robots.txt.

# Optional
NEXT_PUBLIC_FW_COLLECTION="<the handle of your collection>" # If you want to display a specific collection. See Resources for more details on how to get the collection handle.
REVALIDATE_SECRET="<a secure random string>" # Required for on-demand ISR revalidation. See ISR section below.
```

## Develop locally

You will need to use the environment variables [defined in `.env.example`](.env.example) to run Next.js Commerce. It's recommended you use [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables) for this, but a `.env.local` file is all that is necessary.

> Note: You should not commit your `.env.local` file or it will expose secrets that will allow others to use your Fourthwall store.

1. Install Vercel CLI: `npm i -g vercel`
2. Link local instance with Vercel and GitHub accounts (creates `.vercel` directory): `vercel link`
3. Download your environment variables: `vercel env pull`

```bash
pnpm install
pnpm dev
```

Your app should now be running on [localhost:3000](http://localhost:3000/).

## Deploying

After cloning the repo with the Deploy with Vercel button above, you will need to set the environment variables.

```bash
git clone _your repo_ # your repo that you set up with Deploy with Vercel

vercel # From your repo directory. Links to your project

vercel # Initializes the project
vercel env add NEXT_PUBLIC_FW_COLLECTION
vercel env add NEXT_PUBLIC_FW_STOREFRONT_TOKEN
vercel env add NEXT_PUBLIC_FW_CHECKOUT
vercel env add NEXT_PUBLIC_VERCEL_URL

vercel --prod # Deploys to production
```

## Image Optimization

By default, this template uses Vercel's Image Optimization. To use Fourthwall's built-in image optimization instead, set:

```bash
NEXT_PUBLIC_USE_FW_IMAGE_OPTIMIZATION="true"
```

## Incremental Static Regeneration (ISR)

This template uses ISR to cache pages at the edge for fast load times while keeping content fresh.

### How it works

- **URL structure**: Currency is part of the URL path (`/USD/product/my-product`, `/EUR/collections/all`) rather than a query parameter. This enables full page caching since each currency variant is a separate cached page.
- **Automatic revalidation**: Product and collection pages are cached and automatically revalidated every hour (`revalidate = 3600`).
- **Home page**: Pre-built at deploy time for USD, EUR, GBP, and CAD currencies.
- **Product/Collection pages**: Built on-demand on first request, then cached.
- **Cart**: Fetched client-side to keep product pages fully static.

### On-demand revalidation

To instantly update content after changes (e.g., product update, price change), use the revalidation endpoint.

**Setup:**
1. Set the `REVALIDATE_SECRET` environment variable to a secure random string
2. Configure your CMS or Fourthwall webhook to call this endpoint when content changes

#### Tag-based revalidation (recommended)

Revalidate by tag to invalidate a specific product or collection across all currencies at once:

```
GET /api/revalidate?tag=product-my-product&secret=YOUR_SECRET
GET /api/revalidate?tag=collection-all&secret=YOUR_SECRET
```

**Available tags:**
- `product-{handle}` - Invalidates cached data for a specific product (all currencies)
- `collection-{handle}` - Invalidates cached data for a specific collection (all currencies)

This is the recommended approach because a single call invalidates the product/collection data regardless of which currency pages are using it.

#### Path-based revalidation

Alternatively, revalidate a specific page path:

```
GET /api/revalidate?path=/USD/product/my-product&secret=YOUR_SECRET
```

**Note:** Path-based revalidation only invalidates that exact page. To revalidate a product for all currencies, you'd need multiple calls:
```bash
curl "https://your-site.com/api/revalidate?path=/USD/product/my-product&secret=xxx"
curl "https://your-site.com/api/revalidate?path=/EUR/product/my-product&secret=xxx"
```

#### Response examples

```json
// Success (tag)
{ "revalidated": true, "tag": "product-my-product", "timestamp": 1705123456789 }

// Success (path)
{ "revalidated": true, "path": "/USD/product/my-product", "timestamp": 1705123456789 }

// Error
{ "error": "Invalid secret" }
{ "error": "Missing path or tag parameter" }
```

## Resources

* How to get your [collection handle](https://docs.fourthwall.com/storefront/collection).
* [Style your store](https://my-shop.fourthwall.com/admin/dashboard/store-design/layout/index/) for the [checkout flow](https://docs.fourthwall.com/storefront/checkout).

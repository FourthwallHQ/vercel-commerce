import type { Metadata } from "next";
import Grid from "components/grid";
import Collections from "components/layout/collections";
import Footer from "components/layout/footer";
import ProductGridItems from "components/layout/product-grid-items";
import { Wrapper } from "components/wrapper";
import { getCollectionProducts, getShop, getShopOgImage } from "lib/fourthwall";

export const revalidate = 3600;

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ currency: string; handle: string }>;
}): Promise<Metadata> {
  const { currency, handle } = await params;
  const [products, shopOgImage] = await Promise.all([
    getCollectionProducts({ collection: handle, currency, limit: 1 }),
    getShopOgImage()
  ]);

  // Priority: first product's featured image, then shop OG image
  const firstProduct = products[0];
  const ogImageUrl = firstProduct?.featuredImage?.url || shopOgImage;

  return {
    title: handle.charAt(0).toUpperCase() + handle.slice(1),
    openGraph: ogImageUrl
      ? {
          images: [{ url: ogImageUrl }]
        }
      : undefined,
    twitter: {
      card: 'summary_large_image',
      images: ogImageUrl ? [ogImageUrl] : undefined
    }
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ currency: string; handle: string }>;
}) {
  const { currency, handle } = await params;
  const [products, shop] = await Promise.all([
    getCollectionProducts({ collection: handle, currency, limit: 5 }),
    getShop()
  ]);

  return (
    <Wrapper currency={currency} shop={shop}>
      <div className="mx-auto flex max-w-screen-2xl flex-col gap-8 px-4 pb-4 text-black dark:text-white md:flex-row">
        <div className="order-first w-full flex-none md:max-w-[125px]">
          <Collections />
        </div>
        <div className="order-last min-h-screen w-full md:order-none">
          <section>
            {products.length === 0 ? (
              <p className="py-3 text-lg">{`No products found in this collection`}</p>
            ) : (
              <Grid className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                <ProductGridItems products={products} currency={currency} />
              </Grid>
            )}
          </section>
        </div>
      </div>
      <Footer />
    </Wrapper>
  );
}

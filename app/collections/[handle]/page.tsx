import Grid from "components/grid";
import Collections from "components/layout/collections";
import Footer from "components/layout/footer";
import ProductGridItems from "components/layout/product-grid-items";
import { Wrapper } from "components/wrapper";
import { getCollectionProducts } from "lib/fourthwall";

export default async function CategoryPage({
  params,
  searchParams
}: {
  params: Promise<{ handle: string }>;
  searchParams: Promise<{ currency?: string }>;
}) {
  const currency = (await searchParams).currency || 'USD';
  const products = await getCollectionProducts({ collection: (await params).handle, currency, limit: 5 });

  return (
    <Wrapper currency={currency}>
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
                <ProductGridItems products={products} />
              </Grid>
            )}
          </section>
        </div>
      </div>
      <Footer />
    </Wrapper>
  );
}

import { Carousel } from 'components/carousel';
import { ThreeItemGrid } from 'components/grid/three-items';
import Footer from 'components/layout/footer';
import { Wrapper } from 'components/wrapper';

export const metadata = {
  description: 'High-performance ecommerce store built with Next.js, Vercel, and Fourthwall.',
  openGraph: {
    type: 'website'
  }
};

export default async function HomePage({ searchParams }: { searchParams: Promise<{ currency?: string }> }) {
  const currency = (await searchParams).currency || 'USD';

  return (
    <Wrapper currency={currency}>
      <ThreeItemGrid currency={currency} />
      <Carousel currency={currency} />
      <Footer />
    </Wrapper>
  );
}

import type { Metadata } from 'next';
import { Carousel } from 'components/carousel';
import { ThreeItemGrid } from 'components/grid/three-items';
import Footer from 'components/layout/footer';
import { Wrapper } from 'components/wrapper';
import { getShop, getShopOgImage } from 'lib/fourthwall';

export function generateStaticParams() {
  return [{ currency: 'USD' }, { currency: 'EUR' }, { currency: 'GBP' }, { currency: 'CAD' }];
}

export async function generateMetadata(): Promise<Metadata> {
  const ogImageUrl = await getShopOgImage();

  return {
    description: 'High-performance ecommerce store built with Next.js, Vercel, and Fourthwall.',
    openGraph: {
      type: 'website',
      images: ogImageUrl ? [{ url: ogImageUrl }] : undefined
    },
    twitter: {
      card: 'summary_large_image',
      images: ogImageUrl ? [ogImageUrl] : undefined
    }
  };
}

export default async function HomePage({ params }: { params: Promise<{ currency: string }> }) {
  const currency = (await params).currency;
  const shop = await getShop();

  return (
    <Wrapper currency={currency} shop={shop}>
      <ThreeItemGrid currency={currency} />
      <Carousel currency={currency} />
      <Footer />
    </Wrapper>
  );
}

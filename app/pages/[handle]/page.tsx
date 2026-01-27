import { notFound } from 'next/navigation';
import Footer from 'components/layout/footer';
import Prose from 'components/prose';
import { Wrapper } from 'components/wrapper';
import { getShop, getStaticPage } from 'lib/fourthwall';

export const revalidate = 3600;

const STATIC_PAGES = ['privacy-policy', 'terms-of-service', 'returns-faq', 'contact'];

export function generateStaticParams() {
  return STATIC_PAGES.map((handle) => ({ handle }));
}

export default async function StaticPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;

  const [page, shop] = await Promise.all([
    getStaticPage(handle),
    getShop()
  ]);

  if (!page) {
    return notFound();
  }

  return (
    <Wrapper currency="USD" shop={shop}>
      <div className="mx-auto max-w-4xl px-4 py-12">
        <Prose html={page.bodyHtml} />
      </div>
      <Footer />
    </Wrapper>
  );
}

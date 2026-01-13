import { redirect } from 'next/navigation';

export default async function ProductRedirect({
  params,
  searchParams
}: {
  params: Promise<{ handle: string }>;
  searchParams: Promise<{ currency?: string; [key: string]: string | string[] | undefined }>;
}) {
  const { handle } = await params;
  const { currency, ...rest } = await searchParams;
  const targetCurrency = currency || 'USD';

  const remainingParams = new URLSearchParams();
  for (const [key, value] of Object.entries(rest)) {
    if (Array.isArray(value)) {
      value.forEach(v => remainingParams.append(key, v));
    } else if (value !== undefined) {
      remainingParams.append(key, value);
    }
  }

  const queryString = remainingParams.toString();
  redirect(`/${targetCurrency}/product/${handle}${queryString ? `?${queryString}` : ''}`);
}

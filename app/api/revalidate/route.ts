import { revalidateTag, revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { TAGS } from 'lib/constants';

// Cache life profile for immediate revalidation
const IMMEDIATE_REVALIDATE = { expire: 0 };

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-revalidate-secret');

  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { tag, path } = body;

    if (tag && Object.values(TAGS).includes(tag)) {
      revalidateTag(tag, IMMEDIATE_REVALIDATE);
      return NextResponse.json({ revalidated: true, tag });
    }

    if (path) {
      revalidatePath(path);
      return NextResponse.json({ revalidated: true, path });
    }

    // Default: revalidate all product-related content
    revalidateTag(TAGS.products, IMMEDIATE_REVALIDATE);
    revalidateTag(TAGS.collections, IMMEDIATE_REVALIDATE);
    return NextResponse.json({ revalidated: true, tags: [TAGS.products, TAGS.collections] });

  } catch (error) {
    return NextResponse.json({ error: 'Failed to revalidate' }, { status: 500 });
  }
}

import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const path = request.nextUrl.searchParams.get('path');
  const tag = request.nextUrl.searchParams.get('tag');
  const secret = request.nextUrl.searchParams.get('secret');

  // Validate secret token
  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 });
  }

  if (!path && !tag) {
    return NextResponse.json({ error: 'Missing path or tag parameter' }, { status: 400 });
  }

  try {
    if (tag) {
      revalidateTag(tag, 'default');
      return NextResponse.json({ revalidated: true, tag, timestamp: Date.now() });
    }

    if (path) {
      revalidatePath(path, 'page');
      return NextResponse.json({ revalidated: true, path, timestamp: Date.now() });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to revalidate' }, { status: 500 });
  }
}

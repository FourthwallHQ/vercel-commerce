import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Webhook event types from Fourthwall
type WebhookEventType =
  | 'PRODUCT_CREATED'
  | 'PRODUCT_UPDATED'
  | 'COLLECTION_UPDATED';

interface WebhookPayload {
  type: WebhookEventType;
  data: {
    id: string;
    slug: string;
    [key: string]: unknown;
  };
}

/**
 * Verify HMAC-SHA256 signature from Fourthwall webhook
 */
function verifySignature(payload: string, signature: string, secret: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload, 'utf8')
    .digest('base64');

  // Use timing-safe comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'base64'),
      Buffer.from(expectedSignature, 'base64')
    );
  } catch {
    return false;
  }
}

/**
 * Get the cache tag(s) to invalidate based on webhook event type
 */
function getTagsToInvalidate(payload: WebhookPayload): string[] {
  const { type, data } = payload;

  if (!data.slug) {
    console.warn('[Webhook] Missing slug in webhook payload:', type);
    return [];
  }

  switch (type) {
    case 'PRODUCT_CREATED':
    case 'PRODUCT_UPDATED':
      return [`product-${data.slug}`];

    case 'COLLECTION_UPDATED':
      return [`collection-${data.slug}`];

    default:
      console.warn('[Webhook] Unknown event type:', type);
      return [];
  }
}

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.FOURTHWALL_WEBHOOK_SECRET;

  // Check if webhook secret is configured
  if (!webhookSecret) {
    console.error('[Webhook] FOURTHWALL_WEBHOOK_SECRET is not configured');
    return NextResponse.json(
      { error: 'Missing webhook secret configuration' },
      { status: 400 }
    );
  }

  // Get the signature header
  const signature = request.headers.get('X-Fourthwall-Hmac-SHA256');

  if (!signature) {
    console.warn('[Webhook] Missing signature header');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  // Read raw body for signature verification
  const rawBody = await request.text();

  // Verify signature
  if (!verifySignature(rawBody, signature, webhookSecret)) {
    console.warn('[Webhook] Signature verification failed');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  // Parse the payload
  let payload: WebhookPayload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    console.error('[Webhook] Failed to parse payload');
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  console.log('[Webhook] Received event:', payload.type, 'for:', payload.data?.slug);

  // Get tags to invalidate
  const tags = getTagsToInvalidate(payload);

  if (tags.length === 0) {
    console.warn('[Webhook] No tags to invalidate for event:', payload.type);
    return NextResponse.json(
      { revalidated: false, reason: 'No tags to invalidate', timestamp: Date.now() },
      { status: 200 }
    );
  }

  // Revalidate each tag
  try {
    for (const tag of tags) {
      console.log('[Webhook] Revalidating tag:', tag);
      revalidateTag(tag, 'max');
    }

    return NextResponse.json({
      revalidated: true,
      tags,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('[Webhook] Revalidation failed:', error);
    return NextResponse.json({ error: 'Revalidation failed' }, { status: 500 });
  }
}

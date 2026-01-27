import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import crypto from 'crypto';

// Mock next/cache
vi.mock('next/cache', () => ({
  revalidateTag: vi.fn(),
}));

import { revalidateTag } from 'next/cache';
import { POST } from '../route';
import { NextRequest } from 'next/server';

// Helper to create HMAC signature
function createSignature(body: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(body, 'utf8').digest('base64');
}

// Helper to create a NextRequest
function createRequest(
  body: object,
  headers: Record<string, string> = {}
): NextRequest {
  const bodyStr = JSON.stringify(body);
  return new NextRequest('http://localhost/api/webhooks/fourthwall', {
    method: 'POST',
    body: bodyStr,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });
}

describe('Fourthwall Webhook Route', () => {
  const WEBHOOK_SECRET = 'test-secret-key-12345';
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv, FOURTHWALL_WEBHOOK_SECRET: WEBHOOK_SECRET };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('TC-5: Valid HMAC signature accepted', () => {
    it('should return 200 with revalidated: true for valid signature', async () => {
      const payload = {
        type: 'PRODUCT_UPDATED',
        data: { id: 'prod-123', slug: 'test-product' },
      };
      const bodyStr = JSON.stringify(payload);
      const signature = createSignature(bodyStr, WEBHOOK_SECRET);

      const request = createRequest(payload, {
        'X-Fourthwall-Hmac-SHA256': signature,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.revalidated).toBe(true);
      expect(data.tags).toContain('product-test-product');
      expect(revalidateTag, 'max').toHaveBeenCalledWith('product-test-product');
    });
  });

  describe('TC-6: Invalid HMAC signature rejected', () => {
    it('should return 401 for invalid signature', async () => {
      const payload = {
        type: 'PRODUCT_UPDATED',
        data: { id: 'prod-123', slug: 'test-product' },
      };
      const invalidSignature = createSignature(JSON.stringify(payload), 'wrong-secret');

      const request = createRequest(payload, {
        'X-Fourthwall-Hmac-SHA256': invalidSignature,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Invalid signature');
      expect(revalidateTag, 'max').not.toHaveBeenCalled();
    });
  });

  describe('TC-7: Missing signature rejected', () => {
    it('should return 401 when signature header is missing', async () => {
      const payload = {
        type: 'PRODUCT_UPDATED',
        data: { id: 'prod-123', slug: 'test-product' },
      };

      const request = createRequest(payload);

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Invalid signature');
      expect(revalidateTag, 'max').not.toHaveBeenCalled();
    });
  });

  describe('TC-8: PRODUCT_UPDATED tag invalidation', () => {
    it('should invalidate product-{slug} tag for PRODUCT_UPDATED', async () => {
      const payload = {
        type: 'PRODUCT_UPDATED',
        data: { id: 'prod-123', slug: 'awesome-shirt' },
      };
      const bodyStr = JSON.stringify(payload);
      const signature = createSignature(bodyStr, WEBHOOK_SECRET);

      const request = createRequest(payload, {
        'X-Fourthwall-Hmac-SHA256': signature,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.tags).toEqual(['product-awesome-shirt']);
      expect(revalidateTag, 'max').toHaveBeenCalledWith('product-awesome-shirt');
    });

    it('should invalidate product-{slug} tag for PRODUCT_CREATED', async () => {
      const payload = {
        type: 'PRODUCT_CREATED',
        data: { id: 'prod-456', slug: 'new-product' },
      };
      const bodyStr = JSON.stringify(payload);
      const signature = createSignature(bodyStr, WEBHOOK_SECRET);

      const request = createRequest(payload, {
        'X-Fourthwall-Hmac-SHA256': signature,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.tags).toEqual(['product-new-product']);
      expect(revalidateTag, 'max').toHaveBeenCalledWith('product-new-product');
    });
  });

  describe('TC-9: COLLECTION_UPDATED tag invalidation', () => {
    it('should invalidate collection-{slug} tag for COLLECTION_UPDATED', async () => {
      const payload = {
        type: 'COLLECTION_UPDATED',
        data: { id: 'col-123', slug: 'summer-collection' },
      };
      const bodyStr = JSON.stringify(payload);
      const signature = createSignature(bodyStr, WEBHOOK_SECRET);

      const request = createRequest(payload, {
        'X-Fourthwall-Hmac-SHA256': signature,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.tags).toEqual(['collection-summer-collection']);
      expect(revalidateTag, 'max').toHaveBeenCalledWith('collection-summer-collection');
    });

  });

  describe('TC-10: Missing slug handled gracefully', () => {
    it('should return 200 with revalidated: false when slug is missing', async () => {
      const payload = {
        type: 'PRODUCT_UPDATED',
        data: { id: 'prod-123' }, // No slug
      };
      const bodyStr = JSON.stringify(payload);
      const signature = createSignature(bodyStr, WEBHOOK_SECRET);

      const request = createRequest(payload, {
        'X-Fourthwall-Hmac-SHA256': signature,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.revalidated).toBe(false);
      expect(data.reason).toBe('No tags to invalidate');
      expect(revalidateTag, 'max').not.toHaveBeenCalled();
    });
  });

  describe('TC-11: Missing webhook secret config', () => {
    it('should return 400 when FOURTHWALL_WEBHOOK_SECRET is not set', async () => {
      delete process.env.FOURTHWALL_WEBHOOK_SECRET;

      const payload = {
        type: 'PRODUCT_UPDATED',
        data: { id: 'prod-123', slug: 'test-product' },
      };

      const request = createRequest(payload, {
        'X-Fourthwall-Hmac-SHA256': 'some-signature',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Missing webhook secret configuration');
      expect(revalidateTag, 'max').not.toHaveBeenCalled();
    });
  });

  describe('Unknown event type handling', () => {
    it('should return 200 with revalidated: false for unknown event type', async () => {
      const payload = {
        type: 'UNKNOWN_EVENT_TYPE',
        data: { id: 'test-123', slug: 'test-slug' },
      };
      const bodyStr = JSON.stringify(payload);
      const signature = createSignature(bodyStr, WEBHOOK_SECRET);

      const request = createRequest(payload, {
        'X-Fourthwall-Hmac-SHA256': signature,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.revalidated).toBe(false);
      expect(data.reason).toBe('No tags to invalidate');
      expect(revalidateTag, 'max').not.toHaveBeenCalled();
    });
  });

  describe('Invalid JSON payload', () => {
    it('should return 400 for malformed JSON', async () => {
      const invalidBody = 'not valid json';
      const signature = createSignature(invalidBody, WEBHOOK_SECRET);

      const request = new NextRequest('http://localhost/api/webhooks/fourthwall', {
        method: 'POST',
        body: invalidBody,
        headers: {
          'Content-Type': 'application/json',
          'X-Fourthwall-Hmac-SHA256': signature,
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid payload');
      expect(revalidateTag, 'max').not.toHaveBeenCalled();
    });
  });
});

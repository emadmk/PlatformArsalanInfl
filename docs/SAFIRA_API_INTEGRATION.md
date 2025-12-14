# Safira Luxury - MicroInfluencer Platform API Integration

## Overview

This document describes the API integration between **Safira Luxury (safiralux.com)** and **MicroInfluencer Platform (microcollabhub.com)**.

**Base URL:** `https://microcollabhub.com/api/v1`

---

## Authentication

### All Requests (Webhooks & API)
All requests from Safira to MicroInfluencer must include Bearer token:

```
Headers:
  Authorization: Bearer microinfluencer-key-2024
  Content-Type: application/json
```

### Configuration Summary

| Direction | Header | Value |
|-----------|--------|-------|
| Safira → MicroInfluencer | `Authorization` | `Bearer microinfluencer-key-2024` |
| MicroInfluencer → Safira | `X-Safira-Api-Key` | `safira-external-key-2024` |

### Environment Variables

**Safira (.env):**
```
EXTERNAL_API_KEY=safira-external-key-2024
MICROINFLUENCER_API_URL=https://microcollabhub.com/api/v1
MICROINFLUENCER_API_KEY=microinfluencer-key-2024
```

**MicroInfluencer (.env):**
```
SAFIRA_API_KEY=microinfluencer-key-2024
SAFIRA_WEBHOOK_SECRET=safira-external-key-2024
SAFIRA_API_URL=https://safiralux.com/api/v1/external
```

---

## Webhook Endpoints (Safira → MicroInfluencer)

These endpoints are for Safira to send data to our platform.

### 1. Tracking Events Webhook

**Endpoint:** `POST /webhooks/safira-tracking`

**Description:** Send page views, clicks, signups, and other tracking events.

**Request Body:**
```json
{
  "event_type": "PAGE_VIEW | CLICK | SIGNUP | INVESTMENT_START | PURCHASE_START",
  "event_id": "unique-event-id-123",
  "referral_code": "INF_ABC123",
  "timestamp": "2024-01-15T10:30:00Z",
  "utm_source": "INF_ABC123",
  "utm_medium": "instagram",
  "utm_campaign": "safira_referral",
  "utm_content": "bio_link",
  "visitor_id": "visitor-uuid",
  "user_id": "user-uuid-if-logged-in",
  "session_id": "session-uuid",
  "device_type": "mobile | desktop | tablet",
  "browser": "Chrome",
  "browser_version": "120.0",
  "os": "iOS",
  "os_version": "17.0",
  "country": "IR",
  "city": "Tehran",
  "page_url": "https://safiralux.com/invest",
  "page_title": "Invest - Safira Luxury",
  "session_duration": 120,
  "scroll_depth": 75,
  "event_data": {
    "custom_field": "value"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Event received",
  "event_id": "unique-event-id-123"
}
```

---

### 2. Conversion Webhook

**Endpoint:** `POST /webhooks/safira-conversion`

**Description:** Send conversion notifications when a referred customer completes a purchase or investment.

**IMPORTANT:** Each successful conversion fills one slot ($40) for the influencer. After 20 conversions, the influencer earns $800.

**Request Body:**
```json
{
  "conversion_type": "INVESTMENT | PURCHASE",
  "conversion_id": "conv-unique-id-456",
  "referral_code": "INF_ABC123",
  "timestamp": "2024-01-15T14:25:00Z",
  "customer": {
    "id": "customer-uuid",
    "email_hash": "sha256-hash-of-email",
    "is_new": true,
    "signup_date": "2024-01-15T10:30:00Z"
  },
  "transaction": {
    "amount": 1000.00,
    "currency": "USD",
    "product_value": 1000.00,
    "commission": 40.00,
    "commission_rate": 25
  },
  "product": {
    "id": "product-uuid",
    "name": "Gold Investment Package",
    "type": "investment"
  },
  "attribution": {
    "first_click": "2024-01-10T08:00:00Z",
    "last_click": "2024-01-15T14:20:00Z",
    "total_visits": 5
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Conversion received",
  "conversion_id": "conv-unique-id-456",
  "slot_filled": true,
  "slot_number": 5
}
```

---

### 3. Daily Stats Webhook

**Endpoint:** `POST /webhooks/safira-daily-stats`

**Description:** Send daily aggregated statistics for all influencers.

**Request Body:**
```json
{
  "date": "2024-01-15",
  "sellers": [
    {
      "referral_code": "INF_ABC123",
      "visits": 150,
      "unique_visitors": 120,
      "signups": 10,
      "investments": 3,
      "purchases": 2,
      "revenue": 5000.00,
      "commission_earned": 200.00
    },
    {
      "referral_code": "INF_XYZ789",
      "visits": 80,
      "unique_visitors": 65,
      "signups": 5,
      "investments": 1,
      "purchases": 0,
      "revenue": 1000.00,
      "commission_earned": 40.00
    }
  ],
  "totals": {
    "total_visits": 230,
    "total_unique_visitors": 185,
    "total_signups": 15,
    "total_conversions": 6,
    "total_revenue": 6000.00,
    "total_commission": 240.00
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Daily stats received",
  "date": "2024-01-15",
  "sellers_processed": 2
}
```

---

## API Read Endpoints (Safira ← MicroInfluencer)

These endpoints are for Safira to read data from our platform.

### 1. Get Influencer by Referral Code

**Endpoint:** `GET /influencers/:referralCode`

**Description:** Verify and get details of an influencer by their referral code.

**Example:** `GET /influencers/INF_ABC123`

**Response:**
```json
{
  "success": true,
  "data": {
    "referral_code": "INF_ABC123",
    "name": "John Doe",
    "email": "john@example.com",
    "status": "active",
    "tier": "bronze | silver | gold | platinum",
    "social_profiles": {
      "instagram": "johndoe",
      "tiktok": "johndoe",
      "youtube": "johndoe"
    },
    "commission_rate": 25,
    "payment_info": {
      "method": "crypto",
      "wallet_address": "0x..."
    }
  }
}
```

---

### 2. Get All Active Influencers

**Endpoint:** `GET /influencers/active`

**Description:** Get list of all active influencers for syncing.

**Response:**
```json
{
  "success": true,
  "data": {
    "influencers": [
      {
        "referral_code": "INF_ABC123",
        "name": "John Doe",
        "status": "active",
        "tier": "silver",
        "commission_rate": 25,
        "joined_at": "2024-01-01T00:00:00Z"
      },
      {
        "referral_code": "INF_XYZ789",
        "name": "Jane Smith",
        "status": "active",
        "tier": "bronze",
        "commission_rate": 25,
        "joined_at": "2024-01-10T00:00:00Z"
      }
    ],
    "total": 2,
    "last_updated": "2024-01-15T12:00:00Z"
  }
}
```

---

## Referral Link Format

When an influencer registers on our platform, they receive a unique referral code. The referral URL format:

```
https://safiralux.com/invest?ref=INF_ABC123&utm_source=INF_ABC123&utm_medium=instagram
```

**UTM Parameters:**
- `ref` - Influencer's referral code
- `utm_source` - Same as referral code (for tracking)
- `utm_medium` - Platform where link was shared (instagram, tiktok, youtube, twitter, facebook)

---

## Slot System & Commission Structure

| Item | Value |
|------|-------|
| Commission per conversion | $40 |
| Total slots per cycle | 20 |
| Total locked amount per cycle | $800 |
| Withdrawal | After all 20 slots are filled |

**Flow:**
1. Influencer registers → Gets unique referral code
2. Influencer shares link → Tracks page views, clicks
3. Customer converts → Fills one slot ($40)
4. After 20 conversions → $800 available for withdrawal
5. Admin approves → Funds released

---

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid request body |
| 401 | Unauthorized - Invalid API key or signature |
| 403 | Forbidden - Access denied |
| 404 | Not Found - Influencer not found |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |

**Error Response Format:**
```json
{
  "success": false,
  "error": "Error message description"
}
```

---

## Rate Limits

| Endpoint Type | Limit |
|--------------|-------|
| Webhooks | 100 requests per minute per IP |
| API Read | 60 requests per minute per API key |

---

## Testing

### Test Webhook (Tracking Event)
```bash
curl -X POST https://microcollabhub.com/api/v1/webhooks/safira-tracking \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer microinfluencer-key-2024" \
  -d '{
    "event_type": "PAGE_VIEW",
    "event_id": "test-123",
    "referral_code": "INF_ABC123",
    "timestamp": "2024-01-15T10:30:00Z"
  }'
```

### Test Webhook (Conversion)
```bash
curl -X POST https://microcollabhub.com/api/v1/webhooks/safira-conversion \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer microinfluencer-key-2024" \
  -d '{
    "conversion_type": "INVESTMENT",
    "conversion_id": "conv-test-123",
    "referral_code": "INF_ABC123",
    "timestamp": "2024-01-15T14:25:00Z",
    "customer": { "id": "cust-1", "email_hash": "abc", "is_new": true },
    "transaction": { "amount": 1000, "currency": "USD", "product_value": 1000 },
    "product": { "id": "prod-1", "name": "Gold Package", "type": "investment" }
  }'
```

### Test API (Get Influencer)
```bash
curl -X GET https://microcollabhub.com/api/v1/influencers/INF_ABC123 \
  -H "Authorization: Bearer microinfluencer-key-2024"
```

### Test API (Get Active Influencers)
```bash
curl -X GET https://microcollabhub.com/api/v1/influencers/active \
  -H "Authorization: Bearer microinfluencer-key-2024"
```

---

## Contact

For integration support:
- Platform: microcollabhub.com
- Technical Contact: [Your contact info]

---

## Changelog

| Date | Version | Changes |
|------|---------|---------|
| 2024-01-15 | 1.0.0 | Initial API documentation |

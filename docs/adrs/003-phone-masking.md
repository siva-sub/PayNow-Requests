# ADR 003: Progressive Phone Number Disclosure

## Status

Accepted

## Context

PayNow Requests aims to enable individuals to request payments without publicly revealing their phone number. However, the PayNow QR code specification **requires** the recipient's phone number to be encoded in the QR for payments to work.

### The Challenge

```
┌────────────────────────────────────────────────────────────────┐
│                     PAYMENT FLOW                                │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Requester ──────▶ Shared Link ──────▶ Payer Opens Link         │
│  (Phone Number)                        (Should NOT see Phone)   │
│                                                                 │
│  Payer ──────▶ Scans QR ──────▶ Bank App ──────▶ Payment       │
│                (MUST contain Phone)       (Shows Phone)         │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

## Decision

Implement **progressive disclosure**:

1. **Shared Link Page**: Show masked phone (`+65 9123 XXXX`)
2. **QR Code**: Contains full phone (required by PayNow)
3. **Bank App**: Reveals full phone when QR is scanned
4. **Public Sharing**: Phone never appears in shared link

### Implementation

```typescript
function maskPhone(phone: string): string {
  const match = phone.match(/(\+65\s?)?(\d{4})(\d{4})/);
  if (!match) return phone;
  return `+65 ${match[2]} XXXX`;
}

// CreateRequest: Show masked phone when sharing
// ViewRequest: Show masked phone initially
```

## Benefits

1. **Social Privacy**: Phone not visible when sharing link publicly (e.g., group chats)
2. **PayNow Compatible**: QR code works with all banking apps
3. **User Control**: Payer chooses when to reveal phone by scanning QR
4. **No False Security**: Honest about privacy model

## Drawbacks

1. **Not Cryptographic**: Deterministic masking could be reverse-engineered
2. **QR Code Exposure**: Anyone with technical skill can extract phone from QR
3. **Bank App Revelation**: Phone revealed at payment time anyway

## Mitigations

1. **Not Cryptographic**: Document as privacy enhancement, not security feature
2. **QR Exposure**: Accept as necessary for PayNow compatibility
3. **Bank Revelation**: This is the intended PayNow user journey

## Privacy Model

| Stage | Phone Visibility | Rationale |
|-------|------------------|-----------|
| Shared Link | Masked (+65 9123 XXXX) | Social privacy in group chats |
| QR Code | Full (+65 91234567) | Required for PayNow to work |
| Bank App | Full | Standard PayNow flow |
| Payment Confirmation | Full | User verification step |

## Alternatives Considered

### Alternative 1: No Masking
- **Pros**: Simpler, transparent
- **Cons**: Phone visible in all shared contexts
- **Rejected**: Defeats privacy purpose

### Alternative 2: QR Password Protection
- **Pros**: Additional security layer
- **Cons**: Breaks PayNow QR format, poor UX
- **Rejected**: Not EMVCo compliant

### Alternative 3: Proxy/Virtual Number
- **Pros**: True privacy
- **Cons**: Requires backend service, costs money
- **Rejected**: Requires infrastructure, violates no-backend principle

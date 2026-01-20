# ADR 001: Use URL-Based Data Encoding (No Backend)

## Status

Accepted

## Context

PayNow Requests needs to enable payment request sharing across different devices and platforms (WhatsApp, SMS, Email, etc.). Traditional approaches would require:

1. A backend server to store request data
2. A database to persist requests
3. API endpoints for creating and retrieving requests
4. Authentication/authorization mechanisms

This introduces:
- Hosting costs and maintenance overhead
- Privacy concerns (user data on third-party servers)
- Single point of failure
- GDPR/data protection complexity

## Decision

Use **URL-based data encoding** with Base64 encoding of JSON data in the URL hash fragment.

### Implementation

```typescript
interface RequestData {
  phone: string;
  amount: number | null;
  reason: string;
  expiry: Date | null;
  createdAt: Date;
}

function encodeRequestData(data: RequestData): string {
  return btoa(JSON.stringify(data));
}

function decodeRequestData(encoded: string): RequestData | null {
  try {
    const jsonString = atob(encoded);
    return JSON.parse(jsonString);
  } catch {
    return null;
  }
}
```

URL format: `https://example.com/#/request/{base64-encoded-data}`

## Benefits

1. **No Backend Required**: Pure client-side application, deployable to GitHub Pages
2. **Privacy**: No user data stored on any server
3. **Universal Sharing**: Works with any platform that supports URLs
4. **Caching Friendly**: Each unique URL is a static resource
5. **Offline Capable**: URL itself contains all necessary data
6. **Zero Infrastructure Costs**: No hosting or database costs

## Drawbacks

1. **URL Length Limit**: Some platforms have URL length limits
2. **No Native Encryption**: Base64 is encoding, not encryption
3. **No Analytics**: Cannot track request views or completion
4. **No Revocation**: Once shared, requests cannot be revoked

## Mitigations

1. **URL Length**: Keep request data minimal; only essential fields
2. **Encryption**: Document that this provides privacy through obscurity, not cryptographic security
3. **Analytics**: Accept as limitation; this is a privacy-focused design
4. **Revocation**: Accept as limitation; expiry time provides soft revocation

## Alternatives Considered

### Alternative 1: Backend with Database
- **Pros**: Full control, analytics, revocation possible
- **Cons**: Hosting costs, privacy concerns, maintenance burden
- **Rejected**: Too complex for a simple P2P payment request tool

### Alternative 2: IPFS / Decentralized Storage
- **Pros**: No central server, censorship resistant
- **Cons**: Complexity for average users, requires wallet/software
- **Rejected**: Too complex for target user base

### Alternative 3: LocalStorage with Session ID
- **Pros**: Smaller URLs
- **Cons**: Single-device only, breaks cross-device use case
- **Rejected**: Defeats the purpose of sharing requests

## References

- [RFC 3986 - Uniform Resource Identifier](https://tools.ietf.org/html/rfc3986)
- [Base64 Encoding - RFC 4648](https://tools.ietf.org/html/rfc4648)

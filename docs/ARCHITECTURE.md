# PayNow Requests - Architecture Documentation

## Overview

PayNow Requests is a privacy-preserving, intent-scoped payment request application for Singapore's PayNow system. It enables individuals to issue context-bound payment requests without revealing their permanent phone number directly.

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Technology Stack](#technology-stack)
3. [Data Flow](#data-flow)
4. [Security Model](#security-model)
5. [API Reference](#api-reference)
6. [Deployment](#deployment)

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Browser                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ CreateRequest│  │  ViewRequest │  │  PayNow QR   │          │
│  │  Component   │  │  Component   │  │   Generator  │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                 │                 │                     │
│         └─────────────────┴─────────────────┘                     │
│                           │                                       │
│                    ┌──────▼──────┐                                │
│                    │ React Router│                                │
│                    │  (hash mode)│                                │
│                    └──────┬──────┘                                │
└───────────────────────────┼──────────────────────────────────────┘
                           │
                    ┌──────▼──────┐
                    │   Vite      │
                    │   Build     │
                    └──────┬──────┘
                           │
              ┌────────────▼────────────┐
              │  Static Hosting (Pages) │
              └─────────────────────────┘
```

### Component Hierarchy

```
App
├── Router (BrowserRouter)
├── Navigation
├── Routes
│   ├── / → CreateRequest
│   └── /request/:encodedData → ViewRequest
└── Footer

CreateRequest
├── Form (phone, amount, reason, expiry)
├── QR Code Display
└── Share Actions (WhatsApp, SMS, Email, Copy)

ViewRequest
├── Request Details Display
├── QR Code Display (on demand)
├── How It Works Section
└── Privacy Notice
```

---

## Technology Stack

### Frontend Framework

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.2.0 | UI Framework |
| TypeScript | 5.9.3 | Type Safety |
| Vite | 7.2.4 | Build Tool |
| Tailwind CSS | 3.4.19 | Styling |

### Dependencies

| Package | Purpose |
|---------|---------|
| react-router-dom | Client-side routing (hash mode) |
| qrcode | QR code generation |
| date-fns | Date formatting |

### DevDependencies

| Package | Purpose |
|---------|---------|
| @vitejs/plugin-react | React plugin for Vite |
| typescript | TypeScript compiler |
| eslint | Linting |
| autoprefixer | CSS vendor prefixes |
| postcss | CSS processing |

---

## Data Flow

### Request Creation Flow

```
┌─────────┐     ┌────────────┐     ┌──────────────┐     ┌─────────┐
│  User   │────▶│ CreateRequest│────▶│ encodeRequest│────▶│  URL    │
│  Input  │     │  Component │     │   (Base64)   │     │Generated│
└─────────┘     └────────────┘     └──────────────┘     └─────────┘
                      │
                      ▼
              ┌──────────────┐     ┌──────────────┐     ┌─────────┐
              │ generatePayNow│────▶│  QR Code     │────▶│ Display │
              │      QR      │     │   Image      │     │  & Share│
              └──────────────┘     └──────────────┘     └─────────┘
```

### Request Viewing Flow

```
┌─────────┐     ┌────────────┐     ┌──────────────┐     ┌─────────┐
│ Shared  │────▶│ ViewRequest │────▶│ decodeRequest│────▶│  Data   │
│   URL   │     │  Component │     │   (Base64)   │     │ Parsed  │
└─────────┘     └────────────┘     └──────────────┘     └─────────┘
                                           │
                                           ▼
                                   ┌──────────────┐
                                   │ Validate     │
                                   │ Expiry       │
                                   └──────────────┘
                                           │
                      ┌────────────────────┼────────────────────┐
                      │                    │                    │
                      ▼                    ▼                    ▼
               ┌──────────┐         ┌──────────┐         ┌──────────┐
               │ Expired  │         │  Valid   │         │  Invalid │
               │  State   │         │  State   │         │   Data   │
               └──────────┘         └──────────┘         └──────────┘
                                         │
                                         ▼
                                  ┌──────────────┐
                                  │ Show QR Code │
                                  │  (on demand) │
                                  └──────────────┘
```

---

## Security Model

### Privacy Principles

1. **Data Minimization**: Only essential data is encoded in the URL
2. **Progressive Disclosure**: Phone number revealed only when QR is scanned
3. **Ephemeral Requests**: Time-bound validity reduces exposure window
4. **No Persistence**: No server-side storage, no tracking

### Threat Model

| Threat | Mitigation |
|--------|------------|
| URL sniffing | Phone number masked in UI |
| QR code interception | Requires bank app to complete payment |
| Request replay | Expiry time enforcement (UX-level) |
| Social engineering | Clear privacy notices and verification steps |

### Limitations

1. **Expiry is UX-level only**: Expired requests can still be scanned and paid
2. **No cryptographic anonymity**: Base64 encoding provides obfuscation, not encryption
3. **No fraud prevention**: Users must verify requests through separate channels

---

## API Reference

### `generatePayNowQR(opts: PayNowQROptions): string`

Generates a PayNow EMVCo-compliant QR code string.

```typescript
interface PayNowQROptions {
  phone: string;           // Phone number (e.g., "+6591234567" or "91234567")
  amount?: number | null;  // Amount in SGD (null = editable)
  reference?: string | null; // Reference/reason text
  expiry?: string | null;  // Expiry date in YYYYMMDD format
  editable?: boolean;      // Whether amount is editable
  entityName?: string;     // Payee display name
}
```

### `encodeRequestData(data: RequestData): string`

Encodes request data to Base64 for URL sharing.

```typescript
interface RequestData {
  phone: string;
  amount: number | null;
  reason: string;
  expiry: Date | null;
  createdAt: Date;
}
```

### `decodeRequestData(encoded: string): RequestData | null`

Decodes Base64-encoded request data from URL.

---

## Deployment

### Build Process

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

### GitHub Pages Deployment

1. Push code to GitHub repository
2. Enable GitHub Pages in repository settings
3. Select source: `main` branch with `/` folder or `gh-pages` branch
4. Access at: `https://[username].github.io/[repo-name]/`

### Environment Requirements

- Node.js 18+
- Modern browser with ES6 support
- Static hosting (no backend required)

---

## PayNow EMVCo QR Specification

### QR Code Structure

```
00 01  - Payload Format Indicator (EMVCo v1.0)
01 11/12 - Point of Initiation Method (11=static, 12=dynamic)
26 [Merchant Account Information]
  00 [length] SG.PAYNOW
  01 [length] 0 (mobile number)
  02 [length] +65XXXXXXXX
  03 [length] 1 (amount editable: 1=yes, 0=no)
  04 [length] YYYYMMDD (expiry)
52 [length] 0000 (Merchant Category Code)
53 [length] 702 (Currency: SGD)
54 [length] XX.XX (Transaction Amount)
58 [length] SG (Country Code)
59 [length] [Payee Name]
60 [length] Singapore (City)
62 [length]
  01 [length] [Reference/Reason]
63 04 [CRC] - CRC-16-CCITT checksum
```

### CRC-16-CCITT Calculation

The checksum is calculated over the entire QR data string (excluding the CRC itself) using the CRC-16-CCITT polynomial (0x1021).

---

## Browser Compatibility

| Browser | Minimum Version |
|---------|-----------------|
| Chrome/Edge | Latest |
| Firefox | Latest |
| Safari | Latest |
| Mobile Safari | Latest |
| Chrome Mobile | Latest |

Required features:
- ES6 modules
- URL base64 encoding/decoding
- Canvas API
- URL hash routing

---

## Future Enhancements

1. **Password Protection**: Optional password for request access
2. **Click Limiting**: Limit number of times a request can be viewed
3. **Request History**: LocalStorage-based request history
4. **Dark Mode**: Theme switching capability
5. **Multi-Language**: Support for multiple languages
6. **Analytics**: Opt-in usage analytics

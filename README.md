# PayNow Requests

Privacy-preserving, intent-scoped payment requests for Singapore PayNow.

## About

This app enables individuals (non-merchants) to issue **context-bound PayNow payment requests** without revealing their permanent phone number directly.

### Key Features

- **Intent-Centric**: Requests state purpose, amount, and validity window
- **Privacy-Preserving**: Phone number masked until recipient scans QR code in bank app
- **Time-Scoped**: Explicit expiry indicates request urgency
- **Cross-Device Sharing**: URL-encoded requests work on any device
- **No Backend**: Works entirely client-side, perfect for GitHub Pages
- **Human Control**: Payers must manually confirm in their banking app

### How It Differs from Existing PayNow QR Generators

| Aspect | Existing Projects (serrynaimo, xkjyeah) | This Project |
|--------|--------------------------------------------|--------------|
| Core Product | Static QR code (utility) | Payment request object |
| Use Case | Merchant checkout / hawker stalls | Individual P2P requests |
| Data Storage | Device-specific (localStorage) | URL-encoded (cross-device) |
| Lifecycle | None (stateless) | Create → Share → View → Pay → Expire |
| Privacy | Phone number visible in QR | Phone masked, revealed only on bank app |
| Context | Reference field only | Purpose, amount, expiry displayed |
| Sharing | Screenshot/print | Shareable link via WhatsApp/SMS/Email |
| Expiry | None (permanent QR) | UX-level expiry enforcement |

## How It Works

### For Requesters (People Receiving Money)

1. Fill in form: Phone number, amount, reason, expiry time
2. Generate QR code and shareable link
3. Share link via WhatsApp, SMS, Email, or any chat platform
4. Recipients open link, see request details, and scan QR to pay

### For Payers (People Sending Money)

1. Click shared link
2. View request details: Who requests what amount, for what reason, valid until when
3. Click "Show QR Code to Pay"
4. Open banking app (DBS, OCBC, UOB, etc.) and scan QR
5. **Only then** does bank app reveal recipient's full phone number
6. Verify amount and reason, then confirm payment

### Phone Number Obfuscation

**Request Link Page**: Shows masked phone (e.g., `+65 9123 XXXX`)
**QR Code**: Contains full number (required for PayNow to work)
**Bank App**: When recipient scans QR, only then does their bank show full number
**Public Sharing**: Phone number never appears publicly on shared link

This approach balances **usability** (QR works with all bank apps) with **privacy** (number not publicly visible).

## Privacy & Security

### What This App Does NOT Do

- Does NOT execute payments (all transactions occur in your banking app)
- Does NOT deep-link into bank PayNow flows
- Does NOT enforce expiry at the PayNow rail level
- Does NOT provide cryptographic anonymity
- Does NOT claim to prevent fraud

### What This App Does

- Encodes request data in URL (base64)
- Masks phone number on the shared link page
- Generates PayNow EMVCo-compliant QR codes
- Provides UX-level expiry enforcement (expired requests show warning)
- Enables cross-device sharing via any messaging platform

### Data Handling

- **No data storage**: All request data is in the URL itself
- **No backend**: Works entirely client-side
- **No tracking**: No analytics or user data collection
- **URL encoding**: Request data is base64-encoded in the URL path

### Important Notes

1. **Expiry is UX-level only**: Expired requests can still be scanned and paid. Expiry is enforced by the web interface, not by the PayNow network or banks.

2. **Phone number revelation**: When recipient scans the QR code in their banking app, the full phone number will be displayed. This is a PayNow requirement - the QR code must contain the actual number for payments to work.

3. **No fraud prevention**: This app does not verify requesters or prevent social engineering. Recipients should always verify requests through separate channels before paying.

4. **Not for merchants**: This app is designed for individual P2P payments, not for business use. Consider existing PayNow QR generators for merchant scenarios.

## Deployment

This app is designed for static hosting, particularly **GitHub Pages**:

```bash
# Build
npm run build

# Deploy to GitHub Pages
# 1. Push to GitHub repository
# 2. Enable GitHub Pages in repository settings
# 3. Select 'gh-pages' branch or 'main' branch with '/docs' folder
```

Your live URL will be:
```
https://[your-username].github.io/[repository-name]
```

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and optimized builds
- **Tailwind CSS** for styling
- **React Router** for client-side routing
- **qrcode** library for QR code generation
- **PayNow EMVCo QR** specification compliant

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Browser Support

Works on all modern browsers that support:
- ES6 modules
- URL base64 encoding/decoding
- Canvas API (for QR code rendering)

Tested on:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## PayNow EMVCo QR Specification

This app generates PayNow QR codes compliant with:
- **EMVCo Merchant-Presented QR Code Specification v1.0**
- **Singapore SGQR Specifications** (PayNow subset)
- **CRC-16-CCITT** checksum validation

For technical details, see:
- [EMVCo QR Specification](https://www.emvco.com/emv-technologies/qr-codes/)
- [IMDA SGQR Specifications](https://www.imda.gov.sg/industry-development/infrastructure/quick-response-code)

## License

MIT License - Feel free to fork, modify, and use for your own needs.

## Credits

This project implements the PayNow EMVCo QR code specification as documented by open-source implementations:
- [serrynaimo/paynow-qr](https://github.com/serrynaimo/paynow-qr)
- [xkjyeah/paynow-qr-generator](https://github.com/xkjyeah/paynow-qr-generator)

## Disclaimer

This project is not affiliated with MAS (Monetary Authority of Singapore), PayNow, or any Singapore bank. Use at your own risk. Always verify payment requests before sending money.

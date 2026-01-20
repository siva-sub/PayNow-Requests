# PayNow Requests - Architecture Diagrams

This document contains all architecture and design diagrams for the PayNow Requests application, rendered via [Kroki.io](https://kroki.io).

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Data Flow](#data-flow)
3. [Privacy Model](#privacy-model)
4. [EMVCo QR Structure](#emvco-qr-structure)
5. [Request Lifecycle](#request-lifecycle)

---

## System Architecture

### Component Overview

![System Architecture](https://kroki.io/mermaid/svg/eNp1Tr0KwjAQ3n2KEOdaXBxEClbESdBWdAgdrng1xdjGJKJ9e5O0Qlvwhu-G7_emQHJyiifE3lpKRi3MjP7QjARBRDYKwSCj7U_w-UJtaPaTe825xDejDod86_GSAzRVbUXSf5u_ylUYHROywwoVmFp1HpfSc4xzUg7KrrlwMNrWh-k-DbcPKMXYHkN1Z9Shm6k72oM2jUA_viiFWE4X8ysUeY_q-v6wvmLAfQFmd2GO)

### Description

The application is built as a client-side React application:

- **App.tsx**: Root component with React Router setup
- **CreateRequest**: Form for creating payment requests
- **ViewRequest**: Page for viewing shared requests
- **paynow.ts**: Utility for generating EMVCo-compliant QR codes
- **Share Actions**: WhatsApp, SMS, Email integration
- **Bank Apps**: External banking applications for payment execution

---

## Data Flow

### Request Creation and Payment Flow

![Data Flow](https://kroki.io/mermaid/svg/eNp1kD9PwzAQxfd-ihtBKhtiyFCpcRALf4yRwnxyjsZKcza2S9Vvj500IajgwcO93zu_50CfB2JNlcGdx34F6Tj00WjjkCMowAAqQyGSv5BFloUnjHSGLhCZEYmnP9x1lmpDx_-8ZQZK5A62zg3qcKmbzUYUcM8pEsjWMq1h29sDx3XKisHygIkJ07ahqQRclRjo7vZ6iTwQk08dcs5ne4RXNauqgLd2GAFyA4-GuzmDzBp6gi-D8N5iDFNMmdS6gBdH_GOpx2FFyzyzIs8PPWHoqBlrLXeJvdHdlGXpqkxwezxN04yXaZdGBsO_f68cHcLyh_F9btsTx9U3ynmZlg==)

### Sequence Description

1. **Requester** enters payment details (phone, amount, reason) into CreateRequest
2. **CreateRequest** encodes the data to Base64 and generates PayNow QR
3. **CreateRequest** displays QR and shareable link to Requester
4. **Requester** shares the link via WhatsApp to **Payer**
5. **Payer** opens the link in **ViewRequest**
6. **ViewRequest** decodes the request and shows masked phone number
7. **Payer** clicks "Show QR" to reveal the full QR code
8. **Payer** scans QR in their **Bank App**
9. **Bank App** confirms payment details
10. **Payer** confirms payment in **Bank App**

---

## Privacy Model

### Progressive Disclosure of Phone Number

![Privacy Model](https://kroki.io/mermaid/svg/eNpNjLEKgzAURXe_4mLHIrUt2ipF0EAnB6uLUBxSTVSMUVI7-PeVoOCDe5dz7qsVHRvEqYHlwreZTbRmOPvIGqpYhbiV3eOjTsHRdeDleY4luVnAsgJEm3_x8UpBhopp9_kTAkkzSGYW-nGkdbLpVx8RlR3CcdQ-GSRvVY-Ezj2T0zrS9Z1mwRCCt0L4B88uKfd2IFoB52V5t3eArIA6lUtvxh_MxkG9)

### Privacy Stages

| Stage | Phone Visibility | Context |
|-------|------------------|---------|
| **Stage 1: Shared Link** | `+65 9XXX XXXX` | Phone masked in shared link and web view |
| **Stage 2: QR Code** | `+65 91234567` | Full phone encoded in QR (required by PayNow) |
| **Stage 3: Bank App** | `+65 91234567` | Full phone shown in banking app |

### Privacy Rationale

- **Stage 1**: Prevents phone number harvesting in group chats and public posts
- **Stage 2**: QR code must contain full phone for PayNow to function
- **Stage 3**: Standard PayNow flow reveals phone at confirmation

---

## EMVCo QR Structure

### PayNow QR Code Format

![EMVCo QR Structure](https://kroki.io/mermaid/svg/eNpdkNFugjAUhu99ipPu2kURzcbFEqziXDKmbMmyNF5UaKEZtKaWbLz9DowLoRdNk-_7c_6e3PJLAR_rCeA5JowceBObH3wCNZkgJ5hOnyBkZDYLAFlpeAaRsRV35NSHOmWNyjyAvVZOcaeMhlfhCpMNLcqItwoQ2bTg2qEuzdDYMLL0AqDcidzYpm9xa2zRWKBRWyt02gxhhNAPIKxMrUcNd4geMNcSO4o9I3vsPigExLwajdwzssJSiZCinTmiL0jbQgkFWoj0-1pXvdBd9P_nc0bed_eH8Ct---xxTzzcemE0Dq6rs7BDuGBkmynHz6WAqOT5kPpIfy8K97TBhd1OvboGE9hQqrIM7qTMlr6c_AF0YH-N)

### Field Descriptions

| ID | Description | Value |
|----|-------------|-------|
| **00** | Payload Format Indicator | `01` (EMVCo v1.0) |
| **01** | Point of Initiation Method | `11` (static) / `12` (dynamic) |
| **26** | Merchant Account Information | Nested structure |
| **26-00** | Payment Scheme | `SG.PAYNOW` |
| **26-01** | Proxy Type | `0` (mobile number) |
| **26-02** | Proxy Value | Phone number |
| **26-03** | Editable Amount Flag | `1` (yes) / `0` (no) |
| **26-04** | Expiry Date | YYYYMMDD format |
| **52** | Merchant Category Code | `0000` (individual) |
| **53** | Currency Code | `702` (SGD) |
| **54** | Transaction Amount | Decimal with 2 digits |
| **58** | Country Code | `SG` |
| **59** | Merchant/Payee Name | Display name |
| **60** | City | `Singapore` |
| **62-01** | Bill Number / Reference | Payment reason |
| **63** | CRC-16-CCITT | Checksum |

---

## Request Lifecycle

### State Transitions

![Request Lifecycle](https://kroki.io/mermaid/svg/eNpNjjEPgjAQhXd-xaUmbiQarYCDi3FjMJi4EIYLXKWREASM8u9te01sh7vrfe-17zHi0EJeRGDOeSScqRTcoaDXm6ZZVBDHJ7i1OBrmGuS6f4rKmXhhFXdNn1LY-rc6iVtZxRUX80KNPazt7LGZHL18B22_8GZ_n7zKlWleOvI5QemuO65QNgdMAsqBGGabGlUWQBeFmVJKZk3AbA5G6bZO0n2AOIqnpORObqIfMdBdvQ==)

### Lifecycle States

| State | Description | Trigger |
|-------|-------------|---------|
| **Create Request** | User enters payment details | Form submission |
| **Share Link** | URL encoded and shared | Share button clicked |
| **View Request** | Recipient opens shared link | Link accessed |
| **Scan & Pay** | QR code displayed and scanned | User action |
| **Request Expires** | Expiry time passed | Time-based |

### State Details

**Create Request**
- Input: Phone number, amount, reason, expiry
- Output: Base64-encoded request data, PayNow QR code
- Validation: Phone format, amount range, reason length

**Share Link**
- Format: `https://domain/#/request/{base64-data}`
- Channels: WhatsApp, SMS, Email, any chat platform
- Privacy: Phone number masked in link preview

**View Request**
- Decode: Base64 to JSON
- Validation: Expiry check
- Display: Masked phone, amount, reason, expiry

**Scan & Pay**
- Action: User clicks "Show QR to Pay"
- QR: Contains full phone number (PayNow requirement)
- Execution: User scans QR in banking app

**Request Expires**
- UX-level enforcement only
- Warning displayed prominently
- QR still scannable (user discretion)

---

## Using These Diagrams

### Embedding in Markdown

These diagrams can be embedded in any Markdown file that supports HTML/img tags:

```markdown
![Alt Text](https://kroki.io/mermaid/svg/{encoded-url})
```

### Editing Diagrams

To modify these diagrams:

1. Edit the Mermaid source code
2. Encode with deflate + base64:
   ```bash
   echo "graph LR
   A[A] --> B[B]" | \
   python3 -c "import sys,zlib,base64; \
   print(base64.urlsafe_b64encode(\
   zlib.compress(sys.stdin.read().encode(),9)).decode())"
   ```
3. Update URL: `https://kroki.io/mermaid/svg/{encoded}`

### Alternative: POST API

For dynamic generation, use Kroki's POST API:

```bash
curl -X POST https://kroki.io/mermaid/svg \
  -H "Content-Type: application/json" \
  -d '{"diagram_source": "graph LR\nA[A] --> B[B]"}'
```

---

## References

- [Kroki Documentation](https://docs.kroki.io)
- [Mermaid Syntax](https://mermaid.js.org/syntax/flowchart.html)
- [EMVCo QR Specification](https://www.emvco.com/emv-technologies/qr-codes/)
- [IMDA SGQR Specifications](https://www.imda.gov.sg/industry-development/infrastructure/quick-response-code)

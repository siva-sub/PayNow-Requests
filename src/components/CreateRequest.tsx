import { useState } from 'react';
import { encodeRequestData } from '../utils/paynow';
import { generatePayNowQR } from '../utils/paynow';
import QRCode from 'qrcode';

export default function CreateRequest() {
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState<number | null>(null);
  const [reason, setReason] = useState('');
  const [expiryHours, setExpiryHours] = useState(24);
  const [entityName, setEntityName] = useState('Payee');
  const [useExpiry, setUseExpiry] = useState(true);
  const [showQR, setShowQR] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [requestUrl, setRequestUrl] = useState('');
  const [error, setError] = useState('');
  const [expiryDate, setExpiryDate] = useState<Date | null>(null);

  const handleCreate = async () => {
    setError('');

    if (!phone) {
      setError('Please enter your phone number');
      return;
    }

    if (!reason) {
      setError('Please enter a reason for this payment request');
      return;
    }

    const newExpiry = useExpiry
      ? new Date(Date.now() + expiryHours * 60 * 60 * 1000)
      : null;
    setExpiryDate(newExpiry);

    const requestData = {
      phone,
      amount,
      reason,
      expiry: newExpiry,
      createdAt: new Date(),
    };

    const encodedData = encodeRequestData(requestData);
    const baseUrl = window.location.origin + window.location.pathname;
    const fullUrl = `${baseUrl}#/request/${encodedData}`;
    setRequestUrl(fullUrl);

    const qrData = generatePayNowQR({
      phone,
      amount,
      reference: reason,
      expiry: newExpiry ? toYYYYMMDD(newExpiry) : null,
      editable: amount === null,
      entityName,
    });

    const qrUrl = await QRCode.toDataURL(qrData, {
      errorCorrectionLevel: 'M',
      width: 300,
      margin: 2,
    });
    setQrCode(qrUrl);
    setShowQR(true);
  };

  const handleShare = (platform: 'whatsapp' | 'sms' | 'email' | 'copy') => {
    const urlToShare = requestUrl;
    const message = `Payment Request: ${amount ? `SGD ${amount.toFixed(2)}` : 'Pay amount specified'} for "${reason}"\n\nPay here: ${urlToShare}`;

    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
        break;
      case 'sms':
        window.open(`sms:?body=${encodeURIComponent(message)}`, '_blank');
        break;
      case 'email':
        window.open(`mailto:?subject=Payment Request&body=${encodeURIComponent(message)}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(urlToShare);
        alert('Link copied to clipboard!');
        break;
    }
  };

  function toYYYYMMDD(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  }

  function maskPhone(phone: string): string {
    const match = phone.match(/(\+65\s?)?(\d{4})(\d{4})/);
    if (!match) return phone;
    return `+65 ${match[2]} XXXX`;
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="editorial-card delay-2">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif font-bold text-gray-900 mb-3 animate-fade-in-up delay-1">
            Create Payment Request
          </h1>
          <p className="text-gray-600 font-sans animate-fade-in-up delay-2">
            Generate an intent-scoped PayNow payment request
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg animate-fade-in-up delay-3">
            {error}
          </div>
        )}

        {!showQR ? (
          <div className="space-y-6">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Your Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+65 9123 4567 or 91234567"
                className="input-field w-full"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                This will be masked until payer scans QR code
              </p>
            </div>

            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                Amount (SGD)
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  id="amount"
                  step="0.01"
                  min="0"
                  value={amount || ''}
                  onChange={(e) =>
                    setAmount(e.target.value ? parseFloat(e.target.value) : null)
                  }
                  placeholder="50.00"
                  className="input-field flex-1"
                />
                <button
                  type="button"
                  onClick={() => setAmount(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Editable
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Leave blank to let payer enter amount
              </p>
            </div>

            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                Reason / Reference
              </label>
              <input
                type="text"
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Dinner at Hawker Centre"
                className="input-field w-full"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                This will be shown to payer
              </p>
            </div>

            <div>
              <label htmlFor="expiry" className="block text-sm font-medium text-gray-700 mb-2">
                Expiry
              </label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={useExpiry}
                    onChange={(e) => setUseExpiry(e.target.checked)}
                    className="rounded border-gray-300 text-accent focus:ring-2 focus:ring-accent"
                  />
                  <span className="ml-2 text-gray-700">Set expiry time</span>
                </label>
                {useExpiry && (
                  <select
                    value={expiryHours}
                    onChange={(e) => setExpiryHours(Number(e.target.value))}
                    className="input-field flex-1"
                  >
                    <option value={1}>1 hour</option>
                    <option value={6}>6 hours</option>
                    <option value={24}>24 hours</option>
                    <option value={48}>2 days</option>
                    <option value={168}>1 week</option>
                  </select>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="entityName" className="block text-sm font-medium text-gray-700 mb-2">
                Display Name
              </label>
              <input
                type="text"
                id="entityName"
                value={entityName}
                onChange={(e) => setEntityName(e.target.value)}
                placeholder="Your Name"
                className="input-field w-full"
              />
              <p className="mt-1 text-xs text-gray-500">
                This name will appear in QR code
              </p>
            </div>

            <button
              type="button"
              onClick={handleCreate}
              className="btn-primary w-full"
            >
              Generate Request
            </button>
          </div>
        ) : (
          <div className="editorial-card delay-3">
            <div className="text-center mb-8">
              <div className="bg-accent-light px-4 py-2 rounded-lg inline-block mb-4 animate-fade-in-up delay-1">
                ✓ Payment Request Created
              </div>

              <div className="space-y-6">
                <div>
                  <p className="text-sm text-gray-600">Paying to:</p>
                  <p className="text-lg font-semibold text-gray-900">{entityName}</p>
                  <p className="text-sm text-accent">{maskPhone(phone)}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Amount:</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {amount ? `SGD ${amount.toFixed(2)}` : 'Payer to enter'}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Reason:</p>
                  <p className="text-lg font-semibold text-gray-900">{reason}</p>
                </div>

                {useExpiry && expiryDate && (
                  <div>
                    <p className="text-sm text-gray-600">Valid until:</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {expiryDate.toLocaleString('en-SG', {
                        timeZone: 'Asia/Singapore',
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </p>
                  </div>
                )}

                <div className="pt-4">
                  <img
                    src={qrCode}
                    alt="PayNow QR Code"
                    className="mx-auto shadow-editorial rounded-lg"
                  />
                  <p className="mt-2 text-sm text-gray-600">
                    Scan with your bank app to pay
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => handleShare('whatsapp')}
                className="btn-primary w-full"
              >
                Share via WhatsApp
              </button>
              <button
                onClick={() => handleShare('sms')}
                className="btn-primary w-full"
              >
                Share via SMS
              </button>
              <button
                onClick={() => handleShare('email')}
                className="btn-primary w-full"
              >
                Share via Email
              </button>
              <button
                onClick={() => handleShare('copy')}
                className="btn-primary w-full"
              >
                Copy Link
              </button>
              <button
                onClick={() => {
                  setShowQR(false);
                  setQrCode('');
                  setRequestUrl('');
                  setExpiryDate(null);
                }}
                className="text-gray-600 font-medium py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors w-full"
              >
                Create Another
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

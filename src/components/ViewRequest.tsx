import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { decodeRequestData } from '../utils/paynow';
import { generatePayNowQR } from '../utils/paynow';
import QRCode from 'qrcode';

export default function ViewRequest() {
  const { encodedData } = useParams();
  const [request, setRequest] = useState<any>(null);
  const [qrCode, setQrCode] = useState('');
  const [expired, setExpired] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    if (!encodedData) {
      setLoading(false);
      return;
    }

    const requestData = decodeRequestData(encodedData);
    if (!requestData) {
      setLoading(false);
      return;
    }

    const now = new Date();
    if (requestData.expiry && requestData.expiry < now) {
      setExpired(true);
      setLoading(false);
      return;
    }

    setRequest(requestData);
    setLoading(false);
  }, [encodedData]);

  const handleShowQR = async () => {
    const qrData = generatePayNowQR({
      phone: request.phone,
      amount: request.amount,
      reference: request.reason,
      expiry: request.expiry ? toYYYYMMDD(request.expiry) : null,
      editable: request.amount === null,
      entityName: 'Payee',
    });

    const qrUrl = await QRCode.toDataURL(qrData, {
      errorCorrectionLevel: 'M',
      width: 400,
      margin: 2,
    });
    setQrCode(qrUrl);
    setShowQR(true);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (expired) {
    return (
      <div className="editorial-card animate-fade-in-up delay-1">
        <div className="text-center">
          <div className="text-6xl mb-4">⏰</div>
          <h1 className="text-4xl font-serif font-bold text-gray-900 mb-2">
            Payment Request Expired
          </h1>
          <p className="text-gray-600 mb-6">
            This payment request is no longer valid. Please contact the requester
            for a new request.
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="btn-primary"
          >
            Create Your Own Request
          </button>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="editorial-card animate-fade-in-up delay-2">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-4xl font-serif font-bold text-gray-900 mb-2">
            Request Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            This payment request does not exist or has been deleted.
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="btn-primary"
          >
            Create Your Own Request
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in-up delay-3">
      <div className="editorial-card delay-4">
        <div className="text-center mb-8">
          <div className="bg-accent-light px-6 py-3 rounded-lg inline-block mb-4 animate-fade-in-up delay-1">
            Payment Request
          </div>
          <h1 className="text-4xl font-serif font-bold text-gray-900 mb-2 animate-fade-in-up delay-2">
            {maskPhone(request.phone)} requests:
          </h1>
          <p className="text-xl font-semibold text-accent animate-fade-in-up delay-3">
            {request.amount
              ? `SGD ${request.amount.toFixed(2)}`
              : 'Pay Amount Specified'}
          </p>
        </div>

        <div className="space-y-6 mb-8">
          <div className="editorial-card animate-fade-in-up delay-5">
            <p className="text-sm text-gray-600 mb-1">Reason</p>
            <p className="text-2xl font-semibold text-gray-900">
              {request.reason}
            </p>
          </div>

          {request.expiry && (
            <div className="editorial-card animate-fade-in-up delay-6">
              <p className="text-sm text-gray-600 mb-1">Valid until</p>
              <p className="text-lg font-semibold text-gray-900">
                {request.expiry.toLocaleString('en-SG', {
                  timeZone: 'Asia/Singapore',
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {(() => {
                  const hours = Math.floor(
                    (request.expiry.getTime() - Date.now()) / (1000 * 60 * 60)
                  );
                  if (hours < 1) {
                    return 'Expires in less than 1 hour';
                  }
                  return `Expires in ${hours} hour${hours > 1 ? 's' : ''}`;
                })()}
              </p>
            </div>
          )}

          {request.amount === null && (
            <div className="editorial-card animate-fade-in-up delay-7">
              <p className="text-sm font-medium text-gray-600">
                Amount is editable
              </p>
              <p className="text-sm text-gray-700">
                You can enter any amount when paying
              </p>
            </div>
          )}

          {!showQR ? (
            <button
              onClick={handleShowQR}
              className="btn-primary w-full animate-fade-in-up delay-8"
            >
              Show QR Code to Pay
            </button>
          ) : (
            <div className="space-y-4 animate-fade-in-up delay-9">
              <div className="text-center">
                <img
                  src={qrCode}
                  alt="PayNow QR Code"
                  className="mx-auto shadow-editorial rounded-lg"
                />
                <p className="mt-3 text-sm text-gray-600">
                  Scan this QR code with your bank app (DBS, OCBC, UOB, etc.)
                </p>
              </div>

              <div className="editorial-card animate-fade-in-up delay-10">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Payment Confirmation
                </p>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    Your bank app will show recipient's full phone number
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    Verify amount and reason before confirming
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    This app does not execute payments - payment occurs in your bank app
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    Phone number is revealed only on payment confirmation
                  </li>
                </ul>
              </div>

              <button
                onClick={() => setShowQR(false)}
                className="text-gray-600 font-medium py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors w-full"
              >
                Hide QR Code
              </button>
            </div>
          )}
        </div>

      </div>

      <div className="editorial-card animate-fade-in-up delay-11">
        <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-3">
          How This Works
        </h2>
        <ol className="space-y-3 text-gray-700">
          <li className="flex items-start">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent text-surface flex items-center justify-center font-bold mr-3">
              1
            </span>
            <span>Click "Show QR Code to Pay" above</span>
          </li>
          <li className="flex items-start">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent text-surface flex items-center justify-center font-bold mr-3">
              2
            </span>
            <span>Open your banking app (DBS digibank, OCBC, UOB, etc.)</span>
          </li>
          <li className="flex items-start">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent text-surface flex items-center justify-center font-bold mr-3">
              3
            </span>
            <span>Use "Scan & Pay" feature to scan QR code</span>
          </li>
          <li className="flex items-start">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent text-surface flex items-center justify-center font-bold mr-3">
              4
            </span>
            <span>Verify amount, reason, and recipient before confirming</span>
          </li>
        </ol>
      </div>

      <div className="editorial-card animate-fade-in-up delay-12">
        <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-3">
          Privacy Notice
        </h2>
        <div className="space-y-2 text-sm text-gray-700">
          <p>
            Your phone number is <strong className="text-accent">masked</strong> on this page. It will
            only be revealed when you scan the QR code in your banking app.
          </p>
          <p>
            This payment request is <strong className="text-accent">intent-scoped</strong> and{' '}
            <strong className="text-accent">time-bound</strong>. It does not reveal your
            permanent phone number publicly.
          </p>
          <p>
            This app is <strong className="text-accent">not</strong> a payment processor. All
            transactions occur within your bank's secure environment.
          </p>
        </div>
      </div>
    </div>
  );
}

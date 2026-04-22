import { useState } from 'react';
import { X, CheckCircle, AlertCircle, Loader2, CreditCard } from 'lucide-react';
import axios from 'axios';

interface PaymentGatewayProps {
  contractId: string;
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
}

const PaymentGateway = ({ contractId, amount, onSuccess, onCancel }: PaymentGatewayProps) => {
  const [loading, setLoading] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'initiate' | 'processing' | 'success' | 'failure'>('initiate');
  const [errorMessage, setErrorMessage] = useState('');
  const [paymentDetails, setPaymentDetails] = useState<any>(null);

  const handlePayment = async () => {
    setLoading(true);
    setPaymentStep('processing');
    setErrorMessage('');

    try {
      // Simulate payment processing delay (1.5 seconds)
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Call mock payment API
      const response = await axios.post('/api/payments/process', {
        contractId,
        amount,
      });

      if (!response.data.success) {
        throw new Error(response.data.message);
      }

      setPaymentDetails(response.data);
      setPaymentStep('success');
      
      // Call onSuccess after showing success message
      setTimeout(() => {
        onSuccess();
      }, 2000);

    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || error.message || 'Payment failed');
      setPaymentStep('failure');
    } finally {
      setLoading(false);
    }
  };

  if (paymentStep === 'success') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Payment Successful!</h2>
          <p className="text-gray-600 mb-4">
            Your payment of <span className="font-bold text-green-600">₹{amount.toLocaleString()}</span> has been processed successfully.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm text-gray-600 mb-2">Payment ID: <span className="font-mono font-bold">{paymentDetails?.paymentId}</span></p>
            <p className="text-sm text-gray-600">Contract Status: <span className="font-bold text-green-600">ACTIVE (Paid)</span></p>
          </div>
          <button
            onClick={onCancel}
            className="btn btn-primary w-full"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  if (paymentStep === 'failure') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-12 h-12 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Payment Failed</h2>
          <p className="text-red-600 mb-6">{errorMessage}</p>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="btn btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              onClick={() => setPaymentStep('initiate')}
              className="btn btn-primary flex-1"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (paymentStep === 'processing') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8 text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Processing Payment</h2>
          <p className="text-gray-600">
            Please wait while we process your payment of <span className="font-bold">₹{amount.toLocaleString()}</span>...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <CreditCard className="w-6 h-6 text-primary-600" />
            <h2 className="text-xl font-bold text-gray-900">Secure Payment</h2>
          </div>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Payment Details */}
        <div className="p-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 mb-1">Contract ID</p>
            <p className="font-mono font-bold text-gray-900">{contractId.substring(0, 12)}...</p>
          </div>

          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-2">Amount to Pay</p>
            <p className="text-4xl font-bold text-primary-600">₹{amount.toLocaleString()}</p>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Secure payment gateway</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Instant confirmation</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Payment receipt will be sent</span>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handlePayment}
            disabled={loading}
            className="btn btn-primary w-full flex items-center justify-center gap-2"
          >
            <CreditCard className="w-5 h-5" />
            {loading ? 'Processing...' : 'Pay Now'}
          </button>

          <p className="text-xs text-gray-500 text-center mt-4">
            This is a demo payment gateway. No real payment will be processed.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentGateway;

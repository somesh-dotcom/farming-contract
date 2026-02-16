import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface PaymentFormProps {
  contractId?: string;
  amount?: number;
  onSubmit: (paymentData: any) => void;
  onCancel: () => void;
}

const PaymentForm = ({ contractId, amount, onSubmit, onCancel }: PaymentFormProps) => {
  const { t } = useTranslation();
  const [paymentData, setPaymentData] = useState({
    paymentMethod: '',
    paymentType: 'OTHER',
    amount: amount || 0,
    reference: '',
  });

  const paymentMethods = [
    { value: 'cash', label: t('transaction.cash') },
    { value: 'bank_transfer', label: t('transaction.bankTransfer') },
    { value: 'upi', label: t('transaction.upi') },
    { value: 'cheque', label: t('transaction.cheque') },
    { value: 'neft', label: t('transaction.neft') },
    { value: 'rtgs', label: t('transaction.rtgs') },
    { value: 'imps', label: t('transaction.imps') },
    { value: 'card', label: t('transaction.card') },
    { value: 'digital_wallet', label: t('transaction.digitalWallet') },
    { value: 'paytm', label: t('transaction.paytm') },
    { value: 'google_pay', label: t('transaction.googlePay') },
    { value: 'amazon_pay', label: t('transaction.amazonPay') },
    { value: 'phonepe', label: t('transaction.phonePe') },
  ];

  const paymentTypes = [
    { value: 'ADVANCE', label: t('transaction.advance') },
    { value: 'PARTIAL', label: t('transaction.partial') },
    { value: 'FINAL', label: t('transaction.final') },
    { value: 'REFUND', label: t('transaction.refund') },
    { value: 'OTHER', label: t('transaction.other') },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setPaymentData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...paymentData,
      contractId,
    });
  };

  return (
    <div className="card p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('transaction.createTransaction')}</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('transaction.selectPaymentMethod')}
            </label>
            <select
              name="paymentMethod"
              value={paymentData.paymentMethod}
              onChange={handleChange}
              className="input w-full"
              required
            >
              <option value="">{t('transaction.selectPaymentMethod')}</option>
              {paymentMethods.map(method => (
                <option key={method.value} value={method.value}>
                  {method.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('transaction.selectPaymentType')}
            </label>
            <select
              name="paymentType"
              value={paymentData.paymentType}
              onChange={handleChange}
              className="input w-full"
              required
            >
              {paymentTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('transaction.enterAmount')}
            </label>
            <input
              type="number"
              name="amount"
              value={paymentData.amount}
              onChange={handleChange}
              className="input w-full"
              min="0"
              step="0.01"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('transaction.paymentReference')}
            </label>
            <input
              type="text"
              name="reference"
              value={paymentData.reference}
              onChange={handleChange}
              className="input w-full"
              placeholder={t('transaction.paymentReference')}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary"
          >
            {t('common.cancel')}
          </button>
          <button
            type="submit"
            className="btn btn-primary"
          >
            {t('transaction.processPayment')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PaymentForm;
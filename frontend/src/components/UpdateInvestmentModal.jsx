import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function UpdateInvestmentModal({ isOpen, onClose, investment, onUpdate }) {
  const [currentValue, setCurrentValue] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (investment) {
      setCurrentValue(investment.currentValue || '');
    }
  }, [investment]);

  if (!isOpen || !investment) {
    return null;
  }

  const handleSave = async (e) => {
    e.preventDefault();
    if (!currentValue || isNaN(currentValue)) {
      alert('Please enter a valid number for the current value.');
      return;
    }

    setLoading(true);
    await onUpdate({
      id: investment.id,
      currentValue: parseFloat(currentValue),
    });
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-4 transform transition-all scale-100 opacity-100">
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Update "{investment.name}"
          </h3>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSave} className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Initial amount invested: <span className="font-medium">RWF {investment.amountInvested?.toLocaleString()}</span>
          </p>
          <div>
            <label htmlFor="currentValue" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              New Current Value (RWF)
            </label>
            <input
              type="number"
              id="currentValue"
              name="currentValue"
              value={currentValue}
              onChange={(e) => setCurrentValue(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm p-2"
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
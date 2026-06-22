import { useState } from 'react';
import type { OrderItem } from '../types';
import { formatByPerson, formatBySummary, copyToClipboard } from '../utils/formatOrder';

interface Props {
  storeName: string;
  items: OrderItem[];
  totalAmount: number;
  totalCups: number;
  userName: string;
  onClose: () => void;
  onCloseGroup: () => void;
}

export default function OrderSummary({ storeName, items, totalAmount, totalCups, userName, onClose, onCloseGroup }: Props) {
  const [copied, setCopied] = useState(false);
  const [format, setFormat] = useState<'person' | 'summary'>('summary');
  const [showConfirmClose, setShowConfirmClose] = useState(false);

  const text = format === 'person'
    ? formatByPerson(storeName, items)
    : formatBySummary(storeName, items, userName);

  const handleCopy = async () => {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" />

      <div
        className="relative w-full max-w-lg max-h-[90dvh] overflow-y-auto bg-white dark:bg-gray-900 
                   rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">📋 訂單彙整</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">✕</button>
        </div>

        {/* Stats */}
        <div className="flex gap-4 mb-5">
          <div className="flex-1 p-3 bg-milk-50 dark:bg-milk-900/20 rounded-xl text-center">
            <div className="text-2xl font-bold text-milk-600 dark:text-milk-400">{totalCups}</div>
            <div className="text-xs text-gray-500">杯</div>
          </div>
          <div className="flex-1 p-3 bg-tea-50 dark:bg-tea-900/20 rounded-xl text-center">
            <div className="text-2xl font-bold text-tea-600 dark:text-tea-400">${totalAmount}</div>
            <div className="text-xs text-gray-500">總計</div>
          </div>
          <div className="flex-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-center">
            <div className="text-2xl font-bold text-gray-600 dark:text-gray-300">
              {new Set(items.map(i => i.personName)).size}
            </div>
            <div className="text-xs text-gray-500">人</div>
          </div>
        </div>

        {/* Format Toggle */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setFormat('person')}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all
              ${format === 'person'
                ? 'bg-milk-500 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
              }`}
          >
            👤 按人分組
          </button>
          <button
            onClick={() => setFormat('summary')}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all
              ${format === 'summary'
                ? 'bg-milk-500 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
              }`}
          >
            🧋 品項彙總
          </button>
        </div>

        {/* Preview */}
        <pre className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm text-gray-700 dark:text-gray-300 
                        whitespace-pre-wrap break-words font-mono leading-relaxed max-h-60 overflow-y-auto">
          {text}
        </pre>

        {/* Actions */}
        <div className="mt-5 space-y-3">
          <button
            onClick={handleCopy}
            className={`w-full py-3.5 rounded-xl font-semibold shadow-lg transition-all duration-200 active:scale-[0.98]
              ${copied
                ? 'bg-tea-500 text-white shadow-tea-500/30'
                : 'bg-gradient-to-r from-milk-500 to-milk-600 hover:from-milk-600 hover:to-milk-700 text-white shadow-milk-500/30'
              }`}
          >
            {copied ? '✅ 已複製！貼到 LINE 吧' : '📋 複製訂單文字'}
          </button>

          {!showConfirmClose ? (
            <button
              onClick={() => setShowConfirmClose(true)}
              className="w-full py-3 rounded-xl text-sm font-medium text-gray-500 dark:text-gray-400
                         bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              🔒 結單並存入歷史紀錄
            </button>
          ) : (
            <div className="flex gap-2 animate-scale-in">
              <button
                onClick={() => setShowConfirmClose(false)}
                className="flex-1 py-3 rounded-xl text-sm font-medium bg-gray-100 dark:bg-gray-800 
                           text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                取消
              </button>
              <button
                onClick={onCloseGroup}
                className="flex-1 py-3 rounded-xl text-sm font-medium bg-red-500 text-white 
                           hover:bg-red-600 shadow-md shadow-red-500/30 transition-colors"
              >
                確定結單
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

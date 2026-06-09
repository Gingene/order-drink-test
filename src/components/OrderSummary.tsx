import { useState } from 'react';
import type { OrderItem } from '../types';
import { formatByPerson, formatBySummary, copyToClipboard } from '../utils/formatOrder';

interface Props {
  storeName: string;
  items: OrderItem[];
  totalAmount: number;
  totalCups: number;
  onClose: () => void;
  onCloseGroup: () => void;
}

export default function OrderSummary({ storeName, items, totalAmount, totalCups, onClose, onCloseGroup }: Props) {
  const [copied, setCopied] = useState(false);
  const [format, setFormat] = useState<'person' | 'summary'>('person');
  const [showConfirmClose, setShowConfirmClose] = useState(false);

  const text = format === 'person'
    ? formatByPerson(storeName, items)
    : formatBySummary(storeName, items);

  const handleCopy = async () => {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const totalPeople = new Set(items.map(i => i.personName)).size;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/55 backdrop-blur-sm animate-fade-in" />

      <div
        className="relative w-full max-w-lg max-h-[90dvh] overflow-y-auto bg-white dark:bg-zinc-900 
                   rounded-t-[28px] sm:rounded-[26px] p-6 shadow-2xl animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-1.5">
            <span className="text-lg">📊</span>
            <h3 className="text-xl font-black text-gray-800 dark:text-zinc-100">團購訂單彙整</h3>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Stats Dashboard Grid */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="p-3 bg-milk-50 dark:bg-milk-900/10 rounded-2xl text-center border border-milk-200/20 shadow-sm relative overflow-hidden">
            <div className="text-2xl font-black text-milk-600 dark:text-milk-400">{totalCups}</div>
            <div className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mt-0.5">總杯數</div>
            <div className="absolute top-0 right-0 w-8 h-8 bg-milk-500/5 rounded-full blur-md"></div>
          </div>
          <div className="p-3 bg-tea-50 dark:bg-tea-900/10 rounded-2xl text-center border border-tea-200/20 shadow-sm relative overflow-hidden">
            <div className="text-2xl font-black text-tea-600 dark:text-tea-400">${totalAmount}</div>
            <div className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mt-0.5">總金額</div>
            <div className="absolute top-0 right-0 w-8 h-8 bg-tea-500/5 rounded-full blur-md"></div>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-zinc-800 rounded-2xl text-center border border-gray-200/40 dark:border-zinc-800/80 shadow-sm relative overflow-hidden">
            <div className="text-2xl font-black text-gray-700 dark:text-zinc-300">{totalPeople}</div>
            <div className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mt-0.5">總人數</div>
            <div className="absolute top-0 right-0 w-8 h-8 bg-gray-500/5 rounded-full blur-md"></div>
          </div>
        </div>

        {/* Toggle Switch Tabs */}
        <div className="flex bg-gray-100 dark:bg-zinc-800 p-1 rounded-xl mb-4 border border-gray-200/20 dark:border-zinc-800/40">
          <button
            onClick={() => setFormat('person')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5
              ${format === 'person'
                ? 'bg-white dark:bg-zinc-800 text-milk-600 dark:text-milk-400 shadow-sm border-t border-white/5 dark:border-zinc-700/20'
                : 'text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-300'
              }`}
          >
            <span>👤</span> 按人分組 (收款用)
          </button>
          <button
            onClick={() => setFormat('summary')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5
              ${format === 'summary'
                ? 'bg-white dark:bg-zinc-800 text-milk-600 dark:text-milk-400 shadow-sm border-t border-white/5 dark:border-zinc-700/20'
                : 'text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-300'
              }`}
          >
            <span>🧋</span> 品項彙總 (點餐用)
          </button>
        </div>

        {/* Receipt Styled Preview Box */}
        <div className="receipt-paper rounded-2xl p-4 mb-6 relative shadow-inner">
          {/* Perforated lines top */}
          <div className="w-full flex justify-between absolute top-0 inset-x-0 overflow-hidden opacity-10">
            {Array.from({ length: 24 }).map((_, i) => (
              <span key={i} className="block w-2.5 h-2.5 rounded-full bg-zinc-900 -mt-1.5"></span>
            ))}
          </div>

          <div className="receipt-divider my-1 pt-1 opacity-20"></div>

          <pre className="text-xs text-gray-800 dark:text-zinc-300 whitespace-pre-wrap break-words font-mono leading-relaxed max-h-56 overflow-y-auto scrollbar-none pr-1">
            {text}
          </pre>

          <div className="receipt-divider my-1 pb-1 opacity-20"></div>

          {/* Perforated lines bottom */}
          <div className="w-full flex justify-between absolute bottom-0 inset-x-0 overflow-hidden opacity-10">
            {Array.from({ length: 24 }).map((_, i) => (
              <span key={i} className="block w-2.5 h-2.5 rounded-full bg-zinc-900 -mb-1.5"></span>
            ))}
          </div>
        </div>

        {/* Action Panel */}
        <div className="space-y-3">
          <button
            onClick={handleCopy}
            className={`w-full py-3.5 rounded-xl font-extrabold text-sm shadow-md transition-all duration-300 active:scale-98 cursor-pointer flex items-center justify-center gap-1.5
              ${copied
                ? 'bg-tea-500 hover:bg-tea-600 text-white shadow-tea-500/20'
                : 'bg-gradient-to-r from-milk-500 to-milk-600 hover:from-milk-600 hover:to-milk-700 text-white shadow-milk-500/20 hover:shadow-lg hover:shadow-milk-500/30'
              }`}
          >
            {copied ? (
              <>
                <span>✅ 已成功複製！貼到 LINE 群吧</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
                <span>複製訂單文字</span>
              </>
            )}
          </button>

          {!showConfirmClose ? (
            <button
              onClick={() => setShowConfirmClose(true)}
              className="w-full py-3 rounded-xl text-xs font-semibold text-gray-500 dark:text-zinc-400
                         bg-gray-50 dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors border border-gray-200/40 dark:border-zinc-800 cursor-pointer"
            >
              🔒 結算訂單並存入歷史紀錄
            </button>
          ) : (
            <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-xl space-y-3 animate-scale-in">
              <p className="text-xs text-red-600 dark:text-red-400 font-semibold text-center">
                ⚠️ 確定結團？結團後將存入歷史，並清空目前點餐車
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowConfirmClose(false)}
                  className="flex-1 py-2.5 rounded-lg text-xs font-bold bg-white dark:bg-zinc-800 
                             text-gray-600 dark:text-zinc-300 border border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  返回
                </button>
                <button
                  onClick={onCloseGroup}
                  className="flex-1 py-2.5 rounded-lg text-xs font-bold bg-red-500 text-white 
                             hover:bg-red-600 shadow-sm shadow-red-500/25 transition-colors cursor-pointer"
                >
                  確認結團
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import {
  CheckCircle2,
  DownloadCloud,
  BookOpen,
  ArrowRight,
  Mail,
  ShieldCheck,
  Package,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { BookCover } from '../components/BookCover';

export const OrderSuccessView: React.FC = () => {
  const {
    currentOrder,
    setCurrentView,
    openPdfViewer,
    downloadBookPdf,
  } = useShop();

  if (!currentOrder) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">No active order found</h2>
        <button
          onClick={() => setCurrentView('catalog')}
          className="px-5 py-2.5 bg-[#00875a] text-white text-xs font-semibold rounded-xl"
        >
          Browse Study Materials
        </button>
      </div>
    );
  }

  const hasDigital = currentOrder.items.some((i) => i.format === 'digital');
  const hasPhysical = currentOrder.items.some((i) => i.format === 'physical');

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Celebration Header */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto ring-8 ring-emerald-50">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 block">
          PAYMENT CONFIRMED & ORDER PLACED
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0a2540] font-['Plus_Jakarta_Sans',sans-serif]">
          Thank You, {currentOrder.shipping.fullName}!
        </h1>
        <p className="text-sm text-slate-600 max-w-md mx-auto">
          We have emailed your receipt and instant download links to{' '}
          <strong className="text-slate-900">{currentOrder.shipping.email}</strong>.
        </p>

        <div className="inline-flex items-center gap-3 px-4 py-2 bg-slate-100 rounded-full text-xs font-medium text-slate-700">
          <span>Order ID: <strong className="font-mono text-slate-900">#{currentOrder.id}</strong></span>
          <span>•</span>
          <span>Date: <strong>{currentOrder.date}</strong></span>
        </div>
      </div>

      {/* Digital Access Section */}
      {hasDigital && (
        <div className="bg-gradient-to-br from-emerald-50/70 via-white to-slate-50 border-2 border-emerald-500/40 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-emerald-100">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                INSTANT ACCESS READY
              </span>
              <h2 className="text-xl font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif] mt-1">
                Your Digital Study Guides & PDFs
              </h2>
            </div>
            <span className="text-xs text-slate-500">Lifetime access & unlimited re-downloads</span>
          </div>

          <div className="space-y-4 pt-2">
            {currentOrder.items
              .filter((i) => i.format === 'digital')
              .map((item) => (
                <div
                  key={`${item.bookId}-digital`}
                  className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs"
                >
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="shrink-0">
                      <BookCover book={item.book} size="sm" showShadow={false} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                        {item.book.title}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {item.book.samplePdfName} • High-Res PDF • Exam Edition 2026
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-emerald-700 font-semibold">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>License Activated for {currentOrder.shipping.email}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => openPdfViewer(item.book)}
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition-colors"
                    >
                      <BookOpen className="w-4 h-4 text-slate-600" />
                      <span>Read Online</span>
                    </button>

                    <button
                      onClick={() => downloadBookPdf(item.book)}
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#00875a] hover:bg-[#00734c] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
                    >
                      <DownloadCloud className="w-4 h-4" />
                      <span>Download PDF</span>
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Physical Delivery Tracking Card */}
      {hasPhysical && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                Physical Printed Book Order
              </h3>
              <p className="text-xs text-slate-500">
                Courier dispatch scheduled within 24 hours. Expected delivery: 3-5 business days.
              </p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl text-xs space-y-1 text-slate-700">
            <div className="font-bold text-slate-900">Shipping Address:</div>
            <div>{currentOrder.shipping.fullName}</div>
            <div>{currentOrder.shipping.addressLine1}, {currentOrder.shipping.addressLine2}</div>
            <div>{currentOrder.shipping.city}, {currentOrder.shipping.state} - {currentOrder.shipping.pinCode}</div>
            <div className="text-slate-500 pt-1">Contact: +91 {currentOrder.shipping.phone}</div>
          </div>
        </div>
      )}

      {/* Order Summary Receipt Box */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif] pb-3 border-b border-slate-100">
          Payment Receipt
        </h3>

        <div className="space-y-2 text-xs text-slate-600">
          <div className="flex justify-between">
            <span>Payment Method</span>
            <span className="font-bold text-slate-900 uppercase">
              {currentOrder.paymentMethod}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Payment Status</span>
            <span className="font-bold text-emerald-700">Paid & Verified</span>
          </div>
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>₹{currentOrder.subtotal}</span>
          </div>
          {currentOrder.discount > 0 && (
            <div className="flex justify-between text-emerald-700 font-semibold">
              <span>Coupon Discount</span>
              <span>-₹{currentOrder.discount}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Delivery</span>
            <span>{currentOrder.deliveryFee > 0 ? `₹${currentOrder.deliveryFee}` : 'FREE'}</span>
          </div>
          <div className="border-t border-slate-200 pt-3 flex justify-between items-baseline">
            <span className="text-sm font-bold text-slate-900">Total Paid</span>
            <span className="text-xl font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
              ₹{currentOrder.total}
            </span>
          </div>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Mail className="w-4 h-4 text-emerald-600" />
            <span>Invoice receipt sent to your email.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentView('orders')}
              className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              View All Orders
            </button>
            <button
              onClick={() => setCurrentView('catalog')}
              className="px-5 py-2 bg-[#00875a] hover:bg-[#00734c] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5"
            >
              <span>Continue Shopping</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

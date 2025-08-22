'use client';

import { useCallback, useEffect, useState } from 'react';

declare global {
  interface Window {
    Razorpay?: any;
  }
}

function loadScript(src: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve(true);
    const s = document.createElement('script');
    s.src = src;
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

export default function RazorpayDonate({
  amountInPaise = 5000,
  label = '❤️ Donate (Razorpay)',
  name = 'Personal Time Advisor',
  description = 'Support the project',
  upiFallback = 'upi://pay?pa=your@upi&pn=PersonalTimeAdvisor&tn=Thanks&cu=INR'
}: {
  amountInPaise?: number;
  label?: string;
  name?: string;
  description?: string;
  upiFallback?: string;
}) {
  const [ready, setReady] = useState(false);
  const key = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

  useEffect(() => {
    loadScript('https://checkout.razorpay.com/v1/checkout.js').then(setReady);
  }, []);

  const openCheckout = useCallback(() => {
    if (!key || !window.Razorpay) {
      window.location.href = upiFallback; // fallback to UPI deep link
      return;
    }

    const options = {
      key,
      amount: amountInPaise, // e.g. 5000 = ₹50.00
      currency: 'INR',
      name,
      description,
      // For production: create order server-side and pass order_id here
      handler: () => {},
      theme: { color: '#22c55e' }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  }, [key, amountInPaise, name, description, upiFallback]);

  return (
    <button
      type="button"
      onClick={openCheckout}
      className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-5 py-3 font-medium shadow-lg ring-1 ring-white/10 disabled:opacity-60 text-white"
      disabled={!ready}
      aria-label="Donate via Razorpay"
    >
      {label}
    </button>
  );
}

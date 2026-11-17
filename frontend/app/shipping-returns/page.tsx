import Link from 'next/link';
import { ArrowRight, RotateCcw, Truck } from 'lucide-react';

const deliveryOptions = [
  { name: 'Standard', timing: '5–7 business days', price: '$12 or free over $300' },
  { name: 'Express', timing: '2–3 business days', price: '$25' },
  { name: 'Overnight', timing: 'Next business day', price: '$45' },
];

export default function ShippingReturnsPage() {
  return (
    <div className="min-h-screen bg-[#F5F1EB] px-6 pb-24 pt-24 text-stone-900 md:px-12 lg:px-20">
      <div className="mx-auto max-w-6xl">
        <header className="border-b border-stone-300 py-14 md:py-20">
          <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#A36D49]">
            The practical details
          </p>
          <h1 className="max-w-3xl font-serif text-5xl font-medium leading-[1.04] tracking-tight md:text-7xl">
            Shipping & returns.
          </h1>
          <p className="mt-6 max-w-xl text-sm leading-7 text-stone-600">
            Delivery choices and current rates are shown below. You’ll see the
            final shipping amount in your order summary before placing an order.
          </p>
        </header>

        <div className="grid gap-12 py-12 md:grid-cols-[0.65fr_1.35fr] md:gap-20 md:py-16">
          <div className="flex items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#E9DED3] text-[#8F5D3F]">
              <Truck size={18} strokeWidth={1.6} />
            </span>
            <div>
              <h2 className="font-serif text-2xl">Delivery</h2>
              <p className="mt-3 text-sm leading-7 text-stone-600">
                Choose the option that suits you at checkout. Delivery timing is
                an estimate in business days.
              </p>
            </div>
          </div>
          <div className="divide-y divide-stone-300 border-y border-stone-300">
            {deliveryOptions.map((option) => (
              <div key={option.name} className="grid gap-2 py-5 sm:grid-cols-[1fr_1fr_auto] sm:items-center">
                <span className="font-medium">{option.name}</span>
                <span className="text-sm text-stone-600">{option.timing}</span>
                <span className="text-sm text-stone-800">{option.price}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-12 border-t border-stone-300 py-12 md:grid-cols-[0.65fr_1.35fr] md:gap-20 md:py-16">
          <div className="flex items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#E9DED3] text-[#8F5D3F]">
              <RotateCcw size={18} strokeWidth={1.6} />
            </span>
            <div>
              <h2 className="font-serif text-2xl">Returns</h2>
              <p className="mt-3 text-sm leading-7 text-stone-600">
                Need help with a return? Get in touch with your order number and
                the team can guide you through the next steps.
              </p>
            </div>
          </div>
          <div className="bg-white/45 p-6 md:p-8">
            <p className="text-sm leading-7 text-stone-600">
              Return eligibility and available options can depend on the item
              and order. Please contact us before sending anything back so we
              can confirm the right process for your purchase.
            </p>
            <Link href="/contact" className="mt-6 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-900 transition-colors hover:text-[#A36D49]">
              Get in touch <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        <p className="border-t border-stone-300 pt-6 text-xs leading-6 text-stone-500">
          Shipping rates and options shown here reflect the current checkout experience and may be updated.
        </p>
      </div>
    </div>
  );
}

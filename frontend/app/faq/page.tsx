import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const faqs = [
  {
    question: 'How does the virtual try-on work?',
    answer: 'Open the Try-On Studio to explore garments on a 3D avatar. You can adjust available colours and sizes to get a visual sense of the silhouette. The preview is a styling aid; the fit of a physical garment can vary.',
  },
  {
    question: 'How do I choose my size?',
    answer: 'Open a product page and use its size guide for fit information. If you are between sizes, compare the garment description and fit notes before ordering.',
  },
  {
    question: 'Can I change a colour or size after adding an item to my bag?',
    answer: 'You can review your selection in the bag. If you need a different option, return to the product page and select the preferred colour and size.',
  },
  {
    question: 'When is standard shipping free?',
    answer: 'Standard shipping is complimentary on orders over $300. For orders of $300 or less, standard shipping is $12. Other available delivery options and their prices are shown at checkout.',
  },
  {
    question: 'Where can I see my order?',
    answer: 'Sign in or create an account to visit your account area. Order information is shown there when available.',
  },
  {
    question: 'How do I start a return?',
    answer: 'Visit the Shipping & Returns page for the current return guidance. If you need help with a specific order, include its order number when you get in touch.',
  },
];

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-[#F5F1EB] px-6 pb-24 pt-24 text-stone-900 md:px-12 lg:px-20">
      <div className="mx-auto max-w-5xl">
        <header className="border-b border-stone-300 py-14 md:py-20">
          <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#A36D49]">
            The helpful details
          </p>
          <h1 className="font-serif text-5xl font-medium tracking-tight md:text-7xl">
            Frequently asked
            <br className="hidden sm:block" /> questions.
          </h1>
          <p className="mt-6 max-w-xl text-sm leading-7 text-stone-600">
            A few useful notes about finding your fit, shopping the collection,
            and what happens after checkout.
          </p>
        </header>

        <div className="divide-y divide-stone-300">
          {faqs.map((faq, index) => (
            <details key={faq.question} className="group py-6 md:py-8">
              <summary className="flex cursor-pointer list-none items-start gap-5 [&::-webkit-details-marker]:hidden">
                <span className="mt-1 text-[10px] font-semibold tracking-[0.2em] text-[#A36D49]">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="flex-1 font-serif text-xl md:text-2xl">{faq.question}</span>
                <span className="mt-1 text-xl leading-none text-stone-500 transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="ml-10 mt-4 max-w-3xl text-sm leading-7 text-stone-600 md:ml-[60px]">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-5 border-t border-stone-300 pt-8 sm:flex-row sm:items-center">
          <p className="font-serif text-xl">Still looking for an answer?</p>
          <Link href="/contact" className="inline-flex items-center gap-2 bg-stone-900 px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-white transition-colors hover:bg-stone-700">
            Visit contact <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}

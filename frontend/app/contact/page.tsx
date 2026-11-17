import Link from 'next/link';
import { ArrowRight, BookOpenText, MessageCircle, PackageCheck, Sparkles } from 'lucide-react';

const contactOptions = [
  {
    icon: PackageCheck,
    title: 'An order question',
    copy: 'Find order details and account options in your personal wardrobe.',
    action: 'Visit your account',
    href: '/account',
  },
  {
    icon: Sparkles,
    title: 'Fit and styling',
    copy: 'Explore a garment, test colourways, and build a look in the virtual studio.',
    action: 'Open the studio',
    href: '/studio',
  },
  {
    icon: MessageCircle,
    title: 'A quick answer',
    copy: 'Browse common questions about the collection, fit, and shopping.',
    action: 'Read the FAQs',
    href: '/faq',
  },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#F5F1EB] px-6 pb-20 pt-24 text-stone-900 md:px-12 md:pb-28 lg:px-20">
      <div className="mx-auto max-w-7xl">
        <div className="border-b border-stone-300 py-14 md:py-20">
          <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#A36D49]">
            We’re here to help
          </p>
          <div className="grid gap-8 md:grid-cols-[1fr_0.65fr] md:items-end">
            <h1 className="max-w-2xl font-serif text-5xl font-medium leading-[1.04] tracking-tight md:text-7xl">
              Let’s find the
              <br />
              right answer.
            </h1>
            <p className="max-w-md text-sm leading-7 text-stone-600 md:justify-self-end">
              Whether you’re choosing a fit or checking in on an order, start
              with the option that best matches what you need.
            </p>
          </div>
        </div>

        <div className="grid gap-4 py-10 md:grid-cols-3 md:gap-6 md:py-14">
          {contactOptions.map(({ icon: Icon, title, copy, action, href }) => (
            <article key={title} className="flex min-h-[260px] flex-col border border-stone-300 bg-white/40 p-6 md:p-8">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#E9DED3] text-[#8F5D3F]">
                <Icon size={18} strokeWidth={1.6} />
              </span>
              <h2 className="mt-7 font-serif text-2xl">{title}</h2>
              <p className="mt-3 flex-1 text-sm leading-6 text-stone-600">{copy}</p>
              <Link href={href} className="mt-7 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-900 transition-colors hover:text-[#A36D49]">
                {action} <ArrowRight size={14} />
              </Link>
            </article>
          ))}
        </div>

        <div className="flex flex-col items-start justify-between gap-5 bg-[#28231F] px-6 py-8 text-[#F5F1EB] md:flex-row md:items-center md:px-10">
          <div className="flex items-start gap-4">
            <BookOpenText size={18} className="mt-1 shrink-0 text-[#D6A27D]" />
            <div>
              <h2 className="font-serif text-xl">Need a little more detail?</h2>
              <p className="mt-1 text-xs leading-6 text-stone-300">
                Browse delivery information or find quick answers in our FAQ.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/faq" className="inline-flex items-center gap-2 border border-white/35 px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] transition-colors hover:bg-white/10">
              Read the FAQs <ArrowRight size={14} />
            </Link>
            <Link href="/shipping-returns" className="inline-flex items-center gap-2 border border-white/35 px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] transition-colors hover:bg-white/10">
              Shipping & returns <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

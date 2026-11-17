import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

const principles = [
  {
    number: '01',
    title: 'Less, with purpose',
    copy: 'We believe the best wardrobe is built slowly: versatile pieces, considered details, and nothing without a reason to be there.',
  },
  {
    number: '02',
    title: 'Feel comes first',
    copy: 'Fabric, weight, and movement matter. We focus on the qualities you notice every time you reach for a piece.',
  },
  {
    number: '03',
    title: 'Make it personal',
    copy: 'Style is individual. Our virtual studio gives you space to explore colour, proportion, and combinations your way.',
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#F5F1EB] pt-24 text-stone-900">
      <section className="px-6 py-16 md:px-12 md:py-24 lg:px-20">
        <div className="mx-auto max-w-7xl">
          <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#A36D49]">
            A wardrobe, considered
          </p>
          <div className="grid items-end gap-8 md:grid-cols-[1.2fr_0.8fr]">
            <h1 className="max-w-3xl font-serif text-5xl font-medium leading-[1.02] tracking-tight md:text-7xl">
              Everyday pieces.
              <br />
              A little more considered.
            </h1>
            <p className="max-w-md pb-1 text-sm leading-7 text-stone-600 md:justify-self-end">
              VARDE is a modern wardrobe shaped by thoughtful design, tactile
              materials, and a more personal way to find your fit.
            </p>
          </div>
          <div className="relative mt-12 aspect-[16/8] overflow-hidden bg-[#D9C6B4] md:mt-16">
            <Image
              src="/images/lookbooks/look-001.jpg"
              alt="A considered VARDE look"
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/35 to-transparent" />
            <span className="absolute bottom-5 left-5 text-[10px] font-medium uppercase tracking-[0.24em] text-white md:bottom-8 md:left-8">
              The art of getting dressed
            </span>
          </div>
        </div>
      </section>

      <section className="bg-white/55 px-6 py-16 md:px-12 md:py-24 lg:px-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 md:grid-cols-[0.7fr_1.3fr] md:gap-20">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#A36D49]">
                What we believe
              </p>
              <h2 className="mt-4 max-w-sm font-serif text-3xl leading-tight md:text-4xl">
                Good design should feel easy to live in.
              </h2>
            </div>
            <div className="divide-y divide-stone-300">
              {principles.map((principle) => (
                <article key={principle.number} className="grid gap-3 py-6 sm:grid-cols-[52px_1fr]">
                  <span className="text-[10px] font-semibold tracking-[0.2em] text-[#A36D49]">
                    {principle.number}
                  </span>
                  <div>
                    <h3 className="font-serif text-xl">{principle.title}</h3>
                    <p className="mt-2 max-w-xl text-sm leading-7 text-stone-600">{principle.copy}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-16 md:px-12 md:py-24 lg:px-20">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 border-t border-stone-300 pt-10 sm:flex-row sm:items-center">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#A36D49]">
              Find your point of view
            </p>
            <h2 className="mt-3 font-serif text-3xl">Make the wardrobe your own.</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/shop" className="inline-flex items-center gap-2 bg-stone-900 px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-white transition-colors hover:bg-stone-700">
              Explore the collection <ArrowRight size={14} />
            </Link>
            <Link href="/studio" className="inline-flex items-center gap-2 border border-stone-400 px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.18em] transition-colors hover:border-stone-900">
              <Sparkles size={14} /> Try the studio
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

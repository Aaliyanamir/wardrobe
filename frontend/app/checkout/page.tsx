'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Check, ShieldCheck } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { createOrder } from '@/lib/api';
import toast from 'react-hot-toast';
import Image from 'next/image';

type Step = 'information' | 'shipping' | 'payment' | 'confirmation';

const steps: { id: Step; label: string }[] = [
  { id: 'information', label: 'Information' },
  { id: 'shipping', label: 'Shipping' },
  { id: 'payment', label: 'Payment' },
  { id: 'confirmation', label: 'Confirmation' },
];

export default function CheckoutPage() {
  const [currentStep, setCurrentStep] = useState<Step>('information');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [confirmedOrderNumber, setConfirmedOrderNumber] = useState('');
  const [isLiveOrder, setIsLiveOrder] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    firstName: 'Alex',
    lastName: 'Morgan',
    email: 'alex.morgan@luxury.com',
    phone: '+1 (555) 234-5678',
    address: '740 Park Avenue',
    city: 'New York',
    state: 'NY',
    zip: '10021',
    shippingMethod: 'standard',
  });

  const { cartItems, cartTotal, clearCart } = useStore();
  const total = cartTotal();

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

  const handleNext = async () => {
    const nextStep = steps[currentStepIndex + 1];
    if (nextStep) {
      if (nextStep.id === 'confirmation') {
        setIsSubmitting(true);
        const shippingCost = total > 300 ? 0 : 12;
        const tax = Math.round(total * 0.08);
        const orderTotal = total + shippingCost + tax;

        const res = await createOrder({
          items: cartItems,
          shippingAddress: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            zip: formData.zip,
          },
          paymentInfo: { method: 'card' },
          subtotal: total,
          shippingCost,
          tax,
          total: orderTotal,
        });

        setConfirmedOrderNumber(res.orderNumber);
        setIsLiveOrder(res.isLive);
        setOrderPlaced(true);
        clearCart();
        setIsSubmitting(false);
        toast.success(`Order ${res.orderNumber} confirmed!`);
        setCurrentStep('confirmation');
        return;
      }
      setCurrentStep(nextStep.id);
    }
  };

  if (orderPlaced && currentStep === 'confirmation') {
    return (
      <div className="min-h-screen bg-studio-white flex items-center justify-center pt-24 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center"
        >
          <div className="w-16 h-16 bg-studio-black rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl">
            <Check size={28} className="text-studio-white" strokeWidth={2} />
          </div>
          <h1 className="text-heading font-light mb-4">Order Confirmed</h1>
          <p className="text-sm text-studio-dark leading-relaxed mb-2">
            Thank you for your order, {formData.firstName}. You&apos;ll receive a confirmation email shortly.
          </p>
          <div className="flex items-center justify-center gap-2 mb-2">
            <p className="text-base font-mono font-semibold text-studio-black">
              Order #{confirmedOrderNumber || 'ORD-894721'}
            </p>
          </div>
          <p className="text-label text-studio-mid mb-10 flex items-center justify-center gap-1.5">
            <ShieldCheck size={14} className="text-green-600" />
            <span>{isLiveOrder ? 'Processed via Live Express REST API' : 'Simulated Order Processed'}</span>
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/account" className="btn-primary flex items-center justify-center gap-2">
              View in My Orders
              <ArrowRight size={14} />
            </Link>
            <Link href="/shop" className="btn-secondary flex items-center justify-center">
              Continue Shopping
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-studio-white pt-24">
      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-12 text-center">
          <Link href="/" className="flex items-center gap-3 justify-center mb-8">
            <div className="w-6 h-6 bg-studio-black" />
            <span className="text-label tracking-widest">WARDROBE</span>
          </Link>

          {/* Step indicators */}
          <div className="flex items-center justify-center gap-0">
            {steps.slice(0, -1).map((step, i) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all duration-300 ${
                      currentStepIndex > i
                        ? 'bg-studio-black text-studio-white'
                        : currentStepIndex === i
                        ? 'border-2 border-studio-black text-studio-black'
                        : 'border border-studio-grey text-studio-mid'
                    }`}
                  >
                    {currentStepIndex > i ? <Check size={14} /> : i + 1}
                  </div>
                  <span className="text-label mt-1 text-studio-dark">{step.label}</span>
                </div>
                {i < steps.length - 2 && (
                  <div className={`w-16 h-px mx-2 mb-4 ${currentStepIndex > i ? 'bg-studio-black' : 'bg-studio-grey'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12">
          {/* Form */}
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            {currentStep === 'information' && (
              <div>
                <h2 className="text-lg font-medium mb-8">Contact Information</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-label text-studio-mid block mb-2">First Name</label>
                      <input className="w-full border border-studio-grey px-4 py-3 text-sm bg-transparent outline-none focus:border-studio-black transition-colors" placeholder="Alex" />
                    </div>
                    <div>
                      <label className="text-label text-studio-mid block mb-2">Last Name</label>
                      <input className="w-full border border-studio-grey px-4 py-3 text-sm bg-transparent outline-none focus:border-studio-black transition-colors" placeholder="Morgan" />
                    </div>
                  </div>
                  <div>
                    <label className="text-label text-studio-mid block mb-2">Email</label>
                    <input type="email" className="w-full border border-studio-grey px-4 py-3 text-sm bg-transparent outline-none focus:border-studio-black transition-colors" placeholder="alex@example.com" />
                  </div>
                  <div>
                    <label className="text-label text-studio-mid block mb-2">Phone</label>
                    <input type="tel" className="w-full border border-studio-grey px-4 py-3 text-sm bg-transparent outline-none focus:border-studio-black transition-colors" placeholder="+1 (555) 000-0000" />
                  </div>
                  <div>
                    <label className="text-label text-studio-mid block mb-2">Address</label>
                    <input className="w-full border border-studio-grey px-4 py-3 text-sm bg-transparent outline-none focus:border-studio-black transition-colors" placeholder="123 Studio Ave" />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-label text-studio-mid block mb-2">City</label>
                      <input className="w-full border border-studio-grey px-4 py-3 text-sm bg-transparent outline-none focus:border-studio-black transition-colors" placeholder="New York" />
                    </div>
                    <div>
                      <label className="text-label text-studio-mid block mb-2">State</label>
                      <input className="w-full border border-studio-grey px-4 py-3 text-sm bg-transparent outline-none focus:border-studio-black transition-colors" placeholder="NY" />
                    </div>
                    <div>
                      <label className="text-label text-studio-mid block mb-2">ZIP</label>
                      <input className="w-full border border-studio-grey px-4 py-3 text-sm bg-transparent outline-none focus:border-studio-black transition-colors" placeholder="10001" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 'shipping' && (
              <div>
                <h2 className="text-lg font-medium mb-8">Shipping Method</h2>
                <div className="space-y-3">
                  {[
                    { id: 'standard', label: 'Standard Shipping', eta: '5–7 business days', price: total > 300 ? 'Free' : '$12' },
                    { id: 'express', label: 'Express Shipping', eta: '2–3 business days', price: '$25' },
                    { id: 'overnight', label: 'Overnight', eta: 'Next business day', price: '$45' },
                  ].map((opt) => (
                    <label
                      key={opt.id}
                      className="flex items-center justify-between p-4 border border-studio-grey cursor-pointer hover:border-studio-black transition-colors peer-checked:border-studio-black"
                    >
                      <div className="flex items-center gap-3">
                        <input type="radio" name="shipping" className="accent-studio-black" defaultChecked={opt.id === 'standard'} />
                        <div>
                          <p className="text-sm font-medium">{opt.label}</p>
                          <p className="text-label text-studio-dark">{opt.eta}</p>
                        </div>
                      </div>
                      <span className="text-sm font-medium">{opt.price}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 'payment' && (
              <div>
                <h2 className="text-lg font-medium mb-8">Payment</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-label text-studio-mid block mb-2">Card Number</label>
                    <input className="w-full border border-studio-grey px-4 py-3 text-sm bg-transparent outline-none focus:border-studio-black transition-colors" placeholder="1234 5678 9012 3456" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-label text-studio-mid block mb-2">Expiry</label>
                      <input className="w-full border border-studio-grey px-4 py-3 text-sm bg-transparent outline-none focus:border-studio-black transition-colors" placeholder="MM / YY" />
                    </div>
                    <div>
                      <label className="text-label text-studio-mid block mb-2">CVC</label>
                      <input className="w-full border border-studio-grey px-4 py-3 text-sm bg-transparent outline-none focus:border-studio-black transition-colors" placeholder="123" />
                    </div>
                  </div>
                  <div>
                    <label className="text-label text-studio-mid block mb-2">Name on Card</label>
                    <input className="w-full border border-studio-grey px-4 py-3 text-sm bg-transparent outline-none focus:border-studio-black transition-colors" placeholder="Alex Morgan" />
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleNext}
              className="mt-8 btn-primary w-full flex items-center justify-center gap-2 group"
            >
              {currentStep === 'payment' ? 'Place Order' : 'Continue'}
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>

          {/* Order Summary */}
          <div className="bg-studio-grey p-6">
            <h3 className="text-sm font-medium mb-6">Order Summary</h3>
            <div className="space-y-4 mb-6">
              {cartItems.map((item) => (
                <div key={`${item.id}-${item.size}`} className="flex gap-3">
                  <div className="relative w-16 h-20 bg-studio-white flex-shrink-0 overflow-hidden">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-studio-dark text-studio-white text-[10px] rounded-full flex items-center justify-center">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium leading-tight">{item.name}</p>
                    <p className="text-label text-studio-dark mt-1">{item.size} · {item.color}</p>
                  </div>
                  <span className="text-xs font-medium">${item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-studio-mid pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-studio-dark">Subtotal</span>
                <span>${total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-studio-dark">Shipping</span>
                <span>{total > 300 ? 'Free' : '$12'}</span>
              </div>
              <div className="flex justify-between text-sm font-medium border-t border-studio-mid pt-3 mt-3">
                <span>Total</span>
                <span>${(total + (total > 300 ? 0 : 12)).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

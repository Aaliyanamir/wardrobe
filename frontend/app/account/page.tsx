'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
  Package,
  Heart,
  User as UserIcon,
  Settings,
  LogOut,
  ShoppingBag,
  Sparkles,
  Trash2,
  ChevronRight,
  Lock,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import {
  loginApi,
  registerApi,
  fetchOrders,
  fetchSavedLooks,
  deleteLookApi,
} from '@/lib/api';
import toast from 'react-hot-toast';

type TabType = 'wardrobe' | 'orders' | 'profile' | 'settings';

const mockOrders = [
  {
    id: 'ORD-001',
    date: 'Nov 10, 2025',
    status: 'Delivered',
    total: 530,
    items: [
      { name: 'Oversized Cotton Poplin Shirt', size: 'M', color: 'Chalk White', price: 185 },
      { name: 'Wide-Leg Japanese Denim', size: '30', color: 'Raw Indigo', price: 345 },
    ],
  },
  {
    id: 'ORD-002',
    date: 'Oct 22, 2025',
    status: 'Delivered',
    total: 695,
    items: [
      { name: 'Double-Faced Wool Blazer', size: 'L', color: 'Camel', price: 695 },
    ],
  },
  {
    id: 'ORD-003',
    date: 'Dec 1, 2025',
    status: 'In Transit',
    total: 275,
    items: [
      { name: 'Fleece-Lined Zip-Up', size: 'M', color: 'Carbon', price: 275 },
    ],
  },
];

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState<TabType>('wardrobe');
  const { savedLooks, deleteLook, loadLook, user, setUser } = useStore();
  const [liveOrders, setLiveOrders] = useState<any[]>(mockOrders);
  const [isLiveOrders, setIsLiveOrders] = useState(false);

  // Authentication form state
  const [isRegistering, setIsRegistering] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authFirstName, setAuthFirstName] = useState('');
  const [authLastName, setAuthLastName] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Load live orders from backend API
  useEffect(() => {
    let mounted = true;
    fetchOrders().then((res) => {
      if (mounted && res.orders.length > 0) {
        // Map API orders to order structure
        const formatted = res.orders.map((o: any) => ({
          id: o.orderNumber || o._id,
          date: new Date(o.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
          status: o.status === 'processing' ? 'Processing' : o.status || 'Delivered',
          total: o.total || o.subtotal,
          items: o.items || [],
        }));
        setLiveOrders(formatted);
        setIsLiveOrders(res.isLive);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail || !authPassword) {
      toast.error('Please enter email and password');
      return;
    }
    setAuthLoading(true);

    if (isRegistering) {
      const res = await registerApi({
        firstName: authFirstName || 'Valued',
        lastName: authLastName || 'Client',
        email: authEmail,
        password: authPassword,
      });
      setUser(res.user);
      toast.success(`Account created! Welcome, ${res.user.name}`);
    } else {
      const res = await loginApi({ email: authEmail, password: authPassword });
      setUser(res.user);
      toast.success(`Welcome back, ${res.user.name}`);
    }
    setAuthLoading(false);
  };

  const statusColor: Record<string, string> = {
    Delivered: 'text-green-600',
    'In Transit': 'text-accent-gold',
    Processing: 'text-blue-600',
  };

  const tabs = [
    { id: 'wardrobe', label: 'My Wardrobe', icon: Heart },
    { id: 'orders', label: 'Orders', icon: UserIcon },
    { id: 'profile', label: 'Profile & VIP', icon: UserIcon },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const;

  return (
    <div className="bg-studio-white min-h-screen pt-24">
      <div className="max-w-[1440px] mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-12">
          <p className="text-label text-studio-mid mb-2">Account</p>
          <div className="flex items-center justify-between">
            <h1 className="text-heading font-light">
              Welcome, {user?.name || 'Guest'}
            </h1>
            <button
              onClick={() => {
                setUser(null);
                toast.success('Signed out');
              }}
              className="flex items-center gap-2 text-label text-studio-dark hover:text-studio-black transition-colors"
            >
              <LogOut size={14} />
              Sign Out
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-10">
          {/* Sidebar Tabs */}
          <nav className="space-y-1">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as TabType)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-all duration-200 ${
                  activeTab === id
                    ? 'bg-studio-black text-studio-white'
                    : 'text-studio-dark hover:text-studio-black hover:bg-studio-grey'
                }`}
              >
                <Icon size={16} strokeWidth={1.5} />
                {label}
              </button>
            ))}
          </nav>

          {/* Content */}
          <div>
            <AnimatePresence mode="wait">
              {/* ===== MY WARDROBE ===== */}
              {activeTab === 'wardrobe' && (
                <motion.div
                  key="wardrobe"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                >
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-lg font-medium">Saved Looks ({savedLooks.length})</h2>
                    <Link
                      href="/studio"
                      className="btn-secondary text-xs flex items-center gap-2"
                    >
                      <Sparkles size={12} />
                      Create New Look
                    </Link>
                  </div>

                  {savedLooks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 border border-studio-grey">
                      <Heart size={40} strokeWidth={1} className="text-studio-mid mb-4" />
                      <p className="text-sm text-studio-dark mb-6">
                        No saved looks yet. Visit the studio to build and save your outfits.
                      </p>
                      <Link href="/studio" className="btn-primary flex items-center gap-2">
                        <Sparkles size={14} />
                        Open Studio
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {savedLooks.map((look) => (
                        <motion.div
                          key={look.id}
                          layout
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="border border-studio-grey p-5 group"
                        >
                          {/* Look preview */}
                          <div className="bg-studio-grey aspect-square mb-4 flex items-center justify-center">
                            <div className="text-studio-mid">
                              <Sparkles size={32} strokeWidth={1} />
                            </div>
                          </div>

                          <h3 className="text-sm font-medium mb-1">{look.name}</h3>
                          <p className="text-label text-studio-mid mb-3">
                            {look.items.length} pieces ·{' '}
                            {new Date(look.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </p>

                          <div className="flex gap-2">
                            <Link
                              href="/studio"
                              onClick={() => loadLook(look)}
                              className="flex-1 text-label text-studio-dark border border-studio-grey py-2 flex items-center justify-center gap-1 hover:border-studio-black transition-colors"
                            >
                              <Sparkles size={11} />
                              Try On
                            </Link>
                            <button
                              onClick={() => {
                                deleteLook(look.id);
                                deleteLookApi(look.id);
                                toast.success('Look deleted');
                              }}
                              className="p-2 border border-studio-grey hover:border-red-400 hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* ===== ORDERS ===== */}
              {activeTab === 'orders' && (
                <motion.div
                  key="orders"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                >
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-lg font-medium">Order History ({liveOrders.length})</h2>
                    {isLiveOrders ? (
                      <span className="flex items-center gap-1.5 text-[10px] uppercase font-mono font-medium text-green-700 bg-green-50 border border-green-200 px-2.5 py-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        Live Express API Synchronized
                      </span>
                    ) : (
                      <span className="text-[10px] uppercase font-mono text-studio-mid bg-studio-grey px-2 py-0.5">
                        Local Sync
                      </span>
                    )}
                  </div>

                  <div className="space-y-4">
                    {liveOrders.map((order) => (
                      <div key={order.id} className="border border-studio-grey p-6">
                        <div className="flex items-start justify-between mb-5">
                          <div>
                            <div className="flex items-center gap-4 mb-1">
                              <span className="text-sm font-medium">{order.id}</span>
                              <span className={`text-label font-medium ${statusColor[order.status] || 'text-studio-dark'}`}>
                                {order.status}
                              </span>
                            </div>
                            <span className="text-label text-studio-mid">{order.date}</span>
                          </div>
                          <span className="text-sm font-medium font-mono">${order.total}</span>
                        </div>

                        <div className="space-y-3">
                          {order.items.map((item: any, i: number) => (
                            <div key={i} className="flex justify-between items-center py-2 border-t border-studio-grey first:border-t-0">
                              <div>
                                <p className="text-sm font-medium text-studio-black">{item.name}</p>
                                <p className="text-label text-studio-dark mt-0.5">
                                  {item.size || 'M'} · {item.color || 'Standard'}
                                </p>
                              </div>
                              <span className="text-sm font-mono">${item.price}</span>
                            </div>
                          ))}
                        </div>

                        <div className="flex gap-3 mt-5 pt-4 border-t border-studio-grey">
                          <button className="btn-ghost text-xs flex items-center gap-1">
                            Track Order
                            <ChevronRight size={12} />
                          </button>
                          <button className="btn-ghost text-xs flex items-center gap-1">
                            Return / Exchange
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* ===== PROFILE & VIP ===== */}
              {activeTab === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="max-w-lg"
                >
                  {user ? (
                    <div>
                      <div className="flex items-center gap-2 mb-6">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[10px] uppercase font-mono tracking-widest text-green-700 font-semibold bg-green-50 border border-green-200 px-2 py-0.5">
                          WARDROBE VIP Client
                        </span>
                      </div>
                      <h2 className="text-lg font-medium mb-8">VIP Client Profile</h2>
                      <div className="space-y-5">
                        <div>
                          <label className="text-label text-studio-mid block mb-2">Full Name</label>
                          <input
                            type="text"
                            defaultValue={user.name}
                            className="w-full border border-studio-grey bg-transparent px-4 py-3 text-sm outline-none focus:border-studio-black transition-colors"
                          />
                        </div>
                        <div>
                          <label className="text-label text-studio-mid block mb-2">Email Address</label>
                          <input
                            type="email"
                            defaultValue={user.email}
                            className="w-full border border-studio-grey bg-transparent px-4 py-3 text-sm outline-none focus:border-studio-black transition-colors"
                          />
                        </div>
                        <div>
                          <label className="text-label text-studio-mid block mb-2">VIP Concierge Service</label>
                          <p className="text-xs text-studio-dark p-3 bg-studio-grey/50 border border-studio-grey">
                            Dedicated 3D fit specialist assigned. Complimentary return pickup & private preview access enabled.
                          </p>
                        </div>
                        <button
                          onClick={() => toast.success('Profile saved!')}
                          className="btn-primary w-full mt-6"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 border border-studio-black/15 bg-studio-white shadow-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Lock size={16} className="text-studio-black" />
                        <span className="text-[10px] tracking-widest uppercase font-semibold text-studio-mid">
                          {isRegistering ? 'Client Registration' : 'Member Sign In'}
                        </span>
                      </div>
                      <h2 className="text-heading font-light mb-2">
                        {isRegistering ? 'Create VIP Account' : 'Welcome Back'}
                      </h2>
                      <p className="text-xs text-studio-dark mb-6">
                        {isRegistering
                          ? 'Join the private atelier to synchronize 3D try-on sessions across devices.'
                          : 'Sign in to access your saved 3D looks, fitting room presets, and order history.'}
                      </p>

                      <form onSubmit={handleAuth} className="space-y-4">
                        {isRegistering && (
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-label text-studio-mid block mb-1">First Name</label>
                              <input
                                type="text"
                                value={authFirstName}
                                onChange={(e) => setAuthFirstName(e.target.value)}
                                placeholder="Claire"
                                className="w-full border border-studio-grey px-3 py-2.5 text-sm bg-transparent outline-none focus:border-studio-black"
                              />
                            </div>
                            <div>
                              <label className="text-label text-studio-mid block mb-1">Last Name</label>
                              <input
                                type="text"
                                value={authLastName}
                                onChange={(e) => setAuthLastName(e.target.value)}
                                placeholder="Laurent"
                                className="w-full border border-studio-grey px-3 py-2.5 text-sm bg-transparent outline-none focus:border-studio-black"
                              />
                            </div>
                          </div>
                        )}

                        <div>
                          <label className="text-label text-studio-mid block mb-1">Email Address</label>
                          <input
                            type="email"
                            value={authEmail}
                            onChange={(e) => setAuthEmail(e.target.value)}
                            placeholder="client@luxury.com"
                            className="w-full border border-studio-grey px-3 py-2.5 text-sm bg-transparent outline-none focus:border-studio-black"
                            required
                          />
                        </div>

                        <div>
                          <label className="text-label text-studio-mid block mb-1">Password</label>
                          <input
                            type="password"
                            value={authPassword}
                            onChange={(e) => setAuthPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full border border-studio-grey px-3 py-2.5 text-sm bg-transparent outline-none focus:border-studio-black"
                            required
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={authLoading}
                          className="w-full btn-primary py-3 flex items-center justify-center gap-2 mt-2"
                        >
                          <ShieldCheck size={16} />
                          <span>
                            {authLoading
                              ? 'Authenticating…'
                              : isRegistering
                              ? 'Register VIP Account'
                              : 'Sign In'}
                          </span>
                        </button>
                      </form>

                      <div className="mt-5 text-center">
                        <button
                          type="button"
                          onClick={() => setIsRegistering(!isRegistering)}
                          className="text-xs text-studio-dark hover:text-studio-black underline"
                        >
                          {isRegistering
                            ? 'Already a VIP Member? Sign In'
                            : "Don't have an account? Register"}
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* ===== SETTINGS ===== */}
              {activeTab === 'settings' && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="max-w-lg"
                >
                  <h2 className="text-lg font-medium mb-8">Preferences</h2>
                  <div className="space-y-6">
                    {[
                      { label: 'Email Notifications', desc: 'New arrivals & exclusive offers', enabled: true },
                      { label: 'SMS Updates', desc: 'Order tracking & delivery alerts', enabled: false },
                      { label: '3D Preview Quality', desc: 'High resolution (may load slower)', enabled: true },
                      { label: 'Save Try-On Sessions', desc: 'Automatically save your studio sessions', enabled: true },
                    ].map((setting) => (
                      <div key={setting.label} className="flex items-center justify-between py-4 border-b border-studio-grey">
                        <div>
                          <p className="text-sm font-medium">{setting.label}</p>
                          <p className="text-label text-studio-dark mt-0.5">{setting.desc}</p>
                        </div>
                        <button
                          className={`w-12 h-6 rounded-full transition-all duration-300 relative ${
                            setting.enabled ? 'bg-studio-black' : 'bg-studio-grey'
                          }`}
                        >
                          <span
                            className={`absolute top-1 w-4 h-4 bg-studio-white rounded-full transition-all duration-300 ${
                              setting.enabled ? 'left-7' : 'left-1'
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

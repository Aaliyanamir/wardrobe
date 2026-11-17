import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/ui/Navbar';
import CartDrawer from '@/components/ui/CartDrawer';
import { Toaster } from 'react-hot-toast';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'WARDROBE — Virtual Try-On Studio',
  description: 'Ultra-modern luxury 3D virtual try-on e-commerce experience',
  keywords: ['fashion', 'virtual try-on', '3D', 'luxury', 'clothing'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-studio-white text-studio-black antialiased">
        <Navbar />
        <CartDrawer />
        <main>{children}</main>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#111111',
              color: '#F5F5F7',
              borderRadius: '0px',
              fontSize: '13px',
              letterSpacing: '0.05em',
            },
          }}
        />
      </body>
    </html>
  );
}

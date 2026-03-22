import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import LayoutWrapper from '@/components/layout/LayoutWrapper';
import { Toaster } from 'sonner';
import './globals.css';
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'STORE - Modern E-commerce for Quality Clothing',
  description: 'Discover our collection of premium T-shirts and pants. Shop the latest trends in men\'s and women\'s fashion.',
  keywords: ['e-commerce', 't-shirts', 'pants', 'fashion', 'clothing', 'online shopping'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn('font-sans', inter.variable)}>
      <body className="min-h-screen">
        <LayoutWrapper>{children}</LayoutWrapper>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}

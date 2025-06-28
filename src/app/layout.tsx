import { Inter } from 'next/font/google';
import './globals.css';
import { PayPalProvider } from '../contexts/PayPalProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Perfectly Styled',
  description: 'AI-powered style consultation',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <PayPalProvider>{children}</PayPalProvider>
      </body>
    </html>
  );
}
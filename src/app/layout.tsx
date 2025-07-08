import { Inter } from 'next/font/google';
import './globals.css';
import { PayPalProvider } from '../contexts/PayPalProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Perfectly Styled',
  description: 'Style consultation',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <PayPalProvider>
          {children}
          <footer className="fixed bottom-4 right-4 text-sm text-muted-foreground z-50">
            <a
              href="https://www.instagram.com/perfectlystyled.co.uk"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              Need help? Message us on Instagram
            </a>
          </footer>
        </PayPalProvider>
      </body>
    </html>
  );
}

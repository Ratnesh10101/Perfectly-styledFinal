import { Inter } from 'next/font/google';
import './globals.css';
import { PayPalProvider } from '../contexts/PayPalProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Perfectly Styled',
  description: 'Automated Style Analysis',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      {/* 👇 add `pb-20` (or whatever size feels right) */}
      <body className={`${inter.className} pb-20`}>
        <PayPalProvider>
          {children}

          {/* fixed footer stays where it is */}
          <footer className="fixed bottom-4 right-4 text-l text-muted-foreground z-50">
            <a
              href="https://www.instagram.com/perfectlystyled.co.uk"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              Need help or have feedback to give? Message us on Instagram
            </a>
          </footer>
        </PayPalProvider>
      </body>
    </html>
  );
}

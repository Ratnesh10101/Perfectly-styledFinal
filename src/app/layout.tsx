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
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full flex flex-col`}>
        <PayPalProvider>
          <main className="flex-grow">
            {children}
          </main>

          {/* Footer now stays at bottom naturally */}
          <footer className="p-4 text-l text-muted-foreground">
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <footer className="fixed bottom-4 right-4 text-sm text-muted-foreground">
          <a
            href="https://www.instagram.com/perfectlystyled.co.uk"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            Need help? Message us on Instagram
          </a>
        </footer>
      </body>
    </html>
  );
}

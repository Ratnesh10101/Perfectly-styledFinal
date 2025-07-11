// src/app/_document.tsx
import { Html, Head, Main, NextScript } from 'next/document';
import { DocumentProps } from 'next/document';

export default function Document(props: DocumentProps) {
  return (
    <Html lang="en">
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

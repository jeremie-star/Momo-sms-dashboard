import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'MoMo Dashboard - Transaction Management',
  description: 'Comprehensive mobile money transaction dashboard for Rwanda',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-poppins antialiased bg-gradient-to-br from-yellow-50 to-white">{children}</body>
    </html>
  );
}
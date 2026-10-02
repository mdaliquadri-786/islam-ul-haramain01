import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { getSiteUrl, SITE_IDENTITY } from '@/lib/seo';

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: SITE_IDENTITY.defaultTitle,
    template: SITE_IDENTITY.titleTemplate
  },
  description: SITE_IDENTITY.defaultDescription,
  applicationName: SITE_IDENTITY.nameEnglish
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" dir="ltr">
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}

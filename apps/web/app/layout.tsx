import { RootLayout } from '@repo/common/components';
import { ReactQueryProvider, RootProvider } from '@repo/common/context';
import { TooltipProvider, cn } from '@repo/ui';
import { GeistMono } from 'geist/font/mono';
import type { Viewport } from 'next';
import { Metadata } from 'next';
import { Bricolage_Grotesque } from 'next/font/google';
import localFont from 'next/font/local';

const bricolage = Bricolage_Grotesque({
    subsets: ['latin'],
    variable: '--font-bricolage',
});

import './globals.css';

export const metadata: Metadata = {
    title: 'Agro Float - Ocean Data Visualization & Analysis Platform',
    description:
        'Advanced ocean data visualization and analysis platform with AI-powered insights for oceanographic research and marine data exploration.',
    keywords: 'ocean data, oceanography, marine data, visualization, AI analysis, research platform',
    authors: [{ name: 'Agro Float Team', url: 'https://agrofloat.com' }],
    creator: 'Agro Float Team',
    publisher: 'Agro Float',
    openGraph: {
        title: 'Agro Float - Ocean Data Visualization & Analysis Platform',
        siteName: 'Agro Float',
        description:
            'Advanced ocean data visualization and analysis platform with AI-powered insights for oceanographic research and marine data exploration.',
        url: 'https://agrofloat.com',
        type: 'website',
        locale: 'en_US',
        images: [
            {
                url: 'https://agrofloat.com/og-image.jpg',
                width: 1200,
                height: 630,
                alt: 'Agro Float Preview',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Agro Float - Ocean Data Visualization & Analysis Platform',
        site: 'agrofloat.com',
        creator: '@agrofloat',
        description:
            'Advanced ocean data visualization and analysis platform with AI-powered insights for oceanographic research and marine data exploration.',
        images: ['https://agrofloat.com/twitter-image.jpg'],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    alternates: {
        canonical: 'https://agrofloat.com',
    },
};

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
};

const inter = localFont({
    src: './InterVariable.woff2',
    variable: '--font-inter',
});

const clash = localFont({
    src: './ClashGrotesk-Variable.woff2',
    variable: '--font-clash',
});

export default function ParentLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="en"
            className={cn(GeistMono.variable, inter.variable, clash.variable, bricolage.variable)}
            suppressHydrationWarning
        >
            <head>
                <link rel="icon" href="/favicon.ico" sizes="any" />

                {/* <script
                    crossOrigin="anonymous"
                    src="//unpkg.com/react-scan/dist/auto.global.js"
                ></script> */}
            </head>
            <body>
                <RootProvider>
                    <TooltipProvider>
                        <ReactQueryProvider>
                            <RootLayout>{children}</RootLayout>
                        </ReactQueryProvider>
                    </TooltipProvider>
                </RootProvider>
            </body>
        </html>
    );
}

import type { Metadata } from 'next';
import { Urbanist, Inter, Cinzel, Diphylleia, Roboto, Merriweather, Spectral, DM_Sans, Quicksand, Dosis, Sono} from "next/font/google";
// import { cookies } from 'next/headers';
import "./globals.css";

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap'});

const urbanist = Urbanist({ 
  subsets: ['latin'],
  weight: ['100', '300'],
  variable: '--font-urbanist',
});

const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-cinzel',
});

const diphylleia = Diphylleia({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-diphylleia',
});

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-roboto',
});

const merriweather = Merriweather({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-merriweather',
});

const spectral = Spectral({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-spectral',
});

const dm_sans = DM_Sans({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-dm-sans',
});

const quicksand = Quicksand({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-quicksand',
});

const dosis = Dosis({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-dosis',
});

const sono = Sono({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-sono',
});

// let savedTheme = cookies().get('color-theme');
// { name: 'color-theme', value: '' }

export const metadata: Metadata = {
  title: {
    default: 'Biblion',
    template: '%s | Biblion'
  },
  openGraph: {
    url: 'https://biblion.karnovah.com',
    type: 'website',
    title: 'Biblion',
    description: 'Word Trainer', 
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${diphylleia.variable} ${cinzel.variable} ${inter.variable} ${urbanist.variable} ${roboto.variable} ${merriweather.variable} ${spectral.variable} ${dm_sans.variable} ${quicksand.variable} ${dosis.variable} ${sono.variable} font-sono`}>{children}
      </body>
    </html>
  );
}

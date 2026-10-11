import type { Metadata, Viewport } from 'next';
import { IBM_Plex_Sans_Thai, Kanit } from 'next/font/google';
import './globals.css';

const thai = IBM_Plex_Sans_Thai({
  variable: '--font-thai',
  subsets: ['thai', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});


const kanit = Kanit({
  variable: '--font-kanit',
  subsets: ['thai', 'latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'ระบบ AI ตรวจวินิจฉัยศัตรูข้าวโพด | มหาวิทยาลัยแม่โจ้',
    template: '%s | ระบบ AI ตรวจวินิจฉัยศัตรูข้าวโพด',
  },
  description:
    'ถ่ายรูปใบหรือฝักข้าวโพดให้ AI ช่วยวินิจฉัยโรคและแมลงศัตรูพืช พร้อมคลังความรู้ สูตรปุ๋ย และปฏิทินดูแลไร่ข้าวโพด อ้างอิงคำแนะนำกรมวิชาการเกษตร',
  keywords: ['ข้าวโพด', 'โรคข้าวโพด', 'แมลงศัตรูข้าวโพด', 'หนอนกระทู้ลายจุด', 'ปุ๋ยข้าวโพด', 'AI เกษตร'],
};

export const viewport: Viewport = {
  themeColor: '#fffaf0',
  width: 'device-width',
  initialScale: 1,
};

type LayoutProps<_T extends string> = { children: React.ReactNode };

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="th" className={`${thai.variable} ${kanit.variable} h-full`}>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}

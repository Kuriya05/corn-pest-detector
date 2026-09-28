import type { Metadata, Viewport } from 'next';
import { Sarabun } from 'next/font/google';
import './globals.css';

const thai = Sarabun({
  variable: '--font-thai',
  subsets: ['thai', 'latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
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
  themeColor: '#1f7d45',
  width: 'device-width',
  initialScale: 1,
};

type LayoutProps<_T extends string> = { children: React.ReactNode };

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="th" className={`${thai.variable} h-full`}>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}

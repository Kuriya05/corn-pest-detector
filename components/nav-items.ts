export type NavItem = {
  href: string;
  label: string;
  short: string;
  icon: string;
  desc: string;
  /** สีประจำหมวด (ค่าสีตรง ๆ เพื่อใช้กับ inline style ได้) */
  cat?: string;
};

export const navItems: NavItem[] = [
  { href: '/', label: 'หน้าหลัก', short: 'หน้าหลัก', icon: 'home', desc: 'ภาพรวมและทางลัดทั้งหมด' },
  { href: '/detect', label: 'สแกนวินิจฉัย', short: 'สแกน', icon: 'scan', desc: 'ถ่ายรูปให้ AI ช่วยวินิจฉัย' },
  { href: '/pests', label: 'แมลงศัตรู', short: 'แมลง', icon: 'bug', desc: 'คลังแมลงและสัตว์ศัตรูข้าวโพด', cat: '#ea580c' },
  { href: '/diseases', label: 'โรคข้าวโพด', short: 'โรค', icon: 'leaf', desc: 'คลังโรคและวินิจฉัยจากอาการ', cat: '#d97706' },
  { href: '/fertilizer', label: 'ปุ๋ย & ธาตุอาหาร', short: 'ปุ๋ย', icon: 'flask', desc: 'สูตรปุ๋ยและเครื่องคำนวณ', cat: '#0284c7' },
  { href: '/calendar', label: 'ดูแลไร่', short: 'ดูแลไร่', icon: 'calendar', desc: 'ปฏิทินและคู่มือจัดการแปลง', cat: '#059669' },
];

export const moreItems: NavItem[] = [
  { href: '/weeds', label: 'วัชพืชในไร่', short: 'วัชพืช', icon: 'sprout', desc: 'จำแนกวัชพืชและวิธีกำจัด', cat: '#65a30d' },
  { href: '/varieties', label: 'พันธุ์ข้าวโพด', short: 'พันธุ์', icon: 'wheat', desc: 'เลือกพันธุ์ให้ตรงกับพื้นที่', cat: '#7c3aed' },
  { href: '/biologicals', label: 'ชีวภัณฑ์ & ศัตรูธรรมชาติ', short: 'ชีวภัณฑ์', icon: 'shield', desc: 'ควบคุมศัตรูพืชแบบปลอดภัย', cat: '#0d9488' },
  { href: '/chemicals', label: 'คลังสารป้องกันกำจัด', short: 'สารเคมี', icon: 'spray', desc: 'ค้นสาร อัตราใช้ และกลุ่มสลับสาร', cat: '#be123c' },
  { href: '/history', label: 'ประวัติการสแกน', short: 'ประวัติ', icon: 'clock', desc: 'ผลตรวจย้อนหลังในเครื่องนี้' },
  { href: '/knowledge', label: 'ค้นหาข้ามทุกคลัง', short: 'ค้นหา', icon: 'book', desc: 'พิมพ์อาการแล้วค้นทุกหมวดพร้อมกัน' },
  { href: '/help', label: 'คู่มือการใช้งาน', short: 'คู่มือ', icon: 'help', desc: 'วิธีถ่ายรูปและใช้ระบบ' },
];

export const allNavItems = [...navItems, ...moreItems];

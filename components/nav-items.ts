export type NavItem = { href: string; label: string; short: string; icon: string; desc: string };

/** เมนูหลัก — เรียงตามลำดับที่เกษตรกรใช้งานจริง */
export const navItems: NavItem[] = [
  { href: '/', label: 'หน้าหลัก', short: 'หน้าหลัก', icon: 'home', desc: 'ภาพรวมและทางลัดทั้งหมด' },
  { href: '/detect', label: 'สแกนวินิจฉัย', short: 'สแกน', icon: 'scan', desc: 'ถ่ายรูปให้ AI ช่วยวินิจฉัย' },
  { href: '/pests', label: 'แมลงศัตรู', short: 'แมลง', icon: 'bug', desc: 'คลังแมลงศัตรูข้าวโพด' },
  { href: '/diseases', label: 'โรคข้าวโพด', short: 'โรค', icon: 'leaf', desc: 'คลังโรคและวินิจฉัยจากอาการ' },
  { href: '/fertilizer', label: 'ปุ๋ย & ธาตุอาหาร', short: 'ปุ๋ย', icon: 'flask', desc: 'สูตรปุ๋ยและเครื่องคำนวณ' },
  { href: '/calendar', label: 'ดูแลไร่', short: 'ดูแลไร่', icon: 'calendar', desc: 'ปฏิทินและคู่มือจัดการแปลง' },
];

export const moreItems: NavItem[] = [
  { href: '/history', label: 'ประวัติการสแกน', short: 'ประวัติ', icon: 'clock', desc: 'ผลตรวจย้อนหลังในเครื่องนี้' },
  { href: '/knowledge', label: 'คลังความรู้รวม', short: 'ความรู้', icon: 'book', desc: 'ค้นหาข้ามทุกหมวด' },
  { href: '/help', label: 'คู่มือการใช้งาน', short: 'คู่มือ', icon: 'help', desc: 'วิธีถ่ายรูปและใช้ระบบ' },
];

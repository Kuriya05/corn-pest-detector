import type { SourceRef } from './types';

/** แหล่งอ้างอิงของคลังสารป้องกันกำจัด */
export const CSRC: Record<string, SourceRef> = {
  r1: { label: 'ศูนย์วิจัยข้าวโพดและข้าวฟ่างแห่งชาติ ม.เกษตรศาสตร์ — โรคที่สำคัญของข้าวโพดและการป้องกันกำจัด', url: 'http://www3.rdi.ku.ac.th/exhibition/50/plant/56_plant/56_plant.html' },
  r10: { label: 'ศูนย์วิจัยพืชไร่นครสวรรค์ — โรคราน้ำค้างข้าวโพด', url: 'https://www.doa.go.th/fc/nakhonsawan/?p=1441' },
  r11: { label: 'ศูนย์วิจัยพืชไร่นครสวรรค์ — ศัตรูธรรมชาติในไร่ข้าวโพด', url: 'https://www.doa.go.th/fc/nakhonsawan/?p=2055' },
  r12: { label: 'ศูนย์วิจัยพืชไร่นครสวรรค์ — หนอนห่อใบข้าวในข้าวโพด', url: 'https://www.doa.go.th/fc/nakhonsawan/?p=2136' },
  r13: { label: 'ศูนย์วิจัยพืชไร่นครสวรรค์ — เพลี้ยอ่อนข้าวโพด', url: 'https://www.doa.go.th/fc/nakhonsawan/?p=2454' },
  r14: { label: 'ศูนย์วิจัยพืชไร่นครสวรรค์ — หนอนกระทู้หอมทำลายข้าวโพด', url: 'https://www.doa.go.th/fc/nakhonsawan/?p=2689' },
  r15: { label: 'ศูนย์วิจัยพืชไร่นครสวรรค์ — มอดดิน ศัตรูข้าวโพดในภาวะแล้ง', url: 'https://www.doa.go.th/fc/nakhonsawan/?p=2870' },
  r16: { label: 'ศูนย์วิจัยพืชไร่นครสวรรค์ — หนู สัตว์ศัตรูสำคัญของข้าวโพดเลี้ยงสัตว์', url: 'https://www.doa.go.th/fc/nakhonsawan/?p=2891' },
  r17: { label: 'ศูนย์วิจัยพืชไร่นครสวรรค์ — การระบาดของโรคใบไหม้แผลเล็ก', url: 'https://www.doa.go.th/fc/nakhonsawan/?p=3793' },
  r18: { label: 'ศูนย์วิจัยพืชไร่นครสวรรค์ — ปลูกข้าวโพดหลังนา ระวังเพลี้ยกระโดดท้องขาว', url: 'https://www.doa.go.th/fc/nakhonsawan/?p=3947' },
  r19: { label: 'ศูนย์วิจัยพืชไร่นครสวรรค์ — หนอนเจาะลำต้นข้าวโพด', url: 'https://www.doa.go.th/fc/nakhonsawan/?p=4451' },
  r2: { label: 'กรมส่งเสริมการเกษตร — เตือนเฝ้าระวังหนอนเจาะฝักข้าวโพด', url: 'https://krabi.doae.go.th/khaophanom/' },
  r20: { label: 'ศูนย์วิจัยพืชไร่นครสวรรค์ — หนอนบุ้งสีน้ำตาล', url: 'https://www.doa.go.th/fc/nakhonsawan/?p=5139' },
  r21: { label: 'กรมวิชาการเกษตร (สวพ.5) — เทคโนโลยีการผลิตข้าวโพดเลี้ยงสัตว์หลังนาในเขตภาคกลาง (2562) บทที่ 4 โรคและแมลงศัตรู', url: 'https://www.doa.go.th/oard5/wp-content/uploads/2019/09/km62.pdf' },
  r22: { label: 'กรมวิชาการเกษตร — คำแนะนำการป้องกันกำจัดแมลง-สัตว์ศัตรูพืชอย่างมีประสิทธิภาพและปลอดภัยจากงานวิจัย (2563)', url: 'https://www.doa.go.th/psco/wp-content/uploads/2020/06/%E0%B8%84%E0%B8%B9%E0%B9%88%E0%B8%A1%E0%B8%B7%E0%B8%AD%E0%B8%84%E0%B8%B3%E0%B9%81%E0%B8%99%E0%B8%B0%E0%B8%99%E0%B8%B3%E0%B8%81%E0%B8%B2%E0%B8%A3%E0%B8%9B%E0%B9%89%E0%B8%AD%E0%B8%87%E0%B8%81%E0%B8%B1%E0%B8%99%E0%B8%81%E0%B8%B3%E0%B8%88%E0%B8%B1%E0%B8%94%E0%B9%81%E0%B8%A1%E0%B8%A5%E0%B8%87-%E0%B8%AA%E0%B8%B1%E0%B8%95%E0%B8%A7%E0%B9%8C%E0%B8%A8%E0%B8%B1%E0%B8%95%E0%B8%A3%E0%B8%B9%E0%B8%9E%E0%B8%B7%E0%B8%8A%E0%B8%AD%E0%B8%A2%E0%B9%88%E0%B8%B2%E0%B8%87%E0%B8%9B%E0%B8%A5%E0%B8%AD%E0%B8%94%E0%B8%A0%E0%B8%B1%E0%B8%A2-%E0%B8%9A%E0%B8%B5%E0%B8%9A%E0%B8%AD%E0%B8%B1%E0%B8%94.pdf' },
  r23: { label: 'กรมวิชาการเกษตร — แมลงศัตรูหลังการเก็บเกี่ยวที่สำคัญ', url: 'https://www.doa.go.th/share/attachment.php?aid=3097' },
  r24: { label: 'ศูนย์วิจัยข้าวโพดและข้าวฟ่างแห่งชาติ ม.เกษตรศาสตร์ — ชีววิธีควบคุมหนอนกระทู้ลายจุด', url: 'https://www3.rdi.ku.ac.th/?p=83660' },
  r3: { label: 'จดหมายข่าวศูนย์วิจัยพืชไร่นครสวรรค์ — โรคราสนิม', url: 'https://nsfcrc-news.blogspot.com/2009/10/blog-post_12.html' },
  r4: { label: 'จดหมายข่าวศูนย์วิจัยพืชไร่นครสวรรค์ — โรคใบไหม้แผลใหญ่ในข้าวโพด', url: 'https://nsfcrc-news.blogspot.com/2015/11/blog-post_13.html' },
  r5: { label: 'กรมส่งเสริมการเกษตร — แยกให้ออก ราน้ำค้าง หรือใบด่างจากไวรัส', url: 'https://ppsf.doae.go.th/' },
  r6: { label: 'กรมส่งเสริมการเกษตร — แจ้งเตือนการระบาดหนอนกระทู้ข้าวโพดลายจุด', url: 'https://secreta.doae.go.th/?p=6436' },
  r7: { label: 'ห้องสมุดเพื่อเกษตรกรไทย ม.เกษตรศาสตร์ — ทำไมข้าวโพดถึงฟันหลอ (เพลี้ยไฟ)', url: 'https://thaifarmer.lib.ku.ac.th/news/5fbf1f821888e30ddbc28deb' },
  r8: { label: 'CABI — Fall Armyworm Field Handbook', url: 'https://www.cabi.org/wp-content/uploads/FAW-pocket-guide.pdf' },
  r9: { label: 'ศูนย์วิจัยพืชไร่นครสวรรค์ — หนอนกระทู้ข้าวโพดลายจุด', url: 'https://www.doa.go.th/fc/nakhonsawan/?p=1332' },
  irac: { label: 'IRAC — Mode of Action Classification Scheme (คณะกรรมการจัดการความต้านทานสารฆ่าแมลงสากล)', url: 'https://irac-online.org/modes-of-action/' },
  frac: { label: 'FRAC — Fungicide Resistance Action Committee Code List', url: 'https://www.frac.info/fungicide-resistance-management/frac-mode-of-action-classification' },
  hrac: { label: 'HRAC — Global Herbicide Mode of Action Classification', url: 'https://hracglobal.com/tools/classification-lookup' },
  doaBan: { label: 'ราชกิจจานุเบกษา — ประกาศกระทรวงอุตสาหกรรม บัญชีรายชื่อวัตถุอันตราย (ฉบับที่ 6) พ.ศ. 2563 กำหนดให้พาราควอตและคลอร์ไพริฟอสเป็นวัตถุอันตรายชนิดที่ 4', url: 'https://ratchakitcha.soc.go.th/' },
};

/** การใช้สาร 1 กรณี — ใช้กับศัตรูพืชชนิดใด อัตราเท่าไร วิธีใด */
export type ChemicalUse = {
  /** ชื่อศัตรูพืช โรค หรือวัชพืชเป้าหมาย */
  target: string;
  /** id ของรายการในคลังแมลง/โรค/วัชพืช เพื่อลิงก์ข้ามหน้า */
  targetId?: string;
  targetType: 'แมลงศัตรูพืช' | 'โรคพืช' | 'วัชพืช' | 'สัตว์ศัตรูพืช';
  formulation?: string;
  rate: string;
  method: string;
  note?: string;
};

/** สารป้องกันกำจัด 1 สารออกฤทธิ์ */
export type ChemicalEntry = {
  id: string;
  /** ชื่อสารออกฤทธิ์ภาษาไทย */
  nameTh: string;
  /** ชื่อสามัญสากล (common name) */
  nameEn: string;
  category: 'สารกำจัดแมลง' | 'สารป้องกันกำจัดโรคพืช' | 'สารกำจัดวัชพืช' | 'สารกำจัดสัตว์ศัตรูพืช' | 'สารรมโรงเก็บ' | 'ชีวภัณฑ์';
  /** กลุ่มสารเคมีตามโครงสร้าง เช่น ไพรีทรอยด์ */
  chemClass?: string;
  /** รหัสกลุ่มกลไกการออกฤทธิ์ IRAC / FRAC / HRAC — ใช้วางแผนสลับกลุ่มสาร */
  group?: string;
  /** กลไกการออกฤทธิ์โดยย่อ */
  mode?: string;
  /** สูตรและความเข้มข้นที่พบในคำแนะนำทางราชการ */
  formulations: string[];
  uses: ChemicalUse[];
  /** ช่วงเวลาหรือจังหวะการใช้ */
  timing?: string;
  warnings?: string[];
  /** true = ห้ามใช้ในข้าวโพด หรือเป็นวัตถุอันตรายชนิดที่ 4 */
  restricted?: boolean;
  restrictedReason?: string;
  sources: SourceRef[];
  matchKeywords: string[];
};

/** สารที่ดึงมาจากคำแนะนำในคลังแมลงและคลังโรค (สารออกฤทธิ์เดียวกันรวมเป็นรายการเดียว) */
export const chemicals: ChemicalEntry[] = [
  {
    id: 'cyantraniliprole-thiamethoxam',
    nameTh: 'ไซแอนทรานิลิโพรล + ไทอะมีทอกแซม',
    nameEn: 'cyantraniliprole + thiamethoxam',
    category: 'สารกำจัดแมลง',
    chemClass: 'สารผสม: ไดอะไมด์ + นีโอนิโคตินอยด์',
    group: 'IRAC 28 + 4A',
    mode: 'กระตุ้นตัวรับไรอะโนดีนร่วมกับกระตุ้นตัวรับนิโคตินิกอะเซทิลโคลีน',
    formulations: [
      '24% FS + 24% FS',
    ],
    uses: [
      { target: 'หนอนกระทู้ข้าวโพดลายจุด', targetId: 'fall-armyworm', targetType: 'แมลงศัตรูพืช', formulation: '24% FS + 24% FS', rate: '7 มล. ต่อเมล็ดพันธุ์ 1 กก. (ข้าวโพดเลี้ยงสัตว์) / 8 มล. (ข้าวโพดหวาน)', method: 'คลุกเมล็ด', note: 'ป้องกันการเข้าทำลายในระยะต้นอ่อน' },
    ],
    sources: [CSRC.r6, CSRC.r8, CSRC.r9, CSRC.r22, CSRC.r24, CSRC.irac],
    matchKeywords: [
      'cyantraniliprole',
      'cyantraniliprole + thiamethoxam',
      'thiamethoxam',
      'ไซแอนทรานิลิโพรล + ไทอะมีทอกแซม',
    ],
  },
  {
    id: 'spinetoram',
    nameTh: 'สไปนีโทแรม',
    nameEn: 'spinetoram',
    category: 'สารกำจัดแมลง',
    chemClass: 'สไปโนซิน',
    group: 'IRAC 5',
    mode: 'ปรับการทำงานของตัวรับนิโคตินิกอะเซทิลโคลีนแบบ allosteric',
    formulations: [
      '12% SC',
      '25% WG',
    ],
    uses: [
      { target: 'หนอนกระทู้ข้าวโพดลายจุด', targetId: 'fall-armyworm', targetType: 'แมลงศัตรูพืช', formulation: '12% SC', rate: '20 มล. ต่อน้ำ 20 ลิตร', method: 'พ่นทางใบ' },
      { target: 'หนอนกระทู้ข้าวโพดลายจุด', targetId: 'fall-armyworm', targetType: 'แมลงศัตรูพืช', formulation: '25% WG', rate: '10 กรัม ต่อน้ำ 20 ลิตร', method: 'พ่นทางใบ' },
    ],
    warnings: [
      'ห้ามใช้ติดต่อกันเกิน 2–3 ครั้ง ควรสลับกับสารต่างกลุ่มเพื่อชะลอความต้านทานของหนอนกระทู้ลายจุด',
    ],
    sources: [CSRC.r6, CSRC.r8, CSRC.r9, CSRC.r22, CSRC.r24, CSRC.irac],
    matchKeywords: [
      'spinetoram',
      'สไปนีโทแรม',
    ],
  },
  {
    id: 'emamectin-benzoate',
    nameTh: 'อีมาเมกตินเบนโซเอต',
    nameEn: 'emamectin benzoate',
    category: 'สารกำจัดแมลง',
    chemClass: 'อะเวอร์เมกติน',
    group: 'IRAC 6',
    mode: 'กระตุ้นช่องคลอไรด์ที่ควบคุมด้วยกลูตาเมต ทำให้หนอนหยุดกินและเป็นอัมพาต',
    formulations: [
      '1.92% EC',
      '5% WG',
    ],
    uses: [
      { target: 'หนอนกระทู้ข้าวโพดลายจุด', targetId: 'fall-armyworm', targetType: 'แมลงศัตรูพืช', formulation: '1.92% EC', rate: '20 มล. ต่อน้ำ 20 ลิตร', method: 'พ่นทางใบ' },
      { target: 'หนอนกระทู้ข้าวโพดลายจุด', targetId: 'fall-armyworm', targetType: 'แมลงศัตรูพืช', formulation: '5% WG', rate: '10 กรัม ต่อน้ำ 20 ลิตร', method: 'พ่นทางใบ' },
      { target: 'เพลี้ยอ่อนข้าวโพด', targetId: 'corn-aphid', targetType: 'แมลงศัตรูพืช', formulation: '1.92% EC', rate: '10 มล. ต่อน้ำ 20 ลิตร', method: 'พ่นทางใบ' },
      { target: 'เพลี้ยอ่อนอ้อย', targetId: 'sugarcane-aphid', targetType: 'แมลงศัตรูพืช', formulation: '1.92% EC', rate: '10 มล. ต่อน้ำ 20 ลิตร', method: 'พ่นทางใบ' },
      { target: 'หนอนบุ้งสีน้ำตาล', targetId: 'wasp-moth-larva', targetType: 'แมลงศัตรูพืช', formulation: '1.92% EC', rate: '20 มล. ต่อน้ำ 20 ลิตร', method: 'พ่นทางใบ' },
      { target: 'หนอนบุ้งสีน้ำตาล', targetId: 'wasp-moth-larva', targetType: 'แมลงศัตรูพืช', formulation: '5% WG', rate: '10 กรัม ต่อน้ำ 20 ลิตร', method: 'พ่นทางใบ' },
    ],
    warnings: [
      'เป็นพิษต่อสัตว์น้ำสูง ห้ามล้างถังพ่นลงแหล่งน้ำ',
      'สลับกลุ่มสารเพื่อชะลอความต้านทาน',
    ],
    sources: [CSRC.r6, CSRC.r8, CSRC.r9, CSRC.r11, CSRC.r13, CSRC.r20, CSRC.r22, CSRC.r24, CSRC.irac],
    matchKeywords: [
      'emamectin benzoate',
      'อีมาเมกตินเบนโซเอต',
    ],
  },
  {
    id: 'chlorfenapyr',
    nameTh: 'คลอร์ฟีนาเพอร์',
    nameEn: 'chlorfenapyr',
    category: 'สารกำจัดแมลง',
    chemClass: 'ไพร์โรล',
    group: 'IRAC 13',
    mode: 'ตัดการสร้างพลังงาน ATP ในไมโทคอนเดรีย (uncoupler)',
    formulations: [
      '10% SC',
    ],
    uses: [
      { target: 'หนอนกระทู้ข้าวโพดลายจุด', targetId: 'fall-armyworm', targetType: 'แมลงศัตรูพืช', formulation: '10% SC', rate: '30 มล. ต่อน้ำ 20 ลิตร', method: 'พ่นทางใบ' },
    ],
    sources: [CSRC.r6, CSRC.r8, CSRC.r9, CSRC.r22, CSRC.r24, CSRC.irac],
    matchKeywords: [
      'chlorfenapyr',
      'คลอร์ฟีนาเพอร์',
    ],
  },
  {
    id: 'indoxacarb',
    nameTh: 'อินดอกซาคาร์บ',
    nameEn: 'indoxacarb',
    category: 'สารกำจัดแมลง',
    chemClass: 'ออกซาไดอะซีน',
    group: 'IRAC 22A',
    mode: 'ปิดกั้นช่องโซเดียมของเส้นประสาท',
    formulations: [
      '15% EC',
    ],
    uses: [
      { target: 'หนอนกระทู้ข้าวโพดลายจุด', targetId: 'fall-armyworm', targetType: 'แมลงศัตรูพืช', formulation: '15% EC', rate: '30 มล. ต่อน้ำ 20 ลิตร', method: 'พ่นทางใบ', note: 'เอกสารบางฉบับระบุเป็น 15% SC อัตราเท่ากัน — ให้ยึดตามฉลากผลิตภัณฑ์' },
    ],
    sources: [CSRC.r6, CSRC.r8, CSRC.r9, CSRC.r22, CSRC.r24, CSRC.irac],
    matchKeywords: [
      'indoxacarb',
      'อินดอกซาคาร์บ',
    ],
  },
  {
    id: 'methoxyfenozide-spinetoram',
    nameTh: 'เมทอกซีฟีโนไซด์ + สไปนีโทแรม',
    nameEn: 'methoxyfenozide + spinetoram',
    category: 'สารกำจัดแมลง',
    chemClass: 'สารผสม: ไดอะซิลไฮดราซีน + สไปโนซิน',
    group: 'IRAC 18 + 5',
    mode: 'เร่งการลอกคราบผิดปกติร่วมกับพิษต่อระบบประสาท',
    formulations: [
      '30% + 6% SC',
    ],
    uses: [
      { target: 'หนอนกระทู้ข้าวโพดลายจุด', targetId: 'fall-armyworm', targetType: 'แมลงศัตรูพืช', formulation: '30% + 6% SC', rate: '30 มล. ต่อน้ำ 20 ลิตร', method: 'พ่นทางใบ' },
    ],
    sources: [CSRC.r6, CSRC.r8, CSRC.r9, CSRC.r22, CSRC.r24, CSRC.irac],
    matchKeywords: [
      'methoxyfenozide',
      'methoxyfenozide + spinetoram',
      'spinetoram',
      'เมทอกซีฟีโนไซด์ + สไปนีโทแรม',
    ],
  },
  {
    id: 'chlorantraniliprole',
    nameTh: 'คลอแรนทรานิลิโพรล',
    nameEn: 'chlorantraniliprole',
    category: 'สารกำจัดแมลง',
    chemClass: 'ไดอะไมด์',
    group: 'IRAC 28',
    mode: 'กระตุ้นตัวรับไรอะโนดีน ทำให้กล้ามเนื้อหนอนหดเกร็ง',
    formulations: [
      '5.17% SC',
    ],
    uses: [
      { target: 'หนอนกระทู้ข้าวโพดลายจุด', targetId: 'fall-armyworm', targetType: 'แมลงศัตรูพืช', formulation: '5.17% SC', rate: '30 มล. ต่อน้ำ 20 ลิตร', method: 'พ่นทางใบ' },
    ],
    warnings: [
      'ไดอะไมด์ (IRAC 28) หนอนกระทู้ลายจุดในหลายประเทศเริ่มต้านทาน ห้ามใช้ซ้ำเกิน 2 ครั้งติดต่อกัน',
    ],
    sources: [CSRC.r6, CSRC.r8, CSRC.r9, CSRC.r22, CSRC.r24, CSRC.irac],
    matchKeywords: [
      'chlorantraniliprole',
      'คลอแรนทรานิลิโพรล',
    ],
  },
  {
    id: 'flubendiamide',
    nameTh: 'ฟลูเบนไดอะไมด์',
    nameEn: 'flubendiamide',
    category: 'สารกำจัดแมลง',
    chemClass: 'ไดอะไมด์',
    group: 'IRAC 28',
    mode: 'กระตุ้นตัวรับไรอะโนดีน',
    formulations: [
      '20% WG',
    ],
    uses: [
      { target: 'หนอนกระทู้ข้าวโพดลายจุด', targetId: 'fall-armyworm', targetType: 'แมลงศัตรูพืช', formulation: '20% WG', rate: '10 กรัม ต่อน้ำ 20 ลิตร', method: 'พ่นทางใบ' },
    ],
    warnings: [
      'ไดอะไมด์ (IRAC 28) ห้ามใช้สลับกับคลอแรนทรานิลิโพรลเพราะเป็นกลุ่มเดียวกัน',
    ],
    sources: [CSRC.r6, CSRC.r8, CSRC.r9, CSRC.r22, CSRC.r24, CSRC.irac],
    matchKeywords: [
      'flubendiamide',
      'ฟลูเบนไดอะไมด์',
    ],
  },
  {
    id: 'deltamethrin',
    nameTh: 'เดลทาเมทริน',
    nameEn: 'deltamethrin',
    category: 'สารกำจัดแมลง',
    chemClass: 'ไพรีทรอยด์',
    group: 'IRAC 3A',
    mode: 'รบกวนช่องโซเดียมของเส้นประสาท ออกฤทธิ์ถูกตัวตาย',
    formulations: [
      '3% EC',
    ],
    uses: [
      { target: 'หนอนเจาะลำต้นข้าวโพด', targetId: 'corn-borer', targetType: 'แมลงศัตรูพืช', formulation: '3% EC', rate: '10 มล. ต่อน้ำ 20 ลิตร', method: 'พ่นทางใบ' },
    ],
    warnings: [
      'ไพรีทรอยด์เป็นพิษสูงต่อผึ้ง ตัวห้ำ และสัตว์น้ำ',
    ],
    sources: [CSRC.r19, CSRC.r22, CSRC.irac],
    matchKeywords: [
      'deltamethrin',
      'เดลทาเมทริน',
    ],
  },
  {
    id: 'triflumuron',
    nameTh: 'ไตรฟลูมูรอน',
    nameEn: 'triflumuron',
    category: 'สารกำจัดแมลง',
    chemClass: 'เบนโซอิลยูเรีย (IGR)',
    group: 'IRAC 15',
    mode: 'ยับยั้งการสร้างไคติน ทำให้หนอนลอกคราบไม่สำเร็จ',
    formulations: [
      '25% WP',
    ],
    uses: [
      { target: 'หนอนเจาะลำต้นข้าวโพด', targetId: 'corn-borer', targetType: 'แมลงศัตรูพืช', formulation: '25% WP', rate: '30 กรัม ต่อน้ำ 20 ลิตร', method: 'พ่นทางใบ' },
    ],
    sources: [CSRC.r19, CSRC.r22, CSRC.irac],
    matchKeywords: [
      'triflumuron',
      'ไตรฟลูมูรอน',
    ],
  },
  {
    id: 'teflubenzuron',
    nameTh: 'เทฟลูเบนซูรอน',
    nameEn: 'teflubenzuron',
    category: 'สารกำจัดแมลง',
    chemClass: 'เบนโซอิลยูเรีย (IGR)',
    group: 'IRAC 15',
    mode: 'ยับยั้งการสร้างไคติน',
    formulations: [
      '5% EC',
    ],
    uses: [
      { target: 'หนอนเจาะลำต้นข้าวโพด', targetId: 'corn-borer', targetType: 'แมลงศัตรูพืช', formulation: '5% EC', rate: '25 มล. ต่อน้ำ 20 ลิตร', method: 'พ่นทางใบ' },
    ],
    sources: [CSRC.r19, CSRC.r22, CSRC.irac],
    matchKeywords: [
      'teflubenzuron',
      'เทฟลูเบนซูรอน',
    ],
  },
  {
    id: 'chlorfluazuron',
    nameTh: 'คลอร์ฟลูอาซูรอน',
    nameEn: 'chlorfluazuron',
    category: 'สารกำจัดแมลง',
    chemClass: 'เบนโซอิลยูเรีย (IGR)',
    group: 'IRAC 15',
    mode: 'ยับยั้งการสร้างไคติน',
    formulations: [
      '5% EC',
    ],
    uses: [
      { target: 'หนอนเจาะลำต้นข้าวโพด', targetId: 'corn-borer', targetType: 'แมลงศัตรูพืช', formulation: '5% EC', rate: '25 มล. ต่อน้ำ 20 ลิตร', method: 'พ่นทางใบ' },
      { target: 'หนอนกระทู้หอม', targetId: 'beet-armyworm', targetType: 'แมลงศัตรูพืช', formulation: '5% EC', rate: '30 มล. ต่อน้ำ 20 ลิตร', method: 'พ่นทางใบ' },
    ],
    sources: [CSRC.r14, CSRC.r19, CSRC.r22, CSRC.irac],
    matchKeywords: [
      'chlorfluazuron',
      'คลอร์ฟลูอาซูรอน',
    ],
  },
  {
    id: 'fipronil',
    nameTh: 'ฟิโพรนิล',
    nameEn: 'fipronil',
    category: 'สารกำจัดแมลง',
    chemClass: 'ฟีนิลไพราโซล',
    group: 'IRAC 2B',
    mode: 'ปิดกั้นช่องคลอไรด์ที่ควบคุมด้วย GABA',
    formulations: [
      '5% SC',
    ],
    uses: [
      { target: 'หนอนเจาะลำต้นข้าวโพด', targetId: 'corn-borer', targetType: 'แมลงศัตรูพืช', formulation: '5% SC', rate: '20 มล. ต่อน้ำ 20 ลิตร', method: 'พ่นทางใบ', note: 'มีพิษร้ายแรงต่อแมลงหางหนีบซึ่งเป็นตัวห้ำสำคัญ' },
      { target: 'หนอนเจาะฝักข้าวโพด', targetId: 'corn-earworm', targetType: 'แมลงศัตรูพืช', formulation: '5% SC', rate: '20 มล. ต่อน้ำ 20 ลิตร', method: 'พ่นทางใบ', note: 'พ่นเฉพาะบริเวณฝัก' },
      { target: 'เพลี้ยไฟ', targetId: 'thrips', targetType: 'แมลงศัตรูพืช', formulation: '5% SC', rate: '15 มล. ต่อน้ำ 20 ลิตร', method: 'พ่นทางใบ' },
      { target: 'หนอนห่อใบข้าว (ในข้าวโพด)', targetId: 'leaf-folder', targetType: 'แมลงศัตรูพืช', formulation: '5% SC', rate: '30–50 มล. ต่อน้ำ 20 ลิตร', method: 'พ่นทางใบ' },
    ],
    warnings: [
      'มีพิษร้ายแรงต่อแมลงหางหนีบและมวนตัวห้ำซึ่งเป็นศัตรูธรรมชาติสำคัญในไร่ข้าวโพด ใช้เฉพาะเมื่อจำเป็นจริง',
      'เป็นพิษสูงต่อผึ้งและสัตว์น้ำ ห้ามพ่นใกล้แหล่งน้ำ',
    ],
    sources: [CSRC.r2, CSRC.r7, CSRC.r12, CSRC.r19, CSRC.r22, CSRC.irac],
    matchKeywords: [
      'fipronil',
      'ฟิโพรนิล',
    ],
  },
  {
    id: 'flufenoxuron',
    nameTh: 'ฟลูเฟนนอกซูรอน',
    nameEn: 'flufenoxuron',
    category: 'สารกำจัดแมลง',
    chemClass: 'เบนโซอิลยูเรีย (IGR)',
    group: 'IRAC 15',
    mode: 'ยับยั้งการสร้างไคติน',
    formulations: [
      '5% EC',
    ],
    uses: [
      { target: 'หนอนเจาะฝักข้าวโพด', targetId: 'corn-earworm', targetType: 'แมลงศัตรูพืช', formulation: '5% EC', rate: '20 มล. ต่อน้ำ 20 ลิตร', method: 'พ่นทางใบ', note: 'พ่นเฉพาะบริเวณฝัก' },
      { target: 'หนอนกระทู้หอม', targetId: 'beet-armyworm', targetType: 'แมลงศัตรูพืช', formulation: '5% EC', rate: '30 มล. ต่อน้ำ 20 ลิตร', method: 'พ่นทางใบ' },
    ],
    sources: [CSRC.r2, CSRC.r14, CSRC.r22, CSRC.irac],
    matchKeywords: [
      'flufenoxuron',
      'ฟลูเฟนนอกซูรอน',
    ],
  },
  {
    id: 'carbaryl',
    nameTh: 'คาร์บาริล',
    nameEn: 'carbaryl',
    category: 'สารกำจัดแมลง',
    chemClass: 'คาร์บาเมต',
    group: 'IRAC 1A',
    mode: 'ยับยั้งเอนไซม์อะเซทิลโคลีนเอสเทอเรส',
    formulations: [
      '85% WP',
    ],
    uses: [
      { target: 'เพลี้ยอ่อนข้าวโพด', targetId: 'corn-aphid', targetType: 'แมลงศัตรูพืช', formulation: '85% WP', rate: '50 กรัม ต่อน้ำ 20 ลิตร', method: 'พ่นทางใบ' },
      { target: 'เพลี้ยไฟ', targetId: 'thrips', targetType: 'แมลงศัตรูพืช', formulation: '85% WP', rate: '40 กรัม ต่อน้ำ 20 ลิตร', method: 'พ่นทางใบ' },
      { target: 'หนอนกระทู้คอรวง', targetId: 'oriental-armyworm', targetType: 'แมลงศัตรูพืช', formulation: '85% WP', rate: '45 กรัม ต่อน้ำ 20 ลิตร', method: 'พ่นทางใบ' },
      { target: 'ตั๊กแตน', targetId: 'grasshopper', targetType: 'แมลงศัตรูพืช', formulation: '85% WP', rate: 'คาร์บาริล 125 กรัม + น้ำ 20 ลิตร + กากน้ำตาล 2 ลิตร + แกลบ 60 ลิตร + ซังข้าวโพด 30 ลิตร', method: 'เหยื่อพิษ', note: 'เหยื่อพิษกำจัดตัวเต็มวัย — วางกลางวันเป็นแนวกว้าง 1 เมตร แต่ละแนวห่างกัน ~40 เมตร เริ่มจากด้านเหนือลม' },
      { target: 'ตั๊กแตน', targetId: 'grasshopper', targetType: 'แมลงศัตรูพืช', formulation: '85% WP', rate: '25 กรัม ต่อน้ำ 20 ลิตร', method: 'พ่นทางใบ', note: 'กำจัดตัวอ่อน' },
      { target: 'ด้วงกุหลาบ', targetId: 'rose-beetle', targetType: 'แมลงศัตรูพืช', formulation: '85% WP', rate: '40 กรัม ต่อน้ำ 20 ลิตร', method: 'พ่นทางใบ' },
      { target: 'เพลี้ยกระโดดดำ', targetId: 'black-planthopper', targetType: 'แมลงศัตรูพืช', formulation: '85% WP', rate: '40 กรัม ต่อน้ำ 20 ลิตร', method: 'พ่นทางใบ' },
      { target: 'เพลี้ยกระโดดท้องขาว', targetId: 'white-bellied-planthopper', targetType: 'แมลงศัตรูพืช', formulation: '85% WP', rate: '20 กรัม ต่อน้ำ 20 ลิตร', method: 'พ่นทางใบ' },
      { target: 'เพลี้ยอ่อนอ้อย', targetId: 'sugarcane-aphid', targetType: 'แมลงศัตรูพืช', formulation: '85% WP', rate: '50 กรัม ต่อน้ำ 20 ลิตร', method: 'พ่นทางใบ' },
    ],
    warnings: [
      'เป็นพิษสูงต่อผึ้ง หลีกเลี่ยงการพ่นช่วงข้าวโพดออกดอกตัวผู้ในเวลากลางวัน',
      'ทำลายตัวห้ำตัวเบียนในแปลง ควรใช้เมื่อถึงระดับเศรษฐกิจเท่านั้น',
    ],
    sources: [CSRC.r7, CSRC.r11, CSRC.r13, CSRC.r18, CSRC.r22, CSRC.irac],
    matchKeywords: [
      'carbaryl',
      'คาร์บาริล',
    ],
  },
  {
    id: 'beta-cyfluthrin',
    nameTh: 'เบตา-ไซฟลูทริน',
    nameEn: 'beta-cyfluthrin',
    category: 'สารกำจัดแมลง',
    chemClass: 'ไพรีทรอยด์',
    group: 'IRAC 3A',
    mode: 'รบกวนช่องโซเดียมของเส้นประสาท',
    formulations: [
      '2.5% EC',
    ],
    uses: [
      { target: 'เพลี้ยอ่อนข้าวโพด', targetId: 'corn-aphid', targetType: 'แมลงศัตรูพืช', formulation: '2.5% EC', rate: '40 มล. ต่อน้ำ 20 ลิตร', method: 'พ่นทางใบ' },
      { target: 'หนอนกระทู้หอม', targetId: 'beet-armyworm', targetType: 'แมลงศัตรูพืช', formulation: '2.5% EC', rate: '40 มล. ต่อน้ำ 20 ลิตร', method: 'พ่นทางใบ' },
      { target: 'เพลี้ยอ่อนอ้อย', targetId: 'sugarcane-aphid', targetType: 'แมลงศัตรูพืช', formulation: '2.5% EC', rate: '40 มล. ต่อน้ำ 20 ลิตร', method: 'พ่นทางใบ' },
    ],
    warnings: [
      'ไพรีทรอยด์เป็นพิษสูงต่อผึ้ง ตัวห้ำ และสัตว์น้ำ',
    ],
    sources: [CSRC.r11, CSRC.r13, CSRC.r14, CSRC.r22, CSRC.irac],
    matchKeywords: [
      'beta-cyfluthrin',
      'เบตา-ไซฟลูทริน',
    ],
  },
  {
    id: 'diazinon',
    nameTh: 'ไดอะซินอน',
    nameEn: 'diazinon',
    category: 'สารกำจัดแมลง',
    chemClass: 'ออร์กาโนฟอสเฟต',
    group: 'IRAC 1B',
    mode: 'ยับยั้งเอนไซม์อะเซทิลโคลีนเอสเทอเรส',
    formulations: [
      '60% EC',
    ],
    uses: [
      { target: 'เพลี้ยอ่อนข้าวโพด', targetId: 'corn-aphid', targetType: 'แมลงศัตรูพืช', formulation: '60% EC', rate: '15 มล. ต่อน้ำ 20 ลิตร', method: 'พ่นทางใบ' },
      { target: 'ตั๊กแตน', targetId: 'grasshopper', targetType: 'แมลงศัตรูพืช', formulation: '60% EC', rate: '20 มล. ต่อน้ำ 20 ลิตร', method: 'พ่นทางใบ' },
      { target: 'เพลี้ยอ่อนอ้อย', targetId: 'sugarcane-aphid', targetType: 'แมลงศัตรูพืช', formulation: '60% EC', rate: '15 มล. ต่อน้ำ 20 ลิตร', method: 'พ่นทางใบ' },
    ],
    warnings: [
      'ออร์กาโนฟอสเฟตพิษเฉียบพลันสูง ต้องสวมอุปกรณ์ป้องกันครบ',
      'เป็นพิษต่อผึ้งและสัตว์น้ำ',
    ],
    sources: [CSRC.r11, CSRC.r13, CSRC.r22, CSRC.irac],
    matchKeywords: [
      'diazinon',
      'ไดอะซินอน',
    ],
  },
  {
    id: 'thiamethoxam',
    nameTh: 'ไทอะมีทอกแซม',
    nameEn: 'thiamethoxam',
    category: 'สารกำจัดแมลง',
    chemClass: 'นีโอนิโคตินอยด์',
    group: 'IRAC 4A',
    mode: 'กระตุ้นตัวรับนิโคตินิกอะเซทิลโคลีน ดูดซึมเข้าต้นพืช',
    formulations: [
      '35% FS',
      '25% WG',
      '25% WP',
    ],
    uses: [
      { target: 'เพลี้ยไฟ', targetId: 'thrips', targetType: 'แมลงศัตรูพืช', formulation: '35% FS', rate: '5 มล. ต่อเมล็ดพันธุ์ 1 กก.', method: 'คลุกเมล็ด' },
      { target: 'เพลี้ยไฟ', targetId: 'thrips', targetType: 'แมลงศัตรูพืช', formulation: '25% WG', rate: '10 กรัม ต่อน้ำ 20 ลิตร', method: 'พ่นทางใบ' },
      { target: 'เพลี้ยกระโดดท้องขาว', targetId: 'white-bellied-planthopper', targetType: 'แมลงศัตรูพืช', formulation: '25% WP', rate: '2 กรัม ต่อน้ำ 20 ลิตร', method: 'พ่นทางใบ' },
    ],
    warnings: [
      'เป็นพิษต่อผึ้ง วิธีคลุกเมล็ดปลอดภัยต่อผึ้งมากกว่าการพ่นทางใบ',
      'สลับกลุ่มสารเมื่อใช้เกิน 2 ครั้งติดต่อกัน',
    ],
    sources: [CSRC.r7, CSRC.r18, CSRC.r22, CSRC.irac],
    matchKeywords: [
      'thiamethoxam',
      'ไทอะมีทอกแซม',
    ],
  },
  {
    id: 'imidacloprid',
    nameTh: 'อิมิดาโคลพริด',
    nameEn: 'imidacloprid',
    category: 'สารกำจัดแมลง',
    chemClass: 'นีโอนิโคตินอยด์',
    group: 'IRAC 4A',
    mode: 'กระตุ้นตัวรับนิโคตินิกอะเซทิลโคลีน ดูดซึมเข้าต้นพืช',
    formulations: [
      '60% FS',
      '70% WS',
      '10% SL',
      '70% WG',
    ],
    uses: [
      { target: 'เพลี้ยไฟ', targetId: 'thrips', targetType: 'แมลงศัตรูพืช', formulation: '60% FS', rate: '10 มล. ต่อเมล็ดพันธุ์ 1 กก.', method: 'คลุกเมล็ด' },
      { target: 'เพลี้ยไฟ', targetId: 'thrips', targetType: 'แมลงศัตรูพืช', formulation: '70% WS', rate: '5 กรัม ต่อเมล็ดพันธุ์ 1 กก.', method: 'คลุกเมล็ด' },
      { target: 'เพลี้ยไฟ', targetId: 'thrips', targetType: 'แมลงศัตรูพืช', formulation: '10% SL', rate: '30 มล. ต่อน้ำ 20 ลิตร', method: 'พ่นทางใบ' },
      { target: 'เพลี้ยไฟ', targetId: 'thrips', targetType: 'แมลงศัตรูพืช', formulation: '70% WG', rate: '10 กรัม ต่อน้ำ 20 ลิตร', method: 'พ่นทางใบ' },
      { target: 'มอดดิน', targetId: 'ground-weevil', targetType: 'แมลงศัตรูพืช', formulation: '70% WS', rate: '5 กรัม ต่อเมล็ดพันธุ์ 1 กก.', method: 'คลุกเมล็ด', note: 'วิธีที่กรมวิชาการเกษตรแนะนำเป็นหลัก' },
      { target: 'เพลี้ยกระโดดท้องขาว', targetId: 'white-bellied-planthopper', targetType: 'แมลงศัตรูพืช', formulation: '10% SL', rate: '15 มล. ต่อน้ำ 20 ลิตร', method: 'พ่นทางใบ' },
    ],
    warnings: [
      'เป็นพิษต่อผึ้ง วิธีคลุกเมล็ดปลอดภัยต่อผึ้งมากกว่าการพ่นทางใบ',
      'ห้ามใช้ซ้ำกลุ่ม 4A ติดต่อกันหลายครั้ง เพราะเพลี้ยไฟและเพลี้ยกระโดดสร้างความต้านทานได้เร็ว',
    ],
    sources: [CSRC.r7, CSRC.r15, CSRC.r18, CSRC.r22, CSRC.irac],
    matchKeywords: [
      'imidacloprid',
      'อิมิดาโคลพริด',
    ],
  },
  {
    id: 'clothianidin',
    nameTh: 'โคลไทอะนิดิน',
    nameEn: 'clothianidin',
    category: 'สารกำจัดแมลง',
    chemClass: 'นีโอนิโคตินอยด์',
    group: 'IRAC 4A',
    mode: 'กระตุ้นตัวรับนิโคตินิกอะเซทิลโคลีน',
    formulations: [
      '16% SG',
    ],
    uses: [
      { target: 'เพลี้ยไฟ', targetId: 'thrips', targetType: 'แมลงศัตรูพืช', formulation: '16% SG', rate: '15 กรัม ต่อน้ำ 20 ลิตร', method: 'พ่นทางใบ' },
    ],
    warnings: [
      'เป็นพิษต่อผึ้ง หลีกเลี่ยงการพ่นช่วงพืชมีดอก',
    ],
    sources: [CSRC.r7, CSRC.r22, CSRC.irac],
    matchKeywords: [
      'clothianidin',
      'โคลไทอะนิดิน',
    ],
  },
  {
    id: 'carbosulfan',
    nameTh: 'คาร์โบซัลแฟน',
    nameEn: 'carbosulfan',
    category: 'สารกำจัดแมลง',
    chemClass: 'คาร์บาเมต',
    group: 'IRAC 1A',
    mode: 'ยับยั้งเอนไซม์อะเซทิลโคลีนเอสเทอเรส',
    formulations: [
      '25% ST',
      '20% EC',
    ],
    uses: [
      { target: 'มอดดิน', targetId: 'ground-weevil', targetType: 'แมลงศัตรูพืช', formulation: '25% ST', rate: '20 กรัม ต่อเมล็ดพันธุ์ 1 กก.', method: 'คลุกเมล็ด' },
      { target: 'มอดดิน', targetId: 'ground-weevil', targetType: 'แมลงศัตรูพืช', formulation: '20% EC', rate: '30 มล. ต่อน้ำ 20 ลิตร', method: 'พ่นทางใบ', note: 'ใช้เฉพาะเมื่อพบการระบาดแล้ว' },
      { target: 'หนอนห่อใบข้าว (ในข้าวโพด)', targetId: 'leaf-folder', targetType: 'แมลงศัตรูพืช', formulation: '20% EC', rate: '80–110 มล. ต่อน้ำ 20 ลิตร', method: 'พ่นทางใบ' },
    ],
    warnings: [
      'เป็นพิษสูง ต้องสวมอุปกรณ์ป้องกันครบขณะคลุกเมล็ด',
      'เมล็ดที่คลุกสารแล้วห้ามนำไปบริโภคหรือเลี้ยงสัตว์เด็ดขาด',
    ],
    sources: [CSRC.r12, CSRC.r15, CSRC.r22, CSRC.irac],
    matchKeywords: [
      'carbosulfan',
      'คาร์โบซัลแฟน',
    ],
  },
  {
    id: 'spodoptera-exigua-npv',
    nameTh: 'ไวรัส NPV หนอนกระทู้หอม (SeNPV)',
    nameEn: 'Spodoptera exigua NPV',
    category: 'ชีวภัณฑ์',
    chemClass: 'ไวรัสนิวคลีโอโพลีฮีโดรซิส',
    group: 'ชีวภัณฑ์',
    mode: 'หนอนกินไวรัสเข้าไปแล้วเชื้อเพิ่มจำนวนในตัว ทำให้หนอนตายใน 3–5 วัน',
    formulations: [],
    uses: [
      { target: 'หนอนกระทู้หอม', targetId: 'beet-armyworm', targetType: 'แมลงศัตรูพืช', rate: '20–30 มล. ต่อน้ำ 20 ลิตร', method: 'ชีวภัณฑ์', note: 'พ่นตอนเย็น' },
    ],
    warnings: [
      'ไวรัสสลายตัวเร็วเมื่อโดนแสงแดด ต้องพ่นตอนเย็นหรือหลังพระอาทิตย์ตก',
      'เจาะจงเฉพาะหนอนกระทู้หอม ไม่ควบคุมหนอนชนิดอื่น',
      'เก็บในตู้เย็น ห้ามผสมกับสารฆ่าเชื้อหรือสารที่เป็นด่าง',
    ],
    sources: [CSRC.r14, CSRC.r22],
    matchKeywords: [
      'spodoptera exigua npv',
      'ไวรัส NPV หนอนกระทู้หอม (SeNPV)',
    ],
  },
  {
    id: 'fenitrothion',
    nameTh: 'เฟนิโตรไทออน',
    nameEn: 'fenitrothion',
    category: 'สารกำจัดแมลง',
    chemClass: 'ออร์กาโนฟอสเฟต',
    group: 'IRAC 1B',
    mode: 'ยับยั้งเอนไซม์อะเซทิลโคลีนเอสเทอเรส',
    formulations: [
      '50% WP',
    ],
    uses: [
      { target: 'ตั๊กแตน', targetId: 'grasshopper', targetType: 'แมลงศัตรูพืช', formulation: '50% WP', rate: '20 กรัม ต่อน้ำ 20 ลิตร', method: 'พ่นทางใบ' },
    ],
    warnings: [
      'ออร์กาโนฟอสเฟต ต้องสวมอุปกรณ์ป้องกันครบขณะพ่น',
      'เป็นพิษต่อผึ้งและสัตว์น้ำ',
    ],
    sources: [CSRC.r22, CSRC.irac],
    matchKeywords: [
      'fenitrothion',
      'เฟนิโตรไทออน',
    ],
  },
  {
    id: 'phosphine',
    nameTh: 'ฟอสฟีน (อะลูมิเนียมฟอสไฟด์)',
    nameEn: 'phosphine (aluminium phosphide)',
    category: 'สารรมโรงเก็บ',
    chemClass: 'สารรม',
    group: 'IRAC 24A',
    mode: 'ยับยั้งการหายใจระดับเซลล์ (mitochondrial complex IV)',
    formulations: [],
    uses: [
      { target: 'ด้วงงวงข้าวโพด', targetId: 'maize-weevil', targetType: 'แมลงศัตรูพืช', rate: '2 เม็ด ต่อลูกบาศก์เมตร นาน 7 วัน', method: 'รมในโรงเก็บ', note: 'ประชากรบางแหล่งต้านทาน ต้องใช้ถึง 4 เม็ด/ลบ.ม. — ต้องปฏิบัติตามคำแนะนำความปลอดภัยอย่างเคร่งครัด' },
      { target: 'แมลงศัตรูข้าวโพดในโรงเก็บ', targetId: 'storage-pests', targetType: 'แมลงศัตรูพืช', rate: '2 เม็ด ต่อลูกบาศก์เมตร นาน 7 วัน', method: 'รมในโรงเก็บ', note: 'ประชากรบางแหล่งต้านทาน ต้องใช้ถึง 4 เม็ด/ลบ.ม.' },
    ],
    sources: [CSRC.r23, CSRC.irac],
    matchKeywords: [
      'aluminium phosphide',
      'phosphine',
      'phosphine (aluminium phosphide)',
      'ฟอสฟีน (อะลูมิเนียมฟอสไฟด์)',
    ],
  },
  {
    id: 'dinotefuran',
    nameTh: 'ไดโนทีฟูแรน',
    nameEn: 'dinotefuran',
    category: 'สารกำจัดแมลง',
    chemClass: 'นีโอนิโคตินอยด์',
    group: 'IRAC 4A',
    mode: 'กระตุ้นตัวรับนิโคตินิกอะเซทิลโคลีน',
    formulations: [
      '10% WP',
    ],
    uses: [
      { target: 'เพลี้ยกระโดดท้องขาว', targetId: 'white-bellied-planthopper', targetType: 'แมลงศัตรูพืช', formulation: '10% WP', rate: '15 กรัม ต่อน้ำ 20 ลิตร', method: 'พ่นทางใบ' },
    ],
    warnings: [
      'เป็นพิษต่อผึ้ง หลีกเลี่ยงการพ่นช่วงพืชมีดอก',
    ],
    sources: [CSRC.r18, CSRC.irac],
    matchKeywords: [
      'dinotefuran',
      'ไดโนทีฟูแรน',
    ],
  },
  {
    id: 'pymetrozine',
    nameTh: 'ไพมีโทรซีน',
    nameEn: 'pymetrozine',
    category: 'สารกำจัดแมลง',
    chemClass: 'ไพริดีนอะโซเมทีน',
    group: 'IRAC 9B',
    mode: 'ทำให้เพลี้ยหยุดดูดกินน้ำเลี้ยงทันที',
    formulations: [
      '50% WG',
    ],
    uses: [
      { target: 'เพลี้ยกระโดดท้องขาว', targetId: 'white-bellied-planthopper', targetType: 'แมลงศัตรูพืช', formulation: '50% WG', rate: '10 กรัม ต่อน้ำ 20 ลิตร', method: 'พ่นทางใบ' },
    ],
    sources: [CSRC.r18, CSRC.irac],
    matchKeywords: [
      'pymetrozine',
      'ไพมีโทรซีน',
    ],
  },
  {
    id: 'buprofezin',
    nameTh: 'บูโพรเฟซิน',
    nameEn: 'buprofezin',
    category: 'สารกำจัดแมลง',
    chemClass: 'ไทอะไดอะซีน (IGR)',
    group: 'IRAC 16',
    mode: 'ยับยั้งการสร้างไคตินของเพลี้ย',
    formulations: [
      '25% WP',
    ],
    uses: [
      { target: 'เพลี้ยกระโดดท้องขาว', targetId: 'white-bellied-planthopper', targetType: 'แมลงศัตรูพืช', formulation: '25% WP', rate: '20 กรัม ต่อน้ำ 20 ลิตร', method: 'พ่นทางใบ' },
    ],
    sources: [CSRC.r18, CSRC.irac],
    matchKeywords: [
      'buprofezin',
      'บูโพรเฟซิน',
    ],
  },
  {
    id: 'flonicamid',
    nameTh: 'ฟลอนิคามิด',
    nameEn: 'flonicamid',
    category: 'สารกำจัดแมลง',
    chemClass: 'ฟลอนิคามิด',
    group: 'IRAC 29',
    mode: 'รบกวนการทำงานของอวัยวะรับรู้ ทำให้หยุดดูดกิน',
    formulations: [
      '50% WG',
    ],
    uses: [
      { target: 'เพลี้ยกระโดดท้องขาว', targetId: 'white-bellied-planthopper', targetType: 'แมลงศัตรูพืช', formulation: '50% WG', rate: '10 กรัม ต่อน้ำ 20 ลิตร', method: 'พ่นทางใบ' },
    ],
    sources: [CSRC.r18, CSRC.irac],
    matchKeywords: [
      'flonicamid',
      'ฟลอนิคามิด',
    ],
  },
  {
    id: 'bensultap',
    nameTh: 'เบนซัลแทป',
    nameEn: 'bensultap',
    category: 'สารกำจัดแมลง',
    chemClass: 'เนไรส์ทอกซินอะนาล็อก',
    group: 'IRAC 14',
    mode: 'ปิดกั้นตัวรับนิโคตินิกอะเซทิลโคลีน',
    formulations: [
      '50% WP',
    ],
    uses: [
      { target: 'หนอนห่อใบข้าว (ในข้าวโพด)', targetId: 'leaf-folder', targetType: 'แมลงศัตรูพืช', formulation: '50% WP', rate: '10–20 กรัม ต่อน้ำ 20 ลิตร', method: 'พ่นทางใบ' },
    ],
    sources: [CSRC.r12, CSRC.irac],
    matchKeywords: [
      'bensultap',
      'เบนซัลแทป',
    ],
  },
  {
    id: 'zinc-phosphide',
    nameTh: 'ซิงค์ฟอสไฟด์ (ออกฤทธิ์เร็ว)',
    nameEn: 'zinc phosphide',
    category: 'สารกำจัดสัตว์ศัตรูพืช',
    chemClass: 'สารกำจัดหนูออกฤทธิ์เร็ว',
    group: 'ออกฤทธิ์เร็ว (acute)',
    mode: 'ทำปฏิกิริยากับกรดในกระเพาะเกิดก๊าซฟอสฟีน หนูตายภายในไม่กี่ชั่วโมง',
    formulations: [
      '80% ผง',
    ],
    uses: [
      { target: 'หนูศัตรูไร่ข้าวโพด', targetId: 'rats', targetType: 'สัตว์ศัตรูพืช', formulation: '80% ผง', rate: 'สาร 1 กก. ผสมเมล็ดพืช เช่น ปลายข้าวหรือข้าวโพดป่น 100 กก.', method: 'เหยื่อพิษ', note: 'วางจุดละประมาณ 1 ช้อนชา รองและกลบด้วยแกลบ จุดห่างกัน 5–10 เมตร ในระยะเตรียมแปลง' },
    ],
    warnings: [
      'ออกฤทธิ์เร็วมาก ถ้าหนูกินไม่ถึงขนาดตายจะเข็ดเหยื่อ ควรวางเหยื่อล่อที่ไม่ผสมสาร 2–3 วันก่อน แล้วจึงวางเหยื่อพิษ',
      'เป็นพิษร้ายแรงต่อคนและสัตว์เลี้ยง ห้ามวางในที่ที่เด็กหรือสัตว์เลี้ยงเข้าถึง',
      'เก็บซากหนูฝังกลบทุกวัน',
    ],
    sources: [CSRC.r16, CSRC.r22],
    matchKeywords: [
      'zinc phosphide',
      'ซิงค์ฟอสไฟด์ (ออกฤทธิ์เร็ว)',
    ],
  },
  {
    id: 'flocoumafen',
    nameTh: 'โฟลคูมาเฟน (ออกฤทธิ์ช้า)',
    nameEn: 'flocoumafen',
    category: 'สารกำจัดสัตว์ศัตรูพืช',
    chemClass: 'สารกันเลือดแข็งตัวรุ่นที่ 2',
    group: 'ออกฤทธิ์ช้า (anticoagulant)',
    mode: 'ยับยั้งวิตามินเค ทำให้เลือดไม่แข็งตัว หนูตายใน 3–7 วัน',
    formulations: [
      '0.005% ก้อนขี้ผึ้ง',
    ],
    uses: [
      { target: 'หนูศัตรูไร่ข้าวโพด', targetId: 'rats', targetType: 'สัตว์ศัตรูพืช', formulation: '0.005% ก้อนขี้ผึ้ง', rate: '100 กรัม หรือประมาณ 20 ก้อน/ไร่', method: 'เหยื่อพิษ' },
    ],
    warnings: [
      'เก็บให้พ้นมือเด็กและสัตว์เลี้ยง ยาแก้พิษคือวิตามินเค 1 (ต้องพบแพทย์)',
      'อาจเกิดพิษต่อเนื่องกับนกล่าเหยื่อและสัตว์ที่กินซากหนู ควรเก็บซากฝังกลบ',
    ],
    sources: [CSRC.r16, CSRC.r22],
    matchKeywords: [
      'flocoumafen',
      'โฟลคูมาเฟน (ออกฤทธิ์ช้า)',
    ],
  },
  {
    id: 'bromadiolone',
    nameTh: 'โบรมาดิโอโลน (ออกฤทธิ์ช้า)',
    nameEn: 'bromadiolone',
    category: 'สารกำจัดสัตว์ศัตรูพืช',
    chemClass: 'สารกันเลือดแข็งตัวรุ่นที่ 2',
    group: 'ออกฤทธิ์ช้า (anticoagulant)',
    mode: 'ยับยั้งวิตามินเค ทำให้เลือดไม่แข็งตัว',
    formulations: [
      '0.005% ก้อนขี้ผึ้ง',
    ],
    uses: [
      { target: 'หนูศัตรูไร่ข้าวโพด', targetId: 'rats', targetType: 'สัตว์ศัตรูพืช', formulation: '0.005% ก้อนขี้ผึ้ง', rate: '100 กรัม หรือประมาณ 20 ก้อน/ไร่', method: 'เหยื่อพิษ' },
    ],
    warnings: [
      'เก็บให้พ้นมือเด็กและสัตว์เลี้ยง ยาแก้พิษคือวิตามินเค 1 (ต้องพบแพทย์)',
      'เก็บซากหนูฝังกลบเพื่อลดพิษต่อเนื่องในสัตว์ผู้ล่า',
    ],
    sources: [CSRC.r16, CSRC.r22],
    matchKeywords: [
      'bromadiolone',
      'โบรมาดิโอโลน (ออกฤทธิ์ช้า)',
    ],
  },
  {
    id: 'brodifacoum',
    nameTh: 'โบรไดฟาคูม (ออกฤทธิ์ช้า)',
    nameEn: 'brodifacoum',
    category: 'สารกำจัดสัตว์ศัตรูพืช',
    chemClass: 'สารกันเลือดแข็งตัวรุ่นที่ 2',
    group: 'ออกฤทธิ์ช้า (anticoagulant)',
    mode: 'ยับยั้งวิตามินเค ทำให้เลือดไม่แข็งตัว',
    formulations: [
      '0.005% ก้อนขี้ผึ้ง',
    ],
    uses: [
      { target: 'หนูศัตรูไร่ข้าวโพด', targetId: 'rats', targetType: 'สัตว์ศัตรูพืช', formulation: '0.005% ก้อนขี้ผึ้ง', rate: '100 กรัม หรือประมาณ 20 ก้อน/ไร่', method: 'เหยื่อพิษ' },
    ],
    warnings: [
      'ความเป็นพิษต่อเนื่องสูงที่สุดในกลุ่ม ควรใช้ในภาชนะวางเหยื่อแบบปิด',
      'เก็บให้พ้นมือเด็กและสัตว์เลี้ยง ยาแก้พิษคือวิตามินเค 1',
    ],
    sources: [CSRC.r16, CSRC.r22],
    matchKeywords: [
      'brodifacoum',
      'โบรไดฟาคูม (ออกฤทธิ์ช้า)',
    ],
  },
  {
    id: 'difethialone',
    nameTh: 'ไดฟีทิอาโลน (ออกฤทธิ์ช้า)',
    nameEn: 'difethialone',
    category: 'สารกำจัดสัตว์ศัตรูพืช',
    chemClass: 'สารกันเลือดแข็งตัวรุ่นที่ 2',
    group: 'ออกฤทธิ์ช้า (anticoagulant)',
    mode: 'ยับยั้งวิตามินเค ทำให้เลือดไม่แข็งตัว',
    formulations: [
      '0.0025% BB',
    ],
    uses: [
      { target: 'หนูศัตรูไร่ข้าวโพด', targetId: 'rats', targetType: 'สัตว์ศัตรูพืช', formulation: '0.0025% BB', rate: '100 กรัม หรือประมาณ 20 ก้อน/ไร่', method: 'เหยื่อพิษ' },
    ],
    warnings: [
      'เก็บให้พ้นมือเด็กและสัตว์เลี้ยง ยาแก้พิษคือวิตามินเค 1',
    ],
    sources: [CSRC.r16, CSRC.r22],
    matchKeywords: [
      'difethialone',
      'ไดฟีทิอาโลน (ออกฤทธิ์ช้า)',
    ],
  },
  {
    id: 'coumatetralyl',
    nameTh: 'คูมาเททราลิล (ออกฤทธิ์ช้า)',
    nameEn: 'coumatetralyl',
    category: 'สารกำจัดสัตว์ศัตรูพืช',
    chemClass: 'สารกันเลือดแข็งตัวรุ่นที่ 1',
    group: 'ออกฤทธิ์ช้า (anticoagulant)',
    mode: 'ยับยั้งวิตามินเค ต้องให้หนูกินติดต่อกันหลายวัน',
    formulations: [
      '0.0375%',
    ],
    uses: [
      { target: 'หนูศัตรูไร่ข้าวโพด', targetId: 'rats', targetType: 'สัตว์ศัตรูพืช', formulation: '0.0375%', rate: '400 กรัม หรือประมาณ 40 ก้อน/ไร่', method: 'เหยื่อพิษ' },
    ],
    warnings: [
      'ต้องให้หนูกินติดต่อกันหลายวันจึงได้ผล ต้องเติมเหยื่อให้มีตลอด',
      'เก็บให้พ้นมือเด็กและสัตว์เลี้ยง ยาแก้พิษคือวิตามินเค 1',
    ],
    sources: [CSRC.r16, CSRC.r22],
    matchKeywords: [
      'coumatetralyl',
      'คูมาเททราลิล (ออกฤทธิ์ช้า)',
    ],
  },
  {
    id: 'metalaxyl',
    nameTh: 'เมทาแลกซิล',
    nameEn: 'metalaxyl',
    category: 'สารป้องกันกำจัดโรคพืช',
    chemClass: 'ฟีนิลอะไมด์',
    group: 'FRAC 4',
    mode: 'ยับยั้งการสังเคราะห์ RNA ของเชื้อราชั้นต่ำ (โอโอไมซีต) ดูดซึมเข้าต้น',
    formulations: [
      '35% DS',
      '25% WP',
    ],
    uses: [
      { target: 'โรคราน้ำค้าง (ใบลาย)', targetId: 'downy-mildew', targetType: 'โรคพืช', formulation: '35% DS', rate: '7–10 กรัม ต่อเมล็ดพันธุ์ 1 กก.', method: 'คลุกเมล็ด' },
      { target: 'โรคราน้ำค้าง (ใบลาย)', targetId: 'downy-mildew', targetType: 'โรคพืช', formulation: '25% WP', rate: '30–40 กรัม ต่อน้ำ 20 ลิตร', method: 'พ่นทางใบ', note: 'พ่นครั้งแรกเมื่ออายุ 5–7 วัน แล้วพ่นทุก 7 วัน' },
    ],
    warnings: [
      'ฟีนิลอะไมด์ (FRAC 4) เชื้อราน้ำค้างสร้างความต้านทานได้เร็ว ห้ามใช้ซ้ำเดี่ยวติดต่อกันหลายฤดู ควรสลับกับไดเมโทมอร์ฟ',
    ],
    sources: [CSRC.r1, CSRC.r5, CSRC.r10, CSRC.r21, CSRC.frac],
    matchKeywords: [
      'metalaxyl',
      'เมทาแลกซิล',
    ],
  },
  {
    id: 'metalaxyl-m',
    nameTh: 'เมทาแลกซิล-เอ็ม',
    nameEn: 'metalaxyl-M (mefenoxam)',
    category: 'สารป้องกันกำจัดโรคพืช',
    chemClass: 'ฟีนิลอะไมด์',
    group: 'FRAC 4',
    mode: 'ไอโซเมอร์ที่ออกฤทธิ์ของเมทาแลกซิล ใช้อัตราต่ำกว่า',
    formulations: [
      '35% ES',
    ],
    uses: [
      { target: 'โรคราน้ำค้าง (ใบลาย)', targetId: 'downy-mildew', targetType: 'โรคพืช', formulation: '35% ES', rate: '3.5 มล. ต่อเมล็ดพันธุ์ 1 กก.', method: 'คลุกเมล็ด' },
    ],
    sources: [CSRC.r1, CSRC.r5, CSRC.r10, CSRC.r21, CSRC.frac],
    matchKeywords: [
      'mefenoxam',
      'metalaxyl-m',
      'metalaxyl-m (mefenoxam)',
      'เมทาแลกซิล-เอ็ม',
    ],
  },
  {
    id: 'dimethomorph',
    nameTh: 'ไดเมโทมอร์ฟ',
    nameEn: 'dimethomorph',
    category: 'สารป้องกันกำจัดโรคพืช',
    chemClass: 'คาร์บอกซิลิกแอซิดอะไมด์ (CAA)',
    group: 'FRAC 40',
    mode: 'ยับยั้งการสร้างผนังเซลล์ของโอโอไมซีต',
    formulations: [
      '50% WP',
    ],
    uses: [
      { target: 'โรคราน้ำค้าง (ใบลาย)', targetId: 'downy-mildew', targetType: 'โรคพืช', formulation: '50% WP', rate: '30 กรัม ต่อเมล็ดพันธุ์ 1 กก.', method: 'คลุกเมล็ด' },
      { target: 'โรคราน้ำค้าง (ใบลาย)', targetId: 'downy-mildew', targetType: 'โรคพืช', formulation: '50% WP', rate: '20–30 กรัม ต่อน้ำ 20 ลิตร', method: 'พ่นทางใบ', note: 'พ่นครั้งแรกเมื่ออายุ 5–7 วัน แล้วพ่นทุก 7 วัน' },
    ],
    sources: [CSRC.r1, CSRC.r5, CSRC.r10, CSRC.r21, CSRC.frac],
    matchKeywords: [
      'dimethomorph',
      'ไดเมโทมอร์ฟ',
    ],
  },
  {
    id: 'propiconazole',
    nameTh: 'โพรพิโคนาโซล',
    nameEn: 'propiconazole',
    category: 'สารป้องกันกำจัดโรคพืช',
    chemClass: 'ไตรอะโซล (DMI)',
    group: 'FRAC 3',
    mode: 'ยับยั้งการสร้างเออร์โกสเตอรอลในผนังเซลล์เชื้อรา',
    formulations: [],
    uses: [
      { target: 'โรคใบไหม้แผลใหญ่', targetId: 'nclb', targetType: 'โรคพืช', rate: '15 ซีซี ต่อน้ำ 20 ลิตร', method: 'พ่นทางใบ', note: 'พ่น 3 ครั้ง ห่างกันครั้งละ 1 สัปดาห์ — เอกสารต้นทางไม่ระบุ % สูตร ให้อ่านจากฉลาก' },
    ],
    sources: [CSRC.r1, CSRC.r4, CSRC.r21, CSRC.frac],
    matchKeywords: [
      'propiconazole',
      'โพรพิโคนาโซล',
    ],
  },
  {
    id: 'azoxystrobin-difenoconazole',
    nameTh: 'อะซอกซีสโตรบิน + ไดฟีโนโคนาโซล',
    nameEn: 'azoxystrobin + difenoconazole',
    category: 'สารป้องกันกำจัดโรคพืช',
    chemClass: 'สารผสม: สโตรบิลูริน + ไตรอะโซล',
    group: 'FRAC 11 + 3',
    mode: 'ยับยั้งการหายใจของเชื้อรา ร่วมกับยับยั้งการสร้างเออร์โกสเตอรอล',
    formulations: [],
    uses: [
      { target: 'โรคใบไหม้แผลใหญ่', targetId: 'nclb', targetType: 'โรคพืช', rate: '15 ซีซี ต่อน้ำ 20 ลิตร', method: 'พ่นทางใบ', note: 'สารผสมสำเร็จรูป พ่น 3 ครั้ง ห่างกัน 1 สัปดาห์' },
    ],
    sources: [CSRC.r1, CSRC.r4, CSRC.r21, CSRC.frac],
    matchKeywords: [
      'azoxystrobin',
      'azoxystrobin + difenoconazole',
      'difenoconazole',
      'อะซอกซีสโตรบิน + ไดฟีโนโคนาโซล',
    ],
  },
  {
    id: 'carbendazim-epoxiconazole',
    nameTh: 'คาร์เบนดาซิม + อีพอกซีโคนาโซล',
    nameEn: 'carbendazim + epoxiconazole',
    category: 'สารป้องกันกำจัดโรคพืช',
    chemClass: 'สารผสม: เบนซิมิดาโซล + ไตรอะโซล',
    group: 'FRAC 1 + 3',
    mode: 'ยับยั้งการแบ่งเซลล์ ร่วมกับยับยั้งการสร้างเออร์โกสเตอรอล',
    formulations: [],
    uses: [
      { target: 'โรคใบไหม้แผลใหญ่', targetId: 'nclb', targetType: 'โรคพืช', rate: '25 ซีซี ต่อน้ำ 20 ลิตร', method: 'พ่นทางใบ', note: 'สารผสมสำเร็จรูป พ่น 3 ครั้ง ห่างกัน 1 สัปดาห์' },
    ],
    warnings: [
      'คาร์เบนดาซิมเป็นสารที่สหภาพยุโรปไม่ต่ออายุการขึ้นทะเบียนแล้ว หากปลูกส่งออกควรตรวจสอบข้อกำหนดของผู้รับซื้อก่อนใช้',
      'เบนซิมิดาโซล (FRAC 1) เชื้อราสร้างความต้านทานได้เร็ว ห้ามใช้เดี่ยวซ้ำ',
    ],
    sources: [CSRC.r1, CSRC.r4, CSRC.r21, CSRC.frac],
    matchKeywords: [
      'carbendazim',
      'carbendazim + epoxiconazole',
      'epoxiconazole',
      'คาร์เบนดาซิม + อีพอกซีโคนาโซล',
    ],
  },
  {
    id: 'triforine',
    nameTh: 'ไตรโฟรีน (Saprol)',
    nameEn: 'triforine',
    category: 'สารป้องกันกำจัดโรคพืช',
    chemClass: 'ไพเพอราซีน (DMI)',
    group: 'FRAC 3',
    mode: 'ยับยั้งการสร้างเออร์โกสเตอรอล',
    formulations: [],
    uses: [
      { target: 'โรคใบไหม้แผลเล็ก', targetId: 'sclb', targetType: 'โรคพืช', rate: 'เอกสารระบุไม่ตรงกัน: 20 ซีซี หรือ 60 มล. ต่อน้ำ 20 ลิตร', method: 'พ่นทางใบ', note: 'ต้องตรวจสอบฉลากและสอบถามเจ้าหน้าที่ก่อนใช้' },
    ],
    sources: [CSRC.r1, CSRC.r17, CSRC.r21, CSRC.frac],
    matchKeywords: [
      'triforine',
      'ไตรโฟรีน (Saprol)',
    ],
  },
  {
    id: 'difenoconazole',
    nameTh: 'ไดฟีโนโคนาโซล (Score)',
    nameEn: 'difenoconazole',
    category: 'สารป้องกันกำจัดโรคพืช',
    chemClass: 'ไตรอะโซล (DMI)',
    group: 'FRAC 3',
    mode: 'ยับยั้งการสร้างเออร์โกสเตอรอล',
    formulations: [
      '250 EC',
    ],
    uses: [
      { target: 'โรคราสนิม', targetId: 'rust', targetType: 'โรคพืช', formulation: '250 EC', rate: '20 มล. ต่อน้ำ 20 ลิตร', method: 'พ่นทางใบ', note: 'พ่นทุก 7 วัน จำนวน 2–4 ครั้ง เริ่มเมื่อพบจุดสนิม 3–4 จุดต่อใบ' },
    ],
    sources: [CSRC.r1, CSRC.r3, CSRC.r21, CSRC.frac],
    matchKeywords: [
      'difenoconazole',
      'ไดฟีโนโคนาโซล (Score)',
    ],
  },
  {
    id: 'mancozeb',
    nameTh: 'แมนโคเซบ',
    nameEn: 'mancozeb',
    category: 'สารป้องกันกำจัดโรคพืช',
    chemClass: 'ไดไทโอคาร์บาเมต',
    group: 'FRAC M03',
    mode: 'สารสัมผัสออกฤทธิ์หลายจุด ความเสี่ยงดื้อยาต่ำ',
    formulations: [
      '80% WP',
    ],
    uses: [
      { target: 'โรคราสนิม', targetId: 'rust', targetType: 'โรคพืช', formulation: '80% WP', rate: '40 กรัม ต่อน้ำ 20 ลิตร', method: 'พ่นทางใบ', note: 'พ่นทุก 7 วัน จำนวน 2–4 ครั้ง' },
    ],
    warnings: [
      'สหภาพยุโรปไม่ต่ออายุการขึ้นทะเบียนแมนโคเซบตั้งแต่ปี 2564 หากผลผลิตมีปลายทางส่งออกควรตรวจสอบข้อกำหนดก่อนใช้',
      'เป็นสารสัมผัส ต้องพ่นให้ทั่วและพ่นซ้ำเมื่อฝนชะ',
    ],
    sources: [CSRC.r1, CSRC.r3, CSRC.r21, CSRC.frac],
    matchKeywords: [
      'mancozeb',
      'แมนโคเซบ',
    ],
  },
  {
    id: 'difenoconazole-propiconazole',
    nameTh: 'ไดฟีโนโคนาโซล + โพรพิโคนาโซล',
    nameEn: 'difenoconazole + propiconazole',
    category: 'สารป้องกันกำจัดโรคพืช',
    chemClass: 'สารผสม: ไตรอะโซล 2 ชนิด',
    group: 'FRAC 3',
    mode: 'ยับยั้งการสร้างเออร์โกสเตอรอล',
    formulations: [
      '15% + 15%',
    ],
    uses: [
      { target: 'โรคราสนิม', targetId: 'rust', targetType: 'โรคพืช', formulation: '15% + 15%', rate: '20 ซีซี ต่อน้ำ 20 ลิตร', method: 'พ่นทางใบ', note: 'งานวิจัยรายงานว่าควบคุมโรคได้ดีที่สุดและให้ผลผลิตสูงที่สุด' },
    ],
    sources: [CSRC.r1, CSRC.r3, CSRC.r21, CSRC.frac],
    matchKeywords: [
      'difenoconazole',
      'difenoconazole + propiconazole',
      'propiconazole',
      'ไดฟีโนโคนาโซล + โพรพิโคนาโซล',
    ],
  },
];

/** แหล่งอ้างอิงเพิ่มเติมสำหรับสารกำจัดวัชพืช */
export const HSRC: Record<string, SourceRef> = {
  nswWeed: { label: 'ศูนย์วิจัยพืชไร่นครสวรรค์ — การกำจัดวัชพืชในข้าวโพดเลี้ยงสัตว์', url: 'https://www.doa.go.th/fc/nakhonsawan/?p=2849' },
  nswHerbDamage: { label: 'ศูนย์วิจัยพืชไร่นครสวรรค์ — อาการผิดปกติของข้าวโพดที่เกิดจากสารกำจัดวัชพืช', url: 'https://www.doa.go.th/fc/nakhonsawan/?p=3827' },
  kku: { label: 'วารสารแก่นเกษตร 49(4): 903–914 (2564) — ประสิทธิภาพสารกำจัดวัชพืชก่อนงอกร่วมกับหลังงอกในข้าวโพด', url: 'https://li01.tci-thaijo.org/index.php/agkasetkaj/article/view/251394' },
  nu: { label: 'วารสารเกษตรนเรศวร 21(1) (2567) — ประสิทธิภาพ s-metolachlor และ acetochlor ในข้าวโพดหวาน', url: 'https://li01.tci-thaijo.org/index.php/aginujournal/' },
  doaMaizeTech: { label: 'กรมวิชาการเกษตร — เทคโนโลยีการผลิตข้าวโพดเลี้ยงสัตว์', url: 'https://www.doa.go.th/fcri/' },
};


/** สารกำจัดวัชพืชและสารที่ห้ามใช้ — เขียนจากคำแนะนำกรมวิชาการเกษตรและงานวิจัยไทย */
export const herbicides: ChemicalEntry[] = [
  {
    id: 'alachlor',
    nameTh: 'อะลาคลอร์',
    nameEn: 'alachlor',
    category: 'สารกำจัดวัชพืช',
    chemClass: 'คลอโรอะเซตามายด์',
    group: 'HRAC 15 (K3)',
    mode: 'ยับยั้งการสร้างกรดไขมันสายยาว วัชพืชตายตั้งแต่ยังไม่โผล่พ้นดิน',
    formulations: ['48% EC'],
    uses: [
      { target: 'วัชพืชใบแคบฤดูเดียวและใบกว้างบางชนิด', targetType: 'วัชพืช', formulation: '48% EC', rate: '125–150 มล. ต่อน้ำ 20 ลิตร (ใช้น้ำ 80 ลิตร/ไร่)', method: 'พ่นคลุมดิน (ก่อนวัชพืชงอก)', note: 'พ่นวันปลูกถึง 1 วันหลังปลูก ขณะดินมีความชื้น' },
    ],
    timing: 'วันปลูกถึง 1 วันหลังปลูก',
    warnings: ['ถ้าดินแห้งสารจะไม่ทำงาน ต้องพ่นขณะดินชื้นเท่านั้น', 'พ่นทับต้นข้าวโพดที่งอกแล้วอาจทำให้ใบบิดม้วน'],
    sources: [HSRC.nswWeed, HSRC.doaMaizeTech, CSRC.hrac],
    matchKeywords: ['อะลาคลอร์', 'alachlor', 'สารคลุมดิน', 'ก่อนงอก'],
  },
  {
    id: 'metolachlor',
    nameTh: 'เมโทลาคลอร์',
    nameEn: 'metolachlor',
    category: 'สารกำจัดวัชพืช',
    chemClass: 'คลอโรอะเซตามายด์',
    group: 'HRAC 15 (K3)',
    mode: 'ยับยั้งการสร้างกรดไขมันสายยาว ออกฤทธิ์กับวัชพืชที่กำลังงอก',
    formulations: ['40% EC'],
    uses: [
      { target: 'วัชพืชใบแคบฤดูเดียวและใบกว้างบางชนิด', targetType: 'วัชพืช', formulation: '40% EC', rate: '150–200 มล. ต่อน้ำ 20 ลิตร (ใช้น้ำ 80 ลิตร/ไร่)', method: 'พ่นคลุมดิน (ก่อนวัชพืชงอก)' },
    ],
    timing: 'วันปลูกถึง 1 วันหลังปลูก',
    warnings: ['ต้องพ่นขณะดินมีความชื้นพอเพียง'],
    sources: [HSRC.nswWeed, HSRC.doaMaizeTech, CSRC.hrac],
    matchKeywords: ['เมโทลาคลอร์', 'metolachlor', 'สารคลุมดิน'],
  },
  {
    id: 's-metolachlor',
    nameTh: 'เอส-เมโทลาคลอร์',
    nameEn: 's-metolachlor',
    category: 'สารกำจัดวัชพืช',
    chemClass: 'คลอโรอะเซตามายด์ (ไอโซเมอร์ที่ออกฤทธิ์)',
    group: 'HRAC 15 (K3)',
    mode: 'ยับยั้งการสร้างกรดไขมันสายยาว — ใช้อัตราต่ำกว่าเมโทลาคลอร์เดิม',
    formulations: ['—'],
    uses: [
      { target: 'วัชพืชในข้าวโพดหวาน', targetType: 'วัชพืช', rate: '255 และ 340 กรัมสารออกฤทธิ์/ไร่', method: 'พ่นคลุมดิน', note: 'งานวิจัย ม.นเรศวร พ่นที่ 1 และ 7 วันหลังปลูก ควบคุมวัชพืชได้ดีกว่าอะเซโทคลอร์' },
    ],
    timing: '1–7 วันหลังปลูก',
    sources: [HSRC.nu, CSRC.hrac],
    matchKeywords: ['เอส-เมโทลาคลอร์', 's-metolachlor', 'smetolachlor'],
  },
  {
    id: 'acetochlor',
    nameTh: 'อะเซโทคลอร์',
    nameEn: 'acetochlor',
    category: 'สารกำจัดวัชพืช',
    chemClass: 'คลอโรอะเซตามายด์',
    group: 'HRAC 15 (K3)',
    mode: 'ยับยั้งการสร้างกรดไขมันสายยาว',
    formulations: ['50% EC'],
    uses: [
      { target: 'วัชพืชใบแคบฤดูเดียว', targetType: 'วัชพืช', formulation: '50% EC', rate: '80–120 มล. ต่อน้ำ 20 ลิตร (ใช้น้ำ 80 ลิตร/ไร่)', method: 'พ่นคลุมดิน (ก่อนวัชพืชงอก)' },
    ],
    timing: 'วันปลูกถึง 1 วันหลังปลูก',
    sources: [HSRC.nswWeed, HSRC.nu, CSRC.hrac],
    matchKeywords: ['อะเซโทคลอร์', 'acetochlor'],
  },
  {
    id: 'atrazine',
    nameTh: 'อะทราซีน',
    nameEn: 'atrazine',
    category: 'สารกำจัดวัชพืช',
    chemClass: 'ไตรอะซีน',
    group: 'HRAC 5 (C1)',
    mode: 'ยับยั้งการสังเคราะห์แสงที่ระบบโฟโตซิสเต็ม II ข้าวโพดสลายสารนี้ได้เองจึงทนทาน',
    formulations: ['—'],
    uses: [
      { target: 'วัชพืชใบกว้างและใบแคบบางชนิด', targetType: 'วัชพืช', rate: '300 กรัมสารออกฤทธิ์/ไร่', method: 'พ่นคลุมดิน (ก่อนวัชพืชงอก)', note: 'ใช้ในแปลงข้าวโพดได้เพราะข้าวโพดทนทานต่อสารกลุ่มนี้' },
    ],
    warnings: ['สลายตัวช้า ตกค้างในดินและอาจเป็นพิษต่อพืชตามที่ปลูกต่อ เช่น ถั่ว ผัก', 'มีโอกาสชะลงสู่น้ำใต้ดิน ห้ามใช้ใกล้บ่อน้ำหรือแหล่งน้ำ'],
    sources: [HSRC.kku, HSRC.doaMaizeTech, CSRC.hrac],
    matchKeywords: ['อะทราซีน', 'atrazine', 'ไตรอะซีน'],
  },
  {
    id: 'pendimethalin',
    nameTh: 'เพนดิเมทาลิน',
    nameEn: 'pendimethalin',
    category: 'สารกำจัดวัชพืช',
    chemClass: 'ไดไนโตรอะนิลีน',
    group: 'HRAC 3 (K1)',
    mode: 'ยับยั้งการแบ่งเซลล์ที่ปลายราก วัชพืชงอกแล้วรากไม่พัฒนา',
    formulations: ['33% EC'],
    uses: [
      { target: 'วัชพืชใบแคบฤดูเดียวและใบกว้าง', targetType: 'วัชพืช', formulation: '33% EC', rate: '264 กรัมสารออกฤทธิ์/ไร่', method: 'พ่นคลุมดิน (1 วันหลังปลูก)', note: 'งานวิจัยแก่นเกษตรใช้เป็นสารก่อนงอก แล้วตามด้วยไนโคซัลฟูรอน อะเมทริน หรือฟลูรอกซิเพอร์ที่ 30 วันหลังปลูก' },
    ],
    timing: '1 วันหลังปลูก',
    sources: [HSRC.kku, CSRC.hrac],
    matchKeywords: ['เพนดิเมทาลิน', 'pendimethalin'],
  },
  {
    id: 'nicosulfuron',
    nameTh: 'ไนโคซัลฟูรอน',
    nameEn: 'nicosulfuron',
    category: 'สารกำจัดวัชพืช',
    chemClass: 'ซัลโฟนิลยูเรีย',
    group: 'HRAC 2 (B)',
    mode: 'ยับยั้งเอนไซม์ ALS ที่ใช้สร้างกรดอะมิโน วัชพืชหยุดโตแล้วค่อย ๆ ตาย',
    formulations: ['6% OD'],
    uses: [
      { target: 'วัชพืชใบแคบและใบกว้างหลังงอก', targetType: 'วัชพืช', formulation: '6% OD', rate: '9.6 กรัมสารออกฤทธิ์/ไร่', method: 'พ่นหลังวัชพืชงอก', note: 'งานวิจัยแก่นเกษตร: พ่น 1 วันหลังปลูก แล้วพ่นซ้ำที่ 30 วันหลังปลูก ควบคุมวัชพืชได้ดีที่สุด' },
    ],
    timing: '1 วันหลังปลูก และซ้ำที่ 30 วันหลังปลูก',
    warnings: ['กลุ่ม HRAC 2 เป็นกลุ่มที่วัชพืชสร้างความต้านทานได้เร็วที่สุดกลุ่มหนึ่ง ต้องสลับกลุ่มทุกฤดู', 'ข้าวโพดหวานและข้าวโพดข้าวเหนียวบางพันธุ์อ่อนแอต่อซัลโฟนิลยูเรีย ควรทดลองพ่นพื้นที่เล็กก่อน'],
    sources: [HSRC.kku, CSRC.hrac],
    matchKeywords: ['ไนโคซัลฟูรอน', 'nicosulfuron', 'ซัลโฟนิลยูเรีย'],
  },
  {
    id: 'ametryn',
    nameTh: 'อะเมทริน',
    nameEn: 'ametryn',
    category: 'สารกำจัดวัชพืช',
    chemClass: 'ไตรอะซีน',
    group: 'HRAC 5 (C1)',
    mode: 'ยับยั้งการสังเคราะห์แสงที่โฟโตซิสเต็ม II',
    formulations: ['—'],
    uses: [
      { target: 'วัชพืชใบกว้างและใบแคบหลังงอก', targetType: 'วัชพืช', rate: '400 กรัมสารออกฤทธิ์/ไร่', method: 'พ่นหลังวัชพืชงอก', note: 'พ่นที่ 30 วันหลังปลูก ต่อจากสารก่อนงอก' },
    ],
    warnings: ['ต้องพ่นแบบบังหัวฉีด (directed spray) ไม่ให้ถูกใบข้าวโพดโดยตรง'],
    sources: [HSRC.kku, CSRC.hrac],
    matchKeywords: ['อะเมทริน', 'ametryn'],
  },
  {
    id: 'fluroxypyr',
    nameTh: 'ฟลูรอกซิเพอร์',
    nameEn: 'fluroxypyr',
    category: 'สารกำจัดวัชพืช',
    chemClass: 'ไพริดีนคาร์บอกซิลิกแอซิด (ออกซิน)',
    group: 'HRAC 4 (O)',
    mode: 'เลียนแบบฮอร์โมนออกซิน ทำให้วัชพืชใบกว้างบิดเบี้ยวและตาย',
    formulations: ['—'],
    uses: [
      { target: 'วัชพืชใบกว้างหลังงอก', targetType: 'วัชพืช', rate: '86.4 กรัมสารออกฤทธิ์/ไร่', method: 'พ่นหลังวัชพืชงอก', note: 'พ่นที่ 30 วันหลังปลูก ต่อจากสารก่อนงอก' },
    ],
    warnings: ['ละอองสารปลิวไปโดนพืชใบกว้างข้างเคียง เช่น พริก มะเขือ ถั่ว ทำให้เสียหายได้ ต้องพ่นวันลมสงบ'],
    sources: [HSRC.kku, CSRC.hrac],
    matchKeywords: ['ฟลูรอกซิเพอร์', 'fluroxypyr'],
  },
  {
    id: 'glyphosate',
    nameTh: 'ไกลโฟเสท',
    nameEn: 'glyphosate',
    category: 'สารกำจัดวัชพืช',
    chemClass: 'ไกลซีน',
    group: 'HRAC 9 (G)',
    mode: 'ยับยั้งเอนไซม์ EPSPS ดูดซึมลงไปถึงเหง้าและหัวใต้ดิน จึงใช้กับวัชพืชข้ามปีได้',
    formulations: ['48% SL'],
    uses: [
      { target: 'วัชพืชข้ามปี เช่น แห้วหมู หญ้าคา หญ้าแพรก หญ้าชันกาด หญ้าขจรจบ', targetType: 'วัชพืช', formulation: '48% SL', rate: '120–160 มล. ต่อน้ำ 20 ลิตร', method: 'พ่นก่อนเตรียมดิน', note: 'พ่นก่อนปลูกหรือก่อนเตรียมดิน 7–15 วัน' },
    ],
    timing: 'ก่อนเตรียมดิน 7–15 วัน',
    warnings: ['ไม่เลือกทำลาย ถ้าโดนใบข้าวโพดที่งอกแล้วต้นจะตาย', 'ประเทศไทยกำหนดให้เป็นวัตถุอันตรายชนิดที่ 3 แบบจำกัดการใช้ ต้องซื้อและใช้ตามเงื่อนไขที่กรมวิชาการเกษตรกำหนด'],
    sources: [HSRC.nswWeed, HSRC.doaMaizeTech, CSRC.hrac],
    matchKeywords: ['ไกลโฟเสท', 'ไกลโฟเซต', 'glyphosate'],
  },
  {
    id: 'glufosinate-ammonium',
    nameTh: 'กลูโฟซิเนต-แอมโมเนียม',
    nameEn: 'glufosinate-ammonium',
    category: 'สารกำจัดวัชพืช',
    chemClass: 'ฟอสฟิโนทริซิน',
    group: 'HRAC 10 (H)',
    mode: 'ยับยั้งเอนไซม์กลูตามีนซินทีเทส ทำให้แอมโมเนียสะสมจนใบไหม้ ออกฤทธิ์เร็วแต่ไม่ลงถึงราก',
    formulations: ['15% SL'],
    uses: [
      { target: 'วัชพืชข้ามปีและวัชพืชฤดูเดียวก่อนปลูก', targetType: 'วัชพืช', formulation: '15% SL', rate: '300–400 มล. ต่อน้ำ 20 ลิตร', method: 'พ่นก่อนเตรียมดิน', note: 'พ่นก่อนปลูกหรือก่อนเตรียมดิน 7–15 วัน' },
    ],
    timing: 'ก่อนเตรียมดิน 7–15 วัน',
    warnings: ['ไม่เลือกทำลาย ห้ามพ่นโดนต้นข้าวโพด', 'ออกฤทธิ์เฉพาะส่วนที่สัมผัส วัชพืชข้ามปีที่มีหัวใต้ดินอาจงอกใหม่'],
    sources: [HSRC.nswWeed, HSRC.doaMaizeTech, CSRC.hrac],
    matchKeywords: ['กลูโฟซิเนต', 'glufosinate', 'แอมโมเนียม'],
  },
  {
    id: 'pyroxasulfone',
    nameTh: 'ไพร็อกซาซัลโฟน',
    nameEn: 'pyroxasulfone',
    category: 'สารกำจัดวัชพืช',
    chemClass: 'ไอโซซาโซลีน',
    group: 'HRAC 15 (K3)',
    mode: 'ยับยั้งการสร้างกรดไขมันสายยาว ใช้อัตราต่ำมากเมื่อเทียบกับคลอโรอะเซตามายด์',
    formulations: ['—'],
    uses: [
      { target: 'วัชพืชในไร่ข้าวโพด (สารก่อนงอก)', targetType: 'วัชพืช', rate: 'ตามฉลากผลิตภัณฑ์ — เอกสารทดลองของกรมวิชาการเกษตรไม่ได้ระบุอัตราเดียวที่ใช้อ้างอิงได้', method: 'พ่นคลุมดิน (ก่อนวัชพืชงอก)', note: 'อยู่ในชุดสารก่อนงอกที่กรมวิชาการเกษตรนำมาทดลองในข้าวโพด' },
    ],
    sources: [HSRC.doaMaizeTech, CSRC.hrac],
    matchKeywords: ['ไพร็อกซาซัลโฟน', 'pyroxasulfone'],
  },
  {
    id: 'flumioxazin',
    nameTh: 'ฟลูมิออกซาซิน',
    nameEn: 'flumioxazin',
    category: 'สารกำจัดวัชพืช',
    chemClass: 'เอ็น-ฟีนิลธาลิไมด์',
    group: 'HRAC 14 (E)',
    mode: 'ยับยั้งเอนไซม์ PPO ทำให้เยื่อหุ้มเซลล์วัชพืชแตกเมื่อถูกแสง',
    formulations: ['—'],
    uses: [
      { target: 'วัชพืชในไร่ข้าวโพด (สารก่อนงอก)', targetType: 'วัชพืช', rate: 'ตามฉลากผลิตภัณฑ์ — เอกสารทดลองไม่ได้ระบุอัตราเดียวที่ใช้อ้างอิงได้', method: 'พ่นคลุมดิน (ก่อนวัชพืชงอก)' },
    ],
    sources: [HSRC.doaMaizeTech, CSRC.hrac],
    matchKeywords: ['ฟลูมิออกซาซิน', 'flumioxazin'],
  },
  {
    id: 'isoxaflutole',
    nameTh: 'ไอโซซาฟลูโทล',
    nameEn: 'isoxaflutole',
    category: 'สารกำจัดวัชพืช',
    chemClass: 'ไอโซซาโซล',
    group: 'HRAC 27 (F2)',
    mode: 'ยับยั้งเอนไซม์ HPPD ทำให้วัชพืชใบซีดขาวแล้วตาย',
    formulations: ['—'],
    uses: [
      { target: 'วัชพืชในไร่ข้าวโพด (สารก่อนงอก)', targetType: 'วัชพืช', rate: 'ตามฉลากผลิตภัณฑ์ — เอกสารทดลองไม่ได้ระบุอัตราเดียวที่ใช้อ้างอิงได้', method: 'พ่นคลุมดิน (ก่อนวัชพืชงอก)' },
    ],
    sources: [HSRC.doaMaizeTech, CSRC.hrac],
    matchKeywords: ['ไอโซซาฟลูโทล', 'isoxaflutole'],
  },
  {
    id: 'dimethenamid',
    nameTh: 'ไดเมทีนาไมด์',
    nameEn: 'dimethenamid',
    category: 'สารกำจัดวัชพืช',
    chemClass: 'คลอโรอะเซตามายด์',
    group: 'HRAC 15 (K3)',
    mode: 'ยับยั้งการสร้างกรดไขมันสายยาว',
    formulations: ['—'],
    uses: [
      { target: 'วัชพืชในไร่ข้าวโพด (สารก่อนงอก)', targetType: 'วัชพืช', rate: 'ตามฉลากผลิตภัณฑ์ — เอกสารทดลองไม่ได้ระบุอัตราเดียวที่ใช้อ้างอิงได้', method: 'พ่นคลุมดิน (ก่อนวัชพืชงอก)' },
    ],
    sources: [HSRC.doaMaizeTech, CSRC.hrac],
    matchKeywords: ['ไดเมทีนาไมด์', 'dimethenamid'],
  },
  {
    id: 'mesotrione-atrazine',
    nameTh: 'มีโซไตรโอน + อะทราซีน',
    nameEn: 'mesotrione + atrazine',
    category: 'สารกำจัดวัชพืช',
    chemClass: 'สารผสม: ไตรคีโตน + ไตรอะซีน',
    group: 'HRAC 27 + 5',
    mode: 'ยับยั้งเอนไซม์ HPPD ร่วมกับยับยั้งการสังเคราะห์แสง ใบวัชพืชฟอกขาวแล้วตาย',
    formulations: ['—'],
    uses: [
      { target: 'วัชพืชในไร่ข้าวโพด (สารผสมสำเร็จรูป)', targetType: 'วัชพืช', rate: 'ตามฉลากผลิตภัณฑ์ — เอกสารทดลองไม่ได้ระบุอัตราเดียวที่ใช้อ้างอิงได้', method: 'พ่นคลุมดินหรือหลังงอกตามฉลาก' },
    ],
    warnings: ['มีอะทราซีนผสมอยู่ จึงมีข้อควรระวังเรื่องการตกค้างในดินและการชะลงน้ำใต้ดินเช่นเดียวกัน'],
    sources: [HSRC.doaMaizeTech, CSRC.hrac],
    matchKeywords: ['มีโซไตรโอน', 'mesotrione', 'อะทราซีน'],
  },
  {
    id: '2-4-d',
    nameTh: '2,4-ดี',
    nameEn: '2,4-D',
    category: 'สารกำจัดวัชพืช',
    chemClass: 'ฟีน็อกซีคาร์บอกซิลิกแอซิด (ออกซิน)',
    group: 'HRAC 4 (O)',
    mode: 'เลียนแบบฮอร์โมนออกซิน',
    formulations: ['—'],
    uses: [],
    restricted: true,
    restrictedReason: 'ห้ามใช้ในไร่ข้าวโพด — ศูนย์วิจัยพืชไร่นครสวรรค์รายงานว่าทำให้โคนต้นข้าวโพดปริหัก ใบบิดม้วนพันกัน และแตกหน่อผิดปกติ',
    warnings: ['ถึงแม้จะใช้ในนาข้าวหรือแปลงอื่นได้ แต่ละอองสารที่ปลิวมาโดนไร่ข้าวโพดข้างเคียงก็ทำให้เสียหายได้', 'ถ้าพ่นถังเดียวกับที่เคยใส่ 2,4-D ต้องล้างถังให้สะอาดมากก่อนนำไปพ่นข้าวโพด'],
    sources: [HSRC.nswHerbDamage, CSRC.hrac],
    matchKeywords: ['2,4-d', '24d', 'ทูโฟดี', 'ออกซิน', 'ใบบิด'],
  },
  {
    id: 'paraquat',
    nameTh: 'พาราควอต',
    nameEn: 'paraquat',
    category: 'สารกำจัดวัชพืช',
    chemClass: 'ไบพิริดิลเลียม',
    group: 'HRAC 22 (D)',
    mode: 'แย่งอิเล็กตรอนจากการสังเคราะห์แสง ทำให้ใบไหม้ภายในไม่กี่ชั่วโมง',
    formulations: ['—'],
    uses: [],
    restricted: true,
    restrictedReason: 'วัตถุอันตรายชนิดที่ 4 — ห้ามผลิต นำเข้า ส่งออก ใช้ และครอบครอง ตั้งแต่ 1 มิถุนายน 2563',
    warnings: ['เอกสารคำแนะนำเก่าหลายฉบับยังอ้างถึงพาราควอต ห้ามนำไปปฏิบัติ', 'ถ้ามีสารเหลือค้างในครอบครอง ให้ติดต่อสำนักงานเกษตรอำเภอเพื่อส่งคืนและทำลายอย่างถูกวิธี', 'ใช้ไกลโฟเสทหรือกลูโฟซิเนต-แอมโมเนียมแทนในขั้นตอนพ่นก่อนเตรียมดิน'],
    sources: [HSRC.nswWeed, CSRC.doaBan],
    matchKeywords: ['พาราควอต', 'paraquat', 'กรัมม็อกโซน', 'ห้ามใช้', 'วัตถุอันตรายชนิดที่ 4'],
  },
  {
    id: 'chlorpyrifos',
    nameTh: 'คลอร์ไพริฟอส',
    nameEn: 'chlorpyrifos',
    category: 'สารกำจัดแมลง',
    chemClass: 'ออร์กาโนฟอสเฟต',
    group: 'IRAC 1B',
    mode: 'ยับยั้งเอนไซม์อะเซทิลโคลีนเอสเทอเรส',
    formulations: ['—'],
    uses: [],
    restricted: true,
    restrictedReason: 'วัตถุอันตรายชนิดที่ 4 — ห้ามผลิต นำเข้า ส่งออก ใช้ และครอบครอง ตั้งแต่ 1 มิถุนายน 2563',
    warnings: ['เอกสารคำแนะนำเก่าที่ยังระบุคลอร์ไพริฟอสสำหรับหนอนเจาะลำต้นหรือมอดดิน ห้ามนำไปปฏิบัติ', 'ให้ใช้สารที่ยังขึ้นทะเบียนได้แทน เช่น คลุกเมล็ดด้วยอิมิดาโคลพริด 70% WS สำหรับมอดดิน'],
    sources: [CSRC.doaBan, CSRC.irac],
    matchKeywords: ['คลอร์ไพริฟอส', 'chlorpyrifos', 'ห้ามใช้', 'วัตถุอันตรายชนิดที่ 4'],
  },
];

/** คลังสารรวมทั้งหมด ใช้ในหน้า /chemicals */
export const allChemicals: ChemicalEntry[] = [...chemicals, ...herbicides];

export const chemicalById = (id: string) => allChemicals.find((c) => c.id === id);

export const chemicalCategories = [
  'สารกำจัดแมลง',
  'สารป้องกันกำจัดโรคพืช',
  'สารกำจัดวัชพืช',
  'สารกำจัดสัตว์ศัตรูพืช',
  'สารรมโรงเก็บ',
  'ชีวภัณฑ์',
] as const;

/** หลักการใช้สารให้ปลอดภัยและไม่ให้ศัตรูพืชดื้อยา */
export const chemicalGuide = {
  rotation:
    'สลับกลุ่มกลไกการออกฤทธิ์ (ตัวเลข IRAC / FRAC / HRAC) ทุก 2–3 ครั้งที่พ่น ห้ามสลับระหว่างสารที่มีรหัสกลุ่มเดียวกัน เช่น คลอแรนทรานิลิโพรลกับฟลูเบนไดอะไมด์เป็นกลุ่ม 28 เหมือนกัน สลับกันไม่ได้',
  threshold:
    'พ่นเมื่อถึงระดับเศรษฐกิจเท่านั้น การพ่นตามปฏิทินทำให้ต้นทุนสูง ศัตรูธรรมชาติตาย และแมลงดื้อยาเร็วขึ้น',
  mixing:
    'ห้ามผสมสารหลายชนิดในถังเดียวโดยไม่มีคำแนะนำ เพราะอาจตกตะกอน เสื่อมฤทธิ์ หรือเป็นพิษต่อข้าวโพด — ถ้าจำเป็นให้ทดสอบผสมในแก้วก่อน',
  timing:
    'พ่นตอนเช้าตรู่หรือเย็น ลมสงบ หลีกเลี่ยงแดดจัดและก่อนฝนตก 4–6 ชั่วโมง สำหรับหนอนกระทู้ลายจุดต้องพ่นให้ลงยอดซึ่งเป็นที่หนอนอาศัย',
  ppe:
    'สวมหน้ากาก แว่นตา ถุงมือยาง เสื้อแขนยาว กางเกงขายาว และรองเท้าบูททุกครั้ง อาบน้ำสระผมและเปลี่ยนเสื้อผ้าทันทีหลังพ่น',
  bees:
    'ข้าวโพดผสมเกสรด้วยลมก็จริง แต่ผึ้งมาเก็บละอองเกสรตัวผู้ หลีกเลี่ยงการพ่นสารกลุ่มนีโอนิโคตินอยด์ ไพรีทรอยด์ และคาร์บาเมตช่วงข้าวโพดออกดอกตัวผู้ในเวลากลางวัน',
  banned:
    'พาราควอตและคลอร์ไพริฟอสเป็นวัตถุอันตรายชนิดที่ 4 ห้ามใช้และห้ามครอบครองตั้งแต่ 1 มิถุนายน 2563 — เอกสารคำแนะนำเก่าที่ยังระบุสารทั้งสองห้ามนำไปปฏิบัติ',
  label:
    'อัตราในคลังนี้คัดมาจากเอกสารราชการไทย แต่ผลิตภัณฑ์แต่ละยี่ห้อมีความเข้มข้นต่างกัน ให้ยึดฉลากผลิตภัณฑ์เป็นหลักเสมอ และสอบถามเจ้าหน้าที่เกษตรอำเภอเมื่อไม่แน่ใจ',
  sources: [HSRC.nswWeed, CSRC.doaBan, CSRC.irac, CSRC.frac, CSRC.hrac],
};

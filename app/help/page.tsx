'use client';

import Link from 'next/link';
import { HelpCircle, Camera, CheckCircle2, XCircle, ShieldAlert, Stethoscope, ScanLine, Phone } from 'lucide-react';
import SiteShell from '@/components/site-shell';
import { PageHeader, Card, Callout, Disclosure, BulletList } from '@/components/ui';

const goodPhoto = [
  'เข้าใกล้จุดที่เป็น ให้เห็นรอยแผล รูเจาะ หรือตัวแมลงเต็มกรอบภาพ',
  'ถ่ายกลางแจ้งตอนเช้าหรือเย็น แสงสม่ำเสมอ ไม่ย้อนแสง',
  'ถ่ายทั้งด้านบนใบและใต้ใบ เพราะบางโรคเห็นชัดเฉพาะใต้ใบ',
  'ถ้าสงสัยราน้ำค้าง ถ่ายตอนเช้าตรู่ที่ยังมีน้ำค้าง จะเห็นผงสีขาวชัด',
  'ถ่ายหลายรูปจากหลายต้น แล้วเลือกรูปที่ชัดที่สุดมาสแกน',
];

const badPhoto = [
  'ถ่ายไกลจนเห็นทั้งแปลง — AI จะแยกรายละเอียดของแผลไม่ออก',
  'ภาพเบลอเพราะมือสั่นหรือลมพัดใบ',
  'ถ่ายย้อนแสงจนใบกลายเป็นเงาดำ',
  'ถ่ายตอนใบเปียกน้ำจนสะท้อนแสง (ยกเว้นกรณีต้องการดูผงสปอร์ตอนเช้า)',
];

export default function HelpPage() {
  return (
    <SiteShell>
      <PageHeader
        eyebrow="User Guide"
        title="คู่มือการใช้งาน"
        description="วิธีใช้ระบบให้ได้ผลแม่นยำที่สุด และสิ่งที่ระบบนี้ทำได้–ทำไม่ได้"
        icon={<HelpCircle size={26} strokeWidth={2.3} />}
      />

      <div className="grid gap-4 md:grid-cols-2 mb-8">
        <Link href="/detect" className="group rounded-4xl bg-leaf-700 text-white p-6 transition hover:-translate-y-0.5 focus-ring">
          <span className="grid place-items-center w-12 h-12 rounded-2xl bg-corn-400 text-leaf-900 mb-3.5">
            <ScanLine size={23} />
          </span>
          <h2 className="text-[18px] font-extrabold mb-1.5">มีรูป → สแกนวินิจฉัย</h2>
          <p className="text-[13.5px] text-leaf-100">แม่นยำกว่า เพราะ AI เห็นลักษณะแผลและตัวแมลงจริง พร้อมตีกรอบจุดที่พบบนภาพ</p>
        </Link>

        <Link href="/diseases#advisor" className="group rounded-4xl card-glass p-6 transition hover:-translate-y-0.5 focus-ring">
          <span className="grid place-items-center w-12 h-12 rounded-2xl bg-corn-100 text-corn-800 mb-3.5">
            <Stethoscope size={23} />
          </span>
          <h2 className="text-[18px] font-extrabold text-leaf-900 mb-1.5">ไม่มีรูป → วินิจฉัยจากอาการ</h2>
          <p className="text-[13.5px] text-leaf-700">เลือกอาการที่พบในแปลง ระบบจะประเมินความเป็นไปได้ และบอกว่าต้องออกไปดูอะไรเพิ่ม</p>
        </Link>
      </div>

      <Card className="mb-6">
        <h2 className="flex items-center gap-2 text-[19px] font-extrabold text-leaf-900 mb-4">
          <Camera size={21} className="text-leaf-600" /> ถ่ายรูปอย่างไรให้ AI วิเคราะห์แม่น
        </h2>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="rounded-3xl bg-leaf-50 p-4">
            <p className="flex items-center gap-2 font-extrabold text-[14.5px] text-leaf-800 mb-2.5">
              <CheckCircle2 size={17} className="text-leaf-600" /> ควรทำ
            </p>
            <BulletList items={goodPhoto} marker="check" />
          </div>
          <div className="rounded-3xl bg-rose-50 p-4">
            <p className="flex items-center gap-2 font-extrabold text-[14.5px] text-rose-800 mb-2.5">
              <XCircle size={17} className="text-rose-600" /> ควรเลี่ยง
            </p>
            <BulletList items={badPhoto} marker="warn" />
          </div>
        </div>
      </Card>

      <div className="space-y-3 mb-8">
        <Disclosure title="ควรเชื่อผลวิเคราะห์ของ AI แค่ไหน" defaultOpen>
          <p className="mb-3">
            ให้ดูค่าความมั่นใจ (%) ที่แสดงคู่กับผลทุกครั้ง
          </p>
          <BulletList
            items={[
              'มากกว่า 70% — มีหลักฐานในภาพค่อนข้างชัด แต่ยังควรเดินสำรวจแปลงยืนยันก่อนตัดสินใจพ่นสาร',
              '40–70% — เป็นแค่ความเป็นไปได้ ควรถ่ายรูปเพิ่มจากมุมอื่นหรือต้นอื่น',
              'ต่ำกว่า 40% — ยังสรุปไม่ได้ ให้ถ่ายใหม่ให้ชัดขึ้น หรือปรึกษาเจ้าหน้าที่เกษตร',
            ]}
          />
          <p className="mt-3">
            ที่สำคัญที่สุดคือ <strong>เกณฑ์ตัดสินใจพ่นสาร (ระดับเศรษฐกิจ)</strong> ที่ระบุไว้ในหน้าแมลงแต่ละชนิด —
            แม้ AI จะเจอแมลง แต่ถ้ายังไม่ถึงเกณฑ์ กรมวิชาการเกษตรก็ไม่แนะนำให้พ่นสาร
          </p>
        </Disclosure>

        <Disclosure title="ระบบนี้ทำอะไรไม่ได้บ้าง">
          <BulletList
            items={[
              'ไม่สามารถวินิจฉัยโรคที่อยู่ในดินหรือในรากโดยไม่ถอนต้นขึ้นมาดู',
              'ไม่สามารถบอกปริมาณสารพิษเชื้อรา (อะฟลาทอกซิน ฟูโมนิซิน) ได้ ต้องส่งตรวจในห้องปฏิบัติการเท่านั้น',
              'ไม่สามารถแทนการวิเคราะห์ดิน — ตัวเลขปุ๋ยที่แม่นที่สุดต้องมาจากใบวิเคราะห์ดินจริง',
              'ไม่ได้เชื่อมกับระบบเตือนภัยของราชการแบบเรียลไทม์ ข้อมูลเตือนภัยรายเดือนอ้างอิงช่วงระบาดตามเอกสารวิชาการ',
              'ไม่รับรองว่าผลิตภัณฑ์สารเคมีที่ระบุยังมีทะเบียนถูกต้องอยู่ในปัจจุบัน ต้องตรวจสอบเลขทะเบียนวัตถุอันตรายบนฉลากเอง',
            ]}
            marker="warn"
          />
        </Disclosure>

        <Disclosure title="ข้อมูลของฉันถูกเก็บไว้ที่ไหน">
          <p>
            ภาพที่อัปโหลดจะถูกส่งไปวิเคราะห์แล้วลบทิ้งทันที ไม่ได้เก็บไว้บนเซิร์ฟเวอร์
            ส่วนประวัติผลการสแกนถูกบันทึกไว้ในเบราว์เซอร์เครื่องของคุณเท่านั้น (localStorage)
            หากล้างข้อมูลเบราว์เซอร์หรือเปลี่ยนเครื่อง ประวัติจะหายไป — สามารถดาวน์โหลดเป็นไฟล์ CSV เก็บไว้ได้จากหน้าประวัติ
          </p>
        </Disclosure>

        <Disclosure title="ทำไมบางโรคถึงไม่มีคำแนะนำสารเคมี">
          <p>
            เพราะเอกสารทางการของกรมวิชาการเกษตร<strong>ไม่ได้ระบุอัตราใช้ไว้</strong> เช่น โรคต้นเน่าทุกชนิด โรคฝักเน่า
            โรคราเขม่าดำ และโรคใบด่างจากไวรัส — ระบบนี้จะไม่เติมตัวเลขที่ไม่มีแหล่งอ้างอิง เพราะการแนะนำอัตราผิดอาจทำให้เกษตรกรเสียเงินฟรี
            หรือเกิดอันตราย ในกรณีเหล่านี้ให้เน้นวิธีเขตกรรมและการจัดการน้ำแทน
          </p>
        </Disclosure>
      </div>

      <Callout tone="danger" title="ความปลอดภัยในการใช้สารเคมี">
        <BulletList
          items={[
            'อ่านฉลากผลิตภัณฑ์ทุกครั้ง เปอร์เซ็นต์สูตรในท้องตลาดอาจต่างจากที่ระบุในคำแนะนำ ถ้า % ต่างกัน อัตราใช้ต้องเปลี่ยนตาม',
            'สวมอุปกรณ์ป้องกัน: หน้ากาก แว่นตา ถุงมือ เสื้อแขนยาว และรองเท้าบูต',
            'พ่นตามลม ไม่พ่นย้อนลม และไม่พ่นขณะลมแรง',
            'เว้นระยะปลอดภัยก่อนเก็บเกี่ยวตามที่ระบุบนฉลาก',
            'สารกลุ่ม 4A มีพิษต่อผึ้งสูง ควรพ่นเช้าตรู่หรือเย็น หลีกเลี่ยงช่วงผึ้งออกหาอาหาร',
            'สลับกลุ่มกลไกการออกฤทธิ์ทุก 30 วัน เพื่อไม่ให้แมลงดื้อสาร',
          ]}
          marker="warn"
        />
      </Callout>

      <Card className="mt-6">
        <h2 className="flex items-center gap-2 text-[18px] font-extrabold text-leaf-900 mb-3">
          <Phone size={20} className="text-leaf-600" /> ปรึกษาเจ้าหน้าที่
        </h2>
        <p className="text-[14px] text-leaf-700 mb-4">
          เมื่อไม่แน่ใจ ให้ติดต่อสำนักงานเกษตรอำเภอในพื้นที่ หรือหน่วยงานด้านล่าง
        </p>
        <ul className="grid gap-2.5 sm:grid-cols-2">
          {[
            { label: 'กรมวิชาการเกษตร', url: 'https://www.doa.go.th/' },
            { label: 'กรมส่งเสริมการเกษตร', url: 'https://www.doae.go.th/' },
            { label: 'ศูนย์วิจัยพืชไร่นครสวรรค์', url: 'https://www.doa.go.th/fc/nakhonsawan/' },
            { label: 'คณะเทคโนโลยีการเกษตร ม.แม่โจ้', url: 'https://ap.mju.ac.th/wtms_index.aspx?&lang=th-TH' },
          ].map((l) => (
            <li key={l.url}>
              <a
                href={l.url} target="_blank" rel="noopener noreferrer"
                className="block rounded-2xl bg-leaf-50 px-4 py-3 font-bold text-[14px] text-leaf-800 hover:bg-leaf-100 transition focus-ring"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </Card>

      <div className="mt-6 rounded-4xl bg-soil-50 ring-1 ring-soil-200 p-5 flex gap-3">
        <ShieldAlert size={20} className="shrink-0 mt-0.5 text-soil-600" />
        <p className="text-[13.5px] text-soil-800 leading-relaxed">
          ระบบนี้พัฒนาขึ้นเพื่อการศึกษาและส่งเสริมการเกษตร ข้อมูลอ้างอิงจากเอกสารเผยแพร่ของกรมวิชาการเกษตร กรมส่งเสริมการเกษตร
          กรมพัฒนาที่ดิน สำนักงานเศรษฐกิจการเกษตร และมหาวิทยาลัยเกษตรศาสตร์ โดยระบุแหล่งที่มาไว้ในทุกหน้า
          ผลวิเคราะห์ของ AI ไม่ใช่คำวินิจฉัยทางการ และไม่ใช้แทนคำแนะนำของเจ้าหน้าที่ส่งเสริมการเกษตร
        </p>
      </div>
    </SiteShell>
  );
}

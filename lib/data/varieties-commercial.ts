import type { Variety, SourceRef } from './types';

/**
 * พันธุ์การค้าของบริษัทเอกชนที่เกษตรกรไทยใช้กันแพร่หลาย
 * ใส่เฉพาะข้อมูลที่ยืนยันได้ (ชื่อพันธุ์ ผู้ผลิต ชนิด) — ตัวเลขผลผลิตและความต้านทานโรคต้องดูจากเอกสารบริษัทและแปลงทดสอบในพื้นที่
 */
const SRC: Record<string, SourceRef> = {
  doaPlant: { label: 'กรมวิชาการเกษตร — ฐานข้อมูลพรรณพืชและพันธุ์พืชรับรอง', url: 'https://doa.go.th/cv/' },
  doaSeed: { label: 'กรมวิชาการเกษตร — ตรวจทะเบียนเมล็ดพันธุ์ควบคุม (แอป DOA Agri Factor)', url: 'https://www.doa.go.th/ard/' },
};

const UNVERIFIED = 'ตัวเลขผลผลิต อายุเก็บเกี่ยว และความต้านทานโรคของพันธุ์การค้าเปลี่ยนตามล็อตและพื้นที่ — ขอเอกสารผลทดสอบในพื้นที่จากตัวแทนจำหน่าย และตรวจเลขทะเบียนบนฉลากก่อนซื้อ';
const HYBRID = 'เป็นพันธุ์ลูกผสม ห้ามเก็บเมล็ดไปปลูกต่อ ต้องซื้อเมล็ดใหม่ทุกฤดู';
const unknownResistance = [{ disease: 'โรคราน้ำค้าง', level: 'ไม่ระบุ' as const }];

type Seed = {
  id: string; nameTh: string; code: string; org: string; cropType: Variety['cropType'];
  keywords: string[]; strengths?: string[]; recommendedFor?: string;
};

const make = (s: Seed): Variety => ({
  id: s.id,
  nameTh: s.nameTh,
  code: s.code,
  cropType: s.cropType,
  hybridType: 'ลูกผสมเดี่ยว',
  org: s.org,
  resistance: unknownResistance,
  strengths: s.strengths ?? ['พันธุ์การค้าที่มีจำหน่ายแพร่หลายในแหล่งปลูกหลักของไทย', HYBRID],
  recommendedFor: s.recommendedFor ?? 'ปลูกเชิงการค้าในพื้นที่ที่มีตัวแทนจำหน่ายและบริการให้คำแนะนำ',
  seedSource: 'ร้านค้าเกษตรและตัวแทนจำหน่ายที่ได้รับอนุญาตของบริษัท',
  notes: [UNVERIFIED],
  sources: [SRC.doaSeed, SRC.doaPlant],
  matchKeywords: s.keywords,
});

const CP = 'บริษัท เครือเจริญโภคภัณฑ์ (ซีพี)';
const PIONEER = 'บริษัท คอร์เทวา อะกริไซแอนซ์ (ไพโอเนียร์)';
const SYNGENTA = 'บริษัท ซินเจนทา (เอ็นเค)';
const DEKALB = 'บริษัท ไบเออร์ (ดีคาล์บ)';
const PACIFIC = 'บริษัท แปซิฟิค ซีดส์';

const FEED = 'เลี้ยงสัตว์' as const;

export const commercialVarieties: Variety[] = [
  make({ id: 'cp301', nameTh: 'ซีพี 301', code: 'CP 301', org: CP, cropType: FEED, keywords: ['ซีพี 301', 'cp 301', 'cp301'] }),
  make({ id: 'cp303', nameTh: 'ซีพี 303', code: 'CP 303', org: CP, cropType: FEED, keywords: ['ซีพี 303', 'cp 303', 'cp303'] }),
  make({ id: 'cp888new', nameTh: 'ซีพี 888 นิว', code: 'CP 888 New', org: CP, cropType: FEED, keywords: ['ซีพี 888', 'cp 888', 'cp888'] }),
  make({ id: 'cp639', nameTh: 'ซีพี 639', code: 'CP 639', org: CP, cropType: FEED, keywords: ['ซีพี 639', 'cp 639', 'cp639'] }),
  make({ id: 'p4546', nameTh: 'ไพโอเนียร์ 4546', code: 'P4546', org: PIONEER, cropType: FEED, keywords: ['ไพโอเนียร์ 4546', 'p4546', 'pioneer 4546'] }),
  make({ id: 'p4554', nameTh: 'ไพโอเนียร์ 4554', code: 'P4554', org: PIONEER, cropType: FEED, keywords: ['ไพโอเนียร์ 4554', 'p4554', 'pioneer 4554'] }),
  make({ id: 'nk48', nameTh: 'เอ็นเค 48', code: 'NK 48', org: SYNGENTA, cropType: FEED, keywords: ['เอ็นเค 48', 'nk 48', 'nk48'] }),
  make({ id: 'nk6253', nameTh: 'เอ็นเค 6253', code: 'NK 6253', org: SYNGENTA, cropType: FEED, keywords: ['เอ็นเค 6253', 'nk 6253', 'nk6253'] }),
  make({ id: 'nk7328', nameTh: 'เอ็นเค 7328', code: 'NK 7328', org: SYNGENTA, cropType: FEED, keywords: ['เอ็นเค 7328', 'nk 7328', 'nk7328', 's 7328'] }),
  make({ id: 'dk9955', nameTh: 'ดีคาล์บ 9955', code: 'DK 9955', org: DEKALB, cropType: FEED, keywords: ['ดีเค 9955', 'ดีคาล์บ 9955', 'dk 9955', 'dk9955'] }),
  make({ id: 'dk9979c', nameTh: 'ดีคาล์บ 9979ซี', code: 'DK 9979C', org: DEKALB, cropType: FEED, keywords: ['ดีเค 9979', 'ดีคาล์บ 9979', 'dk 9979', 'dk9979c'] }),
  make({ id: 'pacific339', nameTh: 'แปซิฟิค 339', code: 'Pacific 339', org: PACIFIC, cropType: FEED, keywords: ['แปซิฟิค 339', 'แปซิฟิก 339', 'pacific 339'] }),
  make({
    id: 'hybrix3', nameTh: 'ข้าวโพดหวาน ไฮบริกซ์ 3', code: 'Hi-Brix 3', org: PACIFIC, cropType: 'หวาน',
    keywords: ['ไฮบริกซ์ 3', 'ไฮ-บริกซ์ 3', 'hi-brix 3', 'hibrix 3'],
    recommendedFor: 'แหล่งปลูกข้าวโพดหวานเพื่อขายฝักสดและส่งโรงงาน',
  }),
  make({
    id: 'sugar75', nameTh: 'ข้าวโพดหวาน ซูการ์ 75', code: 'Sugar 75', org: SYNGENTA, cropType: 'หวาน',
    keywords: ['ซูการ์ 75', 'sugar 75', 'sugar75'],
    recommendedFor: 'แหล่งปลูกข้าวโพดหวานเพื่อขายฝักสดและส่งโรงงาน',
  }),
  make({
    id: 'pacific271', nameTh: 'ข้าวโพดฝักอ่อน แปซิฟิค 271', code: 'Pacific 271', org: PACIFIC, cropType: 'ฝักอ่อน',
    keywords: ['แปซิฟิค 271', 'แปซิฟิก 271', 'pacific 271'],
    recommendedFor: 'แหล่งปลูกข้าวโพดฝักอ่อนส่งโรงงานและตลาดสด เช่น ราชบุรี นครปฐม กาญจนบุรี',
  }),
];

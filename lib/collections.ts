/** ชื่อหมวดข้อมูลและป้ายกำกับ — แยกไว้ต่างหากเพื่อให้ฝั่งเบราว์เซอร์ import ได้โดยไม่ดึงโมดูลระบบไฟล์เข้ามา */

export const COLLECTIONS = ['pests', 'diseases', 'biologicals', 'weeds', 'varieties', 'deficiencies', 'chemicals'] as const;
export type CollectionName = (typeof COLLECTIONS)[number];

export const collectionLabels: Record<CollectionName, string> = {
  pests: 'แมลงและสัตว์ศัตรูข้าวโพด',
  diseases: 'โรคข้าวโพด',
  biologicals: 'ชีวภัณฑ์และศัตรูธรรมชาติ',
  weeds: 'วัชพืชในไร่ข้าวโพด',
  varieties: 'พันธุ์ข้าวโพด',
  deficiencies: 'อาการขาดธาตุอาหาร',
  chemicals: 'สารป้องกันกำจัด',
};

/** ฟิลด์ที่ใช้แสดงชื่อรายการในแต่ละหมวด */
export const titleField: Record<CollectionName, string> = {
  pests: 'nameTh',
  diseases: 'nameTh',
  biologicals: 'nameTh',
  weeds: 'nameTh',
  varieties: 'nameTh',
  deficiencies: 'nutrient',
  chemicals: 'nameTh',
};

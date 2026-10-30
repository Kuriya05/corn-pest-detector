'use client';

import { Gamepad2 } from 'lucide-react';
import SiteShell from '@/components/site-shell';
import { PageHeader } from '@/components/ui';
import PestQuiz from '@/components/pest-quiz';

export default function QuizPage() {
  return (
    <SiteShell>
      <PageHeader
        eyebrow="Quiz"
        title="เกมทายศัตรูข้าวโพด"
        description="ดูภาพและอ่านอาการ แล้วทายว่าเป็นแมลง โรค วัชพืช หรือขาดธาตุอะไร ตอบแล้วได้ความรู้และวิธีจัดการไปด้วย คำถามสุ่มจากคลังความรู้ในฐานข้อมูล"
        icon={<Gamepad2 size={26} strokeWidth={2.3} />}
      />
      <PestQuiz />
    </SiteShell>
  );
}

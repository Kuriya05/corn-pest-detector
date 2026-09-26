import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // เพิ่มบรรทัดนี้เพื่ออนุญาตให้ IP ของคุณเชื่อมต่อ HMR ได้
  allowedDevOrigins: ['26.155.53.96'],
};

export default nextConfig;
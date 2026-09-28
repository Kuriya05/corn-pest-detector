import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['26.155.53.96'],
  // @libsql/client เป็น pure JS/WASM ไม่ต้องระบุ external ใน webpack
};

export default nextConfig;

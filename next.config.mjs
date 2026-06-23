import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // ホームディレクトリの余分な package-lock.json を誤検出する警告を防ぐため、
  // このプロジェクトをワークスペースのルートとして明示する
  outputFileTracingRoot: __dirname,
};

export default nextConfig;

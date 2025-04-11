/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',  // Cấu hình build output
  reactStrictMode: true,  // Bật Strict Mode của React
  env: {},                // Thêm các biến môi trường nếu cần
};

module.exports = nextConfig;  // Không cần dùng createNextIntlPlugin nữa

const createNextIntlPlugin = require('next-intl/plugin');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',  // Cấu hình build output
  reactStrictMode: true,  // Bật Strict Mode của React
  env: {},                // Thêm các biến môi trường nếu cần
};

// Kết hợp nextConfig với next-intl
const withNextIntl = createNextIntlPlugin();

// Export cấu hình cuối cùng
module.exports = withNextIntl(nextConfig);

/**
 * 🚀 Script Tự Động Fix Class Tailwind (Phục vụ Chuyển Đổi Sang Design Token)
 * 
 * Mục đích:
 * - Script này sẽ quét toàn bộ thư mục `src/`.
 * - Tự động thay thế các class tiện ích TailwindCSS cũ (ví dụ: text-gray-400, bg-gray-100)
 *   thành các class token mới (ví dụ: text-muted-foreground, bg-muted, text-primary, v.v.).
 * - Đảm bảo toàn bộ dự án đồng bộ theo hệ thống Design Token mới được định nghĩa trong `tailwind.config.ts`.
 *
 * Cách sử dụng:
 * 1. Đặt file script này ở thư mục gốc của dự án (cùng cấp với `package.json`).
 * 2. Chạy thủ công bằng lệnh:
 * 
 *    ```bash
 *    node fix-tailwind-class.js
 *    ```
 * 
 * 3. Script sẽ tự động sinh ra các file `.fixed.tsx`, `.fixed.ts`, `.fixed.jsx`, `.fixed.js`.
 *    (Các file gốc ban đầu sẽ **không bị thay đổi** để đảm bảo an toàn.)
 *
 * 4. Sau khi hoàn tất, script sẽ hỏi:
 *    - Nếu chọn **Yes**: Tự động **ghi đè** file gốc và **xoá file `.fixed`**.
 *    - Nếu chọn **No**: Giữ lại file `.fixed`, dev tự đối chiếu và cập nhật thủ công.
 * 
 * Thời điểm nên sử dụng:
 * - Sau khi **nâng cấp hệ thống Tailwind Design System** (ví dụ: đổi sang sử dụng `primary`, `muted`, v.v.).
 * - Sau khi **chỉnh sửa lớn cấu hình Tailwind của dự án**.
 * - Trước khi thực hiện **refactor lớn** hoặc chuẩn bị **release chính thức**.
 *
 * Ghi chú:
 * - Chỉ quét thư mục `src/`.
 * - Bỏ qua các thư mục: `node_modules/`, `.next/`, `public/`, `out/`.
 * - Cực kỳ an toàn: chỉ overwrite file nếu được xác nhận đồng ý từ dev.
 * 
 * Tác giả: Team Dozu 🚀
 */


const fs = require('fs');
const path = require('path');
const readline = require('readline');

const TARGET_DIR = path.join(__dirname, 'src');
const FILE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];

const REPLACEMENTS = [
  { from: /\bborder-gray-\d+\b/g, to: 'border-border' },
  { from: /\btext-gray-\d+\b/g, to: 'text-muted-foreground' },
  { from: /\bbg-gray-\d+\b/g, to: 'bg-muted' },
  { from: /\bhover:bg-gray-\d+\b/g, to: 'hover:bg-muted' },
  { from: /\bhover:text-gray-\d+\b/g, to: 'hover:text-muted-foreground' },
  { from: /\bhover:border-gray-\d+\b/g, to: 'hover:border-border' },
  { from: /\btext-black\b/g, to: 'text-foreground' },
  { from: /\btext-white\b/g, to: 'text-foreground' },
  { from: /\bbg-black\b/g, to: 'bg-background' },
  { from: /\bbg-white\b/g, to: 'bg-background' },
  { from: /\btext-blue-(500|600|700)\b/g, to: 'text-primary' },
  { from: /\bbg-blue-(100|200)\b/g, to: 'bg-primary' },
  { from: /\btext-red-(500|600|700)\b/g, to: 'text-destructive' },
  { from: /\bbg-red-(100|200)\b/g, to: 'bg-destructive' },
  { from: /\btext-green-(500|600|700)\b/g, to: 'text-accent' },
  { from: /\bbg-green-(100|200)\b/g, to: 'bg-accent' },
];

const fixedFiles = [];

function processFile(filePath) {
  const ext = path.extname(filePath);
  if (!FILE_EXTENSIONS.includes(ext)) return;

  const content = fs.readFileSync(filePath, 'utf8');
  let newContent = content;
  let changed = false;

  for (const { from, to } of REPLACEMENTS) {
    if (from.test(newContent)) {
      newContent = newContent.replace(from, to);
      changed = true;
    }
  }

  if (changed) {
    const newFilePath = filePath.replace(ext, `.fixed${ext}`);
    fs.writeFileSync(newFilePath, newContent, 'utf8');
    console.log(`✅ Đã tạo: ${newFilePath}`);
    fixedFiles.push({ original: filePath, fixed: newFilePath });
  }
}

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (['node_modules', '.next', 'public', 'out'].includes(file)) continue;
      walk(fullPath);
    } else {
      processFile(fullPath);
    }
  }
}

function askOverwrite() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('⚡ Bạn có muốn overwrite file gốc bằng file .fixed không? (y/N): ', (answer) => {
    if (answer.trim().toLowerCase() === 'y') {
      fixedFiles.forEach(({ original, fixed }) => {
        fs.copyFileSync(fixed, original);
        fs.unlinkSync(fixed);
        console.log(`📝 Đã overwrite: ${original}`);
      });
      console.log('🎉 Tất cả file đã được ghi đè và xoá file .fixed!');
    } else {
      console.log('🚫 Không ghi đè. Các file .fixed vẫn được giữ lại.');
    }
    rl.close();
  });
}

console.log('🚀 Bắt đầu quét và fix Tailwind classes...');
walk(TARGET_DIR);
console.log('✅ Đã tạo xong các file .fixed!');

if (fixedFiles.length > 0) {
  askOverwrite();
} else {
  console.log('👍 Không có file nào cần fix.');
}

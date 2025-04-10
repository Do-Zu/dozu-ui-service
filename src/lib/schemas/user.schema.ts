import { z } from 'zod';

/**
 * Zod schema dùng để validate dữ liệu của một người dùng (User).
 * 
 * Gồm các field:
 * - id: số nguyên đại diện cho mã người dùng
 * - name: chuỗi tên đầy đủ của người dùng
 * - email: chuỗi email hợp lệ
 * 
 * Schema này có thể dùng để kiểm tra dữ liệu từ API, form, hoặc bất kỳ nguồn nào khác
 * trước khi sử dụng trong app, giúp tránh lỗi dữ liệu sai định dạng.
 */

export const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
});

/**
 * Type TypeScript tương ứng với dữ liệu hợp lệ theo `UserSchema`.
 * 
 * Sử dụng khi cần định nghĩa kiểu dữ liệu cho biến, props, hoặc response,
 * đảm bảo đồng bộ giữa schema và kiểu TypeScript.
 */
export type User = z.infer<typeof UserSchema>;


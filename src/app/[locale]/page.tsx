'use client'

import { Link } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl';

export default async function HomePage() {
  const t = useTranslations('home');

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-6 py-16">
      {/* Hero Section */}
      <section className="text-center max-w-3xl space-y-6">
        <h1 className="text-5xl font-extrabold leading-tight tracking-tight">
         {t('welcome')} <br />
        </h1>
        <p className="text-muted-foreground text-lg">
          Tổng hợp bài học, quiz, flashcard, gói nhớ, AI gợi ý lộ trình học tích hợp theo phong cách học riêng của bạn.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
          <Link href="/quiz">
            <Button className="px-6 py-3 text-lg">Bắt đầu ngay</Button>
          </Link>
          <Link href="/about">
            <Button variant="outline" className="px-6 py-3 text-lg">
              Tìm hiểu thêm
            </Button>
          </Link>
        </div>
      </section>

      {/* Feature Preview */}
      <section className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center max-w-5xl w-full">
        <div className="bg-card rounded-xl p-6 shadow-sm">
          <h3 className="text-xl font-semibold mb-2">Quiz & Gói nhớ</h3>
          <p className="text-sm text-muted-foreground">
            Luyện tập kiến thức bằng cách chơi quiz vui nhộn, nhớ nhanh và đúng.
          </p>
        </div>
        <div className="bg-card rounded-xl p-6 shadow-sm">
          <h3 className="text-xl font-semibold mb-2">Flashcard & nhận diện</h3>
          <p className="text-sm text-muted-foreground">
            Flashcard minh hoạ và gợi ý bằng AI để nhớ dễ dàng hơn.
          </p>
        </div>
        <div className="bg-card rounded-xl p-6 shadow-sm">
          <h3 className="text-xl font-semibold mb-2">Lộ trình cá nhân</h3>
          <p className="text-sm text-muted-foreground">
            Phân tích thói quen học tập để tối ưu hóa hiệu quả, hướng dẫn bởi AI.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-20 text-sm text-muted-foreground text-center">
        © 2025 Dozu. Thiết kế và phát triển bởi sinh viên FPT.
      </footer>
    </main>
  );
}

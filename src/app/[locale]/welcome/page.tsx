'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { BookOpen, Calendar, Brain, ArrowRight, HelpCircle, ChevronDown, Quote, Star, Mail, Github, Linkedin, Twitter } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/auth/AuthContext';
import { useAuthNavigation } from '@/hooks/useAuthNavigation';
import Threads from '@/components/react-bits/Threads';
import TextType from '@/components/react-bits/TextType';
import StarBorder from '@/components/react-bits/StarBorder';
import CardSwap, { Card } from '@/components/react-bits/CardSwap';
import Autoplay from 'embla-carousel-autoplay';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

const WelcomePage: React.FC = () => {
  const { updateUser } = useAuth();
  const { handleWelcomeComplete } = useAuthNavigation();

  const t = useTranslations('welcome');

  const handleNavigateNextPage = () => {
    handleWelcomeComplete();
  };

  const features = [
    {
      title: t('sections.personalizedLearning.title'),
      description: t('sections.personalizedLearning.description'),
      icon: BookOpen,
    },
    {
      title: t('sections.smartScheduling.title'),
      description: t('sections.smartScheduling.description'),
      icon: Calendar,
    },
    {
      title: t('sections.adaptiveMethods.title'),
      description: t('sections.adaptiveMethods.description'),
      icon: Brain,
    },
  ];

  useEffect(() => {
    updateUser({ isNewUser: false });
  }, []);

  return (
    <div className="relative w-full min-h-screen bg-white text-black overflow-hidden">
      {/* Content Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        {/* Hero and Features Section with Threads Background */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 z-0 pointer-events-none">
            <Threads
              color={[0.2, 0.2, 0.2]}
              amplitude={1.2}
              distance={0}
              enableMouseInteraction={false}
            />
          </div>

          {/* Hero Section */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-10 lg:mb-20 relative z-10"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-6 leading-tight text-black">
              {t('title')}
            </h1>
            <div className="text-lg sm:text-xl lg:text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              <TextType
                text={t('subtitle')}
                as="p"
                typingSpeed={50}
                initialDelay={500}
                showCursor={true}
                cursorCharacter="|"
                cursorBlinkDuration={0.5}
                className="text-center"
                loop={true}
              />
            </div>
          </motion.section>

        </div>

        {/* CTA Section */}
        <motion.section
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="text-center"
        >
          <StarBorder
            as="button"
            color="#0000FF"
            speed="5s"
            className="mb-4"
            onClick={handleNavigateNextPage}
          >
            <span className="flex items-center font-semibold text-lg group">
              {t('cta.button')}
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </StarBorder>
          {/* <p className="text-gray-600 text-sm">{t('cta.subtitle')}</p> */}
        </motion.section>

        {/* Intro Video Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative w-full py-16 lg:py-32 mb-20 lg:mb-40 overflow-hidden z-10"
        >
          {/* Background layer */}
          <div
            className="absolute inset-0 bg-cover bg-center scale-110 blur-sm"
            style={{
              backgroundImage:
                'url(https://framerusercontent.com/images/n1CUtQNh6MFnf07jCSuDbqX5XIE.png?scale-down-to=1024)',
            }}
          />

          {/* Subtle overlay */}
          <div className="absolute inset-0 bg-black/5" />

          {/* Foreground video - nổi lên như modal */}
          <div className="relative z-10 flex justify-center px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative"
            >
              {/* Glow effect */}
              <div className="absolute -inset-4 bg-white/10 blur-2xl rounded-3xl" />
              
              {/* Video card */}
              <div className="relative w-full max-w-5xl aspect-video rounded-2xl overflow-hidden shadow-2xl border border-white/20 bg-black">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                >
                  <source src="https://pub-4a3aef2ee7734e2d88f95beac2d17412.r2.dev/introduce%20video.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </motion.div>
          </div>
        </motion.section>

         {/* Features Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-10 lg:mb-20 mt-8 lg:mt-16 relative z-20"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Left Content */}
            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <h2 className="text-4xl lg:text-5xl font-bold text-black mb-6">
                  {t('sections.features.title') || 'Tính Năng Nổi Bật'}
                </h2>
                <p className="text-lg text-gray-600 leading-relaxed">
                  {t('sections.features.description') || 'Khám phá những tính năng độc đáo giúp bạn học tập hiệu quả hơn'}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="space-y-4"
              >
                {features.map((feature, index) => {
                  const IconComponent = feature.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                      className="flex items-start gap-4 p-4 rounded-lg hover:bg-black/5 transition-colors duration-300 cursor-pointer group"
                    >
                      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-black/10 border border-black/20 flex items-center justify-center group-hover:bg-black/20 transition-colors duration-300">
                        <IconComponent className="w-6 h-6 text-black" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-black mb-1">
                          {feature.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {feature.description}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="flex flex-wrap gap-4 pt-6"
              >
                <div className="bg-gradient-to-br from-black/5 to-black/10 rounded-lg px-6 py-4 border border-black/20">
                  <div className="text-3xl font-bold text-black">1000+</div>
                  <div className="text-sm text-gray-600 mt-1">Học viên đang sử dụng</div>
                </div>
                <div className="bg-gradient-to-br from-black/5 to-black/10 rounded-lg px-6 py-4 border border-black/20">
                  <div className="text-3xl font-bold text-black">95%</div>
                  <div className="text-sm text-gray-600 mt-1">Tỷ lệ hài lòng</div>
                </div>
                <div className="bg-gradient-to-br from-black/5 to-black/10 rounded-lg px-6 py-4 border border-black/20">
                  <div className="text-3xl font-bold text-black">24/7</div>
                  <div className="text-sm text-gray-600 mt-1">Hỗ trợ liên tục</div>
                </div>
              </motion.div>
            </div>

            {/* Right Content - CardSwap */}
            <div className="relative h-[600px] flex items-center justify-center">
              <CardSwap
                width={400}
                height={500}
                cardDistance={50}
                verticalDistance={60}
                delay={4000}
                pauseOnHover={true}
                skewAmount={5}
                easing="elastic"
              >
                {features.map((feature, index) => {
                  const IconComponent = feature.icon;
                  return (
                    <Card
                      key={index}
                      customClass="bg-white/95 backdrop-blur-md border-black/20 shadow-2xl cursor-pointer hover:shadow-3xl transition-shadow duration-300"
                    >
                      <div className="p-8 h-full flex flex-col">
                        <div className="mb-6">
                          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-black/10 to-black/5 border border-black/20 shadow-inner">
                            <IconComponent className="w-7 h-7 text-black" />
                          </div>
                        </div>
                        <h3 className="text-2xl font-bold mb-4 text-black">
                          {feature.title}
                        </h3>
                        <p className="text-gray-700 text-base leading-relaxed flex-1">
                          {feature.description}
                        </p>
                        <div className="mt-6 pt-4 border-t border-black/10">
                          <span className="text-sm text-gray-500 font-medium">
                            {t('sections.learnMore')}
                          </span>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </CardSwap>
            </div>
          </div>
        </motion.section>

        {/* FAQ Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-20 lg:mb-32 relative z-10"
        >
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 text-sm text-gray-500 mb-4">
                <HelpCircle className="w-4 h-4" />
                <span className="uppercase tracking-wider font-medium">{t('faq.badge')}</span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold text-black mb-4">
                {t('faq.title.normal')} <span className="text-gray-400 italic">{t('faq.title.italic')}</span>
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {t('faq.subtitle')}
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left - Contact Card */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="lg:col-span-1"
            >
              <div className="bg-gradient-to-br from-black/5 to-black/10 rounded-2xl p-8 border border-black/10 h-full flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-black/10 border border-black/20 flex items-center justify-center mb-6">
                  <HelpCircle className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-2xl font-bold text-black mb-3">
                  {t('faq.contact.title')}
                </h3>
                <p className="text-gray-600 mb-6 text-sm">
                  {t('faq.contact.description')}
                </p>
                <Button
                  variant="outline"
                  className="border-black/20 hover:bg-black hover:text-white transition-colors"
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  {t('faq.contact.button')}
                </Button>
              </div>
            </motion.div>

            {/* Right - FAQ Accordion */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="lg:col-span-2"
            >
              <div className="space-y-4">
                {[
                  { id: 'q1', question: t('faq.questions.q1.question'), answer: t('faq.questions.q1.answer') },
                  { id: 'q2', question: t('faq.questions.q2.question'), answer: t('faq.questions.q2.answer') },
                  { id: 'q3', question: t('faq.questions.q3.question'), answer: t('faq.questions.q3.answer') },
                  { id: 'q4', question: t('faq.questions.q4.question'), answer: t('faq.questions.q4.answer') },
                  { id: 'q5', question: t('faq.questions.q5.question'), answer: t('faq.questions.q5.answer') },
                ].map((faq, index) => (
                  <FAQItem key={faq.id} faq={faq} index={index} />
                ))}
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* Testimonials Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mb-20 lg:mb-32 relative z-10"
        >
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              <div className="inline-flex items-center gap-2 text-sm text-gray-500 mb-4">
                <Quote className="w-4 h-4" />
                <span className="uppercase tracking-wider font-medium">{t('testimonials.badge')}</span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold text-black mb-4">
                {t('testimonials.title')}
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {t('testimonials.subtitle')}
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="max-w-6xl mx-auto"
          >
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              plugins={[
                Autoplay({
                  delay: 4000,
                }),
              ]}
              className="w-full"
            >
              <CarouselContent>
                {[
                  {
                    id: 1,
                    name: t('testimonials.reviews.r1.name'),
                    role: t('testimonials.reviews.r1.role'),
                    content: t('testimonials.reviews.r1.content'),
                    rating: 5,
                  },
                  {
                    id: 2,
                    name: t('testimonials.reviews.r2.name'),
                    role: t('testimonials.reviews.r2.role'),
                    content: t('testimonials.reviews.r2.content'),
                    rating: 5,
                  },
                  {
                    id: 3,
                    name: t('testimonials.reviews.r3.name'),
                    role: t('testimonials.reviews.r3.role'),
                    content: t('testimonials.reviews.r3.content'),
                    rating: 5,
                  },
                  {
                    id: 4,
                    name: t('testimonials.reviews.r4.name'),
                    role: t('testimonials.reviews.r4.role'),
                    content: t('testimonials.reviews.r4.content'),
                    rating: 5,
                  },
                ].map((review, index) => (
                  <CarouselItem key={review.id} className="md:basis-1/2 lg:basis-1/3">
                    <div className="p-2">
                      <div className="bg-white rounded-2xl p-8 border border-black/10 hover:border-black/20 transition-all duration-300 h-full flex flex-col shadow-sm hover:shadow-lg">
                        <div className="flex items-center gap-1 mb-4">
                          {[...Array(review.rating)].map((_, i) => (
                            <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                        <p className="text-gray-700 leading-relaxed mb-6 flex-1">
                          "{review.content}"
                        </p>
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-black/10 to-black/5 border border-black/20 flex items-center justify-center">
                            <span className="text-lg font-bold text-black">
                              {review.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="font-semibold text-black">{review.name}</div>
                            <div className="text-sm text-gray-500">{review.role}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="flex justify-center gap-2 mt-8">
                <CarouselPrevious className="static translate-y-0" />
                <CarouselNext className="static translate-y-0" />
              </div>
            </Carousel>
          </motion.div>
        </motion.section>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="border-t border-black/10 pt-12 pb-8 relative z-10"
        >
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-8">
            {/* Logo & Description */}
            <div className="md:col-span-4">
              <h3 className="text-2xl font-bold text-black mb-4">Dozu</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                {t('footer.description')}
              </p>
              <div className="flex gap-3">
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-black/5 hover:bg-black hover:text-white border border-black/10 flex items-center justify-center transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter className="w-4 h-4" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-black/5 hover:bg-black hover:text-white border border-black/10 flex items-center justify-center transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-black/5 hover:bg-black hover:text-white border border-black/10 flex items-center justify-center transition-colors"
                  aria-label="Github"
                >
                  <Github className="w-4 h-4" />
                </a>
                <a
                  href="mailto:support@dozu.com"
                  className="w-10 h-10 rounded-full bg-black/5 hover:bg-black hover:text-white border border-black/10 flex items-center justify-center transition-colors"
                  aria-label="Email"
                >
                  <Mail className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="md:col-span-2">
              <h4 className="font-semibold text-black mb-4">{t('footer.quickLinks.title')}</h4>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-gray-600 hover:text-black text-sm transition-colors">
                    {t('footer.quickLinks.features')}
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-black text-sm transition-colors">
                    {t('footer.quickLinks.pricing')}
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-black text-sm transition-colors">
                    {t('footer.quickLinks.about')}
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-black text-sm transition-colors">
                    {t('footer.quickLinks.blog')}
                  </a>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div className="md:col-span-2">
              <h4 className="font-semibold text-black mb-4">{t('footer.resources.title')}</h4>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-gray-600 hover:text-black text-sm transition-colors">
                    {t('footer.resources.helpCenter')}
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-black text-sm transition-colors">
                    {t('footer.resources.tutorials')}
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-black text-sm transition-colors">
                    {t('footer.resources.community')}
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-black text-sm transition-colors">
                    {t('footer.resources.contact')}
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div className="md:col-span-2">
              <h4 className="font-semibold text-black mb-4">{t('footer.legal.title')}</h4>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-gray-600 hover:text-black text-sm transition-colors">
                    {t('footer.legal.privacy')}
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-black text-sm transition-colors">
                    {t('footer.legal.terms')}
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-black text-sm transition-colors">
                    {t('footer.legal.cookies')}
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-black text-sm transition-colors">
                    {t('footer.legal.license')}
                  </a>
                </li>
              </ul>
            </div>

            {/* Newsletter */}
            <div className="md:col-span-2">
              <h4 className="font-semibold text-black mb-4">{t('footer.newsletter.title')}</h4>
              <p className="text-gray-600 text-sm mb-4">
                {t('footer.newsletter.description')}
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder={t('footer.newsletter.placeholder')}
                  className="flex-1 px-3 py-2 text-sm border border-black/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/20"
                />
                <Button size="sm" className="bg-black hover:bg-black/90 text-white">
                  {t('footer.newsletter.button')}
                </Button>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-black/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-600">
              {t('footer.copyright')}
            </p>
            <p className="text-sm text-gray-600">
              {t('footer.madeWith')} <span className="text-red-500">♥</span> {t('footer.by')}
            </p>
          </div>
        </motion.footer>

      </div>
    </div>
  );
};

// FAQ Item Component
const FAQItem: React.FC<{ faq: { id: string; question: string; answer: string }; index: number }> = ({ faq, index }) => {
  const [isOpen, setIsOpen] = useState(index === 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
      className="bg-white rounded-xl border border-black/10 overflow-hidden hover:border-black/20 transition-colors"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-black/5 transition-colors"
      >
        <span className="text-lg font-semibold text-black pr-4">{faq.question}</span>
        <ChevronDown
          className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-6 pb-5 pt-2 text-gray-600 leading-relaxed">
          {faq.answer}
        </div>
      </div>
    </motion.div>
  );
};

export default WelcomePage;

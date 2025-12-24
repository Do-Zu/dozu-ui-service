'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
    BookOpen,
    Calendar,
    Brain,
    ArrowRight,
    HelpCircle,
    ChevronDown,
    Star,
    Mail,
    Github,
    Linkedin,
    Twitter,
} from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/auth/AuthContext';
import { useAuthNavigation } from '@/hooks/useAuthNavigation';
import Threads from '@/components/react-bits/Threads';
import TextType from '@/components/react-bits/TextType';
import StarBorder from '@/components/react-bits/StarBorder';
import CardSwap, { Card } from '@/components/react-bits/CardSwap';
import Particles from '@/components/react-bits/Particles';
import SplitText from '@/components/react-bits/SplitText';

const WelcomePage: React.FC = () => {
    const { updateUser } = useAuth();
    const { handleWelcomeComplete } = useAuthNavigation();
    const featuresRef = React.useRef<HTMLElement>(null);

    const viewportOnce = { once: true, amount: 0.2 } as const;

    const t = useTranslations('welcome');

    const handleNavigateNextPage = () => {
        handleWelcomeComplete();
    };

    const handleLearnMore = () => {
        featuresRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
        });
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
        <div className="relative min-h-screen w-full overflow-hidden bg-white text-black">
            <Particles
                className="absolute inset-0 z-0"
                particleCount={500}
                particleSpread={10}
                speed={0.05}
                particleBaseSize={90}
                moveParticlesOnHover={true}
                alphaParticles={false}
                disableRotation={false}
            />
            <div className="relative z-10 w-full">
                <div className="relative overflow-hidden">
                    <div className="pointer-events-none absolute inset-0 z-0">
                        <Threads amplitude={2.5} distance={0.15} enableMouseInteraction={false} />
                    </div>

                    {/* Hero Section */}
                    <motion.section
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={viewportOnce}
                        transition={{ duration: 0.8 }}
                        className="relative z-10 mb-16 text-center lg:mb-24"
                    >
                        {/* Badge */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={viewportOnce}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="mb-6 mt-10 inline-flex items-center gap-2 rounded-full border-2 dark:text-slate-400 px-4 py-2 shadow-sm"
                        >
                            <Star className="size-4" />
                            <span className="text-sm font-medium ">{t('badge')}</span>
                        </motion.div>

                        {/* Title with gradient */}
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={viewportOnce}
                            transition={{ duration: 0.8, delay: 0.3 }}
                            className="mb-8 text-5xl font-bold leading-tight sm:text-6xl lg:text-8xl"
                        >
                            <SplitText
                                text={t('title')}
                                className="text-center text-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text "
                                delay={100}
                                duration={0.6}
                                ease="power3.out"
                                splitType="chars"
                                from={{ opacity: 0, y: 40 }}
                                to={{ opacity: 1, y: 0 }}
                                threshold={0.1}
                                rootMargin="-100px"
                                textAlign="center"
                                tag="h1"
                            />
                        </motion.h1>

                        {/* Subtitle */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={viewportOnce}
                            transition={{ duration: 0.8, delay: 0.5 }}
                            className="mx-auto mb-12 max-w-3xl text-lg leading-relaxed text-gray-600 sm:text-xl lg:text-2xl"
                        >
                            <TextType
                                text={t('subtitle')}
                                as="p"
                                typingSpeed={50}
                                initialDelay={800}
                                showCursor={true}
                                cursorCharacter="|"
                                cursorBlinkDuration={0.5}
                                className="text-center h-52"
                                loop={true}
                            />
                        </motion.div>

                        {/* CTA Buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={viewportOnce}
                            transition={{ duration: 0.8, delay: 0.7 }}
                            className="flex flex-col items-center justify-center gap-4 sm:flex-row"
                        >
                            <StarBorder
                                as="button"
                                color="#3B82F6"
                                speed="5s"
                                className="w-full rounded-3xl sm:w-auto"
                                onClick={handleNavigateNextPage}
                            >
                                <div className="group flex items-center justify-center px-6 py-2.5 text-base font-semibold">
                                    {t('cta.button')}
                                    <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
                                </div>
                            </StarBorder>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleLearnMore}
                                className="w-full rounded-full border-2 border-gray-200 bg-white px-8 py-4 text-lg font-semibold shadow-sm transition-all hover:bg-gray-50 hover:shadow-md dark:text-gray-700 sm:w-auto"
                            >
                                <span className="flex items-center justify-center gap-2">
                                    <HelpCircle className="size-5" />
                                    {t('cta.learn_more')}
                                </span>
                            </motion.button>
                        </motion.div>

                        {/* Trust indicators */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={viewportOnce}
                            transition={{ duration: 0.8, delay: 0.9 }}
                            className="mt-12 flex items-center justify-center gap-8 text-sm text-gray-500"
                        >
                            <div className="flex items-center gap-2">
                                <div className="flex -space-x-2">
                                    <div className="size-8 rounded-full border-2 border-white bg-gradient-to-br from-blue-400 to-blue-600" />
                                    <div className="size-8 rounded-full border-2 border-white bg-gradient-to-br from-purple-400 to-purple-600" />
                                    <div className="size-8 rounded-full border-2 border-white bg-gradient-to-br from-pink-400 to-pink-600" />
                                </div>
                                <span className="font-medium text-gray-700">1000+ members</span>
                            </div>
                            <div className="h-4 w-px bg-gray-300" />
                            <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="size-4 fill-yellow-400 text-yellow-400" />
                                ))}
                                <span className="ml-1 font-medium text-gray-700">4.9/5</span>
                            </div>
                        </motion.div>
                    </motion.section>
                </div>

                {/* Intro Video Section */}
                <motion.section
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={viewportOnce}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="relative z-10 mb-20 w-full overflow-hidden py-16 lg:mb-40 lg:py-32"
                >
                    <Image
                        src="https://framerusercontent.com/images/n1CUtQNh6MFnf07jCSuDbqX5XIE.png?scale-down-to=1024"
                        alt=""
                        aria-hidden
                        fill
                        priority
                        sizes="100vw"
                        className="pointer-events-none absolute inset-0 scale-125 rounded-2xl object-cover object-center opacity-90 blur-sm"
                    />
                    <div className="absolute inset-0 bg-black/5" />
                    <div className="relative z-10 flex justify-center px-4 sm:px-6 lg:px-8">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={viewportOnce}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            className="relative"
                        >
                            {/* Glow effect */}
                            <div className="absolute -inset-4 rounded-3xl bg-white/10 blur-2xl" />

                            {/* Video card */}
                            <div className="relative aspect-video w-full max-w-5xl overflow-hidden rounded-2xl border border-white/20 bg-black shadow-2xl">
                                <video autoPlay loop muted playsInline className="size-full object-cover">
                                    <source
                                        src="https://pub-4a3aef2ee7734e2d88f95beac2d17412.r2.dev/introduce%20video.mp4"
                                        type="video/mp4"
                                    />
                                    Your browser does not support the video tag.
                                </video>
                            </div>
                        </motion.div>
                    </div>
                </motion.section>

                {/* Features Section */}
                <div className="px-4">
                    <motion.section
                        ref={featuresRef}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={viewportOnce}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="relative z-20 mx-32 mb-10 mt-8 lg:mb-20 lg:mt-16"
                    >
                        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-2">
                            {/* Left Content */}
                            <div className="space-y-8">
                                <motion.div
                                    initial={{ opacity: 0, x: -30 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={viewportOnce}
                                    transition={{ duration: 0.6, delay: 0.3 }}
                                >
                                    <h2 className="mb-6 text-4xl font-bold text-black lg:text-5xl">
                                        {t('sections.features.title') || 'Tính Năng Nổi Bật'}
                                    </h2>
                                    <p className="text-lg leading-relaxed text-gray-600">
                                        {t('sections.features.description') ||
                                            'Khám phá những tính năng độc đáo giúp bạn học tập hiệu quả hơn'}
                                    </p>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, x: -30 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={viewportOnce}
                                    transition={{ duration: 0.6, delay: 0.4 }}
                                    className="space-y-4"
                                >
                                    {features.map((feature, index) => {
                                        const IconComponent = feature.icon;
                                        return (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, x: -20 }}
                                                whileInView={{ opacity: 1, x: 0 }}
                                                viewport={viewportOnce}
                                                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                                                className="group flex cursor-pointer items-start gap-4 rounded-lg p-4 transition-colors duration-300 hover:bg-black/5"
                                            >
                                                <div className="flex size-12 shrink-0 items-center justify-center rounded-lg border border-black/20 bg-black/10 transition-colors duration-300 group-hover:bg-black/20 dark:bg-black/20">
                                                    <IconComponent className="size-6 text-black" />
                                                </div>
                                                <div>
                                                    <h3 className="mb-1 text-lg font-semibold text-black">
                                                        {feature.title}
                                                    </h3>
                                                    <p className="text-sm text-gray-600 dark:text-white">
                                                        {feature.description}
                                                    </p>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={viewportOnce}
                                    transition={{ duration: 0.6, delay: 0.8 }}
                                    className="flex flex-wrap gap-4 pt-6"
                                >
                                    <div className="rounded-lg border border-black/20 bg-gradient-to-br from-black/5 to-black/10 px-6 py-4">
                                        <div className="text-3xl font-bold text-black">1000+</div>
                                        <div className="mt-1 text-sm text-gray-600">Học viên đang sử dụng</div>
                                    </div>
                                    <div className="rounded-lg border border-black/20 bg-gradient-to-br from-black/5 to-black/10 px-6 py-4">
                                        <div className="text-3xl font-bold text-black">95%</div>
                                        <div className="mt-1 text-sm text-gray-600">Tỷ lệ hài lòng</div>
                                    </div>
                                    <div className="rounded-lg border border-black/20 bg-gradient-to-br from-black/5 to-black/10 px-6 py-4">
                                        <div className="text-3xl font-bold text-black">24/7</div>
                                        <div className="mt-1 text-sm text-gray-600">Hỗ trợ liên tục</div>
                                    </div>
                                </motion.div>
                            </div>

                            {/* Right Content - CardSwap */}
                            <div className="relative flex h-[600px] items-center justify-center">
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
                                                <div className="flex h-full flex-col p-8">
                                                    <div className="mb-6">
                                                        <div className="inline-flex size-14 items-center justify-center rounded-xl border border-black/20 bg-gradient-to-br from-black/10 to-black/5 shadow-inner">
                                                            <IconComponent className="size-7 text-black" />
                                                        </div>
                                                    </div>
                                                    <h3 className="mb-4 text-2xl font-bold text-black">
                                                        {feature.title}
                                                    </h3>
                                                    <p className="flex-1 text-base leading-relaxed text-gray-700">
                                                        {feature.description}
                                                    </p>
                                                    <div className="mt-6 border-t border-black/10 pt-4">
                                                        <span className="text-sm font-medium text-gray-500">
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
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={viewportOnce}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="relative z-10 mb-20 lg:mb-32 px-20"
                    >
                        <div className="mb-12 text-center">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={viewportOnce}
                                transition={{ duration: 0.6, delay: 0.5 }}
                            >
                                <div className="mb-4 inline-flex items-center gap-2 text-sm text-gray-500">
                                    <HelpCircle className="size-4" />
                                    <span className="font-medium uppercase tracking-wider">{t('faq.badge')}</span>
                                </div>
                                <h2 className="mb-4 text-4xl font-bold text-black lg:text-5xl">
                                    {t('faq.title.normal')}{' '}
                                    <span className="italic text-gray-400">{t('faq.title.italic')}</span>
                                </h2>
                                <p className="mx-auto max-w-2xl text-lg text-gray-600">{t('faq.subtitle')}</p>
                            </motion.div>
                        </div>

                        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                            {/* Left - Contact Card */}
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={viewportOnce}
                                transition={{ duration: 0.6, delay: 0.6 }}
                                className="lg:col-span-1"
                            >
                                <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-black/10 bg-gradient-to-br from-black/5 to-black/10 p-8 text-center">
                                    <div className="mb-6 flex size-16 items-center justify-center rounded-full border border-black/20 bg-black/10">
                                        <HelpCircle className="size-8 text-black" />
                                    </div>
                                    <h3 className="mb-3 text-2xl font-bold text-black">{t('faq.contact.title')}</h3>
                                    <p className="mb-6 text-sm text-gray-600">{t('faq.contact.description')}</p>
                                    <Button
                                        variant="outline"
                                        className="border-black/20 transition-colors hover:bg-black hover:text-white"
                                    >
                                        <ArrowRight className="mr-2 size-4" />
                                        {t('faq.contact.button')}
                                    </Button>
                                </div>
                            </motion.div>

                            {/* Right - FAQ Accordion */}
                            <motion.div
                                initial={{ opacity: 0, x: 30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={viewportOnce}
                                transition={{ duration: 0.6, delay: 0.7 }}
                                className="lg:col-span-2"
                            >
                                <div className="space-y-4">
                                    {[
                                        {
                                            id: 'q1',
                                            question: t('faq.questions.q1.question'),
                                            answer: t('faq.questions.q1.answer'),
                                        },
                                        {
                                            id: 'q2',
                                            question: t('faq.questions.q2.question'),
                                            answer: t('faq.questions.q2.answer'),
                                        },
                                        {
                                            id: 'q3',
                                            question: t('faq.questions.q3.question'),
                                            answer: t('faq.questions.q3.answer'),
                                        },
                                        {
                                            id: 'q4',
                                            question: t('faq.questions.q4.question'),
                                            answer: t('faq.questions.q4.answer'),
                                        },
                                        {
                                            id: 'q5',
                                            question: t('faq.questions.q5.question'),
                                            answer: t('faq.questions.q5.answer'),
                                        },
                                    ].map((faq, index) => (
                                        <FAQItem key={faq.id} faq={faq} index={index} />
                                    ))}
                                </div>
                            </motion.div>
                        </div>
                    </motion.section>

                    {/* Footer */}
                    <motion.footer
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={viewportOnce}
                        transition={{ duration: 0.8, delay: 0.9 }}
                        className="relative z-10 border-t border-black/10 pb-8 pt-12"
                    >
                        <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-12">
                            {/* Logo & Description */}
                            <div className="md:col-span-4">
                                <h3 className="mb-4 text-2xl font-bold text-black">Dozu</h3>
                                <p className="mb-6 text-sm leading-relaxed text-gray-600">{t('footer.description')}</p>
                                <div className="flex gap-3">
                                    <a
                                        href="#"
                                        className="flex size-10 items-center justify-center rounded-full border border-black/10 bg-black/5 transition-colors hover:bg-black hover:text-white"
                                        aria-label="Twitter"
                                    >
                                        <Twitter className="size-4" />
                                    </a>
                                    <a
                                        href="#"
                                        className="flex size-10 items-center justify-center rounded-full border border-black/10 bg-black/5 transition-colors hover:bg-black hover:text-white"
                                        aria-label="LinkedIn"
                                    >
                                        <Linkedin className="size-4" />
                                    </a>
                                    <a
                                        href="#"
                                        className="flex size-10 items-center justify-center rounded-full border border-black/10 bg-black/5 transition-colors hover:bg-black hover:text-white"
                                        aria-label="Github"
                                    >
                                        <Github className="size-4" />
                                    </a>
                                    <a
                                        href="mailto:support@dozu.com"
                                        className="flex size-10 items-center justify-center rounded-full border border-black/10 bg-black/5 transition-colors hover:bg-black hover:text-white"
                                        aria-label="Email"
                                    >
                                        <Mail className="size-4" />
                                    </a>
                                </div>
                            </div>

                            {/* Quick Links */}
                            <div className="md:col-span-2">
                                <h4 className="mb-4 font-semibold text-black">{t('footer.quickLinks.title')}</h4>
                                <ul className="space-y-3">
                                    <li>
                                        <a
                                            href="#"
                                            className="text-sm text-gray-600 transition-colors hover:text-black"
                                        >
                                            {t('footer.quickLinks.features')}
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#"
                                            className="text-sm text-gray-600 transition-colors hover:text-black"
                                        >
                                            {t('footer.quickLinks.pricing')}
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#"
                                            className="text-sm text-gray-600 transition-colors hover:text-black"
                                        >
                                            {t('footer.quickLinks.about')}
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#"
                                            className="text-sm text-gray-600 transition-colors hover:text-black"
                                        >
                                            {t('footer.quickLinks.blog')}
                                        </a>
                                    </li>
                                </ul>
                            </div>

                            {/* Resources */}
                            <div className="md:col-span-2">
                                <h4 className="mb-4 font-semibold text-black">{t('footer.resources.title')}</h4>
                                <ul className="space-y-3">
                                    <li>
                                        <a
                                            href="#"
                                            className="text-sm text-gray-600 transition-colors hover:text-black"
                                        >
                                            {t('footer.resources.helpCenter')}
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#"
                                            className="text-sm text-gray-600 transition-colors hover:text-black"
                                        >
                                            {t('footer.resources.tutorials')}
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#"
                                            className="text-sm text-gray-600 transition-colors hover:text-black"
                                        >
                                            {t('footer.resources.community')}
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#"
                                            className="text-sm text-gray-600 transition-colors hover:text-black"
                                        >
                                            {t('footer.resources.contact')}
                                        </a>
                                    </li>
                                </ul>
                            </div>

                            {/* Legal */}
                            <div className="md:col-span-2">
                                <h4 className="mb-4 font-semibold text-black">{t('footer.legal.title')}</h4>
                                <ul className="space-y-3">
                                    <li>
                                        <a
                                            href="#"
                                            className="text-sm text-gray-600 transition-colors hover:text-black"
                                        >
                                            {t('footer.legal.privacy')}
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#"
                                            className="text-sm text-gray-600 transition-colors hover:text-black"
                                        >
                                            {t('footer.legal.terms')}
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#"
                                            className="text-sm text-gray-600 transition-colors hover:text-black"
                                        >
                                            {t('footer.legal.cookies')}
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#"
                                            className="text-sm text-gray-600 transition-colors hover:text-black"
                                        >
                                            {t('footer.legal.license')}
                                        </a>
                                    </li>
                                </ul>
                            </div>

                            {/* Newsletter */}
                            <div className="md:col-span-2">
                                <h4 className="mb-4 font-semibold text-black">{t('footer.newsletter.title')}</h4>
                                <p className="mb-4 text-sm text-gray-600">{t('footer.newsletter.description')}</p>
                                <div className="flex gap-2">
                                    <input
                                        type="email"
                                        placeholder={t('footer.newsletter.placeholder')}
                                        className="flex-1 rounded-lg border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
                                    />
                                    <Button size="sm" className="bg-black text-white hover:bg-black/90">
                                        {t('footer.newsletter.button')}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Bar */}
                        <div className="flex flex-col items-center justify-between gap-4 border-t border-black/10 pt-8 md:flex-row">
                            <p className="text-sm text-gray-600">{t('footer.copyright')}</p>
                            <p className="text-sm text-gray-600">
                                {t('footer.madeWith')} <span className="text-red-500">♥</span> {t('footer.by')}
                            </p>
                        </div>
                    </motion.footer>
                </div>
            </div>
        </div>
    );
};

// FAQ Item Component
const FAQItem: React.FC<{ faq: { id: string; question: string; answer: string }; index: number }> = ({
    faq,
    index,
}) => {
    const [isOpen, setIsOpen] = useState(index === 0);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
            className="overflow-hidden rounded-xl border border-black/10 bg-white transition-colors hover:border-black/20"
        >
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex w-full items-center justify-between px-6 py-5 text-left transition-colors hover:bg-black/5"
            >
                <span className="pr-4 text-lg font-semibold text-black">{faq.question}</span>
                <ChevronDown
                    className={`size-5 shrink-0 text-gray-500 transition-transform duration-300 ${
                        isOpen ? 'rotate-180' : ''
                    }`}
                />
            </button>
            <div
                className={`overflow-hidden transition-all duration-300 ${
                    isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
            >
                <div className="px-6 pb-5 pt-2 leading-relaxed text-gray-600">{faq.answer}</div>
            </div>
        </motion.div>
    );
};

export default WelcomePage;

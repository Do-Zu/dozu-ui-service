'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { BookOpen, Calendar, Brain, ArrowRight } from 'lucide-react';

const WelcomePage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<number>(0);

  const sections = [
    {
      title: 'Personalized Learning',
      description: 'Customize your learning experience based on your preferences and goals.',
      icon: <BookOpen className="h-10 w-10 text-white" />,
      color: '#003554',
    },
    {
      title: 'Smart Scheduling',
      description: 'Plan your study sessions efficiently with our intelligent scheduling system.',
      icon: <Calendar className="h-10 w-10 text-white" />,
      color: '#003566',
    },
    {
      title: 'Adaptive Methods',
      description: 'Learn with methods that adapt to your progress and learning style.',
      icon: <Brain className="h-10 w-10 text-white" />,
      color: '#001d3d',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#003554] to-[#001d3d]">
      <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-7xl mx-auto w-full">
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Welcome to Your Learning Journey
          </h1>
          <p className="text-xl text-[#a3c9e0] max-w-3xl mx-auto">
            Discover a smarter way to learn with personalized methods and efficient scheduling
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl mb-16"
        >
          {sections.map((section, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className={`rounded-xl p-6 cursor-pointer transition-all duration-300 ${activeSection === index ? 'scale-105 shadow-xl' : 'opacity-80 hover:opacity-100'}`}
              style={{ backgroundColor: section.color }}
              onClick={() => setActiveSection(index)}
            >
              <div className="bg-opacity-20 bg-white rounded-full p-4 inline-block mb-4">
                {section.icon}
              </div>
              <h2 className="text-2xl font-semibold text-white mb-2">{section.title}</h2>
              <p className="text-[#a3c9e0]">{section.description}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="text-center"
        >
          <Button
            size="lg"
            className="bg-white hover:bg-[#a3c9e0] text-[#003554] font-semibold px-8 py-6 rounded-full transition-all duration-300 transform hover:scale-105"
          >
            Get Started
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <p className="text-[#a3c9e0] mt-4">Your personalized learning experience awaits</p>
        </motion.div>
      </div>

      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="py-6 text-center text-[#a3c9e0] bg-[#00294a] bg-opacity-50"
      >
        <p>© Learning Platform • Personalized Learning Made Simple</p>
      </motion.div>
    </div>
  );
};

export default WelcomePage;

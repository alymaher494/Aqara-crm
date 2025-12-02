import Link from 'next/link';
import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image'; // Import Image component

export default function HeroSection() {
  return (
    <motion.section
      id="hero"
      className="relative flex flex-col items-center justify-center min-h-screen text-center py-16 px-4 overflow-hidden bg-white rtl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="relative z-10 max-w-6xl mx-auto px-4">
        <motion.h1
          className="text-4xl md:text-5xl lg:text-6xl font-bold text-heading-color leading-tight mb-4 drop-shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          إنجاز لإدارة علاقة العملاء في العقارات
        </motion.h1>
        <motion.p
          className="text-lg md:text-xl text-foreground mb-8 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          نظام شامل لإدارة عملائك، صفقاتك، وفرصك بذكاء اصطناعي.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Link href="#contact" className="bg-primary text-primary-foreground px-8 py-3 rounded-lg text-lg font-bold shadow-lg transition-all duration-300 hover:scale-105 hover:bg-blue-700">
            ابدأ الآن
          </Link>
        </motion.div>
        <motion.div
          className="mt-12 flex justify-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <Image
            src="/macbook-crm-dashboard.png" // Placeholder for the MacBook Air image
            alt="CRM Dashboard on MacBook Air"
            width={1920}
            height={1080}
            layout="responsive"
            objectFit="contain"
            className="rounded-xl shadow-2xl border border-gray-200"
          />
        </motion.div>
      </div>
    </motion.section>
  );
}
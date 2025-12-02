'use client';

import { motion } from 'framer-motion';
import { BrainCircuit, BarChart3, MessageSquare, UserCheck, ShieldCheck } from 'lucide-react';
import AboutIcon from './AboutIcon';

export default function AboutSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
  };

  return (
    <section id="about" className="py-16 px-4 bg-white/90">
      <div className="max-w-4xl mx-auto text-center">
        <motion.h2
          className="text-3xl md:text-4xl font-bold text-blue-900 mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          لماذا Aqara Plus CRM؟
        </motion.h2>
        <motion.p
          className="text-lg text-blue-800 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          يركز Aqara Plus CRM على تسهيل عمليات البيع العقاري، وتحسين أداء فريقك، وزيادة الإيرادات من خلال واجهة سهلة وذكاء اصطناعي متكامل وتقارير تفاعلية.
        </motion.p>
        <motion.div
          className="flex flex-wrap justify-center gap-6 mt-8"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={itemVariants}><AboutIcon icon={<BrainCircuit className="w-7 h-7 text-pink-600" />} text="ذكاء اصطناعي متكامل" /></motion.div>
          <motion.div variants={itemVariants}><AboutIcon icon={<BarChart3 className="w-7 h-7 text-blue-600" />} text="تقارير وتحليلات متقدمة" /></motion.div>
          <motion.div variants={itemVariants}><AboutIcon icon={<MessageSquare className="w-7 h-7 text-orange-600" />} text="حملات WhatsApp ذكية" /></motion.div>
          <motion.div variants={itemVariants}><AboutIcon icon={<UserCheck className="w-7 h-7 text-purple-600" />} text="إدارة الموظفين والحضور" /></motion.div>
          <motion.div variants={itemVariants}><AboutIcon icon={<ShieldCheck className="w-7 h-7 text-gray-700" />} text="أمان وخصوصية عالية" /></motion.div>
        </motion.div>
      </div>
    </section>
  );
}
'use client';

import { motion } from 'framer-motion';
import { Handshake, BrainCircuit, BarChart3, MapPin } from 'lucide-react'; // Updated icons
import FeatureCard from './FeatureCard';

export default function FeaturesSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
  };

  return (
    <section id="features" className="py-16 px-4 bg-white rtl">
      <motion.h2
        className="text-3xl md:text-4xl font-bold text-heading-color text-center mb-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        لماذا إنجاز؟
      </motion.h2>
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={itemVariants}><FeatureCard icon={<Handshake className="w-8 h-8 text-accent" />} title="إدارة العملاء" desc="تتبع عملائك بكفاءة عالية." /></motion.div>
        <motion.div variants={itemVariants}><FeatureCard icon={<BrainCircuit className="w-8 h-8 text-accent" />} title="ذكاء اصطناعي" desc="تحليلات ذكية للفرص." /></motion.div>
        <motion.div variants={itemVariants}><FeatureCard icon={<BarChart3 className="w-8 h-8 text-accent" />} title="تقارير مفصلة" desc="إحصائيات يومية." /></motion.div>
        <motion.div variants={itemVariants}><FeatureCard icon={<MapPin className="w-8 h-8 text-accent" />} title="تتبع العقارات" desc="إدارة الوحدات بسهولة." /></motion.div>
      </motion.div>
    </section>
  );
}
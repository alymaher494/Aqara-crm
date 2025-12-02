'use client';

import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import TestimonialCard from './TestimonialCard';

const testimonials = [
  {
    name: 'أحمد جمال',
    company: 'ARQA',
    text: 'نظام Aqara Plus CRM ساعدنا في تنظيم عمليات البيع وزيادة الإيرادات بشكل ملحوظ.',
  },
  {
    name: 'سارة علي',
    company: 'Concept IMD',
    text: 'واجهة النظام سهلة جدًا وفريق الدعم متعاون وسريع الاستجابة.',
  },
  {
    name: 'محمد رمضان',
    company: 'Hashtag',
    text: 'أفضل نظام CRM جربته في السوق العقاري، أنصح به كل الشركات العقارية.',
  },
];

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-16 px-4 bg-white/90">
      <motion.h2
        initial={{ opacity: 0, y: -50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true, amount: 0.5 }}
        className="text-3xl md:text-4xl font-bold text-blue-900 text-center mb-12"
      >
        آراء عملائنا
      </motion.h2>
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {testimonials.map((testimonial, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true, amount: 0.5 }}
          >
            <TestimonialCard {...testimonial} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
'use client';

import { motion } from 'framer-motion';

interface ContactFormSectionProps {
  onOpenContactModal: () => void;
}

export default function ContactFormSection({ onOpenContactModal }: ContactFormSectionProps) {
  return (
    <section id="contact" className="py-16 md:py-24 bg-gradient-to-br from-blue-50 via-white to-blue-100 text-center rtl">
      <div className="max-w-4xl mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, amount: 0.3 }}
          className="text-3xl md:text-4xl font-extrabold text-heading-color mb-6"
        >
          جاهز لتبسيط إدارة علاقات العملاء لديك؟
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true, amount: 0.3 }}
          className="text-lg md:text-xl text-foreground mb-10 max-w-2xl mx-auto"
        >
          تواصل معنا اليوم للحصول على عرض توضيحي مجاني واكتشف كيف يمكن لنظام Aqara Plus CRM أن يحول عملك.
        </motion.p>
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true, amount: 0.3 }}
          onClick={onOpenContactModal}
          className="bg-accent hover:bg-green-600 text-white px-10 py-4 rounded-xl text-xl font-bold shadow-lg transition transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-accent focus:ring-opacity-50"
        >
          اطلب عرضًا توضيحيًا الآن
        </motion.button>
      </div>
    </section>
  );
}
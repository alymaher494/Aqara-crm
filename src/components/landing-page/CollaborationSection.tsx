import { motion } from 'framer-motion';
import { Users, Briefcase } from 'lucide-react';

export default function CollaborationSection() {
  return (
    <section id="collaboration" className="py-16 px-4 bg-white rtl">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, amount: 0.5 }}
          className="text-center lg:text-right"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-heading-color mb-6">
            تعاون فعال لنتائج مبهرة
          </h2>
          <p className="text-lg text-foreground mb-8">
            نؤمن بأن العمل الجماعي هو مفتاح النجاح. منصتنا مصممة لتعزيز التعاون بين فرقك، مما يضمن سير العمل بسلاسة وتحقيق الأهداف المشتركة بكفاءة.
          </p>
          <div className="space-y-6">
            <div className="flex items-center justify-center lg:justify-end text-right">
              <Users className="w-8 h-8 text-accent ml-4" />
              <p className="text-lg text-foreground">
                <span className="font-bold">فرق عمل متكاملة:</span> إدارة مهام ومشاريع مشتركة بسهولة.
              </p>
            </div>
            <div className="flex items-center justify-center lg:justify-end text-right">
              <Briefcase className="w-8 h-8 text-accent ml-4" />
              <p className="text-lg text-foreground">
                <span className="font-bold">تواصل مستمر:</span> أدوات تواصل مدمجة لتبادل المعلومات بفعالية.
              </p>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true, amount: 0.5 }}
          className="flex justify-center lg:justify-start"
        >
          {/* Placeholder for an image or illustration */}
          <div className="w-full max-w-md h-64 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 text-xl">
            صورة توضيحية للتعاون
          </div>
        </motion.div>
      </div>
    </section>
  );
}
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Building2, Users, BarChart3, MessageSquare, BrainCircuit, UserCheck, Star, ArrowRight, CheckCircle, Zap, Target, Award, Mail } from 'lucide-react';

export default function LandingPage() {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);



  const handleCloseContactModal = () => {
    setIsContactModalOpen(false);
  };

  // نموذج التواصل السريع
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [formStatus, setFormStatus] = useState<'idle' | 'success' | 'error' | 'loading'>('idle');

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('loading');
    try {
      // هنا يمكن ربط النموذج مع API أو Supabase أو خدمة بريد لاحقاً
      setTimeout(() => {
        setFormStatus('success');
        // Optionally close modal after success
        // handleCloseContactModal();
      }, 1200); // محاكاة نجاح الإرسال
    } catch {
      setFormStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Minimal & Enhanced */}
      <header className="w-full py-6 px-4 md:px-12 border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <span className="text-xl font-semibold text-heading">Aqara Plus CRM</span>
              <p className="text-xs text-muted-foreground">نظام إدارة العقارات المتكامل</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center space-x-6 space-x-reverse">
            <a href="#hero" className="nav-link">الرئيسية</a>
            <a href="#about" className="nav-link">عن النظام</a>
            <a href="#features" className="nav-link">المميزات</a>
            <a href="#testimonials" className="nav-link">آراء العملاء</a>
            <a href="#contact" className="nav-link">تواصل معنا</a>
          </nav>
          <div className="flex items-center space-x-4 space-x-reverse">
            <Link href="/login" className="btn btn-primary">
              تسجيل الدخول
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section - Enhanced Contrast & Spacing */}
      <section id="hero" className="py-20 px-4 md:px-12 bg-gradient-to-br from-background to-muted/20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center space-x-2 space-x-reverse bg-secondary-muted px-3 py-1 rounded-full text-sm font-medium text-secondary">
                  <Zap className="w-4 h-4" />
                  <span>نظام CRM متقدم للعقارات</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-bold text-heading leading-tight">
                  إدارة العقارات
                  <span className="block text-secondary">بأذكى الطرق</span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
                  نظام متكامل لإدارة العملاء والعقارات والمبيعات. يساعدك على تنظيم عملك وزيادة إنتاجيتك بأدوات ذكية وسهلة الاستخدام.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/login" className="btn btn-primary text-center">
                  ابدأ الآن مجاناً
                  <ArrowRight className="w-4 h-4 mr-2" />
                </Link>
                <button className="btn btn-outline">
                  شاهد العرض التوضيحي
                </button>
              </div>

              <div className="grid grid-cols-3 gap-6 pt-8">
                <div className="text-center">
                  <div className="stat-number">500+</div>
                  <div className="stat-label">شركة عقارية</div>
                </div>
                <div className="text-center">
                  <div className="stat-number">10K+</div>
                  <div className="stat-label">عميل نشط</div>
                </div>
                <div className="text-center">
                  <div className="stat-number">95%</div>
                  <div className="stat-label">رضا العملاء</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="card p-8 bg-gradient-to-br from-card to-muted/10">
                <div className="space-y-6">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-heading mb-1">لوحة تحكم ذكية</h3>
                      <p className="text-sm text-muted-foreground">متابعة الأداء في الوقت الفعلي</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="stat-card">
                      <div className="text-lg font-bold text-heading">28</div>
                      <div className="text-xs text-muted-foreground">عميل جديد</div>
                    </div>
                    <div className="stat-card">
                      <div className="text-lg font-bold text-heading">12</div>
                      <div className="text-xs text-muted-foreground">عقار متاح</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="icon-text-group">
                      <CheckCircle className="w-4 h-4 text-success icon" />
                      <span className="text-sm text-muted-foreground text">إدارة شاملة للعملاء</span>
                    </div>
                    <div className="icon-text-group">
                      <CheckCircle className="w-4 h-4 text-success icon" />
                      <span className="text-sm text-muted-foreground text">تتبع المبيعات والعقارات</span>
                    </div>
                    <div className="icon-text-group">
                      <CheckCircle className="w-4 h-4 text-success icon" />
                      <span className="text-sm text-muted-foreground text">تقارير مفصلة وإحصائيات</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements - Enhanced */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center">
                <Award className="w-8 h-8 text-secondary" />
              </div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center">
                <Target className="w-6 h-6 text-accent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Enhanced Icons & Spacing */}
      <section id="features" className="py-20 px-4 md:px-12 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-heading mb-4">
              مميزات النظام المتقدمة
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              أدوات ذكية مصممة خصيصاً لتلبية احتياجات شركات العقارات الحديثة
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="card-minimal p-6">
              <div className="w-12 h-12 bg-primary-muted rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-primary feature-icon" />
              </div>
              <h3 className="text-lg font-semibold text-heading mb-2">إدارة العملاء</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                قاعدة بيانات شاملة للعملاء المحتملين مع تتبع كامل للتفاعلات والاهتمامات
              </p>
            </div>

            <div className="card-minimal p-6">
              <div className="w-12 h-12 bg-secondary-muted rounded-lg flex items-center justify-center mb-4">
                <Building2 className="w-6 h-6 text-secondary feature-icon" />
              </div>
              <h3 className="text-lg font-semibold text-heading mb-2">إدارة العقارات</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                متابعة شاملة للعقارات من الإنشاء حتى البيع مع حالات مفصلة
              </p>
            </div>

            <div className="card-minimal p-6">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-accent feature-icon" />
              </div>
              <h3 className="text-lg font-semibold text-heading mb-2">التقارير والإحصائيات</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                لوحات تحكم تفاعلية مع رسوم بيانية واضحة وتقارير مفصلة
              </p>
            </div>

            <div className="card-minimal p-6">
              <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6 text-success feature-icon" />
              </div>
              <h3 className="text-lg font-semibold text-heading mb-2">الحملات التسويقية</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                إرسال حملات واتساب مخصصة مع تتبع النتائج والردود
              </p>
            </div>

            <div className="card-minimal p-6">
              <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center mb-4">
                <UserCheck className="w-6 h-6 text-warning feature-icon" />
              </div>
              <h3 className="text-lg font-semibold text-heading mb-2">نظام الحضور</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                تتبع حضور الموظفين جغرافياً مع تقارير مفصلة لساعات العمل
              </p>
            </div>

            <div className="card-minimal p-6">
              <div className="w-12 h-12 bg-primary-muted rounded-lg flex items-center justify-center mb-4">
                <BrainCircuit className="w-6 h-6 text-primary feature-icon" />
              </div>
              <h3 className="text-lg font-semibold text-heading mb-2">الذكاء الاصطناعي</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                تحليلات ذكية للتنبؤ بالمبيعات واقتراحات محسنة للأداء
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section - Enhanced Contrast */}
      <section id="about" className="py-20 px-4 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold text-heading">
                  لماذا Aqara Plus CRM؟
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  نظام مصمم خصيصاً لسوق العقارات المصري والعربي، يجمع بين البساطة والقوة لمساعدتك على إدارة عملك بكفاءة أكبر.
                </p>
              </div>

              <div className="space-y-4">
                <div className="icon-text-group">
                  <div className="w-6 h-6 bg-success rounded-full flex items-center justify-center icon">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <div className="text">
                    <h4 className="font-semibold text-heading">سهولة الاستخدام</h4>
                    <p className="text-sm text-muted-foreground">واجهة عربية بسيطة وسهلة التعلم لجميع الموظفين</p>
                  </div>
                </div>

                <div className="icon-text-group">
                  <div className="w-6 h-6 bg-success rounded-full flex items-center justify-center icon">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <div className="text">
                    <h4 className="font-semibold text-heading">أمان عالي</h4>
                    <p className="text-sm text-muted-foreground">تشفير متقدم وحماية كاملة لبيانات عملائك</p>
                  </div>
                </div>

                <div className="icon-text-group">
                  <div className="w-6 h-6 bg-success rounded-full flex items-center justify-center icon">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <div className="text">
                    <h4 className="font-semibold text-heading">دعم فني</h4>
                    <p className="text-sm text-muted-foreground">فريق دعم متخصص متاح 24/7 للمساعدة</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card p-8">
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-heading mb-2">ابدأ تجربتك المجانية</h3>
                  <p className="text-muted-foreground text-sm">14 يوم مجاناً بدون التزام</p>
                </div>

                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="اسم الشركة"
                    className="input w-full"
                  />
                  <input
                    type="email"
                    placeholder="البريد الإلكتروني"
                    className="input w-full"
                  />
                  <input
                    type="tel"
                    placeholder="رقم الهاتف"
                    className="input w-full"
                  />
                  <button className="btn btn-primary w-full">
                    ابدأ التجربة المجانية
                  </button>
                </div>

                <div className="text-center text-xs text-muted-foreground">
                  لا نحتاج لبيانات البطاقة الائتمانية
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section - Enhanced Avatars & Contrast */}
      <section id="testimonials" className="py-20 px-4 md:px-12 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-heading mb-4">
              آراء عملائنا
            </h2>
            <p className="text-lg text-muted-foreground">
              ما يقوله عملاؤنا عن تجربتهم مع Aqara Plus CRM
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card-minimal p-6">
              <div className="flex items-center space-x-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-accent fill-current" />
                ))}
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                &quot;نظام رائع ساعدنا في تنظيم عملنا وزيادة مبيعاتنا بنسبة 40%. الواجهة سهلة والتقارير مفيدة جداً.&quot;
              </p>
              <div className="icon-text-group">
                <div className="w-10 h-10 bg-primary-muted rounded-full flex items-center justify-center testimonial-avatar">
                  <span className="text-sm font-semibold text-primary">أ.م</span>
                </div>
                <div className="text">
                  <div className="font-semibold text-heading text-sm">أحمد محمد</div>
                  <div className="text-xs text-muted-foreground">مدير مبيعات</div>
                </div>
              </div>
            </div>

            <div className="card-minimal p-6">
              <div className="flex items-center space-x-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-accent fill-current" />
                ))}
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                &quot;أفضل نظام CRM استخدمناه. سهل الاستخدام ويحتوي على جميع المميزات التي نحتاجها لإدارة العقارات.&quot;
              </p>
              <div className="icon-text-group">
                <div className="w-10 h-10 bg-secondary-muted rounded-full flex items-center justify-center testimonial-avatar">
                  <span className="text-sm font-semibold text-secondary">ف.ع</span>
                </div>
                <div className="text">
                  <div className="font-semibold text-heading text-sm">فاطمة علي</div>
                  <div className="text-xs text-muted-foreground">مديرة تسويق</div>
                </div>
              </div>
            </div>

            <div className="card-minimal p-6">
              <div className="flex items-center space-x-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-accent fill-current" />
                ))}
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                &quot;الدعم الفني ممتاز والنظام مستقر. ساعدنا في تتبع جميع عملائنا وتحسين خدمة العملاء.&quot;
              </p>
              <div className="icon-text-group">
                <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center testimonial-avatar">
                  <span className="text-sm font-semibold text-accent">م.ح</span>
                </div>
                <div className="text">
                  <div className="font-semibold text-heading text-sm">محمد حسن</div>
                  <div className="text-xs text-muted-foreground">مدير عام</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section - Enhanced Form */}
      <section id="contact" className="py-20 px-4 md:px-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-heading mb-4">
              تواصل معنا
            </h2>
            <p className="text-lg text-muted-foreground">
              لديك أسئلة أو تحتاج للمساعدة؟ نحن هنا لمساعدتك
            </p>
          </div>

          <div className="card p-8">
            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-heading mb-2">الاسم الكامل *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={form.name}
                    onChange={handleFormChange}
                    className="input w-full"
                    placeholder="أدخل اسمك الكامل"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-heading mb-2">البريد الإلكتروني *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={form.email}
                    onChange={handleFormChange}
                    className="input w-full"
                    placeholder="example@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-heading mb-2">رقم الموبايل</label>
                <input
                  type="text"
                  name="phone"
                  value={form.phone}
                  onChange={handleFormChange}
                  className="input w-full"
                  placeholder="مثال: 01012345678"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-heading mb-2">رسالتك</label>
                <textarea
                  name="message"
                  rows={4}
                  value={form.message}
                  onChange={handleFormChange}
                  className="input w-full resize-none"
                  placeholder="اكتب استفسارك أو رسالتك هنا"
                />
              </div>

              <div className="text-center">
                <button
                  type="submit"
                  disabled={formStatus === 'loading'}
                  className="btn btn-primary"
                >
                  {formStatus === 'loading' ? 'جاري الإرسال...' : 'إرسال الرسالة'}
                </button>
              </div>

              {formStatus === 'success' && (
                <div className="text-center p-4 bg-success/10 border border-success rounded-lg">
                  <CheckCircle className="w-5 h-5 text-success mx-auto mb-2" />
                  <p className="text-success font-medium">
                    تم إرسال رسالتك بنجاح! سنقوم بالتواصل معك قريبًا.
                  </p>
                </div>
              )}

              {formStatus === 'error' && (
                <div className="text-center p-4 bg-error/10 border border-error rounded-lg">
                  <p className="text-error font-medium">
                    حدث خطأ أثناء إرسال رسالتك. يرجى المحاولة مرة أخرى.
                  </p>
                </div>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* Footer - Enhanced with Icons */}
      <footer className="bg-card border-t border-border py-12 px-4 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <div className="font-semibold text-heading">Aqara Plus CRM</div>
                  <div className="text-sm text-muted-foreground">نظام إدارة العقارات المتكامل</div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                حلول متكاملة لإدارة العقارات والعملاء بأذكى الطرق التقنية.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-heading mb-4">المنتج</h4>
              <div className="space-y-2">
                <a href="#" className="flex items-center space-x-2 space-x-reverse text-sm text-muted-foreground hover:text-primary">
                  <span>المميزات</span>
                </a>
                <a href="#" className="flex items-center space-x-2 space-x-reverse text-sm text-muted-foreground hover:text-primary">
                  <span>الأسعار</span>
                </a>
                <a href="#" className="flex items-center space-x-2 space-x-reverse text-sm text-muted-foreground hover:text-primary">
                  <span>العرض التوضيحي</span>
                </a>
                <a href="#" className="flex items-center space-x-2 space-x-reverse text-sm text-muted-foreground hover:text-primary">
                  <span>الدعم الفني</span>
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-heading mb-4">الشركة</h4>
              <div className="space-y-2">
                <a href="#" className="flex items-center space-x-2 space-x-reverse text-sm text-muted-foreground hover:text-primary">
                  <span>عن Aqara Plus</span>
                </a>
                <a href="#" className="flex items-center space-x-2 space-x-reverse text-sm text-muted-foreground hover:text-primary">
                  <span>المدونة</span>
                </a>
                <a href="#" className="flex items-center space-x-2 space-x-reverse text-sm text-muted-foreground hover:text-primary">
                  <span>الوظائف</span>
                </a>
                <a href="#" className="flex items-center space-x-2 space-x-reverse text-sm text-muted-foreground hover:text-primary">
                  <span>تواصل معنا</span>
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-heading mb-4">الدعم</h4>
              <div className="space-y-2">
                <a href="#" className="flex items-center space-x-2 space-x-reverse text-sm text-muted-foreground hover:text-primary">
                  <span>المساعدة</span>
                </a>
                <a href="#" className="flex items-center space-x-2 space-x-reverse text-sm text-muted-foreground hover:text-primary">
                  <span>الأسئلة الشائعة</span>
                </a>
                <a href="#" className="flex items-center space-x-2 space-x-reverse text-sm text-muted-foreground hover:text-primary">
                  <span>الدليل</span>
                </a>
                <a href="mailto:support@aqaraplus.com" className="flex items-center space-x-2 space-x-reverse text-sm text-muted-foreground hover:text-primary">
                  <Mail className="w-4 h-4" />
                  <span>support@aqaraplus.com</span>
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-border mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-sm text-muted-foreground">
                جميع الحقوق محفوظة © {new Date().getFullYear()} Aqara Plus CRM
              </div>
              <div className="flex space-x-4 space-x-reverse mt-4 md:mt-0">
                <a href="#" className="text-sm text-muted-foreground hover:text-primary">سياسة الخصوصية</a>
                <a href="#" className="text-sm text-muted-foreground hover:text-primary">الشروط والأحكام</a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Contact Modal */}
      {isContactModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card max-w-md w-full relative">
            <button
              onClick={handleCloseContactModal}
              className="absolute top-4 left-4 text-muted-foreground hover:text-heading"
            >
              ✕
            </button>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-heading mb-4 text-center">تواصل معنا</h3>
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <input
                  type="text"
                  name="name"
                  required
                  value={form.name}
                  onChange={handleFormChange}
                  className="input w-full"
                  placeholder="الاسم الكامل"
                />
                <input
                  type="email"
                  name="email"
                  required
                  value={form.email}
                  onChange={handleFormChange}
                  className="input w-full"
                  placeholder="البريد الإلكتروني"
                />
                <input
                  type="text"
                  name="phone"
                  value={form.phone}
                  onChange={handleFormChange}
                  className="input w-full"
                  placeholder="رقم الهاتف"
                />
                <textarea
                  name="message"
                  rows={3}
                  value={form.message}
                  onChange={handleFormChange}
                  className="input w-full resize-none"
                  placeholder="رسالتك"
                />
                <button
                  type="submit"
                  disabled={formStatus === 'loading'}
                  className="btn btn-primary w-full"
                >
                  {formStatus === 'loading' ? 'جاري الإرسال...' : 'إرسال'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
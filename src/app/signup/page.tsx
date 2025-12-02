'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Building2, AlertCircle, Mail, CheckCircle } from 'lucide-react';
import { useAuth } from '@/components/hooks/useAuth';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from 'next/link';

const signupSchema = z.object({
    name: z.string().min(3, "الاسم يجب أن يكون 3 أحرف على الأقل"),
    email: z.string().email("البريد الإلكتروني غير صحيح"),
    password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "كلمات المرور غير متطابقة",
    path: ["confirmPassword"],
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [serverError, setServerError] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const router = useRouter();
    const { signup } = useAuth();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<SignupFormValues>({
        resolver: zodResolver(signupSchema),
    });

    const onSubmit = async (data: SignupFormValues) => {
        setServerError('');
        try {
            const result = await signup(data.email, data.password, data.name);
            if (result.success) {
                setIsSuccess(true);
            } else {
                setServerError(result.error || 'حدث خطأ أثناء إنشاء الحساب');
            }
        } catch (error) {
            console.error('Signup error:', error);
            setServerError('حدث خطأ غير متوقع');
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4 font-cairo">
                <div className="w-full max-w-md card p-8 shadow-xl border border-border/50 bg-card rounded-2xl text-center space-y-6 animate-in fade-in zoom-in duration-300">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                        <Mail className="w-10 h-10 text-primary" />
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-heading">تم إنشاء الحساب بنجاح!</h2>
                        <p className="text-muted-foreground">
                            شكراً لتسجيلك في عقارة بلس. يرجى فحص بريدك الإلكتروني لتفعيل الحساب.
                        </p>
                    </div>

                    <div className="bg-muted/50 p-4 rounded-lg text-sm text-muted-foreground border border-border/50">
                        <p>لم يصلك البريد؟ تأكد من مجلد "الرسائل غير المرغوب فيها" (Spam) أو حاول مرة أخرى لاحقاً.</p>
                    </div>

                    <Link
                        href="/login"
                        className="btn-primary w-full py-3 rounded-lg font-bold shadow-md hover:shadow-lg transition-all block"
                    >
                        الذهاب لصفحة الدخول
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4 font-cairo">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center space-x-3 space-x-reverse mb-6">
                        <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center shadow-lg">
                            <Building2 className="w-6 h-6 text-primary-foreground" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-heading">Aqara Plus CRM</h1>
                            <p className="text-sm text-muted-foreground">إنشاء حساب جديد</p>
                        </div>
                    </div>
                </div>

                <div className="card p-8 shadow-xl border border-border/50 bg-card rounded-2xl">
                    <div className="space-y-6">
                        <div className="text-center">
                            <h2 className="text-xl font-semibold text-heading">حساب جديد</h2>
                            <p className="text-sm text-muted-foreground mt-2">أدخل بياناتك للتسجيل</p>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            {serverError && (
                                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-center gap-2 text-destructive">
                                    <AlertCircle className="w-5 h-5" />
                                    <p className="text-sm font-medium">{serverError}</p>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-heading">الاسم الكامل</label>
                                <input
                                    type="text"
                                    {...register("name")}
                                    className={`input w-full ${errors.name ? 'border-destructive' : ''}`}
                                    placeholder="الاسم الكامل"
                                />
                                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-heading">البريد الإلكتروني</label>
                                <input
                                    type="email"
                                    {...register("email")}
                                    className={`input w-full ${errors.email ? 'border-destructive' : ''}`}
                                    placeholder="name@company.com"
                                    dir="ltr"
                                />
                                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-heading">كلمة المرور</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        {...register("password")}
                                        className={`input w-full pr-12 ${errors.password ? 'border-destructive' : ''}`}
                                        placeholder="••••••••"
                                        dir="ltr"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-heading">تأكيد كلمة المرور</label>
                                <input
                                    type="password"
                                    {...register("confirmPassword")}
                                    className={`input w-full ${errors.confirmPassword ? 'border-destructive' : ''}`}
                                    placeholder="••••••••"
                                    dir="ltr"
                                />
                                {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="btn-primary w-full py-2.5 rounded-lg font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-70"
                            >
                                {isSubmitting ? 'جاري التسجيل...' : 'إنشاء الحساب'}
                            </button>
                        </form>

                        <div className="text-center text-sm">
                            <span className="text-muted-foreground">لديك حساب بالفعل؟ </span>
                            <Link href="/login" className="text-primary hover:underline font-medium">
                                تسجيل الدخول
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

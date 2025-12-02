"use client";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 space-y-6 border border-secondary/10">
        <h2 className="text-2xl font-bold text-primary text-center mb-2">إنشاء حساب جديد</h2>
        <form className="space-y-4">
          <div>
            <label className="block mb-1 text-text">اسم الشركة</label>
            <Input type="text" placeholder="اسم الشركة" className="w-full" dir="rtl" />
          </div>
          <div>
            <label className="block mb-1 text-text">اسم المستخدم</label>
            <Input type="text" placeholder="اسم المستخدم" className="w-full" dir="rtl" />
          </div>
          <div>
            <label className="block mb-1 text-text">البريد الإلكتروني</label>
            <Input type="email" placeholder="example@email.com" className="w-full" dir="rtl" />
          </div>
          <div>
            <label className="block mb-1 text-text">كلمة المرور</label>
            <Input type="password" placeholder="••••••••" className="w-full" dir="rtl" />
          </div>
          <div>
            <label className="block mb-1 text-text">تأكيد كلمة المرور</label>
            <Input type="password" placeholder="••••••••" className="w-full" dir="rtl" />
          </div>
          <Button type="submit" className="w-full bg-primary text-text hover:bg-primary-dark">إنشاء حساب</Button>
        </form>
        <div className="flex justify-center text-sm mt-2">
          <Link href="/auth/login" className="text-primary hover:underline">لديك حساب بالفعل؟ تسجيل الدخول</Link>
        </div>
      </div>
    </div>
  );
} 
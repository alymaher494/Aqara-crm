'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Users, 
  Building, 
  Bell, 
  Shield, 
  Database,
  Save,
  RefreshCw
} from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    // Show success message
  };

  const tabs = [
    { id: 'general', label: 'عام', icon: Settings },
    { id: 'users', label: 'المستخدمين', icon: Users },
    { id: 'properties', label: 'العقارات', icon: Building },
    { id: 'notifications', label: 'الإشعارات', icon: Bell },
    { id: 'security', label: 'الأمان', icon: Shield },
    { id: 'database', label: 'قاعدة البيانات', icon: Database },
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-black">الإعدادات</h1>
        <p className="mt-2 text-gray-900">إدارة إعدادات النظام والمستخدمين</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === tab.id
                          ? 'bg-primary text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {activeTab === 'general' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  الإعدادات العامة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      اسم الشركة
                    </label>
                    <Input defaultValue="عقارة بلس" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      رقم الهاتف
                    </label>
                    <Input defaultValue="01234567890" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      البريد الإلكتروني
                    </label>
                    <Input defaultValue="info@aqara-plus.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      العنوان
                    </label>
                    <Input defaultValue="القاهرة، مصر" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    وصف الشركة
                  </label>
                  <textarea
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    rows={3}
                    defaultValue="شركة عقارية رائدة في مجال بيع وتأجير العقارات"
                  />
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleSave} disabled={isLoading}>
                    {isLoading ? (
                      <RefreshCw className="w-4 h-4 ml-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 ml-2" />
                    )}
                    حفظ التغييرات
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'users' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  إدارة المستخدمين
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">محمد سمير</h3>
                        <p className="text-sm text-gray-500">مدير المبيعات</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-800">نشط</Badge>
                      <Button size="sm" variant="outline">تعديل</Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">أحمد علي</h3>
                        <p className="text-sm text-gray-500">مندوب مبيعات</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-800">نشط</Badge>
                      <Button size="sm" variant="outline">تعديل</Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">سارة محمد</h3>
                        <p className="text-sm text-gray-500">مندوبة مبيعات</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-800">نشط</Badge>
                      <Button size="sm" variant="outline">تعديل</Button>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <Button className="w-full">
                    <Users className="w-4 h-4 ml-2" />
                    إضافة مستخدم جديد
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'properties' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  إعدادات العقارات
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">أنواع العقارات</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {['شقة', 'فيلا', 'دوبلكس', 'مكتب', 'محل', 'مستودع', 'أرض'].map((type) => (
                      <div key={type} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <span className="text-sm">{type}</span>
                        <Badge className="bg-green-100 text-green-800">مفعل</Badge>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4">حالات العقارات</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {['متاح', 'مؤجر', 'مباع', 'تحت الصيانة'].map((status) => (
                      <div key={status} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <span className="text-sm">{status}</span>
                        <Badge className="bg-green-100 text-green-800">مفعل</Badge>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button onClick={handleSave} disabled={isLoading}>
                    {isLoading ? (
                      <RefreshCw className="w-4 h-4 ml-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 ml-2" />
                    )}
                    حفظ التغييرات
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  إعدادات الإشعارات
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h3 className="font-medium">إشعارات العملاء الجدد</h3>
                      <p className="text-sm text-gray-500">إرسال إشعار عند إضافة عميل جديد</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-4 h-4" />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h3 className="font-medium">إشعارات المهام المتأخرة</h3>
                      <p className="text-sm text-gray-500">إرسال إشعار للمهام المتأخرة</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-4 h-4" />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h3 className="font-medium">إشعارات المواعيد</h3>
                      <p className="text-sm text-gray-500">تذكير بالمواعيد قبل ساعة</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-4 h-4" />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h3 className="font-medium">إشعارات البريد الإلكتروني</h3>
                      <p className="text-sm text-gray-500">إرسال تقارير أسبوعية عبر البريد</p>
                    </div>
                    <input type="checkbox" className="w-4 h-4" />
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button onClick={handleSave} disabled={isLoading}>
                    {isLoading ? (
                      <RefreshCw className="w-4 h-4 ml-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 ml-2" />
                    )}
                    حفظ التغييرات
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  إعدادات الأمان
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">تغيير كلمة المرور</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        كلمة المرور الحالية
                      </label>
                      <Input type="password" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        كلمة المرور الجديدة
                      </label>
                      <Input type="password" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        تأكيد كلمة المرور الجديدة
                      </label>
                      <Input type="password" />
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4">إعدادات الجلسة</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h3 className="font-medium">تسجيل الخروج التلقائي</h3>
                        <p className="text-sm text-gray-500">تسجيل الخروج بعد 30 دقيقة من عدم النشاط</p>
                      </div>
                      <input type="checkbox" defaultChecked className="w-4 h-4" />
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h3 className="font-medium">تسجيل الدخول المزدوج</h3>
                        <p className="text-sm text-gray-500">السماح بتسجيل الدخول من جهازين في نفس الوقت</p>
                      </div>
                      <input type="checkbox" className="w-4 h-4" />
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button onClick={handleSave} disabled={isLoading}>
                    {isLoading ? (
                      <RefreshCw className="w-4 h-4 ml-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 ml-2" />
                    )}
                    حفظ التغييرات
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'database' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  إدارة قاعدة البيانات
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <Database className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                        <h3 className="font-medium">نسخة احتياطية</h3>
                        <p className="text-sm text-gray-500 mb-4">إنشاء نسخة احتياطية من قاعدة البيانات</p>
                        <Button size="sm" className="w-full">
                          إنشاء نسخة احتياطية
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <RefreshCw className="w-8 h-8 text-green-600 mx-auto mb-2" />
                        <h3 className="font-medium">استعادة البيانات</h3>
                        <p className="text-sm text-gray-500 mb-4">استعادة البيانات من نسخة احتياطية</p>
                        <Button size="sm" variant="outline" className="w-full">
                          استعادة البيانات
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h3 className="font-medium">آخر نسخة احتياطية</h3>
                      <p className="text-sm text-gray-500">15 يوليو 2024 - 10:30 ص</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">نجح</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h3 className="font-medium">حجم قاعدة البيانات</h3>
                      <p className="text-sm text-gray-500">2.5 ميجابايت</p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">طبيعي</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
} 
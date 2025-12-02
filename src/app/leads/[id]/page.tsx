"use client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

// بيانات وهمية للعميل
const mockLead = {
  id: 1,
  name: "أحمد علي",
  phone: "01012345678",
  email: "ahmed@example.com",
  status: "مهتم",
  assignedTo: "محمد سمير",
  source: "حملة واتساب - العاصمة الجديدة",
  nationalId: "29805150123456",
  idExpiry: "2027-05-15",
  idImage: "/uploads/id1.jpg",
};

const mockHistory = [
  { date: '2024-06-01 10:00', type: 'إضافة', value: 'تم إضافة العميل بواسطة أحمد علي', user: 'أحمد علي' },
  { date: '2024-06-01 10:05', type: 'تعيين موظف', value: 'تم تعيين الموظف: محمد سمير', user: 'أحمد علي' },
  { date: '2024-06-01 10:10', type: 'تغيير حالة', value: 'جديد → مهتم', user: 'محمد سمير' },
  { date: '2024-06-01 10:15', type: 'تعليق', value: 'تم التواصل مع العميل وسيتم المتابعة غدًا', user: 'محمد سمير' },
];

const statusColors: Record<string, string> = {
  "جديد": "bg-blue-100 text-blue-800 border-blue-300",
  "مهتم": "bg-green-100 text-green-800 border-green-300",
  "تم التواصل": "bg-yellow-100 text-yellow-800 border-yellow-300",
  "غير مهتم": "bg-gray-100 text-gray-800 border-gray-300",
  "محول": "bg-purple-100 text-purple-800 border-purple-300",
};

const userRole = 'admin'; // غيّرها لتجربة الصلاحيات
const allStatuses = ["جديد", "مهتم", "تم التواصل", "غير مهتم", "محول"];
const allEmployees = ["محمد سمير", "أحمد علي"];

export default function LeadDetailsPage() {
  const router = useRouter();
  const lead = mockLead;
  const history = mockHistory;
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState({ ...lead });
  const [successMsg, setSuccessMsg] = useState("");
  const [imgPreview, setImgPreview] = useState(lead.idImage);

  const handleEdit = () => {
    setForm({ ...lead });
    setImgPreview(lead.idImage);
    setEditOpen(true);
    setSuccessMsg("");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelect = (name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImgPreview(URL.createObjectURL(file));
      // In a real app, you'd handle file upload here.
      // For now we just keep the file object in state if needed, or just preview.
      setForm((prev) => ({ ...prev, idImage: file.name }));
    }
  };

  const handleSave = () => {
    setSuccessMsg("تم حفظ التعديلات بنجاح!");
    setEditOpen(false);
    // Here you would implement the actual save logic
  };


  return (
    <div className="max-w-3xl mx-auto my-10 bg-white rounded-2xl shadow-lg p-6 font-cairo rtl text-right">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-primary">بيانات العميل</h1>
        <Button variant="outline" onClick={() => router.push("/leads")}
          className="flex items-center gap-2 border-primary text-primary hover:bg-primary/10">
          <ArrowRight className="w-4 h-4" />
          رجوع للعملاء
        </Button>
      </div>
      {/* زر تعديل حسب الصلاحيات */}
      {(userRole === 'admin' || userRole === 'manager') && (
        <div className="mb-6 flex justify-end">
          <Button className="bg-primary text-white font-bold px-6 py-2 rounded-lg" onClick={handleEdit}>
            تعديل بيانات العميل
          </Button>
        </div>
      )}
      {successMsg && (
        <div className="mb-4 text-green-700 font-bold bg-green-50 border border-green-200 rounded-xl p-3 text-center">
          {successMsg}
        </div>
      )}
      <div className="flex flex-col md:flex-row gap-8">
        {/* صورة البطاقة */}
        <div className="flex-shrink-0 flex flex-col items-center gap-2">
          <div className="w-40 h-28 rounded-xl overflow-hidden border border-border bg-gray-100 flex items-center justify-center">
            <Image src={lead.idImage} alt="صورة البطاقة" width={160} height={110} className="object-cover" />
          </div>
          <span className="text-xs text-muted-foreground">صورة البطاقة</span>
        </div>
        {/* بيانات العميل */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-muted-foreground mb-1">الاسم</div>
            <div className="font-bold text-lg">{lead.name}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">رقم الهاتف</div>
            <div className="font-mono">{lead.phone}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">الحالة</div>
            <span className={`px-2 py-1 rounded text-xs font-bold border ${statusColors[lead.status]}`}>{lead.status}</span>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">الموظف المسؤول</div>
            <div>{lead.assignedTo}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">مصدر العميل</div>
            <div>{lead.source}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">البريد الإلكتروني</div>
            <div>{lead.email}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">رقم البطاقة القومي</div>
            <div className="font-mono">{lead.nationalId}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">تاريخ انتهاء البطاقة</div>
            <div>{lead.idExpiry}</div>
          </div>
        </div>
      </div>
      {/* سجل النشاط */}
      <div className="mt-10">
        <h2 className="text-lg font-bold text-primary mb-3">سجل النشاط</h2>
        <div className="bg-muted rounded-xl p-4 border">
          <ul className="space-y-2">
            {history.map((item, idx) => (
              <li key={idx} className="flex items-center gap-3 text-sm">
                <span className="text-muted-foreground w-32 shrink-0">{item.date}</span>
                <span className="font-bold text-primary w-20 shrink-0">{item.type}</span>
                <span className="flex-1">{item.value}</span>
                <span className="text-xs text-gray-500">{item.user}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      {/* Modal التعديل */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg w-full p-6">
          <h2 className="text-xl font-bold text-primary mb-4">تعديل بيانات العميل</h2>
          <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleSave(); }}>
            <div>
              <Label htmlFor="name">الاسم</Label>
              <Input id="name" name="name" value={form.name} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="phone">رقم الهاتف</Label>
              <Input id="phone" name="phone" value={form.phone} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="status">الحالة</Label>
              <Select value={form.status} onValueChange={val => handleSelect("status", val)}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الحالة" />
                </SelectTrigger>
                <SelectContent>
                  {allStatuses.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="assignedTo">الموظف المسؤول</Label>
              <Select value={form.assignedTo} onValueChange={val => handleSelect("assignedTo", val)}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الموظف" />
                </SelectTrigger>
                <SelectContent>
                  {allEmployees.map(emp => (
                    <SelectItem key={emp} value={emp}>{emp}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="source">مصدر العميل</Label>
              <Input id="source" name="source" value={form.source} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input id="email" name="email" value={form.email} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="nationalId">رقم البطاقة القومي</Label>
              <Input id="nationalId" name="nationalId" value={form.nationalId} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="idExpiry">تاريخ انتهاء البطاقة</Label>
              <Input id="idExpiry" name="idExpiry" value={form.idExpiry} onChange={handleChange} type="date" />
            </div>
            <div>
              <Label htmlFor="idImage">صورة البطاقة</Label>
              <Input id="idImage" name="idImage" type="file" accept="image/*" onChange={handleImage} />
              {imgPreview && (
                <div className="mt-2">
                  <Image src={imgPreview} alt="معاينة البطاقة" width={120} height={80} className="rounded border" />
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>إلغاء</Button>
              <Button type="submit" className="bg-primary text-white font-bold">حفظ التعديلات</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 
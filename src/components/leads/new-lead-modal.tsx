"use client";

import { useState, ChangeEvent } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectItem, SelectTrigger, SelectContent } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getSupabaseClient } from "../lib/supabaseClient";
import { useEffect } from "react";

const statuses = ["جديد", "تم التواصل", "مهتم", "غير مهتم", "تم التحويل"];
const users = ["محمد سمير", "أحمد علي", "سارة محمد"];
const companyId = "11111111-1111-1111-1111-111111111111";

function validateEgyptianID(id: string) {
  // تحقق أساسي: 14 رقم، يبدأ بـ 2 أو 3، كله أرقام
  return /^([23][0-9]{13})$/.test(id);
}

type Lead = {
  id?: number;
  name: string;
  phone: string;
  email?: string;
  status?: string;
  assignedTo?: string;
  notes?: string;
  nationalId?: string;
  idImages?: File[];
};
// استقبل history كـ prop (اختياري)
type Props = {
  open: boolean;
  onClose: (shouldRefresh?: boolean) => void;
  lead?: Lead;
  mode?: 'add' | 'edit' | 'view';
  history?: Array<{date: string, type: string, value: string, user: string}>;
};

export default function NewLeadModal({ open, onClose, lead, mode = 'add', history }: Props) {
  const isView = mode === 'view';
  const isEdit = mode === 'edit';
  const isAdd = mode === 'add';
  const [name, setName] = useState(lead?.name || "");
  const [phone, setPhone] = useState(lead?.phone || "");
  const [email, setEmail] = useState(lead?.email || "");
  const [status, setStatus] = useState(lead?.status || "");
  const [assignedTo, setAssignedTo] = useState(lead?.assignedTo || "");
  const [notes, setNotes] = useState(lead?.notes || "");
  const [idImages, setIdImages] = useState<File[]>(lead?.idImages || []);
  const [nationalId, setNationalId] = useState(lead?.nationalId || "");
  const [idError, setIdError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [employees, setEmployees] = useState<any[]>([]);

  const supabase = getSupabaseClient();

  useEffect(() => {
    async function fetchEmployees() {
      const { data } = await supabase.from('users').select('id, full_name');
      setEmployees(data || []);
    }
    fetchEmployees();
  }, []);

  const handleIdImagesChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setIdImages(Array.from(e.target.files));
    }
  };

  const handleNationalIdChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNationalId(value);
    if (value && !validateEgyptianID(value)) {
      setIdError("رقم البطاقة غير صحيح. يجب أن يكون 14 رقم ويبدأ بـ 2 أو 3.");
    } else {
      setIdError("");
    }
  };

  const handleRemoveImage = (idx: number) => {
    setIdImages((imgs) => imgs.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('handleSubmit called', { name, phone, mode });
    if (!name || !phone) return;
    if (mode === 'add') {
      const { data, error } = await supabase.from('leads').insert({
        full_name: name,
        phone,
        email,
        status,
        assigned_to: assignedTo,
        notes,
        national_id: nationalId || null,
        company_id: companyId,
      });
      console.log('insert result:', { data, error });
      setSuccessMsg("تم إضافة العميل بنجاح!");
      setTimeout(() => {
        setSuccessMsg("");
        onClose(true);
      }, 1500);
      return;
    } else if (mode === 'edit' && lead?.id) {
      const { data, error } = await supabase.from('leads').update({
        full_name: name,
        phone,
        email,
        status,
        assigned_to: assignedTo,
        notes,
        national_id: nationalId || null,
        company_id: companyId,
      }).eq('id', lead.id);
      console.log('update result:', { data, error });
      setSuccessMsg("تم تعديل بيانات العميل بنجاح!");
      setTimeout(() => {
        setSuccessMsg("");
        onClose(true);
      }, 1500);
      return;
    }
    onClose(false);
  };

  // رسالة نجاح
  useEffect(() => {
    if (!open) setSuccessMsg("");
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={() => onClose(false)}>
      <DialogContent className={`w-screen h-screen max-w-none rounded-none p-0 flex flex-col bg-white`} style={{ minHeight: '100vh' }}>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground font-cairo">
            {isAdd && "إضافة عميل جديد"}
            {isEdit && "تعديل بيانات العميل"}
            {isView && "تفاصيل العميل"}
          </DialogTitle>
        </DialogHeader>
        {successMsg && (
          <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg font-bold text-lg animate-fade-in">
            {successMsg}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6 w-full px-0 md:px-0">
          <div className="flex flex-col gap-2 w-full px-8 md:px-16">
            <label className="font-cairo text-base font-bold text-foreground">الاسم *</label>
            {isView ? (
              <div className="rounded-lg bg-gray-100 px-4 py-3 text-lg font-cairo text-black min-h-[48px] flex items-center">{name}</div>
            ) : (
              <Input value={name} onChange={e => setName(e.target.value)} required className="rounded-lg text-lg px-4 py-3 min-h-[48px] font-cairo" />
            )}
          </div>
          <div className="flex flex-col gap-2 w-full px-8 md:px-16">
            <label className="font-cairo text-base font-bold text-foreground">رقم الهاتف *</label>
            {isView ? (
              <div className="rounded-lg bg-gray-100 px-4 py-3 text-lg font-cairo text-black min-h-[48px] flex items-center">{phone}</div>
            ) : (
              <Input value={phone} onChange={e => setPhone(e.target.value)} required className="rounded-lg text-lg px-4 py-3 min-h-[48px] font-cairo" />
            )}
          </div>
          <div className="flex flex-col gap-2 w-full px-8 md:px-16">
            <label className="font-cairo text-base font-bold text-foreground">الإيميل</label>
            {isView ? (
              <div className="rounded-lg bg-gray-100 px-4 py-3 text-lg font-cairo text-black min-h-[48px] flex items-center">{email}</div>
            ) : (
              <Input value={email} onChange={e => setEmail(e.target.value)} className="rounded-lg text-lg px-4 py-3 min-h-[48px] font-cairo" />
            )}
          </div>
          <div className="flex flex-col md:flex-row md:gap-4 w-full px-8 md:px-16">
            <div className="flex-1 w-full">
              <label className="font-cairo text-base font-bold text-foreground">الحالة</label>
              {isView ? (
                <div className="rounded-lg bg-gray-100 px-4 py-3 text-lg font-cairo text-black min-h-[48px] flex items-center">{status}</div>
              ) : (
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="w-full rounded-lg text-lg px-4 py-3 min-h-[48px] font-cairo">{status || "اختر الحالة"}</SelectTrigger>
                  <SelectContent>
                    {statuses.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="flex-1 w-full">
              <label className="font-cairo text-base font-bold text-foreground">الموظف المسؤول</label>
              {isView ? (
                <div className="rounded-lg bg-gray-100 px-4 py-3 text-lg font-cairo text-black min-h-[48px] flex items-center">
                  {employees.find(e => e.id === assignedTo)?.full_name || "-"}
                </div>
              ) : (
                <Select value={assignedTo} onValueChange={setAssignedTo}>
                  <SelectTrigger className="w-full rounded-lg text-lg px-4 py-3 min-h-[48px] font-cairo">
                    {employees.find(e => e.id === assignedTo)?.full_name || "اختر الموظف"}
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((u) => (
                      <SelectItem key={u.id} value={u.id}>{u.full_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2 w-full px-8 md:px-16">
            <label className="font-cairo text-sm font-bold text-foreground">صور بطاقة العميل (اختياري، يمكنك رفع أكثر من صورة)</label>
            {isView ? (
              <div className="flex flex-wrap gap-2 mt-2">
                {idImages && idImages.length > 0 ? idImages.map((img, idx) => (
                  <div key={idx} className="relative w-20 h-20 border rounded-lg overflow-hidden">
                    <img src={typeof img === 'string' ? img : URL.createObjectURL(img)} alt="id" className="object-cover w-full h-full" />
                  </div>
                )) : <span className="text-gray-400">لا يوجد صور</span>}
              </div>
            ) : (
              <>
                <Input type="file" multiple accept="image/*" onChange={handleIdImagesChange} className="rounded-lg" />
                {idImages.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {idImages.map((img, idx) => (
                      <div key={idx} className="relative w-20 h-20 border rounded-lg overflow-hidden">
                        <img src={URL.createObjectURL(img)} alt="id" className="object-cover w-full h-full" />
                        <button type="button" onClick={() => handleRemoveImage(idx)} className="absolute top-1 left-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">×</button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
          {idImages.length > 0 && (
            <div className="flex flex-col gap-2 w-full px-8 md:px-16">
              <label className="font-cairo text-sm font-bold text-foreground">رقم البطاقة القومي (اختياري)</label>
              {isView ? (
                <div className="rounded-lg bg-gray-100 px-3 py-2">{nationalId}</div>
              ) : (
                <Input value={nationalId} onChange={handleNationalIdChange} maxLength={14} className="rounded-lg" />
              )}
              {idError && <span className="text-red-600 text-xs font-cairo">{idError}</span>}
            </div>
          )}
          <div className="flex flex-col gap-2 w-full px-8 md:px-16">
            <label className="font-cairo text-base font-bold text-foreground">ملاحظات</label>
            {isView ? (
              <div className="rounded-lg bg-gray-100 px-4 py-3 text-lg font-cairo text-black min-h-[48px] flex items-center">{notes}</div>
            ) : (
              <Textarea value={notes} onChange={e => setNotes(e.target.value)} className="rounded-lg text-lg px-4 py-3 min-h-[48px] font-cairo" />
            )}
          </div>
          {/* سجل النشاط (History) */}
          {isView && history && (
            <div className="mt-8 w-full px-8 md:px-16">
              <h3 className="font-bold text-lg mb-2 text-foreground">سجل النشاط</h3>
              <div className="space-y-2 overflow-y-auto w-full" style={{ maxHeight: '320px', minHeight: '120px' }}>
                {history.map((item, idx) => (
                  <div key={idx} className="flex flex-col bg-gray-50 rounded-lg p-3 border border-gray-200 w-full">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-500">{item.date}</span>
                      <span className="text-xs text-gray-700">{item.type}</span>
                    </div>
                    <div className="text-sm text-gray-900 font-cairo">{item.value}</div>
                    <div className="text-xs text-gray-500 mt-1">بواسطة: {item.user}</div>
                  </div>
                ))}
                {history.length === 0 && (
                  <div className="text-center text-gray-400">لا يوجد سجل نشاط لهذا العميل.</div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            {isView && (
              <Button type="button" className="bg-primary text-white rounded-lg font-bold" onClick={() => { /* هنا ممكن تفعيل وضع التعديل */ }}>
                تعديل
              </Button>
            )}
            {(isAdd || isEdit) && (
              <Button
                type="submit"
                className="bg-primary text-white rounded-lg font-bold"
                onClick={() => console.log('Save button clicked', { name, phone, mode })}
              >
                {isAdd ? "حفظ العميل" : "حفظ التعديلات"}
              </Button>
            )}
            <Button type="button" onClick={() => onClose(false)} className="rounded-lg bg-white text-black border border-gray-300">إلغاء</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 
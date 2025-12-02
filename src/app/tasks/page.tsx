"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { User, CheckCircle, Edit2, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectItem, SelectTrigger, SelectContent } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getSupabaseClient } from "@/components/lib/supabaseClient";
import { toast } from 'sonner';

const companyId = "11111111-1111-1111-1111-111111111111"; // استخدم UUID حقيقي لشركتك

const taskTypes = ["مكالمة هاتفية", "إرسال واتساب", "زيارة ميدانية", "إرسال بريد إلكتروني"];
const statuses = ["غير مكتملة", "مكتملة"];

export default function TasksPage() {
  const [search, setSearch] = useState("");
  const [showAddTask, setShowAddTask] = useState(false);
  const [editTask, setEditTask] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const supabase = getSupabaseClient();

  // جلب المهام من Supabase
  const fetchTasks = async () => {
    const { data, error } = await supabase.from('tasks').select('*').eq('company_id', companyId);
    if (!error) setTasks(data || []);
  };
  useEffect(() => { fetchTasks(); }, []);

  // إضافة أو تعديل مهمة
  const handleSaveTask = async (e: any) => {
    e.preventDefault();
    const taskData: any = {
      title,
      type,
      due_date: date,
      due_time: time,
      status: status || 'غير مكتملة',
      notes,
      company_id: companyId,
      assigned_to: assignedTo || null,
      // يمكنك ربط lead_id لاحقًا إذا أردت
    };

    try {
      if (editTask) {
        // تعديل
        const { error } = await supabase.from('tasks').update(taskData).eq('id', editTask.id);
        if (error) throw error;
        toast.success('تم تعديل المهمة بنجاح');
      } else {
        // إضافة
        const { error } = await supabase.from('tasks').insert([taskData]);
        if (error) throw error;
        toast.success('تم إضافة المهمة بنجاح');
      }
      setShowAddTask(false);
      await fetchTasks();
    } catch (error: any) {
      console.error('Error saving task:', error);
      toast.error('فشل حفظ المهمة: ' + error.message);
    }
  };

  // حذف مهمة
  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه المهمة؟')) return;

    try {
      const { error } = await supabase.from('tasks').delete().eq('id', taskId);
      if (error) throw error;
      toast.success('تم حذف المهمة بنجاح');
      await fetchTasks();
    } catch (error: any) {
      console.error('Error deleting task:', error);
      toast.error('فشل حذف المهمة: ' + error.message);
    }
  };

  const filteredTasks = tasks.filter((task) =>
    (task.title || '').includes(search) ||
    (task.notes || '').includes(search) ||
    (task.assigned_to || '').includes(search)
  );

  // State for modal fields
  const [title, setTitle] = useState("");
  const [lead, setLead] = useState("");
  const [type, setType] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState("");

  const openAddModal = () => {
    setEditTask(null);
    setTitle("");
    setLead("");
    setType("");
    setDate("");
    setTime("");
    setAssignedTo("");
    setStatus("");
    setNotes("");
    setShowAddTask(true);
  };
  const openEditModal = (task: any) => {
    setEditTask(task);
    setTitle(task.title);
    setLead(task.lead);
    setType(task.type);
    setDate(task.due_date);
    setTime(task.due_time);
    setAssignedTo(task.assigned_to);
    setStatus(task.status);
    setNotes(task.notes || "");
    setShowAddTask(true);
  };
  const closeModal = () => {
    setShowAddTask(false);
  };

  const [employees, setEmployees] = useState<any[]>([]);
  useEffect(() => {
    async function fetchEmployees() {
      const { data } = await supabase.from('users').select('id, full_name');
      setEmployees(data || []);
    }
    fetchEmployees();
  }, []);

  return (
    <div className="p-6 font-cairo">
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-black">المهام اليومية</h1>
          <p className="mt-2 text-gray-900">إدارة ومتابعة مهام فريق المبيعات</p>
        </div>
        <div className="flex gap-2 items-center">
          <Input
            placeholder="بحث عن مهمة أو عميل أو موظف..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-48 md:w-64 bg-input text-foreground placeholder:text-muted-foreground rounded-lg border border-border"
            style={{ fontFamily: 'Tajawal, Cairo, sans-serif' }}
          />
          <Button className="bg-primary text-white rounded-lg font-bold flex gap-2 items-center" onClick={openAddModal}>
            <Plus className="w-4 h-4" /> إضافة مهمة جديدة
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="min-w-full bg-card text-right">
          <thead className="bg-muted">
            <tr>
              <th className="py-3 px-4 font-bold text-foreground">المهمة</th>
              <th className="py-3 px-4 font-bold text-foreground">العميل</th>
              <th className="py-3 px-4 font-bold text-foreground">نوع المهمة</th>
              <th className="py-3 px-4 font-bold text-foreground">التاريخ</th>
              <th className="py-3 px-4 font-bold text-foreground">الوقت</th>
              <th className="py-3 px-4 font-bold text-foreground">الحالة</th>
              <th className="py-3 px-4 font-bold text-foreground">الموظف المسؤول</th>
              <th className="py-3 px-4 font-bold text-foreground">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-muted-foreground">
                  لا يوجد مهام مطابقة للبحث.
                </td>
              </tr>
            ) : (
              filteredTasks.map((task) => (
                <tr key={task.id} className="border-b border-border hover:bg-muted/50 transition">
                  <td className="py-3 px-4 font-medium text-black">{task.title}</td>
                  <td className="py-3 px-4 text-black">{task.lead}</td>
                  <td className="py-3 px-4 text-black">{task.type}</td>
                  <td className="py-3 px-4 text-black">{task.due_date}</td>
                  <td className="py-3 px-4 text-black">{task.due_time}</td>
                  <td className="py-3 px-4">
                    {task.status === "مكتملة" ? (
                      <Badge className="bg-success text-white">مكتملة</Badge>
                    ) : (
                      <Badge className="bg-warning text-warning-foreground">غير مكتملة</Badge>
                    )}
                  </td>
                  <td className="py-3 px-4 flex items-center gap-2 text-black">
                    <User className="w-4 h-4 text-primary" />
                    <span>{employees.find(e => e.id === task.assigned_to)?.full_name || "-"}</span>
                  </td>
                  <td className="py-3 px-4 flex gap-2">
                    <Button className="bg-gray-100 text-black rounded-lg hover:bg-gray-200 px-3 py-1 text-sm font-bold flex gap-1 items-center" onClick={() => openEditModal(task)}>
                      <Edit2 className="w-4 h-4" /> تعديل
                    </Button>
                    <Button className="bg-success text-white rounded-lg px-3 py-1 text-sm font-bold flex gap-1 items-center" onClick={() => {/* هنا يمكن تغيير الحالة لاحقًا */ }}>
                      <CheckCircle className="w-4 h-4" /> تم الإنجاز
                    </Button>
                    <Button className="bg-red-500 text-white rounded-lg px-3 py-1 text-sm font-bold flex gap-1 items-center" onClick={() => handleDeleteTask(task.id)}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2 w-4 h-4"><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><path d="M10 11v6" /><path d="M14 11v6" /></svg> حذف
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Modal إضافة/تعديل مهمة */}
      <Dialog open={showAddTask} onOpenChange={closeModal}>
        <DialogContent className="max-w-xl w-full rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground font-cairo">
              {editTask ? "تعديل مهمة" : "إضافة مهمة جديدة"}
            </DialogTitle>
          </DialogHeader>
          <form className="space-y-4">
            <div>
              <label className="block mb-1 font-cairo">عنوان المهمة *</label>
              <Input value={title} onChange={e => setTitle(e.target.value)} required className="w-full rounded-lg" />
            </div>
            <div>
              <label className="block mb-1 font-cairo">اسم العميل *</label>
              <Input value={lead} onChange={e => setLead(e.target.value)} required className="w-full rounded-lg" />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block mb-1 font-cairo">نوع المهمة *</label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger className="w-full rounded-lg">{type || "اختر النوع"}</SelectTrigger>
                  <SelectContent>
                    {taskTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <label className="block mb-1 font-cairo">الموظف المسؤول *</label>
                <Select value={assignedTo} onValueChange={setAssignedTo}>
                  <SelectTrigger className="w-full rounded-lg">{employees.find(e => e.id === assignedTo)?.full_name || "اختر الموظف"}</SelectTrigger>
                  <SelectContent>
                    {employees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>{emp.full_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block mb-1 font-cairo">التاريخ *</label>
                <Input type="date" value={date} onChange={e => setDate(e.target.value)} required className="w-full rounded-lg" />
              </div>
              <div className="flex-1">
                <label className="block mb-1 font-cairo">الوقت *</label>
                <Input type="time" value={time} onChange={e => setTime(e.target.value)} required className="w-full rounded-lg" />
              </div>
            </div>
            <div>
              <label className="block mb-1 font-cairo">الحالة *</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-full rounded-lg">{status || "اختر الحالة"}</SelectTrigger>
                <SelectContent>
                  {statuses.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block mb-1 font-cairo">ملاحظات</label>
              <Textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full rounded-lg" />
            </div>
            <DialogFooter>
              <Button type="submit" className="bg-primary text-white rounded-lg font-bold" onClick={handleSaveTask}>{editTask ? "حفظ التعديلات" : "إضافة المهمة"}</Button>
              <Button type="button" variant="ghost" onClick={closeModal} className="rounded-lg">إلغاء</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
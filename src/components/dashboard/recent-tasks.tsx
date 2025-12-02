"use client";

const tasks = [
  { task: "متابعة عميل جديد", status: "مفتوحة", due: "2024-06-02", owner: "منى عادل" },
  { task: "تحديث بيانات عقار", status: "مكتملة", due: "2024-06-01", owner: "محمد سمير" },
  { task: "إرسال عرض سعر", status: "مفتوحة", due: "2024-05-31", owner: "أحمد فؤاد" },
  { task: "جدولة اجتماع", status: "مكتملة", due: "2024-05-30", owner: "سارة محمد" },
  { task: "مراجعة مستندات", status: "مفتوحة", due: "2024-05-29", owner: "يوسف خالد" },
];

const statusColor = {
  "مفتوحة": "bg-accent text-text",
  "مكتملة": "bg-primary text-white"
};

export default function RecentTasks() {
  return (
    <div className="bg-white rounded-xl shadow p-4 border border-secondary/10">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-bold text-text">آخر المهام</h3>
        <a href="/tasks" className="text-sm text-primary hover:underline">عرض الكل</a>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm rtl text-right">
          <thead>
            <tr className="bg-background">
              <th className="py-2 px-3 font-bold text-text">المهمة</th>
              <th className="py-2 px-3 font-bold text-text">الحالة</th>
              <th className="py-2 px-3 font-bold text-text">تاريخ الاستحقاق</th>
              <th className="py-2 px-3 font-bold text-text">الموظف المكلف</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task, idx) => (
              <tr key={idx} className="border-b last:border-b-0">
                <td className="py-2 px-3">{task.task}</td>
                <td className="py-2 px-3">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${statusColor[task.status]}`}>{task.status}</span>
                </td>
                <td className="py-2 px-3">{task.due}</td>
                <td className="py-2 px-3">{task.owner}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 
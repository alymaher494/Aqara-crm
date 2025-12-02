"use client";

const leads = [
  { name: "أحمد علي", status: "جديد", date: "2024-06-01", owner: "محمد سمير" },
  { name: "سارة محمد", status: "متواصل", date: "2024-05-30", owner: "أحمد فؤاد" },
  { name: "محمود حسن", status: "مغلق", date: "2024-05-28", owner: "منى عادل" },
  { name: "ليلى إبراهيم", status: "جديد", date: "2024-05-27", owner: "محمد سمير" },
  { name: "يوسف خالد", status: "متواصل", date: "2024-05-25", owner: "أحمد فؤاد" },
];

const statusColor = {
  "جديد": "bg-primary text-white",
  "متواصل": "bg-accent text-text",
  "مغلق": "bg-secondary text-white"
};

export default function RecentLeads() {
  return (
    <div className="bg-white rounded-xl shadow p-4 border border-secondary/10">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-bold text-text">آخر العملاء المضافين</h3>
        <a href="/leads" className="text-sm text-primary hover:underline">عرض الكل</a>
        </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm rtl text-right">
          <thead>
            <tr className="bg-background">
              <th className="py-2 px-3 font-bold text-text">الاسم</th>
              <th className="py-2 px-3 font-bold text-text">الحالة</th>
              <th className="py-2 px-3 font-bold text-text">تاريخ الإضافة</th>
              <th className="py-2 px-3 font-bold text-text">الموظف المسؤول</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead, idx) => (
              <tr key={idx} className="border-b last:border-b-0">
                <td className="py-2 px-3">{lead.name}</td>
                <td className="py-2 px-3">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${statusColor[lead.status]}`}>{lead.status}</span>
                </td>
                <td className="py-2 px-3">{lead.date}</td>
                <td className="py-2 px-3">{lead.owner}</td>
              </tr>
            ))}
          </tbody>
        </table>
                </div>
              </div>
  );
} 
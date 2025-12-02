"use client";

import { useState, useRef, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User } from "lucide-react";
import NewLeadModal from "@/components/leads/new-lead-modal";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { ChevronDown, FileSpreadsheet, Eye, Edit2, XCircle } from "lucide-react";
// حذف استيراد Tooltip مؤقتًا
// import { Tooltip } from "@/components/ui/tooltip";
import { useCallback } from "react";
import * as XLSX from 'xlsx';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useColumnMapping } from "../hooks/useColumnMapping";
import { getSupabaseClient } from "../lib/supabaseClient";

// دعم أسماء الأعمدة المتعددة تلقائيًا
const FIELD_ALIASES: Record<string, string[]> = {
  name: ["اسم", "اسم العميل", "Name", "Request Name", "Client Name", "الاسم", "Full Name", "Customer Name"],
  phone: ["رقم", "رقم الهاتف", "Phone", "Buyer Mobile No", "Mobile", "Primary Phone", "رقم الموبايل", "رقم الجوال", "Phone Number"],
  intlPhone: ["International Phone", "رقم دولي", "Intl Phone", "International Number", "رقم الهاتف الدولي"],
  comment: ["تعليق", "ملاحظة", "Comment", "Client comment", "Sales comment", "Notes", "ملاحظات"],
  source: ["مصدر", "الحملة", "Ad's Name", "Campagin", "Source", "Campaign", "مصدر العميل"],
  date: ["تاريخ", "Date", "Campagin' Date", "تاريخ الإضافة", "تاريخ التسجيل"],
  assignedTo: ["الموظف", "Assign to", "Assigned To", "الموظف المسؤول", "Agent"],
  status: ["حالة", "Client Status ", "Status", "الحالة", "Lead Status"],
};

const statusColors: Record<string, string> = {
  "جديد": "bg-blue-100 text-blue-800 border-blue-300",
  "مهتم": "bg-green-100 text-green-800 border-green-300",
  "تم التواصل": "bg-yellow-100 text-yellow-800 border-yellow-300",
  "غير مهتم": "bg-gray-100 text-gray-800 border-gray-300",
  "محول": "bg-purple-100 text-purple-800 border-purple-300",
};

const allStatuses = ["جديد", "مهتم", "تم التواصل", "غير مهتم", "محول"];
const allEmployees = ["محمد سمير", "أحمد علي"];

const mockLeads = [
  {
    id: 1,
    name: "أحمد علي",
    phone: "01012345678",
    email: "ahmed@example.com",
    status: "جديد",
    assignedTo: "محمد سمير",
    source: "حملة واتساب - العاصمة الجديدة",
    nationalId: "29805150123456",
    idExpiry: "2027-05-15",
    idImage: "/uploads/id1.jpg"
  },
  {
    id: 2,
    name: "سارة محمد",
    phone: "01123456789",
    email: "sara@example.com",
    status: "مهتم",
    assignedTo: "أحمد علي",
    source: "حملة فيسبوك",
    nationalId: "29901010123456",
    idExpiry: "2026-01-01",
    idImage: "/uploads/id2.jpg"
  },
  {
    id: 3,
    name: "محمود حسن",
    phone: "01234567890",
    email: "mahmoud@example.com",
    status: "تم التواصل",
    assignedTo: "محمد سمير",
    source: "حملة واتساب - العاصمة الجديدة",
    nationalId: "30002220123456",
    idExpiry: "2025-02-22",
    idImage: "/uploads/id3.jpg"
  },
];

// Mock history data لكل lead
const mockHistory: Record<number, Array<{date: string, type: string, value: string, user: string}>> = {
  1: [
    { date: '2024-06-01 10:00', type: 'إضافة', value: 'تم إضافة العميل بواسطة أحمد علي', user: 'أحمد علي' },
    { date: '2024-06-01 10:05', type: 'تعيين موظف', value: 'تم تعيين الموظف: محمد سمير', user: 'أحمد علي' },
    { date: '2024-06-01 10:10', type: 'تغيير حالة', value: 'جديد → مهتم', user: 'محمد سمير' },
    { date: '2024-06-01 10:15', type: 'تعليق', value: 'تم التواصل مع العميل وسيتم المتابعة غدًا', user: 'محمد سمير' },
  ],
  2: [
    { date: '2024-06-02 09:00', type: 'إضافة', value: 'تم إضافة العميل بواسطة سارة محمد', user: 'سارة محمد' },
    { date: '2024-06-02 09:10', type: 'تعيين موظف', value: 'تم تعيين الموظف: أحمد علي', user: 'سارة محمد' },
    { date: '2024-06-02 09:20', type: 'تغيير حالة', value: 'جديد → مهتم', user: 'أحمد علي' },
  ],
  3: [
    { date: '2024-06-03 11:00', type: 'إضافة', value: 'تم إضافة العميل بواسطة محمود حسن', user: 'محمود حسن' },
    { date: '2024-06-03 11:10', type: 'تعيين موظف', value: 'تم تعيين الموظف: محمد سمير', user: 'محمود حسن' },
    { date: '2024-06-03 11:20', type: 'تغيير حالة', value: 'جديد → تم التواصل', user: 'محمد سمير' },
  ],
};

// متغير وهمي لدور المستخدم الحالي
const userRole = 'admin'; // يمكن تغييره إلى 'manager' أو 'employee' أو 'sales'

const SYSTEM_FIELDS = [
  { key: 'name', label: 'اسم العميل' },
  { key: 'phone', label: 'رقم الهاتف' },
  { key: 'intlPhone', label: 'رقم الهاتف الدولي' },
  { key: 'comment', label: 'تعليق/ملاحظة' },
  { key: 'source', label: 'مصدر العميل/الحملة' },
  { key: 'date', label: 'تاريخ الإضافة' },
  { key: 'assignedTo', label: 'الموظف المسؤول' },
  { key: 'status', label: 'حالة العميل' },
  { key: '', label: 'تجاهل هذا العمود' },
];

function isValidPhone(phone: string) {
  const cleaned = phone.replace(/\s|-/g, '');
  return (
    (/^01[0-9]{9}$/).test(cleaned) ||
    (/^(\+|00)20[0-9]{10}$/).test(cleaned)
  );
}

function getAutoMapping(headers: string[]): string[] {
  // يحاول ربط الأعمدة تلقائيًا بناءً على FIELD_ALIASES
  return headers.map(h => {
    const header = (h || '').toString().trim().toLowerCase();
    for (const [key, aliases] of Object.entries(FIELD_ALIASES)) {
      if (aliases.some(alias => header.includes(alias.toLowerCase()))) {
        return key;
      }
    }
    return '';
  });
}

export default function LeadsTable() {
  const [search, setSearch] = useState("");
  const [openNewLead, setOpenNewLead] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [employeeFilter, setEmployeeFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"name" | "status" | "assignedTo" | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view'>('add');
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [excelPreview, setExcelPreview] = useState<any[]>([]);
  const [excelErrors, setExcelErrors] = useState<any[]>([]);
  const [excelHeaders, setExcelHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<string[]>([]);
  const [showMappingUI, setShowMappingUI] = useState(false);
  const [editRowIdx, setEditRowIdx] = useState<number | null>(null);
  const [editRowData, setEditRowData] = useState<any>({});
  const [importSummary, setImportSummary] = useState<{success: number, failed: number} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const companyId = "11111111-1111-1111-1111-111111111111"; // استخدم UUID حقيقي من جدول الشركات
  const { mapping: savedMapping, saveMapping, isLoading: mappingLoading } = useColumnMapping(companyId);
  const [showImportModal, setShowImportModal] = useState(false);
  const [leads, setLeads] = useState<any[]>([]);
  const supabase = getSupabaseClient();

  // جلب العملاء من Supabase
  const fetchLeads = async () => {
    const { data, error } = await supabase.from('leads').select('*');
    if (!error) setLeads(data || []);
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  // بعد الاستيراد الناجح، جلب البيانات من جديد
  const handleSaveValidLeads = async () => {
    const supabase = getSupabaseClient();
    const validRows = excelPreview.filter(r => !r.error);
    const invalidRows = excelPreview.filter(r => r.error);
    let successCount = 0;
    let failedCount = invalidRows.length;

    if (validRows.length > 0) {
      // تجهيز البيانات للحفظ (تأكد من الحقول المطلوبة)
      const leadsToInsert = validRows.map(row => ({
        full_name: row.name || '', // يجب أن يكون موجودًا
        phone: row.phone || null,
        email: row.email || null,
        status: row.status || 'جديد',
        source: row.source || null,
        notes: row.comment || null,
        company_id: companyId, // تأكد أن هذا معرف صحيح لشركة موجودة
        // national_id, national_id_image_url, assigned_to, campaign_id, created_by يمكن إضافتهم لاحقًا
      }));
      console.log('Leads to insert:', leadsToInsert); // لمتابعة ما يتم إرساله فعليًا
      const { error } = await supabase.from('leads').insert(leadsToInsert);
      if (!error) {
        successCount = leadsToInsert.length;
      } else {
        console.error('Supabase insert error:', error.message, error.details);
        failedCount += leadsToInsert.length;
      }
    }
    setImportSummary({ success: successCount, failed: failedCount });
    setShowImportModal(false);
    setExcelPreview([]);
    setExcelErrors(invalidRows);
    await fetchLeads(); // تحديث البيانات بعد الحفظ
  };

  // زر إعادة رفع ملف جديد
  const handleResetImport = () => {
    setImportSummary(null);
    setExcelPreview([]);
    setExcelErrors([]);
    setShowImportModal(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // استبدل mockLeads بـ leads
  let filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      (lead.full_name || '').includes(search) ||
      (lead.phone || '').includes(search) ||
      (lead.email || '').includes(search);
    const matchesStatus = statusFilter ? lead.status === statusFilter : true;
    const matchesEmployee = employeeFilter ? lead.assigned_to === employeeFilter : true;
    return matchesSearch && matchesStatus && matchesEmployee;
  });

  if (sortBy) {
    filteredLeads = [...filteredLeads].sort((a, b) => {
      let aValue = "";
      let bValue = "";
      if (sortBy === "name") {
        aValue = a.name;
        bValue = b.name;
      } else if (sortBy === "status") {
        aValue = a.status;
        bValue = b.status;
      } else if (sortBy === "assignedTo") {
        aValue = a.assignedTo;
        bValue = b.assignedTo;
      }
      if (sortDir === "asc") {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });
  }

  const handleOpenView = useCallback((lead: any) => {
    setSelectedLead(lead);
    setModalMode('view');
    setOpenNewLead(true);
  }, []);
  const handleOpenEdit = useCallback((lead: any) => {
    setSelectedLead(lead);
    setModalMode('edit');
    setOpenNewLead(true);
  }, []);
  const handleOpenAdd = useCallback(() => {
    setSelectedLead(null);
    setModalMode('add');
    setOpenNewLead(true);
  }, []);

  const handleDeleteLead = async (leadId: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا العميل؟')) return;
    await supabase.from('leads').delete().eq('id', leadId);
    await fetchLeads();
  };

  // عند رفع ملف جديد، افتح المودال
  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setShowImportModal(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const data = evt.target?.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
      if (!rows.length || !rows[0]) {
        alert("ملف Excel لا يحتوي على بيانات أو رؤوس أعمدة!");
        return;
      }
      const headers = (rows[0] as any[]).map((h: any) => (h || '').toString().trim());
      setExcelHeaders(headers);
      // جلب mapping من Supabase أو auto-mapping
      if (savedMapping && typeof savedMapping === 'object' && Object.keys(savedMapping).length > 0) {
        const mappingObjTyped = savedMapping as Record<string, string | null>;
        const arrMapping = headers.map(h => mappingObjTyped[h] || '');
        setColumnMapping(arrMapping);
      } else {
        setColumnMapping(getAutoMapping(headers));
      }
      setShowMappingUI(true);
    };
    reader.readAsBinaryString(file);
  };

  // بعد المطابقة: معالجة البيانات
  const handleMappingSubmit = async () => {
    // حفظ mapping في Supabase
    const mappingObj: Record<string, string | null> = {};
    excelHeaders.forEach((header, idx) => {
      mappingObj[header] = columnMapping[idx] || null;
    });
    await saveMapping(mappingObj);
    const fileInput = fileInputRef.current;
    if (!fileInput || !fileInput.files?.[0]) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = evt.target?.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
      if (!rows.length || !rows[0]) return;
      const preview: any[] = [];
      const errors: any[] = [];
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i] as any[];
        const mapped: any = {};
        columnMapping.forEach((fieldKey, idx) => {
          if (fieldKey && fieldKey !== '') {
            mapped[fieldKey] = row[idx] || '';
          }
        });
        // تحسين التحقق: استخدم intlPhone إذا توفر، وإلا phone
        if (!mapped.phone && mapped.intlPhone) mapped.phone = mapped.intlPhone;
        // تحقق من صحة الرقم المحلي أو الدولي
        let error = '';
        if (!mapped.name || !mapped.phone) error = 'الاسم أو الرقم ناقص';
        else if (!isValidPhone(mapped.phone) && !(mapped.intlPhone && isValidPhone(mapped.intlPhone))) error = 'رقم غير صالح';
        preview.push({ ...mapped, error });
        if (error) errors.push({ row: i + 1, error });
      }
      setExcelPreview(preview);
      setExcelErrors(errors);
      setShowMappingUI(false);
      setImportSummary(null);
    };
    reader.readAsBinaryString(fileInput.files[0]);
  };

  // تعديل صف في المعاينة
  const handleEditRow = (idx: number) => {
    setEditRowIdx(idx);
    setEditRowData({ ...excelPreview[idx] });
  };
  const handleEditRowChange = (field: string, value: string) => {
    setEditRowData((prev: any) => ({ ...prev, [field]: value }));
  };
  const handleEditRowSave = () => {
    const updated = [...excelPreview];
    // تحقق من صحة البيانات بعد التعديل
    let error = '';
    if (!editRowData.name || !editRowData.phone) error = 'الاسم أو الرقم ناقص';
    else if (!isValidPhone(editRowData.phone)) error = 'رقم غير صالح دوليًا';
    updated[editRowIdx!] = { ...editRowData, error };
    setExcelPreview(updated);
    // أعد حساب الأخطاء
    const errors = updated
      .map((row, idx) => row.error ? { row: idx + 2, error: row.error } : null)
      .filter(Boolean);
    setExcelErrors(errors as any[]);
    setEditRowIdx(null);
    setEditRowData({});
  };
  const handleEditRowCancel = () => {
    setEditRowIdx(null);
    setEditRowData({});
  };

  // تصدير الأخطاء إلى Excel
  const handleExportErrors = () => {
    const errorRows = excelPreview.filter(r => r.error);
    if (!errorRows.length) return;
    const ws = XLSX.utils.json_to_sheet(errorRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Errors");
    XLSX.writeFile(wb, "import_errors.xlsx");
  };

  return (
    <div className="w-full font-cairo">
      {/* Filters & Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex flex-wrap gap-2 items-center">
          <Input
            placeholder="بحث بالاسم أو الرقم أو الإيميل..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-48 md:w-64 bg-input text-foreground placeholder:text-muted-foreground rounded-lg border border-border"
            style={{ fontFamily: 'Tajawal, Cairo, sans-serif' }}
          />
          {/* Status Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="flex items-center gap-2 text-sm font-normal border border-border bg-white text-black hover:bg-gray-50">
                <span>{statusFilter || "كل الحالات"}</span>
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setStatusFilter(null)} className={!statusFilter ? "font-bold text-primary" : ""}>كل الحالات</DropdownMenuItem>
              {allStatuses.map((status) => (
                <DropdownMenuItem key={status} onClick={() => setStatusFilter(status)} className={statusFilter === status ? "font-bold text-primary" : ""}>{status}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {/* Employee Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="flex items-center gap-2 text-sm font-normal border border-border bg-white text-black hover:bg-gray-50">
                <span>{employeeFilter || "كل الموظفين"}</span>
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setEmployeeFilter(null)} className={!employeeFilter ? "font-bold text-primary" : ""}>كل الموظفين</DropdownMenuItem>
              {allEmployees.map((emp) => (
                <DropdownMenuItem key={emp} onClick={() => setEmployeeFilter(emp)} className={employeeFilter === emp ? "font-bold text-primary" : ""}>{emp}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex gap-2 flex-row-reverse">
          <Button
            className="bg-primary text-text hover:bg-primary-dark rounded-lg font-bold flex items-center gap-2 px-4 py-2"
            onClick={handleOpenAdd}
          >
            <User className="w-4 h-4 ml-1" />
            إضافة عميل جديد
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xls,.xlsx,.csv"
            className="hidden"
            onChange={handleExcelUpload}
          />
          <Button
            className="border border-primary text-primary hover:bg-primary/10 rounded-lg font-bold flex items-center gap-2 px-4 py-2 bg-white"
            type="button"
            onClick={() => fileInputRef.current?.click()}
          >
            <FileSpreadsheet className="w-4 h-4 ml-1" />
            رفع ملف Excel
          </Button>
        </div>
      </div>

      {/* Leads Table */}
      <div className="overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="min-w-full bg-card text-right">
          <thead className="bg-muted">
            <tr>
              <th className="py-3 px-4 font-bold text-foreground cursor-pointer select-none" onClick={() => {setSortBy("name"); setSortDir(sortBy === "name" && sortDir === "asc" ? "desc" : "asc")}}>
                الاسم {sortBy === "name" && (sortDir === "asc" ? "▲" : "▼")}
              </th>
              <th className="py-3 px-4 font-bold text-foreground">رقم الهاتف</th>
              <th className="py-3 px-4 font-bold text-foreground cursor-pointer select-none" onClick={() => {setSortBy("status"); setSortDir(sortBy === "status" && sortDir === "asc" ? "desc" : "asc")}}>
                الحالة {sortBy === "status" && (sortDir === "asc" ? "▲" : "▼")}
              </th>
              <th className="py-3 px-4 font-bold text-foreground cursor-pointer select-none" onClick={() => {setSortBy("assignedTo"); setSortDir(sortBy === "assignedTo" && sortDir === "asc" ? "desc" : "asc")}}>
                الموظف المسؤول {sortBy === "assignedTo" && (sortDir === "asc" ? "▲" : "▼")}
              </th>
              <th className="py-3 px-4 font-bold text-foreground">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeads.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-muted-foreground">
                  لا يوجد عملاء مطابقين للبحث.
                </td>
              </tr>
            ) : (
              filteredLeads.map((lead) => (
                <tr key={lead.id} className="border-b last:border-b-0">
                  <td className="py-2 px-4">{lead.full_name}</td>
                  <td className="py-2 px-4">{lead.phone}</td>
                  <td className="py-2 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${statusColors[lead.status]}`}>{lead.status}</span>
                  </td>
                  <td className="py-2 px-4">{lead.assigned_to}</td>
                  <td className="py-2 px-4">
                    <Button className="p-2" onClick={() => handleOpenView(lead)} title="عرض">
                      <Eye className="w-4 h-4" />
                    </Button>
                    {(userRole === 'admin' || userRole === 'manager') && (
                      <>
                        <Button className="p-2" onClick={() => handleOpenEdit(lead)} title="تعديل">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button className="p-2 text-red-500 hover:bg-red-100" title="حذف" onClick={() => handleDeleteLead(lead.id)}>
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Modal للمعاينة والاستيراد */}
      <Dialog open={showImportModal} onOpenChange={setShowImportModal}>
        <DialogContent className="max-w-4xl w-full p-0">
          {/* واجهة مطابقة الأعمدة */}
          {showMappingUI && excelHeaders.length > 0 && (
            <div className="my-6 p-4 border rounded-xl bg-yellow-50">
              <h3 className="text-lg font-bold text-yellow-700 mb-2">مطابقة الأعمدة مع الحقول</h3>
              <p className="mb-4 text-sm text-yellow-800">يرجى ربط كل عمود من ملف Excel مع الحقل المناسب في النظام. الأعمدة غير المهمة اختر لها "تجاهل".</p>
              <table className="min-w-full bg-white rounded-xl border mb-4">
                <thead>
                  <tr>
                    <th className="py-2 px-3 font-bold text-text">اسم العمود في الملف</th>
                    <th className="py-2 px-3 font-bold text-text">الحقل في النظام</th>
                  </tr>
                </thead>
                <tbody>
                  {excelHeaders.map((header, idx) => (
                    <tr key={idx}>
                      <td className="py-2 px-3">{header}</td>
                      <td className="py-2 px-3">
                        <select
                          className="border rounded px-2 py-1"
                          value={columnMapping[idx]}
                          onChange={e => {
                            const newMapping = [...columnMapping];
                            newMapping[idx] = e.target.value;
                            setColumnMapping(newMapping);
                          }}
                        >
                          <option value="">تجاهل هذا العمود</option>
                          {SYSTEM_FIELDS.filter(f => f.key !== '').map(f => (
                            <option key={f.key} value={f.key}>{f.label}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Button
                className="bg-primary text-text hover:bg-primary-dark rounded-lg font-bold px-6 py-2"
                onClick={handleMappingSubmit}
              >
                متابعة الاستيراد
              </Button>
            </div>
          )}
          {/* معاينة البيانات مع دعم التعديل والتصدير */}
          {excelPreview.length > 0 && (
            <div className="my-6 px-4 pb-4" style={{ maxHeight: 500, overflowY: 'auto' }}>
              <h3 className="text-lg font-bold text-primary mb-2">معاينة البيانات المستوردة من Excel</h3>
              <table className="min-w-full bg-white rounded-xl border shadow-sm">
                <thead>
                  <tr>
                    <th className="py-2 px-3 font-bold text-text">الاسم</th>
                    <th className="py-2 px-3 font-bold text-text">رقم الهاتف</th>
                    <th className="py-2 px-3 font-bold text-text">التعليق/الملاحظة</th>
                    <th className="py-2 px-3 font-bold text-text">الحالة</th>
                    <th className="py-2 px-3 font-bold text-text">تعديل</th>
                  </tr>
                </thead>
                <tbody>
                  {excelPreview.map((row, idx) => {
                    const r = row as any;
                    const isEditing = editRowIdx === idx;
                    return (
                      <tr key={idx} className={r.error ? 'bg-red-50' : ''}>
                        <td className="py-2 px-3">
                          {isEditing ? (
                            <input
                              className="border rounded px-2 py-1 w-full"
                              value={editRowData.name || ''}
                              onChange={e => handleEditRowChange('name', e.target.value)}
                            />
                          ) : (
                            r.name
                          )}
                        </td>
                        <td className="py-2 px-3">
                          {isEditing ? (
                            <input
                              className="border rounded px-2 py-1 w-full"
                              value={editRowData.phone || ''}
                              onChange={e => handleEditRowChange('phone', e.target.value)}
                            />
                          ) : (
                            r.phone
                          )}
                        </td>
                        <td className="py-2 px-3">
                          {isEditing ? (
                            <input
                              className="border rounded px-2 py-1 w-full"
                              value={editRowData.comment || ''}
                              onChange={e => handleEditRowChange('comment', e.target.value)}
                            />
                          ) : (
                            r.comment
                          )}
                        </td>
                        <td className="py-2 px-3 font-bold text-xs">
                          {r.error ? <span className="text-red-600">{r.error}</span> : <span className="text-green-600">صالح</span>}
                        </td>
                        <td className="py-2 px-3">
                          {isEditing ? (
                            <>
                              <Button className="mr-2 bg-green-600 text-white px-2 py-1" onClick={handleEditRowSave}>حفظ</Button>
                              <Button className="bg-gray-300 text-black px-2 py-1" onClick={handleEditRowCancel}>إلغاء</Button>
                            </>
                          ) : (
                            <Button className="bg-blue-500 text-white px-2 py-1" onClick={() => handleEditRow(idx)} disabled={!!r.error}>تعديل</Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {excelErrors.length > 0 && (
                <div className="mt-2 text-red-600 text-sm flex items-center gap-4">
                  يوجد {excelErrors.length} صف به أخطاء. يرجى التصحيح قبل الحفظ.
                  <Button className="bg-yellow-400 text-black px-3 py-1 rounded" onClick={handleExportErrors}>تصدير الأخطاء</Button>
                </div>
              )}
              {/* زر حفظ العملاء الصالحين */}
              <Button
                className="mt-4 bg-primary text-text hover:bg-primary-dark rounded-lg font-bold px-6 py-2"
                disabled={excelPreview.filter(r => !r.error).length === 0}
                onClick={handleSaveValidLeads}
              >
                حفظ العملاء الصالحين
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* رسالة نجاح بعد الحفظ */}
      {importSummary && (
        <div className="my-8 p-6 bg-green-50 border border-green-200 rounded-xl text-green-800 text-lg text-center">
          تم حفظ {importSummary.success} عميل بنجاح، لم يتم حفظ {importSummary.failed} صف به أخطاء.<br />
          <Button className="mt-4 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-bold" onClick={handleExportErrors} disabled={excelErrors.length === 0}>
            تصدير الأخطاء إلى Excel
          </Button>
          <Button className="mt-4 ml-4 bg-primary text-white px-6 py-2 rounded-lg font-bold" onClick={handleResetImport}>
            رفع ملف جديد
          </Button>
        </div>
      )}
      <NewLeadModal
        open={openNewLead}
        onClose={(shouldRefresh) => {
          setOpenNewLead(false);
          if (shouldRefresh) fetchLeads();
        }}
        lead={selectedLead}
        mode={modalMode}
        history={modalMode === 'view' && selectedLead ? (mockHistory[selectedLead.id] || []) : undefined}
      />
    </div>
  );
}
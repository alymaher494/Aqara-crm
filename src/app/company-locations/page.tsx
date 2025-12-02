"use client";

import { useState, useEffect, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getSupabaseClient } from "@/components/lib/supabaseClient";

// Leaflet & OSM
import dynamic from "next/dynamic";
const Map = dynamic(() => import("react-leaflet").then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then(mod => mod.Marker), { ssr: false });

interface Company {
  id: string;
  name: string;
}

interface CompanyLocation {
  id: number;
  company_id: string;
  branch_name: string;
  address: string;
  latitude: number;
  longitude: number;
  attendance_radius: number;
}

export default function CompanyLocationsPage() {
  const [locations, setLocations] = useState<CompanyLocation[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<CompanyLocation | null>(null);
  const [form, setForm] = useState({
    company_id: "",
    branch_name: "",
    address: "",
    latitude: 30.0444,
    longitude: 31.2357,
    attendance_radius: 15,
  });
  const [geocodeLoading, setGeocodeLoading] = useState(false);
  const supabase = getSupabaseClient();

  // جلب الشركات والمواقع
  useEffect(() => {
    async function fetchData() {
      const { data: comps } = await supabase.from("companies").select("id, name");
      setCompanies(comps || []);
      const { data: locs } = await supabase.from("company_locations").select("*");
      setLocations(locs || []);
    }
    fetchData();
  }, [showModal, supabase]);

  // geocode العنوان
  const handleGeocode = async () => {
    if (!form.address) return;
    setGeocodeLoading(true);
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(form.address)}`;
    const res = await fetch(url);
    const data = await res.json();
    setGeocodeLoading(false);
    if (data && data[0]) {
      setForm(f => ({ ...f, latitude: parseFloat(data[0].lat), longitude: parseFloat(data[0].lon) }));
    } else {
      alert("لم يتم العثور على موقع لهذا العنوان!");
    }
  };

  // حفظ موقع جديد أو تعديل
  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.company_id) return alert("اختر الشركة!");
    if (editing) {
      await supabase.from("company_locations").update(form).eq("id", editing.id);
    } else {
      await supabase.from("company_locations").insert([form]);
    }
    setShowModal(false);
    setEditing(null);
    setForm({ company_id: "", branch_name: "", address: "", latitude: 30.0444, longitude: 31.2357, attendance_radius: 15 });
  };

  // فتح المودال للتعديل
  const handleEdit = (loc: CompanyLocation) => {
    setEditing(loc);
    setForm({
      company_id: loc.company_id,
      branch_name: loc.branch_name || "",
      address: loc.address || "",
      latitude: loc.latitude,
      longitude: loc.longitude,
      attendance_radius: loc.attendance_radius || 15,
    });
    setShowModal(true);
  };

  // حذف موقع
  const handleDelete = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذا الموقع؟")) return;
    await supabase.from("company_locations").delete().eq("id", id);
    setLocations(locs => locs.filter(l => l.id !== id));
  };

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold mb-4">إدارة مواقع الشركات</h1>
      <Button className="mb-4" onClick={() => setShowModal(true)}>إضافة موقع جديد</Button>
      <table className="min-w-full bg-white rounded-xl border mb-8">
        <thead>
          <tr>
            <th className="py-2 px-3">الشركة</th>
            <th className="py-2 px-3">الفرع</th>
            <th className="py-2 px-3">العنوان</th>
            <th className="py-2 px-3">الموقع</th>
            <th className="py-2 px-3">النطاق (متر)</th>
            <th className="py-2 px-3">إجراءات</th>
          </tr>
        </thead>
        <tbody>
          {locations.map(loc => (
            <tr key={loc.id}>
              <td className="py-2 px-3">{companies.find(c => c.id === loc.company_id)?.name || "-"}</td>
              <td className="py-2 px-3">{loc.branch_name}</td>
              <td className="py-2 px-3">{loc.address}</td>
              <td className="py-2 px-3">
                <div style={{ width: 120, height: 80 }}>
                  {/* @ts-ignore */}
                  <Map center={[loc.latitude, loc.longitude] as [number, number]} zoom={15} style={{ width: "100%", height: "100%" }} scrollWheelZoom={false} dragging={false} doubleClickZoom={false} zoomControl={false}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={[loc.latitude, loc.longitude] as [number, number]} />
                  </Map>
                </div>
              </td>
              <td className="py-2 px-3">{loc.attendance_radius}</td>
              <td className="py-2 px-3">
                <Button size="sm" onClick={() => handleEdit(loc)}>تعديل</Button>
                <Button size="sm" variant="destructive" className="ml-2" onClick={() => handleDelete(loc.id)}>حذف</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Modal إضافة/تعديل موقع */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-xl shadow-lg relative">
            <h2 className="text-xl font-bold mb-4">{editing ? "تعديل موقع" : "إضافة موقع جديد"}</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block mb-1">الشركة *</label>
                <select className="w-full border rounded px-2 py-1" value={form.company_id} onChange={e => setForm(f => ({ ...f, company_id: e.target.value }))} required>
                  <option value="">اختر الشركة</option>
                  {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block mb-1">اسم الفرع</label>
                <Input value={form.branch_name} onChange={e => setForm(f => ({ ...f, branch_name: e.target.value }))} />
              </div>
              <div>
                <label className="block mb-1">العنوان</label>
                <div className="flex gap-2">
                  <Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
                  <Button type="button" onClick={handleGeocode} disabled={geocodeLoading}>{geocodeLoading ? "..." : "تحديد الموقع"}</Button>
                </div>
              </div>
              <div>
                <label className="block mb-1">الموقع على الخريطة</label>
                <div style={{ width: "100%", height: 220 }}>
                  {/* @ts-ignore */}
                  <Map center={[form.latitude, form.longitude] as [number, number]} zoom={15} style={{ width: "100%", height: "100%" }} scrollWheelZoom={true}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={[form.latitude, form.longitude] as [number, number]} />
                  </Map>
                </div>
                <div className="text-xs mt-1">Lat: {form.latitude.toFixed(6)}, Lng: {form.longitude.toFixed(6)}</div>
              </div>
              <div>
                <label className="block mb-1">نطاق الحضور (متر)</label>
                <Input type="number" value={form.attendance_radius} onChange={e => setForm(f => ({ ...f, attendance_radius: Number(e.target.value) }))} min={1} max={100} />
              </div>
              <div className="flex gap-2 justify-end mt-4">
                <Button type="submit" className="bg-primary text-white">حفظ</Button>
                <Button type="button" variant="ghost" onClick={() => { setShowModal(false); setEditing(null); }}>إلغاء</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
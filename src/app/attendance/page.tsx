'use client';

import { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getSupabaseClient } from '@/components/lib/supabaseClient';

interface AttendanceRecord {
  id: string;
  check_in_time: string;
  check_out_time: string | null;
  check_in_location: string;
  check_out_location: string | null;
  notes: string;
}

const companyId = "11111111-1111-1111-1111-111111111111"; // عدلها حسب شركتك
const userId = "aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa"; // عدلها حسب المستخدم الحالي
const branchLocation = { lat: 30.0444, lng: 31.2357 }; // موقع الشركة (مثال: القاهرة)
const attendanceRadiusMeters = 50; // 50 meters allowed range

// حساب المسافة بين نقطتين بالأمتار (Haversine Formula)
function calculateDistanceMeters(loc1: { lat: number, lng: number }, loc2: { lat: number, lng: number }) {
  const R = 6371e3; // Earth radius in meters
  const φ1 = loc1.lat * Math.PI / 180;
  const φ2 = loc2.lat * Math.PI / 180;
  const Δφ = (loc2.lat - loc1.lat) * Math.PI / 180;
  const Δλ = (loc2.lng - loc1.lng) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

function isWithinRadius(loc1: { lat: number, lng: number }, loc2: { lat: number, lng: number }, radiusMeters: number) {
  return calculateDistanceMeters(loc1, loc2) <= radiusMeters;
}

export default function AttendancePage() {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [locationError, setLocationError] = useState('');
  const [checkedIn, setCheckedIn] = useState(false);
  const [reminderCount, setReminderCount] = useState(0);
  const [reminderActive, setReminderActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = getSupabaseClient();

  // جلب سجل الحضور للموظف الحالي
  const fetchAttendance = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('attendance').select('*').eq('employee_id', userId).order('check_in_time', { ascending: false });
    setAttendance(data || []);
    setCheckedIn(!!(data && data[0] && !data[0].check_out_time));
    setLoading(false);
  }, [supabase]);

  // جلب الموقع الجغرافي
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLocationError('');
        },
        (error) => {
          let errorMessage = 'فشل في الحصول على الموقع الجغرافي';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'تم رفض إذن الوصول للموقع. يرجى تفعيل الموقع من إعدادات المتصفح.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'معلومات الموقع غير متاحة حالياً.';
              break;
            case error.TIMEOUT:
              errorMessage = 'انتهت مهلة الحصول على الموقع.';
              break;
            default:
              errorMessage = 'حدث خطأ غير معروف أثناء تحديد الموقع.';
          }
          setLocationError(errorMessage);
        }
      );
    } else {
      setLocationError('المتصفح لا يدعم تحديد الموقع الجغرافي');
    }
  };

  // تسجيل الحضور أو الانصراف
  const handleAttendanceAction = useCallback(async (action: 'check_in' | 'check_out', auto = false) => {
    if (!currentLocation) {
      alert('يرجى السماح بالوصول إلى الموقع الجغرافي');
      return;
    }
    if (action === 'check_in' && !isWithinRadius(currentLocation, branchLocation, attendanceRadiusMeters) && !auto) {
      alert('يجب أن تكون في موقع الشركة لتسجيل الحضور!');
      return;
    }
    const now = new Date().toISOString();
    if (action === 'check_in') {
      await supabase.from('attendance').insert([{
        employee_id: userId,
        company_id: companyId,
        check_in_time: now,
        check_in_location: `(${currentLocation.lat},${currentLocation.lng})`,
        notes: auto ? 'تسجيل تلقائي' : '',
      }]);
      setCheckedIn(true);
    } else {
      // جلب آخر سجل حضور لم يتم تسجيل انصرافه
      const { data } = await supabase.from('attendance').select('*').eq('employee_id', userId).is('check_out_time', null).order('check_in_time', { ascending: false }).limit(1);
      if (data && data[0]) {
        await supabase.from('attendance').update({
          check_out_time: now,
          check_out_location: `(${currentLocation.lat},${currentLocation.lng})`,
        }).eq('id', data[0].id);
        setCheckedIn(false);
      }
    }
    fetchAttendance();
  }, [currentLocation, supabase, fetchAttendance]);

  // تفعيل الحضور التلقائي إذا كان الموظف داخل النطاق
  useEffect(() => {
    getCurrentLocation();
    fetchAttendance();
  }, [fetchAttendance]);

  useEffect(() => {
    if (currentLocation && isWithinRadius(currentLocation, branchLocation, attendanceRadiusMeters) && !checkedIn) {
      handleAttendanceAction('check_in', true);
    } else if (!checkedIn && reminderCount < 7) {
      setReminderActive(true);
      const timer = setTimeout(() => {
        setReminderCount(c => c + 1);
        if (!checkedIn) {
          alert('يرجى تسجيل الحضور!');
        }
      }, 2 * 60 * 1000); // كل دقيقتين
      return () => clearTimeout(timer);
    } else {
      setReminderActive(false);
    }
  }, [currentLocation, checkedIn, reminderCount, handleAttendanceAction]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">الحضور والانصراف</h1>
          <p className="text-gray-600 mt-2">سجل حضورك تلقائيًا أو يدويًا عند الوصول لموقع الشركة</p>
        </div>
        <div className="flex space-x-2 space-x-reverse">
          <Button
            onClick={() => handleAttendanceAction('check_in')}
            className="bg-green-600 hover:bg-green-700"
            disabled={checkedIn || !currentLocation}
          >
            <CheckCircle className="w-4 h-4 ml-2" />
            تسجيل الحضور
          </Button>
          <Button
            onClick={() => handleAttendanceAction('check_out')}
            className="bg-red-600 hover:bg-red-700"
            disabled={!checkedIn}
          >
            <XCircle className="w-4 h-4 ml-2" />
            تسجيل الانصراف
          </Button>
        </div>
      </div>
      {reminderActive && !checkedIn && (
        <div className="bg-yellow-100 text-yellow-800 p-4 rounded-lg text-center font-bold">
          لم تقم بتسجيل الحضور بعد! سيتم تذكيرك كل دقيقتين لمدة 15 دقيقة.
        </div>
      )}
      {locationError && (
        <div className="bg-red-100 text-red-800 p-4 rounded-lg text-center font-bold">
          {locationError}
        </div>
      )}
      {/* جدول سجل الحضور */}
      <div className="overflow-x-auto rounded-2xl border border-border bg-card mt-8">
        <table className="min-w-full bg-card text-right">
          <thead className="bg-muted">
            <tr>
              <th className="py-3 px-4 font-bold text-foreground">وقت الحضور</th>
              <th className="py-3 px-4 font-bold text-foreground">وقت الانصراف</th>
              <th className="py-3 px-4 font-bold text-foreground">موقع الحضور</th>
              <th className="py-3 px-4 font-bold text-foreground">موقع الانصراف</th>
              <th className="py-3 px-4 font-bold text-foreground">ملاحظات</th>
            </tr>
          </thead>
          <tbody>
            {attendance.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-muted-foreground">
                  لا يوجد سجلات حضور لهذا اليوم.
                </td>
              </tr>
            ) : (
              attendance.map((rec) => (
                <tr key={rec.id} className="border-b last:border-b-0">
                  <td className="py-2 px-4">{rec.check_in_time ? new Date(rec.check_in_time).toLocaleString('ar-EG') : '-'}</td>
                  <td className="py-2 px-4">{rec.check_out_time ? new Date(rec.check_out_time).toLocaleString('ar-EG') : '-'}</td>
                  <td className="py-2 px-4">{rec.check_in_location || '-'}</td>
                  <td className="py-2 px-4">{rec.check_out_location || '-'}</td>
                  <td className="py-2 px-4">{rec.notes || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
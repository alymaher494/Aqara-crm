import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/components/lib/supabaseClient';

// GET - جلب الإحصائيات
export async function GET() {
  try {
    const supabase = getSupabaseClient();

    // إحصائيات العملاء
    const { count: totalLeads } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true });

    const { count: newLeads } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'جديد');

    const { count: convertedLeads } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'محول');

    // إحصائيات العقارات
    const { count: totalProperties } = await supabase
      .from('properties')
      .select('*', { count: 'exact', head: true });

    const { count: availableProperties } = await supabase
      .from('properties')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'متاح');

    // إحصائيات المهام
    const { count: totalTasks } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true });

    const { count: completedTasks } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'مكتملة');

    const { count: pendingTasks } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'غير مكتملة');

    // إحصائيات المواعيد
    const { count: totalAppointments } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true });

    const { count: todayAppointments } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('appointment_date', new Date().toISOString().split('T')[0]);

    // إحصائيات الحملات
    const { count: totalCampaigns } = await supabase
      .from('campaigns')
      .select('*', { count: 'exact', head: true });

    const { count: activeCampaigns } = await supabase
      .from('campaigns')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'مكتملة');

    // إحصائيات المشاريع
    const { count: totalProjects } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true });

    // إحصائيات العملاء حسب الحالة
    const { data: leadsByStatus } = await supabase
      .from('leads')
      .select('status')
      .then(result => {
        if (result.data) {
          const statusCounts: Record<string, number> = {};
          result.data.forEach(lead => {
            statusCounts[lead.status] = (statusCounts[lead.status] || 0) + 1;
          });
          return statusCounts;
        }
        return {};
      });

    // إحصائيات العملاء حسب المصدر
    const { data: leadsBySource } = await supabase
      .from('leads')
      .select('source')
      .then(result => {
        if (result.data) {
          const sourceCounts: Record<string, number> = {};
          result.data.forEach(lead => {
            if (lead.source) {
              sourceCounts[lead.source] = (sourceCounts[lead.source] || 0) + 1;
            }
          });
          return sourceCounts;
        }
        return {};
      });

    // إحصائيات العقارات حسب النوع
    const { data: propertiesByType } = await supabase
      .from('properties')
      .select('type')
      .then(result => {
        if (result.data) {
          const typeCounts: Record<string, number> = {};
          result.data.forEach(property => {
            if (property.type) {
              typeCounts[property.type] = (typeCounts[property.type] || 0) + 1;
            }
          });
          return typeCounts;
        }
        return {};
      });

    // إحصائيات العقارات حسب الموقع
    const { data: propertiesByLocation } = await supabase
      .from('properties')
      .select('location')
      .then(result => {
        if (result.data) {
          const locationCounts: Record<string, number> = {};
          result.data.forEach(property => {
            if (property.location) {
              locationCounts[property.location] = (locationCounts[property.location] || 0) + 1;
            }
          });
          return locationCounts;
        }
        return {};
      });

    return NextResponse.json({
      leads: {
        total: totalLeads || 0,
        new: newLeads || 0,
        converted: convertedLeads || 0,
        conversionRate: totalLeads ? ((convertedLeads || 0) / totalLeads * 100).toFixed(1) : '0',
        byStatus: leadsByStatus,
        bySource: leadsBySource
      },
      properties: {
        total: totalProperties || 0,
        available: availableProperties || 0,
        byType: propertiesByType,
        byLocation: propertiesByLocation
      },
      tasks: {
        total: totalTasks || 0,
        completed: completedTasks || 0,
        pending: pendingTasks || 0,
        completionRate: totalTasks ? ((completedTasks || 0) / totalTasks * 100).toFixed(1) : '0'
      },
      appointments: {
        total: totalAppointments || 0,
        today: todayAppointments || 0
      },
      campaigns: {
        total: totalCampaigns || 0,
        active: activeCampaigns || 0
      },
      projects: {
        total: totalProjects || 0
      }
    });

  } catch (error) {
    console.error('Error in stats API:', error);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}
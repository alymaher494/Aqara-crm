'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Helper to calculate Haversine distance in meters
function getDistanceFromLatLonInM_Server(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

export async function getAttendanceStatus() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const today = new Date().toISOString().split('T')[0]

    const { data: log } = await supabase
        .from('attendance_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .single()

    const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single()

    if (!profile?.organization_id) return { error: 'No org' }

    const { data: org } = await supabase
        .from('organizations')
        .select('office_lat, office_lng, allowed_radius')
        .eq('id', profile.organization_id)
        .single()

    return {
        log,
        orgSettings: org
    }
}

export async function checkIn(lat: number, lng: number) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // 1. Get Org Settings to verify location
    const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single()

    if (!profile?.organization_id) return { error: 'No Organization Found' }

    const { data: org } = await supabase
        .from('organizations')
        .select('office_lat, office_lng, allowed_radius, expiry_date')
        .eq('id', profile.organization_id)
        .single()

    // Check Subscription Expiry
    if (org?.expiry_date && new Date() > new Date(org.expiry_date)) {
        return { error: 'Subscription expired. Attendance features are disabled.' }
    }

    // 2. Validate Geofence (only if settings exist)
    if (org?.office_lat && org?.office_lng) {
        const distance = getDistanceFromLatLonInM_Server(lat, lng, org.office_lat, org.office_lng)
        const radius = org.allowed_radius || 100

        if (distance > radius) {
            return {
                error: `You are too far from the office (${Math.round(distance)}m). Allowed radius: ${radius}m.`
            }
        }
    }

    // 3. Create Log
    const today = new Date().toISOString().split('T')[0]

    // Check if already checked in
    const { data: existing } = await supabase
        .from('attendance_logs')
        .select('id')
        .eq('user_id', user.id)
        .eq('date', today)
        .single()

    if (existing) return { error: 'Already checked in today' }

    const { error } = await supabase.from('attendance_logs').insert({
        user_id: user.id,
        organization_id: profile.organization_id,
        check_in_time: new Date().toISOString(),
        date: today,
        status: 'present', // Logic for 'late' can be added later comparing work_start_time
        location_lat: lat,
        location_lng: lng
    })

    if (error) {
        console.error('Check-in error:', error)
        return { error: 'Database error' }
    }

    revalidatePath('/crm')
    return { success: true }
}

export async function checkOut(lat: number, lng: number) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const today = new Date().toISOString().split('T')[0]

    const { error } = await supabase
        .from('attendance_logs')
        .update({
            check_out_time: new Date().toISOString(),
            location_lat: lat, // Optional: update location on checkout? Or just verify they are still near?
            // For now we just record checkout, assuming they are closing up. 
            // Stricter systems might require geofence on checkout too.
        })
        .eq('user_id', user.id)
        .eq('date', today)

    if (error) {
        console.error('Check-out error:', error)
        return { error: 'Database error' }
    }

    revalidatePath('/crm')
    return { success: true }
}

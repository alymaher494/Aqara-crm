'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Get current WhatsApp device status for the organization
 */
export async function getWhatsAppStatus() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single()

    if (!profile?.organization_id) return { error: 'No Organization Found' }

    const { data, error } = await supabase
        .from('whatsapp_devices')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .single()

    if (error && error.code !== 'PGRST116') { // Ignore "not found" error
        return { error: error.message }
    }

    return { data }
}

/**
 * Initiate connection (Simulate starting the WhatsApp engine)
 * Only Admins can call this.
 */
export async function initWhatsAppSession() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id, role')
        .eq('id', user.id)
        .single()

    if (!profile?.organization_id) return { error: 'No Organization Found' }
    if (profile.role !== 'admin' && profile.role !== 'super_admin') return { error: 'Permission Denied: Admins only.' }

    const { error } = await supabase
        .from('whatsapp_devices')
        .upsert({
            organization_id: profile.organization_id,
            status: 'init',
            session_id: `session_${profile.organization_id}_${Date.now()}`,
            qr_code: 'SIMULATED_QR_CODE_DATA', // Simulate QR generation
            last_active: new Date().toISOString()
        })

    if (error) return { error: error.message }

    revalidatePath('/crm/integrations/whatsapp')
    return { success: true }
}

/**
 * Disconnect and clear session
 * Only Admins can call this.
 */
export async function disconnectWhatsApp() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id, role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin' && profile?.role !== 'super_admin') return { error: 'Permission Denied: Admins only.' }

    const { error } = await supabase
        .from('whatsapp_devices')
        .update({
            status: 'disconnected',
            qr_code: null,
            phone_number: null,
            last_active: new Date().toISOString()
        })
        .eq('organization_id', profile.organization_id)

    if (error) return { error: error.message }

    revalidatePath('/crm/integrations/whatsapp')
    return { success: true }
}

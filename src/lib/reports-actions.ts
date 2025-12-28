'use server'

import { createClient } from "@/lib/supabase/server"
import { startOfDay, endOfDay, parseISO } from "date-fns"

export async function getAgentPerformance(startDate?: string, endDate?: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { data: [] }

    const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single()

    if (!profile?.organization_id) return { data: [] }

    // Fetch all agents in the organization
    const { data: agents } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('organization_id', profile.organization_id)

    if (!agents) return { data: [] }

    const start = startDate ? startOfDay(parseISO(startDate)).toISOString() : undefined
    const end = endDate ? endOfDay(parseISO(endDate)).toISOString() : undefined

    const performance = await Promise.all(agents.map(async (agent) => {
        // Leads assigned
        let leadsQuery = supabase.from('leads').select('*', { count: 'exact', head: true })
            .eq('assigned_to', agent.id)
        if (start) leadsQuery = leadsQuery.gte('created_at', start)
        if (end) leadsQuery = leadsQuery.lte('created_at', end)
        const { count: leadsCount } = await leadsQuery

        // Calls made
        let callsQuery = supabase.from('activity_logs').select('*', { count: 'exact', head: true })
            .eq('user_id', agent.id)
            .eq('type', 'call_attempt')
        if (start) callsQuery = callsQuery.gte('created_at', start)
        if (end) callsQuery = callsQuery.lte('created_at', end)
        const { count: callsCount } = await callsQuery

        // Deals won
        let wonQuery = supabase.from('leads').select('*', { count: 'exact', head: true })
            .eq('assigned_to', agent.id)
            .eq('status', 'won')
        // For won deals, we might want to check when they were updated to won, 
        // but for now we'll check created_at or just status.
        // Usually, reports care about when they became 'won'.
        if (start) wonQuery = wonQuery.gte('created_at', start)
        if (end) wonQuery = wonQuery.lte('created_at', end)
        const { count: wonCount } = await wonQuery

        return {
            agentName: agent.full_name || 'Unknown',
            leads: leadsCount || 0,
            calls: callsCount || 0,
            won: wonCount || 0
        }
    }))

    return { data: performance }
}

export async function getLeadsBySource(startDate?: string, endDate?: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { data: [] }

    const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single()

    if (!profile?.organization_id) return { data: [] }

    let query = supabase.from('leads').select('source')
        .eq('organization_id', profile.organization_id)

    if (startDate) query = query.gte('created_at', startOfDay(parseISO(startDate)).toISOString())
    if (endDate) query = query.lte('created_at', endOfDay(parseISO(endDate)).toISOString())

    const { data: leads } = await query

    const sources: Record<string, number> = {}
    leads?.forEach(l => {
        const s = l.source || 'Other'
        sources[s] = (sources[s] || 0) + 1
    })

    return { data: Object.entries(sources).map(([name, value]) => ({ name, value })) }
}

export async function getKPIs(startDate?: string, endDate?: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { data: null }

    const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single()

    if (!profile?.organization_id) return { data: null }

    const start = startDate ? startOfDay(parseISO(startDate)).toISOString() : undefined
    const end = endDate ? endOfDay(parseISO(endDate)).toISOString() : undefined

    // 1. Total Revenue (from Transactions)
    let revQuery = supabase.from('transactions').select('amount')
        .eq('organization_id', profile.organization_id)
        .eq('type', 'income')
    if (start) revQuery = revQuery.gte('date', start)
    if (end) revQuery = revQuery.lte('date', end)
    const { data: revData } = await revQuery
    const totalRevenue = revData?.reduce((acc, curr) => acc + (curr.amount || 0), 0) || 0

    // 2. Conversion Rate (Won / Total Leads)
    let leadsQuery = supabase.from('leads').select('status')
        .eq('organization_id', profile.organization_id)
    if (start) leadsQuery = leadsQuery.gte('created_at', start)
    if (end) leadsQuery = leadsQuery.lte('created_at', end)
    const { data: leadData } = await leadsQuery

    const totalLeads = leadData?.length || 0
    const wonLeads = leadData?.filter(l => l.status === 'won').length || 0
    const conversionRate = totalLeads > 0 ? (wonLeads / totalLeads) * 100 : 0

    // 3. Avg Deal Size
    const avgDealSize = wonLeads > 0 ? totalRevenue / wonLeads : 0

    return {
        data: {
            totalRevenue,
            conversionRate,
            avgDealSize,
            wonLeads,
            totalLeads
        }
    }
}

export async function generateCSVReport(type: 'leads' | 'sales', filters?: any) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single()

    if (!profile?.organization_id) throw new Error('No organization')

    if (type === 'leads') {
        const { data: leads } = await supabase.from('leads')
            .select('name, phone, email, status, source, created_at')
            .eq('organization_id', profile.organization_id)
            .order('created_at', { ascending: false })

        if (!leads) return ""

        const header = "Name,Phone,Email,Status,Source,Created At\n"
        const rows = leads.map(l =>
            `"${l.name}","${l.phone}","${l.email || ''}","${l.status}","${l.source || ''}","${l.created_at}"`
        ).join("\n")

        return header + rows
    } else {
        const { data: txs } = await supabase.from('transactions')
            .select('date, type, category, amount, description')
            .eq('organization_id', profile.organization_id)
            .order('date', { ascending: false })

        if (!txs) return ""

        const header = "Date,Type,Category,Amount,Description\n"
        const rows = txs.map(t =>
            `"${t.date}","${t.type}","${t.category}","${t.amount}","${t.description || ''}"`
        ).join("\n")

        return header + rows
    }
}

export interface Lead {
    id: string
    created_at: string
    name: string
    phone: string
    email?: string
    status: 'new' | 'contacted' | 'meeting' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost'
    source?: string
    notes?: string
    organization_id: string
    assigned_to?: string
    budget_min?: number
    budget_max?: number
    preferred_location?: string
    property_type?: string
    min_bedrooms?: number
    interested_in?: string
    client_comment?: string
    sales_comment?: string
    summary?: string
}

export interface ActivityLog {
    id: string
    created_at: string
    organization_id: string
    user_id?: string
    lead_id: string
    type: 'call_attempt' | 'whatsapp_opened' | 'note_added' | 'status_changed' | 'assignment_changed'
    description?: string
}


export interface Notification {
    id: string
    created_at: string
    user_id: string
    title: string
    message: string
    type: 'info' | 'warning' | 'success'
    is_read: boolean
    link_url?: string
}


export interface Task {
    id: string
    created_at: string
    title: string
    description?: string
    due_date: string
    is_completed: boolean
    lead_id?: string
    lead?: Lead
    organization_id: string
    assigned_to?: string
}

export interface Profile {
    id: string
    organization_id: string
    role: 'admin' | 'agent'
    full_name?: string
    email?: string
    is_super_admin?: boolean
}

export interface Campaign {
    id: string
    created_at: string
    name: string
    status: 'draft' | 'scheduled' | 'running' | 'completed' | 'paused'
    total_leads: number
    sent_count: number
    organization_id: string
    media_url?: string
    media_type?: 'image' | 'video'
    caption?: string
    batch_delay?: number
    batch_size?: number
}

export interface Organization {
    id: string
    created_at: string
    name: string
    work_start_time?: string
    work_end_time?: string
    work_days?: string[] // Array of days e.g. ['Mon', 'Tue']
    subscription_plan?: 'free' | 'pro' | 'enterprise'
    max_users?: number
    expiry_date?: string
    office_lat?: number
    office_lng?: number
    allowed_radius?: number // meters
}

export interface Property {
    id: string
    created_at: string
    organization_id: string
    title: string
    type: 'apartment' | 'villa' | 'townhouse' | 'penthouse' | 'chalet' | 'office' | 'commercial' | 'land'
    listing_type: 'primary' | 'resale'
    status: 'available' | 'reserved' | 'sold'
    price: number
    currency: string
    area: number
    project_name?: string
    developer_name?: string
    location?: string
    bedrooms?: number
    bathrooms?: number
    finishing?: string
    owner_contact?: string
    images?: string[]
    lat?: number
    lng?: number
}

export interface AttendanceLog {
    id: string
    created_at: string
    user_id: string
    organization_id: string
    check_in_time?: string
    check_out_time?: string
    date: string
    status?: 'present' | 'late' | 'absent'
    location_lat?: number
    location_lng?: number
}

export interface Transaction {
    id: string
    created_at: string
    organization_id: string
    type: 'income' | 'expense'
    category: string
    amount: number
    date: string
    description?: string
    related_lead_id?: string
}

export interface Developer {
    id: string
    organization_id: string
    name: string
    logo_url?: string
    website?: string
    sales_hotline?: string
    created_at: string
}

export interface Project {
    id: string
    organization_id: string
    developer_id: string
    developer?: Developer
    name: string
    location?: string
    market_status: 'selling' | 'launching_soon' | 'sold_out' | 'hold'
    price_range_min?: number
    price_range_max?: number
    description?: string
    attachments?: string[]
    created_at: string
}

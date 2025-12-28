import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return request.cookies.getAll() },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    response = NextResponse.next({ request })
                    cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
                },
            },
        }
    )

    // 1. Refresh Session
    const { data: { user } } = await supabase.auth.getUser()

    // 2. Fetch Profile Role if user exists
    let profile = null
    if (user) {
        const { data } = await supabase
            .from('profiles')
            .select('role, is_super_admin')
            .eq('id', user.id)
            .single()
        profile = data
    }

    const path = request.nextUrl.pathname

    // 3. Protect /admin (Super Admin Only)
    if (path.startsWith('/admin')) {
        if (!user) return NextResponse.redirect(new URL('/login', request.url))
        
        // If not super admin, kick them out to CRM
        if (!profile?.is_super_admin) {
            return NextResponse.redirect(new URL('/crm', request.url))
        }
    }

    // 4. Protect /crm (Agents Restrictions)
    if (path.startsWith('/crm')) {
        if (!user) return NextResponse.redirect(new URL('/login', request.url))

        if (profile?.role === 'agent') {
            const restrictedPaths = ['/crm/settings', '/crm/team', '/crm/developers']
            if (restrictedPaths.some(p => path.startsWith(p))) {
                return NextResponse.redirect(new URL('/crm', request.url))
            }
        }
    }

    return response
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
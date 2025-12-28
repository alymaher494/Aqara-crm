'use client'

import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { signOut } from '@/app/(dashboard)/actions'
import { User, Globe, Settings, LogOut, Shield } from 'lucide-react'
import { useTranslation } from '@/hooks/use-translation'

interface UserNavProps {
    isSuperAdmin?: boolean
    userProfile?: {
        name: string
        email: string
    }
}

export function UserNav({ isSuperAdmin = false, userProfile }: UserNavProps) {
    const { toggleLanguage, t, lang, mounted } = useTranslation()

    // Prevent hydration mismatch
    if (!mounted) {
        return (
            <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-slate-200 animate-pulse" />
            </div>
        )
    }

    return (
        <div className="flex items-center gap-2">
            {/* Language Toggle Button */}
            <Button
                variant="ghost"
                size="sm"
                onClick={toggleLanguage}
                className="gap-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
                <Globe className="h-4 w-4" />
                <span className="text-xs font-bold">{lang === 'en' ? 'AR' : 'EN'}</span>
            </Button>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                        <Avatar className="h-9 w-9">
                            <AvatarImage src="/avatars/01.png" alt="User" />
                            <AvatarFallback className="bg-slate-200">
                                <User className="h-4 w-4 text-slate-600" />
                            </AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1 text-start">
                            <p className="text-sm font-medium leading-none">{userProfile?.name || t.common.welcome}</p>
                            <p className="text-xs leading-none text-muted-foreground">
                                {userProfile?.email || 'user@example.com'}
                            </p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                        <DropdownMenuItem asChild>
                            <Link href="/crm/profile" className="cursor-pointer w-full flex items-center">
                                <User className="me-2 h-4 w-4" />
                                {t.common.profile}
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/crm/settings" className="cursor-pointer w-full flex items-center">
                                <Settings className="me-2 h-4 w-4" />
                                {t.common.settings}
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuGroup>

                    {isSuperAdmin && (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild className="text-amber-600 focus:text-amber-700 focus:bg-amber-50">
                                <Link href="/admin" className="cursor-pointer w-full flex items-center font-bold">
                                    <Shield className="me-2 h-4 w-4" />
                                    {t.sidebar.admin}
                                </Link>
                            </DropdownMenuItem>
                        </>
                    )}

                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        onClick={() => signOut()}
                        className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                    >
                        <LogOut className="me-2 h-4 w-4" />
                        {t.common.logout}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FileText, LogOut, PlusCircle, LayoutDashboard, Briefcase, Users, TrendingUp, ChevronRight } from 'lucide-react'
import { revalidatePath } from 'next/cache'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const handleSignOut = async () => {
        'use server'
        const supabaseServer = await createClient()
        await supabaseServer.auth.signOut()
        revalidatePath('/', 'layout')
        redirect('/login')
    }

    const navItems = [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/dashboard/create', label: 'Create Invoice', icon: PlusCircle },
        { href: '/dashboard/services', label: 'Services', icon: Briefcase },
        { href: '/dashboard/clients', label: 'Clients', icon: Users },
        { href: '/dashboard/profit', label: 'Profit', icon: TrendingUp },
    ]

    return (
        <div className="min-h-screen flex bg-[#f8fafc]">
            {/* Sidebar — desktop only */}
            <aside className="w-[280px] bg-white border-r border-slate-200 hidden md:flex flex-col flex-shrink-0 z-20 sticky top-0 h-screen">
                <div className="h-20 flex items-center px-8 border-b border-slate-100/60">
                    <Link href="/dashboard" className="flex items-center gap-3 group">
                        <div className="bg-blue-600 rounded-xl p-2 shadow-lg shadow-blue-200 group-hover:scale-105 transition-transform duration-200">
                            <FileText className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 tracking-tight">
                            InvoicePro
                        </span>
                    </Link>
                </div>

                <nav className="flex-1 px-4 py-8 space-y-1.5 overflow-y-auto">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center justify-between group px-4 py-3 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-all duration-200 border border-transparent hover:border-slate-100"
                        >
                            <div className="flex items-center gap-3">
                                <item.icon className="h-5 w-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                                <span>{item.label}</span>
                            </div>
                            <ChevronRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 text-blue-400" />
                        </Link>
                    ))}
                </nav>

                <div className="p-6 mt-auto border-t border-slate-100/60 bg-slate-50/30">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
                            <span className="font-bold text-sm">{user.email?.charAt(0).toUpperCase()}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-900 truncate">Admin User</p>
                            <p className="text-xs text-slate-500 truncate font-medium">{user.email}</p>
                        </div>
                    </div>
                    <form action={handleSignOut}>
                        <button type="submit" className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 py-2.5 rounded-xl transition-all duration-200 border border-transparent hover:border-red-100">
                            <LogOut className="h-4 w-4" />
                            <span>Sign Out</span>
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {/* Top Navbar */}
                <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 sm:px-8 lg:px-10 z-10 sticky top-0">
                    <div className="flex items-center gap-3">
                        {/* Mobile logo */}
                        <div className="flex md:hidden items-center gap-2">
                            <div className="bg-blue-600 rounded-lg p-1.5 shadow-md">
                                <FileText className="h-5 w-5 text-white" />
                            </div>
                            <span className="font-bold text-slate-900 tracking-tight text-lg">InvoicePro</span>
                        </div>
                        <div className="hidden md:flex items-center gap-2 text-slate-400">
                            <LayoutDashboard className="h-4 w-4" />
                            <span className="text-sm font-bold">/</span>
                            <span className="text-sm font-bold text-slate-900">Dashboard</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-xs font-bold text-slate-500 hidden sm:inline">System Live</span>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 relative overflow-y-auto overflow-x-hidden">
                    <div className="py-8 px-6 sm:px-8 lg:px-10 max-w-7xl mx-auto pb-32 md:pb-12">
                        {children}
                    </div>
                </main>
            </div>

            {/* Mobile Bottom Navigation — sophisticated redesign */}
            <nav className="md:hidden fixed bottom-6 left-4 right-4 bg-white/90 backdrop-blur-xl border border-slate-200 z-50 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-2xl overflow-hidden">
                <div className="flex items-center h-16">
                    <Link href="/dashboard" className="flex-1 flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-blue-600 transition-colors">
                        <LayoutDashboard className="h-5 w-5" />
                        <span className="text-[10px] font-bold">Overview</span>
                    </Link>
                    <Link href="/dashboard/services" className="flex-1 flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-blue-600 transition-colors">
                        <Briefcase className="h-5 w-5" />
                        <span className="text-[10px] font-bold">Services</span>
                    </Link>
                    <Link href="/dashboard/create" className="flex-1 flex flex-col items-center justify-center gap-1 -mt-8">
                        <div className="bg-blue-600 rounded-2xl p-3.5 shadow-xl shadow-blue-200 border-4 border-white">
                            <PlusCircle className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-[10px] font-bold text-blue-600 mt-1">New</span>
                    </Link>
                    <Link href="/dashboard/profit" className="flex-1 flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-blue-600 transition-colors">
                        <TrendingUp className="h-5 w-5" />
                        <span className="text-[10px] font-bold">Profit</span>
                    </Link>
                    <form action={handleSignOut} className="flex-1">
                        <button type="submit" className="w-full h-full flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-red-500 transition-colors py-3">
                            <LogOut className="h-5 w-5" />
                            <span className="text-[10px] font-bold">Exit</span>
                        </button>
                    </form>
                </div>
            </nav>
        </div>
    )
}

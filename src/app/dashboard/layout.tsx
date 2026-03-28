import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FileText, LogOut, PlusCircle, LayoutDashboard, User } from 'lucide-react'
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

    return (
        <div className="min-h-screen flex bg-gray-50">
            {/* Sidebar — desktop only */}
            <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col flex-shrink-0 shadow-sm z-10">
                <div className="h-16 flex items-center px-6 border-b border-gray-100">
                    <div className="flex items-center gap-2 text-blue-600 font-bold text-xl">
                        <div className="bg-blue-600 rounded-lg p-1">
                            <FileText className="h-6 w-6 text-white" />
                        </div>
                        <span>InvoicePro</span>
                    </div>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-1">
                    <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                        <LayoutDashboard className="h-5 w-5 text-gray-500" />
                        Dashboard
                    </Link>
                    <Link href="/dashboard/create" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                        <PlusCircle className="h-5 w-5 text-gray-500" />
                        Create Invoice
                    </Link>
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <div className="flex items-center gap-3 px-3 py-2">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <User className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">Admin</p>
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top Navbar */}
                <header className="h-14 md:h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 shadow-sm z-10 sticky top-0">
                    <div className="flex items-center gap-3">
                        {/* Mobile logo */}
                        <div className="flex md:hidden items-center gap-2 text-blue-600 font-bold text-lg">
                            <div className="bg-blue-600 rounded-lg p-1">
                                <FileText className="h-5 w-5 text-white" />
                            </div>
                            <span>InvoicePro</span>
                        </div>
                        <h1 className="hidden md:block text-lg font-semibold text-gray-900">Invoice Management</h1>
                    </div>
                    <div className="flex items-center space-x-3">
                        <form action={handleSignOut}>
                            <button type="submit" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-100">
                                <LogOut className="h-4 w-4" />
                                <span className="hidden sm:inline-block">Sign out</span>
                            </button>
                        </form>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 relative overflow-y-auto focus:outline-none">
                    {/* pb-20 on mobile so content isn't hidden behind bottom nav */}
                    <div className="py-4 px-4 sm:py-6 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-24 md:pb-8">
                        {children}
                    </div>
                </main>
            </div>

            {/* Mobile Bottom Navigation */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
                <div className="flex h-16">
                    <Link href="/dashboard" className="flex-1 flex flex-col items-center justify-center gap-1 text-gray-600 hover:text-blue-600 transition-colors active:bg-gray-50">
                        <LayoutDashboard className="h-5 w-5" />
                        <span className="text-xs font-medium">Dashboard</span>
                    </Link>
                    <Link href="/dashboard/create" className="flex-1 flex flex-col items-center justify-center gap-1 text-gray-600 hover:text-blue-600 transition-colors active:bg-gray-50">
                        <div className="bg-blue-600 rounded-full p-2 -mt-5 shadow-lg">
                            <PlusCircle className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-xs font-medium mt-1">New Invoice</span>
                    </Link>
                    <form action={handleSignOut} className="flex-1">
                        <button type="submit" className="w-full h-full flex flex-col items-center justify-center gap-1 text-gray-600 hover:text-blue-600 transition-colors active:bg-gray-50">
                            <LogOut className="h-5 w-5" />
                            <span className="text-xs font-medium">Sign out</span>
                        </button>
                    </form>
                </div>
            </nav>
        </div>
    )
}

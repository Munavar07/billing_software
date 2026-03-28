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
            {/* Sidebar */}
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
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 shadow-sm z-10 sticky top-0">
                    <div className="flex-1 min-w-0 flex items-center">
                        <h1 className="text-lg font-semibold text-gray-900 sm:truncate">Invoice Management</h1>
                    </div>
                    <div className="ml-4 flex items-center space-x-4">
                        <form action={handleSignOut}>
                            <button type="submit" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors">
                                <LogOut className="h-4 w-4" />
                                <span className="hidden sm:inline-block">Sign out</span>
                            </button>
                        </form>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 relative overflow-y-auto focus:outline-none">
                    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}

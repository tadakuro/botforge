import DashboardSidebar from '@/components/ui/DashboardSidebar'

export default function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-bg">
      <DashboardSidebar />
      <main className="flex-1 lg:ml-60 pt-14 lg:pt-0 p-4 lg:p-8 min-h-screen overflow-y-auto">
        {children}
      </main>
    </div>
  )
}

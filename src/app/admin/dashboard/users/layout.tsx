import { AdminHeader } from "@/components/admin/AdminHeader";

export default function UsersLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col max-h-screen w-2/3">
      <AdminHeader />
      <main className="flex-1 container mx-auto py-6 px-4 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Thống kê người dùng</h1>
          <p className="text-muted-foreground">
            Thống kê và phân tích dữ liệu người dùng trên hệ thống
          </p>
        </div>
        {children}
      </main>
    </div>
  );
}
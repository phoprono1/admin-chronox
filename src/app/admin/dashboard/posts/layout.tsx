import { AdminHeader } from "@/components/admin/AdminHeader";

export default function PostsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col max-h-screen w-3/4">
      <AdminHeader />
      <main className="flex-1 container mx-auto py-6 px-4 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Thống kê bài viết</h1>
          <p className="text-muted-foreground">
            Thống kê và phân tích dữ liệu bài viết trên hệ thống
          </p>
        </div>
        {children}
      </main>
    </div>
  );
}
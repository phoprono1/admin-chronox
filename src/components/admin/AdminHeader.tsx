import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  BarChart2,
  Calendar,
  FileText,
  Hash,
  Menu,
  MessageSquare,
  ThumbsUp,
  TrendingUp,
  Users,
  Image,
} from "lucide-react";
import { ModeToggle } from "../theme-mode";

export function AdminHeader() {
  return (
    <header className="border-b">
      <div className="flex h-16 items-center px-4 gap-6">
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
        </Button>

        <div className="font-bold text-2xl">ChronoX</div>

        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Thống kê Người Dùng</NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="grid gap-3 p-4 w-[400px]">
                  <NavigationMenuLink asChild>
                    <Link
                      href="/admin/dashboard/users/followers"
                      className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    >
                      <div className="text-sm font-medium leading-none flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Top Người theo dõi
                      </div>
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        Thống kê người dùng có nhiều người theo dõi nhất
                      </p>
                    </Link>
                  </NavigationMenuLink>

                  <NavigationMenuLink asChild>
                    <Link
                      href="/admin/dashboard/users/likes"
                      className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    >
                      <div className="text-sm font-medium leading-none flex items-center gap-2">
                        <ThumbsUp className="h-4 w-4" />
                        Top Lượt thích
                      </div>
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        Thống kê người dùng nhận được nhiều lượt thích nhất
                      </p>
                    </Link>
                  </NavigationMenuLink>

                  <NavigationMenuLink asChild>
                    <Link
                      href="/admin/dashboard/users/posts"
                      className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    >
                      <div className="text-sm font-medium leading-none flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Top Đăng bài
                      </div>
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        Thống kê người dùng đăng nhiều bài viết nhất
                      </p>
                    </Link>
                  </NavigationMenuLink>

                  <NavigationMenuLink asChild>
                    <Link
                      href="/admin/dashboard/users/comments"
                      className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    >
                      <div className="text-sm font-medium leading-none flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Top Bình luận
                      </div>
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        Thống kê người dùng có nhiều bình luận nhất
                      </p>
                    </Link>
                  </NavigationMenuLink>

                  <NavigationMenuLink asChild>
                    <Link
                      href="/admin/dashboard/users/overview"
                      className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    >
                      <div className="text-sm font-medium leading-none flex items-center gap-2">
                        <BarChart2 className="h-4 w-4" />
                        Tổng quan
                      </div>
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        Xem tổng quan các chỉ số thống kê người dùng
                      </p>
                    </Link>
                  </NavigationMenuLink>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Thống kê Bài Viết</NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="grid gap-3 p-4 w-[400px]">
                  <NavigationMenuLink asChild>
                    <Link
                      href="/admin/dashboard/posts/trending"
                      className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    >
                      <div className="text-sm font-medium leading-none flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Top Bài viết nổi bật
                      </div>
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        Thống kê bài viết có nhiều lượt tương tác nhất
                      </p>
                    </Link>
                  </NavigationMenuLink>

                  <NavigationMenuLink asChild>
                    <Link
                      href="/admin/dashboard/posts/likes"
                      className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    >
                      <div className="text-sm font-medium leading-none flex items-center gap-2">
                        <ThumbsUp className="h-4 w-4" />
                        Top Lượt thích
                      </div>
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        Thống kê bài viết có nhiều lượt thích nhất
                      </p>
                    </Link>
                  </NavigationMenuLink>

                  <NavigationMenuLink asChild>
                    <Link
                      href="/admin/dashboard/posts/comments"
                      className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    >
                      <div className="text-sm font-medium leading-none flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Top Bình luận
                      </div>
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        Thống kê bài viết có nhiều bình luận nhất
                      </p>
                    </Link>
                  </NavigationMenuLink>

                  <NavigationMenuLink asChild>
                    <Link
                      href="/admin/dashboard/posts/hashtags"
                      className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    >
                      <div className="text-sm font-medium leading-none flex items-center gap-2">
                        <Hash className="h-4 w-4" />
                        Top Hashtags
                      </div>
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        Thống kê hashtags được sử dụng nhiều nhất
                      </p>
                    </Link>
                  </NavigationMenuLink>

                  <NavigationMenuLink asChild>
                    <Link
                      href="/admin/dashboard/posts/media"
                      className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    >
                      <div className="text-sm font-medium leading-none flex items-center gap-2">
                        <Image className="h-4 w-4" />
                        Thống kê Media
                      </div>
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        Thống kê số lượng ảnh/video trong bài viết
                      </p>
                    </Link>
                  </NavigationMenuLink>

                  <NavigationMenuLink asChild>
                    <Link
                      href="/admin/dashboard/posts/timeline"
                      className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    >
                      <div className="text-sm font-medium leading-none flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Thống kê theo thời gian
                      </div>
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        Xem biểu đồ số lượng bài viết theo thời gian
                      </p>
                    </Link>
                  </NavigationMenuLink>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        <ModeToggle />
      </div>
    </header>
  );
}

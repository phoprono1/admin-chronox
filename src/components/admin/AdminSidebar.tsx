import {
  Home,
  Users,
  FileText,
  Menu,
  BarChart2,
  UserRound,
  FileBarChart,
  ChevronDown,
  ChevronUp,
  LogOut,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { account } from "@/lib/appwrite-client";
import { useRouter } from "next/navigation";

const menuItems = [
  {
    title: "Dashboard",
    icon: BarChart2,
    tooltipContent: "Dashboard",
    collapsible: true,
    subItems: [
      {
        title: "Thống kê người dùng",
        icon: UserRound,
        href: "/admin/dashboard/users/overview",
        tooltipContent: "Thống kê người dùng",
      },
      {
        title: "Thống kê bài viết",
        icon: FileBarChart,
        href: "/admin/dashboard/posts/timeline",
        tooltipContent: "Thống kê bài viết",
      },
    ],
  },
  {
    title: "Người dùng",
    icon: Users,
    href: "/admin/users",
    tooltipContent: "Quản lý người dùng",
  },
  {
    title: "Bài viết",
    icon: FileText,
    href: "/admin/posts",
    tooltipContent: "Quản lý bài viết",
  },
  {
    title: "Báo cáo",
    icon: FileBarChart,
    href: "/admin/reports",
    tooltipContent: "Báo cáo",
  },
];

export function AdminSidebar() {
  const { user } = useAuth();
  const adminName = user?.name;
  const router = useRouter();
  const signOut = async () => {
    try {
      await account.deleteSession("current");
      router.push("/login");
    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error);
    }
  };
  return (
    <TooltipProvider>
      <Sidebar collapsible="icon">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>ChronoX</SidebarGroupLabel>
            <SidebarGroupContent className="w-full">
              <SidebarMenu className="w-full">
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    {item.collapsible ? (
                      <Collapsible className="w-full">
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton className="w-full justify-between">
                            <div className="flex items-center">
                              <item.icon className="h-4 w-4" />
                              <span>{item.title}</span>
                            </div>
                            <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="w-full">
                          <SidebarMenu className="pl-4 w-full">
                            {item.subItems?.map((subItem) => (
                              <SidebarMenuItem key={subItem.href}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <SidebarMenuButton asChild>
                                      <Link href={subItem.href}>
                                        <subItem.icon className="h-4 w-4" />
                                        <span>{subItem.title}</span>
                                      </Link>
                                    </SidebarMenuButton>
                                  </TooltipTrigger>
                                  <TooltipContent side="right">
                                    {subItem.tooltipContent}
                                  </TooltipContent>
                                </Tooltip>
                              </SidebarMenuItem>
                            ))}
                          </SidebarMenu>
                        </CollapsibleContent>
                      </Collapsible>
                    ) : (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SidebarMenuButton asChild>
                            <Link href={item.href!}>
                              <item.icon className="h-4 w-4" />
                              <span>{item.title}</span>
                            </Link>
                          </SidebarMenuButton>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          {item.tooltipContent}
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton className="w-full justify-between">
                    <div className="flex items-center gap-2">
                      <span>{adminName}</span>
                    </div>
                    <ChevronUp className="h-4 w-4 opacity-50" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="top"
                  className="w-[--radix-dropdown-menu-trigger-width]"
                >
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive cursor-pointer"
                    onClick={signOut}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Đăng xuất</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    </TooltipProvider>
  );
}

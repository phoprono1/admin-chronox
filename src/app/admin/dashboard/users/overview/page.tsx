"use client";

import { databases } from "@/lib/appwrite-client";
import { APPWRITE_CONFIG } from "@/lib/constants";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, MessageSquare, Heart } from "lucide-react";
import { Query } from "appwrite";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

interface Stats {
  totalUsers: number;
  totalPosts: number;
  totalComments: number;
  totalLikes: number;
}

interface DailyStats {
  date: string;
  users: number;
  posts: number;
  comments: number;
  likes: number;
}

const chartConfig = {
  users: {
    label: "Người dùng mới",
    color: "hsl(var(--chart-1))",
  },
  posts: {
    label: "Bài viết mới",
    color: "hsl(var(--chart-2))",
  },
  comments: {
    label: "Bình luận mới",
    color: "hsl(var(--chart-3))",
  },
  likes: {
    label: "Lượt thích mới",
    color: "hsl(var(--chart-4))",
  },
};

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalPosts: 0,
    totalComments: 0,
    totalLikes: 0,
  });
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Lấy timestamp của 7 ngày trước
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const [usersResponse, postsResponse, commentsResponse, likesResponse] = 
          await Promise.all([
            databases.listDocuments(
              APPWRITE_CONFIG.databaseId,
              APPWRITE_CONFIG.collections.users,
              [Query.greaterThan('$createdAt', sevenDaysAgo.toISOString())]
            ),
            databases.listDocuments(
              APPWRITE_CONFIG.databaseId,
              APPWRITE_CONFIG.collections.posts,
              [Query.greaterThan('$createdAt', sevenDaysAgo.toISOString())]
            ),
            databases.listDocuments(
              APPWRITE_CONFIG.databaseId,
              APPWRITE_CONFIG.collections.comments,
              [Query.greaterThan('$createdAt', sevenDaysAgo.toISOString())]
            ),
            databases.listDocuments(
              APPWRITE_CONFIG.databaseId,
              APPWRITE_CONFIG.collections.likes,
              [Query.greaterThan('$createdAt', sevenDaysAgo.toISOString())]
            ),
          ]);

        // Cập nhật tổng số liệu
        setStats({
          totalUsers: usersResponse.total,
          totalPosts: postsResponse.total,
          totalComments: commentsResponse.total,
          totalLikes: likesResponse.total,
        });

        // Tạo map cho thống kê theo ngày
        const dailyStatsMap = new Map<string, DailyStats>();

        // Khởi tạo dữ liệu cho 7 ngày
        for (let i = 0; i < 7; i++) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          dailyStatsMap.set(dateStr, {
            date: dateStr,
            users: 0,
            posts: 0,
            comments: 0,
            likes: 0,
          });
        }

        // Đếm số lượng theo ngày
        const countByDate = (documents: any[], type: 'users' | 'posts' | 'comments' | 'likes') => {
          documents.forEach(doc => {
            const date = new Date(doc.$createdAt).toISOString().split('T')[0];
            const stats = dailyStatsMap.get(date);
            if (stats) {
              stats[type]++;
            }
          });
        };

        countByDate(usersResponse.documents, 'users');
        countByDate(postsResponse.documents, 'posts');
        countByDate(commentsResponse.documents, 'comments');
        countByDate(likesResponse.documents, 'likes');

        // Chuyển map thành mảng và sắp xếp theo ngày
        const dailyStatsArray = Array.from(dailyStatsMap.values())
          .sort((a, b) => a.date.localeCompare(b.date));

        setDailyStats(dailyStatsArray);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div>Đang tải...</div>;
  }

  return (
    <div className="space-y-4 p-8">
      <h2 className="text-3xl font-bold tracking-tight">Tổng quan</h2>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng số người dùng
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng số bài viết
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPosts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng số bình luận
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalComments}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng số lượt thích
            </CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLikes}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Hoạt động 7 ngày gần nhất</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <LineChart data={dailyStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => new Date(value).toLocaleDateString('vi-VN')}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
              />
              <ChartTooltip />
              <Line
                type="monotone"
                dataKey="users"
                stroke="var(--color-users)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="posts"
                stroke="var(--color-posts)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="comments"
                stroke="var(--color-comments)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="likes"
                stroke="var(--color-likes)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}

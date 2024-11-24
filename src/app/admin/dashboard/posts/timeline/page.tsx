"use client";

import { databases } from "@/lib/appwrite-client";
import { APPWRITE_CONFIG } from "@/lib/constants";
import { useEffect, useState } from "react";
import {
  Line,
  LineChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, TrendingUp } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TimelineStats {
  date: string;
  posts: number;
  totalPosts: number;
}

const chartConfig = {
  posts: {
    label: "Số bài viết",
    color: "hsl(10, 80%, 50%)", // Màu cam
  },
  totalPosts: {
    label: "Tổng số bài viết",
    color: "hsl(200, 80%, 50%)", // Màu xanh dương
  },
};

export default function TimelineStatsPage() {
  const [timelineStats, setTimelineStats] = useState<TimelineStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("week"); // month, quarter, year

  useEffect(() => {
    const fetchTimelineStats = async () => {
      try {
        const postsResponse = await databases.listDocuments(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collections.posts
        );

        // Tạo map để đếm số bài viết theo ngày
        const statsMap = new Map<string, number>();
        let totalPosts = 0;

        // Xử lý từng bài viết
        postsResponse.documents.forEach((post) => {
          const date = new Date(post.$createdAt);
          let key = "";

          // Format key theo timeRange
          switch (timeRange) {
            case "day":
              // Format: YYYY-MM-DD
              key = date.toISOString().split("T")[0];
              break;
            case "week":
              // Lấy ngày đầu tuần (Thứ 2)
              const firstDayOfWeek = new Date(date);
              const day = date.getDay();
              const diff = date.getDate() - day + (day === 0 ? -6 : 1);
              firstDayOfWeek.setDate(diff);
              key = `${firstDayOfWeek.getFullYear()}-W${String(
                Math.ceil(
                  (firstDayOfWeek.getDate() + firstDayOfWeek.getDay()) / 7
                )
              ).padStart(2, "0")}`;
              break;
            case "month":
              key = `${date.getFullYear()}-${String(
                date.getMonth() + 1
              ).padStart(2, "0")}`;
              break;
            case "quarter":
              const quarter = Math.floor(date.getMonth() / 3) + 1;
              key = `${date.getFullYear()}-Q${quarter}`;
              break;
            case "year":
              key = `${date.getFullYear()}`;
              break;
          }

          statsMap.set(key, (statsMap.get(key) || 0) + 1);
        });

        // Chuyển map thành mảng và sắp xếp theo thời gian
        const statsArray = Array.from(statsMap.entries())
          .map(([date, posts]) => {
            totalPosts += posts;
            return {
              date,
              posts,
              totalPosts,
            };
          })
          .sort((a, b) => a.date.localeCompare(b.date));

        setTimelineStats(statsArray);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching timeline stats:", error);
        setLoading(false);
      }
    };

    fetchTimelineStats();
  }, [timeRange]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-lg border bg-background p-2 shadow-sm">
          <div className="flex flex-col gap-y-1">
            <p className="text-sm font-medium">{formatDate(data.date)}</p>
            <div className="flex items-center gap-x-2 text-xs">
              <div className="flex items-center gap-x-1">
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: chartConfig.posts.color }}
                />
                <span>Bài viết mới: {data.posts}</span>
              </div>
              <div className="flex items-center gap-x-1">
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: chartConfig.totalPosts.color }}
                />
                <span>Tổng số: {data.totalPosts}</span>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const formatDate = (date: string): string => {
    switch (timeRange) {
      case "day":
        const [yearD, monthD, dayD] = date.split("-");
        return `${dayD}/${monthD}/${yearD}`;
      case "week":
        const [yearW, weekW] = date.split("-W");
        return `Tuần ${weekW}/${yearW}`;
      case "month":
        const [year, month] = date.split("-");
        return `Tháng ${month}/${year}`;
      case "quarter":
        const [yearQ, quarter] = date.split("-Q");
        return `Quý ${quarter}/${yearQ}`;
      case "year":
        return `Năm ${date}`;
      default:
        return date;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-medium">
            Thống kê bài viết theo thời gian
          </h2>
          <p className="text-sm text-muted-foreground">
            Biểu đồ thể hiện số lượng bài viết mới và tổng số bài viết theo thời
            gian
          </p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Chọn khoảng thời gian" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Theo ngày</SelectItem>
            <SelectItem value="week">Theo tuần</SelectItem>
            <SelectItem value="month">Theo tháng</SelectItem>
            <SelectItem value="quarter">Theo quý</SelectItem>
            <SelectItem value="year">Theo năm</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng số bài viết
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {timelineStats[timelineStats.length - 1]?.totalPosts || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tốc độ tăng trưởng
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {timelineStats.length > 1
                ? `${(
                    (timelineStats[timelineStats.length - 1].posts /
                      timelineStats[timelineStats.length - 2].posts) *
                      100 -
                    100
                  ).toFixed(1)}%`
                : "0%"}
            </div>
            <p className="text-xs text-muted-foreground">So với kỳ trước</p>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-lg border p-4">
        <ChartContainer config={chartConfig} className="mt-4 h-[400px] w-full">
          <LineChart
            data={timelineStats}
            margin={{ top: 20, right: 0, bottom: 20, left: 0 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickFormatter={formatDate}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: "var(--border)", strokeDasharray: 4 }}
              wrapperStyle={{ outline: "none" }}
            />
            <Line
              type="monotone"
              dataKey="posts"
              stroke={chartConfig.posts.color}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="totalPosts"
              stroke={chartConfig.totalPosts.color}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ChartContainer>
      </div>
    </div>
  );
}

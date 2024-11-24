"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import {
  addDays,
  endOfQuarter,
  endOfYear,
  format,
  startOfQuarter,
  startOfYear,
  subDays,
} from "date-fns";
import { DateRange } from "react-day-picker";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { databases } from "@/lib/appwrite-client";
import { APPWRITE_CONFIG } from "@/lib/constants";
import { Query } from "appwrite";
import { exportToPDF } from "@/lib/utils/exportPDF";
import { ReportStats } from "./reports";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function ReportsPage() {
  const reportRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const [date, setDate] = useState<DateRange>({
    from: subDays(new Date(), 30), // Thay đổi giá trị khởi tạo
    to: new Date(),
  });
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ReportStats>({
    newUsers: { current: 0, previous: 0 },
    newPosts: { current: 0, previous: 0 },
    interactions: { current: 0, previous: 0 },
    interactionRate: { current: 0, previous: 0 },
  });

  const [reportType, setReportType] = useState("monthly");

  const chartData = [
    {
      name: 'Người dùng mới',
      'Kỳ này': stats.newUsers.current,
      'Kỳ trước': stats.newUsers.previous,
    },
    {
      name: 'Bài viết mới',
      'Kỳ này': stats.newPosts.current,
      'Kỳ trước': stats.newPosts.previous,
    },
    {
      name: 'Lượt tương tác',
      'Kỳ này': stats.interactions.current,
      'Kỳ trước': stats.interactions.previous,
    },
  ];

  // Hàm tính phần trăm thay đổi
  const calculatePercentageChange = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  // Thêm useEffect để khởi tạo date range khi component mount
  useEffect(() => {
    const initialDateRange = calculateDateRange(reportType);
    setDate(initialDateRange);
  }, []); // Chỉ chạy một lần khi mount

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);

        if (!date.from || !date.to) return;

        // Tính thời gian cho kỳ hiện tại và kỳ trước
        const currentStart = date.from;
        const currentEnd = date.to;
        const previousStart = new Date(currentStart);
        previousStart.setMonth(previousStart.getMonth() - 1);
        const previousEnd = new Date(currentEnd);
        previousEnd.setMonth(previousEnd.getMonth() - 1);

        // Fetch users
        const [currentUsers, previousUsers] = await Promise.all([
          databases.listDocuments(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.users,
            [
              Query.greaterThanEqual("$createdAt", currentStart.toISOString()),
              Query.lessThanEqual("$createdAt", currentEnd.toISOString()),
            ]
          ),
          databases.listDocuments(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.users,
            [
              Query.greaterThanEqual("$createdAt", previousStart.toISOString()),
              Query.lessThanEqual("$createdAt", previousEnd.toISOString()),
            ]
          ),
        ]);

        // Fetch posts
        const [currentPosts, previousPosts] = await Promise.all([
          databases.listDocuments(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.posts,
            [
              Query.greaterThanEqual("$createdAt", currentStart.toISOString()),
              Query.lessThanEqual("$createdAt", currentEnd.toISOString()),
            ]
          ),
          databases.listDocuments(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.posts,
            [
              Query.greaterThanEqual("$createdAt", previousStart.toISOString()),
              Query.lessThanEqual("$createdAt", previousEnd.toISOString()),
            ]
          ),
        ]);

        // Fetch interactions (likes + comments)
        const [currentLikes, previousLikes, currentComments, previousComments] =
          await Promise.all([
            databases.listDocuments(
              APPWRITE_CONFIG.databaseId,
              APPWRITE_CONFIG.collections.likes,
              [
                Query.greaterThanEqual(
                  "$createdAt",
                  currentStart.toISOString()
                ),
                Query.lessThanEqual("$createdAt", currentEnd.toISOString()),
              ]
            ),
            databases.listDocuments(
              APPWRITE_CONFIG.databaseId,
              APPWRITE_CONFIG.collections.likes,
              [
                Query.greaterThanEqual(
                  "$createdAt",
                  previousStart.toISOString()
                ),
                Query.lessThanEqual("$createdAt", previousEnd.toISOString()),
              ]
            ),
            databases.listDocuments(
              APPWRITE_CONFIG.databaseId,
              APPWRITE_CONFIG.collections.comments,
              [
                Query.greaterThanEqual(
                  "$createdAt",
                  currentStart.toISOString()
                ),
                Query.lessThanEqual("$createdAt", currentEnd.toISOString()),
              ]
            ),
            databases.listDocuments(
              APPWRITE_CONFIG.databaseId,
              APPWRITE_CONFIG.collections.comments,
              [
                Query.greaterThanEqual(
                  "$createdAt",
                  previousStart.toISOString()
                ),
                Query.lessThanEqual("$createdAt", previousEnd.toISOString()),
              ]
            ),
          ]);

        // Tính toán các chỉ số
        const currentInteractions = currentLikes.total + currentComments.total;
        const previousInteractions =
          previousLikes.total + previousComments.total;

        const currentInteractionRate =
          currentPosts.total > 0
            ? (currentInteractions / currentPosts.total) * 100
            : 0;
        const previousInteractionRate =
          previousPosts.total > 0
            ? (previousInteractions / previousPosts.total) * 100
            : 0;

        setStats({
          newUsers: {
            current: currentUsers.total,
            previous: previousUsers.total,
          },
          newPosts: {
            current: currentPosts.total,
            previous: previousPosts.total,
          },
          interactions: {
            current: currentInteractions,
            previous: previousInteractions,
          },
          interactionRate: {
            current: currentInteractionRate,
            previous: previousInteractionRate,
          },
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [date, reportType]); // Thêm reportType vào dependencies

  // Hàm tính khoảng thời gian dựa trên loại báo cáo
  const calculateDateRange = (type: string): DateRange => {
    const today = new Date();

    switch (type) {
      case "monthly":
        return {
          from: subDays(today, 30),
          to: today,
        };

      case "quarterly": {
        const quarterStart = startOfQuarter(today);
        const quarterEnd = endOfQuarter(today);
        return {
          from: quarterStart,
          to: quarterEnd,
        };
      }

      case "yearly": {
        const yearStart = startOfYear(today);
        const yearEnd = endOfYear(today);
        return {
          from: yearStart,
          to: yearEnd,
        };
      }

      case "custom":
        // Giữ nguyên date range hiện tại cho chế độ tùy chỉnh
        return date;

      default:
        return {
          from: subDays(today, 30),
          to: today,
        };
    }
  };

  // Hàm xử lý khi thay đổi loại báo cáo
  const handleReportTypeChange = (value: string) => {
    setReportType(value);
    const newDateRange = calculateDateRange(value);
    setDate(newDateRange);
  };

  // Hàm xử lý thay đổi date range
  const handleDateChange = (value: DateRange | undefined) => {
    if (value) {
      setDate(value);
    }
  };

  const handleExportPDF = async () => {
    try {
      setLoading(true);
      await exportToPDF({
        stats,
        reportType,
        dateRange: date,
        chartRef,
      });
    } catch (error) {
      console.error('Failed to export PDF:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <AdminHeader />
        <h1 className="text-3xl font-bold tracking-tight mt-4">
          Báo cáo thống kê
        </h1>
        <p className="text-muted-foreground">
          Xem và xuất báo cáo thống kê theo thời gian
        </p>
      </div>

      {/* Phần điều khiển */}
      <div className="flex flex-wrap items-center gap-4">
        <Select
          defaultValue="monthly"
          onValueChange={handleReportTypeChange}
          value={reportType}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Chọn chu kỳ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="monthly">Báo cáo tháng</SelectItem>
            <SelectItem value="quarterly">Báo cáo quý</SelectItem>
            <SelectItem value="yearly">Báo cáo năm</SelectItem>
            <SelectItem value="custom">Tùy chỉnh</SelectItem>
          </SelectContent>
        </Select>

        {/* Chỉ hiện date picker khi ở chế độ tùy chỉnh */}
        {reportType === "custom" && (
          <DatePickerWithRange date={date} setDate={handleDateChange} />
        )}

        <Button onClick={handleExportPDF} disabled={loading}>
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Đang xuất...
            </>
          ) : (
            <>
              <FileText className="mr-2 h-4 w-4" />
              Xuất PDF
            </>
          )}
        </Button>
      </div>

      {/* Preview báo cáo */}
      <div ref={reportRef}>
        <Card>
          <CardHeader>
            <CardTitle>
              {reportType === "monthly" && "Báo cáo 30 ngày gần nhất"}
              {reportType === "quarterly" &&
                `Báo cáo Quý ${
                  Math.floor(new Date().getMonth() / 3) + 1
                }/${new Date().getFullYear()}`}
              {reportType === "yearly" &&
                `Báo cáo năm ${new Date().getFullYear()}`}
              {reportType === "custom" && (
                <>
                  Báo cáo từ {date.from ? format(date.from, "dd/MM/yyyy") : ""}{" "}
                  đến {date.to ? format(date.to, "dd/MM/yyyy") : ""}
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              <section>
                <h3 className="text-lg font-semibold mb-4">Tổng quan</h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        Tổng người dùng mới
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        +{stats.newUsers.current}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {calculatePercentageChange(
                          stats.newUsers.current,
                          stats.newUsers.previous
                        ).toFixed(1)}
                        % so với kỳ trước
                      </p>
                    </CardContent>
                  </Card>

                  {/* Card bài viết mới */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        Tổng bài viết mới
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        +{stats.newPosts.current}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {calculatePercentageChange(
                          stats.newPosts.current,
                          stats.newPosts.previous
                        ).toFixed(1)}
                        % so với kỳ trước
                      </p>
                    </CardContent>
                  </Card>

                  {/* Card tương tác */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        Tổng lượt tương tác
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        +{stats.interactions.current}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {calculatePercentageChange(
                          stats.interactions.current,
                          stats.interactions.previous
                        ).toFixed(1)}
                        % so với kỳ trước
                      </p>
                    </CardContent>
                  </Card>

                  {/* Card tỷ lệ tương tác */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        Tỷ lệ tương tác
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {stats.interactionRate.current.toFixed(1)}%
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {calculatePercentageChange(
                          stats.interactionRate.current,
                          stats.interactionRate.previous
                        ).toFixed(1)}
                        % so với kỳ trước
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-4">Biểu đồ so sánh</h3>
                <div ref={chartRef} className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="Kỳ này" fill="#8884d8" />
                      <Bar dataKey="Kỳ trước" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </section>

              {/* Thêm biểu đồ tỷ lệ tương tác */}
              <section>
                <h3 className="text-lg font-semibold mb-4">Tỷ lệ tương tác theo thời gian</h3>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        {
                          name: 'Tỷ lệ tương tác',
                          'Kỳ này': stats.interactionRate.current,
                          'Kỳ trước': stats.interactionRate.previous,
                        }
                      ]}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis unit="%" />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="Kỳ này" fill="#8884d8" />
                      <Bar dataKey="Kỳ trước" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

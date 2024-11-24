"use client";

import { databases } from "@/lib/appwrite-client";
import { APPWRITE_CONFIG } from "@/lib/constants";
import { Query } from "appwrite";
import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface User {
  username: string;
  follower: number;
  avatarId?: string;
}

const chartConfig = {
  follower: {
    label: "Số lượng follower",
    color: "hsl(var(--chart-1))",
  },
};

export default function UsersStatsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopUsers = async () => {
      try {
        const response = await databases.listDocuments(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collections.users,
          [
            Query.orderDesc("follower"),
            Query.limit(10), // Lấy top 10 users
          ]
        );

        const topUsers = response.documents.map((user) => ({
          username: user.username,
          follower: user.follower,
          avatarId: user.avatarId,
        }));
        console.log(topUsers);

        setUsers(topUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopUsers();
  }, []);

  if (loading) {
    return <div>Đang tải...</div>;
  }

  // Custom render cho XAxis
  const CustomXAxisTick = ({ x, y, payload }: any) => {
    // Log để kiểm tra dữ liệu
    console.log("Payload:", payload);

    const user = users.find((u) => u.username === payload.value);
    const avatarUrl = user?.avatarId
      ? `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${APPWRITE_CONFIG.buckets.avatars}/files/${user.avatarId}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`
      : "/default-avatar.png";

    return (
      <g transform={`translate(${x},${y})`}>
        <text x={0} y={0} dy={16} textAnchor="middle" fill="#666" fontSize={12}>
          {payload.value}
        </text>
        <foreignObject x={-15} y={20} width={30} height={30}>
          <div
            style={{
              width: "30px",
              height: "30px",
              overflow: "hidden",
              borderRadius: "50%",
            }}
          >
            <img
              src={avatarUrl}
              alt={payload.value}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
              onError={(e) => {
                console.error("Image load error:", e);
                e.currentTarget.src = "/default-avatar.png";
              }}
            />
          </div>
        </foreignObject>
      </g>
    );
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border p-4">
        <h2 className="text-lg font-medium">
          Top 10 người dùng có nhiều follower nhất
        </h2>
        <ChartContainer config={chartConfig} className="mt-4 h-[400px]">
          <BarChart
            data={users}
            margin={{ top: 20, right: 20, bottom: 80, left: 20 }} // Tăng bottom margin
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="username"
              tickLine={false}
              axisLine={false}
              interval={0}
              tick={<CustomXAxisTick />}
              height={60} // Tăng chiều cao cho XAxis
            />
            {/* Các phần còn lại giữ nguyên */}
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent labelKey="username" nameKey="follower" />
              }
            />
            <Bar
              dataKey="follower"
              fill="var(--color-follower)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </div>
    </div>
  );
}

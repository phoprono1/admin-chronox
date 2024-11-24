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

interface UserComments {
  username: string;
  totalComments: number;
  avatarId?: string;
}

const chartConfig = {
  totalComments: {
    label: "Số lượng bình luận",
    color: "hsl(var(--chart-1))",
  },
};

export default function UserCommentsStatsPage() {
  const [userComments, setUserComments] = useState<UserComments[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserComments = async () => {
      try {
        const commentsResponse = await databases.listDocuments(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collections.comments
        );

        const commentCountMap = new Map<string, number>();
        
        commentsResponse.documents.forEach((comment) => {
          const userId = comment.userCollections.$id;
          commentCountMap.set(userId, (commentCountMap.get(userId) || 0) + 1);
        });

        // Lấy thông tin user cho các userId
        const userPromises = Array.from(commentCountMap.keys()).map((userId) =>
          databases.getDocument(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.users,
            userId
          )
        );

        const users = await Promise.all(userPromises);

        // Tạo dữ liệu cho biểu đồ, bao gồm cả avatarId
        const chartData = users
          .map((user) => ({
            username: user.username,
            totalComments: commentCountMap.get(user.$id) || 0,
            avatarId: user.avatarId // Thêm avatarId
          }))
          .sort((a, b) => b.totalComments - a.totalComments)
          .slice(0, 10);

        setUserComments(chartData);
      } catch (error) {
        console.error("Error fetching user comments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserComments();
  }, []);

  if (loading) {
    return <div>Đang tải...</div>;
  }

  const CustomXAxisTick = ({ x, y, payload }: any) => {
    const user = userComments.find(u => u.username === payload.value);
    const avatarUrl = user?.avatarId
      ? `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${APPWRITE_CONFIG.buckets.avatars}/files/${user.avatarId}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`
      : "/default-avatar.png";

    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={0}
          y={0}
          dy={16}
          textAnchor="middle"
          fill="#666"
          fontSize={12}
        >
          {payload.value}
        </text>
        <foreignObject 
          x={-15} 
          y={20} 
          width={30} 
          height={30}
        >
          <div
            style={{
              width: '30px',
              height: '30px',
              overflow: 'hidden',
              borderRadius: '50%',
            }}
          >
            <img
              src={avatarUrl}
              alt={payload.value}
              style={{
                width: '100%',
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
        <h2 className="text-lg font-medium">Top 10 người dùng bình luận nhiều nhất</h2>
        <ChartContainer config={chartConfig} className="mt-4 h-[400px]">
          <BarChart 
            data={userComments}
            margin={{ top: 20, right: 20, bottom: 80, left: 20 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="username"
              tickLine={false}
              axisLine={false}
              interval={0}
              tick={<CustomXAxisTick />}
              height={80}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelKey="username"
                  nameKey="totalComments"
                />
              }
            />
            <Bar
              dataKey="totalComments"
              fill="var(--color-totalComments)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </div>
    </div>
  );
}
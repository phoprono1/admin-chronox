"use client";

import { databases } from "@/lib/appwrite-client";
import { APPWRITE_CONFIG } from "@/lib/constants";
import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface UserPosts {
  username: string;
  totalPosts: number;
  avatarId?: string;
}

const chartConfig = {
  totalPosts: {
    label: "Số bài viết",
    color: "hsl(var(--chart-1))",
  },
};

export default function UserPostsStatsPage() {
  const [userPosts, setUserPosts] = useState<UserPosts[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        const postsResponse = await databases.listDocuments(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collections.posts
        );

        const userPostsMap = new Map<string, { totalPosts: number; avatarId?: string }>();

        postsResponse.documents.forEach((post) => {
          if (post.accountID?.username) {
            const username = post.accountID.username;
            const current = userPostsMap.get(username) || { totalPosts: 0, avatarId: post.accountID.avatarId };
            userPostsMap.set(username, {
              totalPosts: current.totalPosts + 1,
              avatarId: post.accountID.avatarId
            });
          }
        });

        const postsData = Array.from(userPostsMap.entries()).map(([username, data]) => ({
          username,
          totalPosts: data.totalPosts,
          avatarId: data.avatarId
        }));

        postsData.sort((a, b) => b.totalPosts - a.totalPosts);

        setUserPosts(postsData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user posts:", error);
        setLoading(false);
      }
    };

    fetchUserPosts();
  }, []);

  const CustomXAxisTick = ({ x, y, payload }: any) => {
    const user = userPosts.find(u => u.username === payload.value);
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
                height: '100%',
                objectFit: 'cover'
              }}
              onError={(e) => {
                console.error('Image load error:', e);
                e.currentTarget.src = '/default-avatar.png';
              }}
            />
          </div>
        </foreignObject>
      </g>
    );
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-card">
        <div className="p-6">
          <h4 className="text-xl font-semibold">Top người dùng đăng bài</h4>
        </div>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            Đang tải dữ liệu...
          </div>
        ) : userPosts.length > 0 ? (
          <ChartContainer config={chartConfig} className="mt-4 h-[400px]">
            <BarChart
              data={userPosts}
              margin={{ top: 20, right: 20, bottom: 80, left: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
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
                    nameKey="totalPosts"
                  />
                }
              />
              <Bar
                dataKey="totalPosts"
                fill="var(--color-totalPosts)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Không có dữ liệu thống kê
          </div>
        )}
      </div>
    </div>
  );
}
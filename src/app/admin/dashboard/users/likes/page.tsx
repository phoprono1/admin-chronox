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

interface UserLikes {
  username: string;
  totalLikes: number;
  avatarId?: string;
}

const chartConfig = {
  totalLikes: {
    label: "Số lượt thích",
    color: "hsl(var(--chart-1))",
  },
};

export default function UserLikesStatsPage() {
  const [userLikes, setUserLikes] = useState<UserLikes[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserLikes = async () => {
      try {
        // Lấy tất cả posts và likes
        const [postsResponse, likesResponse] = await Promise.all([
          databases.listDocuments(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.posts
          ),
          databases.listDocuments(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.likes
          ),
        ]);

        // Tạo map để lưu trữ postId -> thông tin người tạo post
        const postAuthorMap = new Map<
          string,
          { username: string; avatarId?: string }
        >();
        postsResponse.documents.forEach((post) => {
          if (post.accountID?.username) {
            postAuthorMap.set(post.$id, {
              username: post.accountID.username,
              avatarId: post.accountID.avatarId,
            });
          }
        });

        // Tạo map để đếm số lượt thích cho mỗi user
        const userLikesMap = new Map<
          string,
          { totalLikes: number; avatarId?: string }
        >();

        // Đếm số lượt thích cho mỗi post và cộng vào tác giả của post đó
        likesResponse.documents.forEach((like) => {
          if (like.postCollections?.$id) {
            const postId = like.postCollections.$id;
            const author = postAuthorMap.get(postId);
            if (author) {
              const current = userLikesMap.get(author.username) || {
                totalLikes: 0,
                avatarId: author.avatarId,
              };
              userLikesMap.set(author.username, {
                totalLikes: current.totalLikes + 1,
                avatarId: author.avatarId,
              });
            }
          }
        });

        // Chuyển map thành mảng để hiển thị
        const likesData = Array.from(userLikesMap.entries()).map(
          ([username, data]) => ({
            username,
            totalLikes: data.totalLikes,
            avatarId: data.avatarId,
          })
        );

        // Sắp xếp theo số lượt thích giảm dần
        likesData.sort((a, b) => b.totalLikes - a.totalLikes);

        setUserLikes(likesData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user likes:", error);
        setLoading(false);
      }
    };

    fetchUserLikes();
  }, []);

  if (loading) {
    return <div>Đang tải...</div>;
  }

  const CustomXAxisTick = ({ x, y, payload }: any) => {
    const user = userLikes.find((u) => u.username === payload.value);
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
          Top 10 người dùng có nhiều lượt thích nhất
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Thống kê dựa trên tổng số lượt thích nhận được từ các bài viết
        </p>
        <ChartContainer config={chartConfig} className="mt-4 h-[400px]">
          <BarChart
            data={userLikes}
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
                <ChartTooltipContent labelKey="username" nameKey="totalLikes" />
              }
            />
            <Bar
              dataKey="totalLikes"
              fill="var(--color-totalLikes)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </div>
    </div>
  );
}

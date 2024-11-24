"use client";

import { databases } from "@/lib/appwrite-client";
import { APPWRITE_CONFIG } from "@/lib/constants";
import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Portal } from "@radix-ui/react-hover-card";
import { Hash } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface HashtagStats {
  tag: string;
  count: number;
  posts: Array<{
    id: string;
    title: string;
    authorName: string;
    createdAt: string;
  }>;
}

const chartConfig = {
  count: {
    label: "Số lần xuất hiện",
    color: "hsl(262.1 83.3% 57.8%)", // Màu tím cho hashtag
  },
};

export default function HashtagStatsPage() {
  const [hashtagStats, setHashtagStats] = useState<HashtagStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHashtagStats = async () => {
      try {
        const postsResponse = await databases.listDocuments(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collections.posts
        );

        // Map để lưu trữ thống kê hashtag
        const hashtagMap = new Map<
          string,
          {
            count: number;
            posts: Array<{
              id: string;
              title: string;
              authorName: string;
              createdAt: string;
            }>;
          }
        >();

        const stripHtml = (html: string) => {
          const tmp = document.createElement("div");
          tmp.innerHTML = html;
          return tmp.textContent || tmp.innerText || "";
        };

        // Xử lý từng bài viết
        postsResponse.documents.forEach((post) => {
          const hashTags = post.hashtags || [];
          const postInfo = {
            id: post.$id,
            title: stripHtml(post.title) || "Không có tiêu đề",
            authorName: post.accountID?.username || "Không xác định",
            createdAt: post.$createdAt,
          };

          // Đếm số lần xuất hiện của mỗi hashtag
          hashTags.forEach((tag: string) => {
            const currentStats = hashtagMap.get(tag) || {
              count: 0,
              posts: [],
            };

            currentStats.count++;
            currentStats.posts.push(postInfo);
            hashtagMap.set(tag, currentStats);
          });
        });

        // Chuyển map thành mảng và sắp xếp theo số lần xuất hiện
        const statsArray = Array.from(hashtagMap.entries())
          .map(([tag, stats]) => ({
            tag,
            count: stats.count,
            posts: stats.posts,
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10); // Lấy top 10 hashtag

        setHashtagStats(statsArray);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching hashtag stats:", error);
        setLoading(false);
      }
    };

    fetchHashtagStats();
  }, []);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-lg border bg-background p-3 shadow-sm">
          <div className="space-y-1.5">
            <p className="text-sm font-medium">
              <span className="flex items-center gap-x-1">
                <Hash className="h-3 w-3" />
                #{data.tag}
              </span>
            </p>
            <p className="text-xs text-muted-foreground">
              Xuất hiện trong {data.count} bài viết
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomXAxisTick = ({ x, y, payload }: any) => {
    const hashtag = hashtagStats.find((h) => h.tag === payload.value);
    console.log(hashtag);

    return (
      <g transform={`translate(${x},${y})`}>
        <foreignObject x={-50} y={0} width={100} height={50}>
          <div className="flex flex-col items-center justify-center">
            <HoverCard>
              <HoverCardTrigger asChild>
                <button className="text-xs text-muted-foreground hover:text-primary">
                  #{payload.value}
                </button>
              </HoverCardTrigger>
              <Portal>
                <HoverCardContent
                  className="w-80 z-[100]"
                  side="top"
                  sideOffset={5}
                  align="center"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-x-2">
                      <Hash className="h-4 w-4" />
                      <h4 className="text-sm font-semibold">#{payload.value}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Xuất hiện trong {hashtag?.count} bài viết
                    </p>
                    <ScrollArea className="h-[200px] w-full rounded-md border p-2">
                      <div className="space-y-2">
                        {hashtag?.posts.map((post) => (
                          <div
                            key={post.id}
                            className="space-y-1 border-b pb-2 last:border-0"
                          >
                            <p className="text-sm font-medium line-clamp-1">
                              {post.title}
                            </p>
                            <div className="flex items-center gap-x-2 text-xs text-muted-foreground">
                              <span>{post.authorName}</span>
                              <span>•</span>
                              <span>
                                {new Date(post.createdAt).toLocaleDateString(
                                  "vi-VN"
                                )}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </HoverCardContent>
              </Portal>
            </HoverCard>
          </div>
        </foreignObject>
      </g>
    );
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border p-4">
        <h2 className="text-lg font-medium">Top 10 hashtag phổ biến nhất</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Thống kê dựa trên số lần xuất hiện của hashtag trong các bài viết. Hover
          vào hashtag để xem chi tiết các bài viết.
        </p>
        <ChartContainer config={chartConfig} className="mt-4 h-[400px] w-full">
          <BarChart
            data={hashtagStats}
            margin={{ top: 20, right: 0, bottom: 60, left: 0 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="tag"
              tickLine={false}
              axisLine={false}
              interval={0}
              tick={<CustomXAxisTick />}
              height={60}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "var(--background)", opacity: 0.1 }}
            />
            <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </div>
    </div>
  );
}

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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Image, FileVideo, File } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface MediaStats {
  totalPosts: number;
  postsWithMedia: number;
  totalImages: number;
  totalVideos: number;
  postsWithImages: number;
  postsWithVideos: number;
  postsWithBoth: number;
  imageDistribution: Array<{
    count: string;
    posts: number;
    percentage: number;
  }>;
  videoDistribution: Array<{
    count: string;
    posts: number;
    percentage: number;
  }>;
}

const chartConfig = {
  posts: {
    label: "Số bài viết",
    color: "hsl(145.6 80.4% 45.9%)", // Màu xanh lá
  },
};

export default function MediaStatsPage() {
  const [mediaStats, setMediaStats] = useState<MediaStats>({
    totalPosts: 0,
    postsWithMedia: 0,
    totalImages: 0,
    totalVideos: 0,
    postsWithImages: 0,
    postsWithVideos: 0,
    postsWithBoth: 0,
    imageDistribution: [],
    videoDistribution: [],
  });
  const [loading, setLoading] = useState(true);

  // Hàm kiểm tra loại file dựa vào extension
  const isVideo = (filename: string) => {
    const videoExtensions = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.mkv'];
    return videoExtensions.some(ext => filename.toLowerCase().endsWith(ext));
  };

  useEffect(() => {
    const fetchMediaStats = async () => {
      try {
        const postsResponse = await databases.listDocuments(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collections.posts
        );

        const posts = postsResponse.documents;
        const totalPosts = posts.length;
        let totalImages = 0;
        let totalVideos = 0;
        let postsWithImages = 0;
        let postsWithVideos = 0;
        let postsWithBoth = 0;
        
        const imageCountMap = new Map<number, number>();
        const videoCountMap = new Map<number, number>();

        // Phân tích media trong mỗi bài viết
        posts.forEach((post) => {
          const mediaFiles = post.fileIds || [];
          const images = mediaFiles.filter((file: string) => !isVideo(file));
          const videos = mediaFiles.filter((file: string) => isVideo(file));
          
          const imageCount = images.length;
          const videoCount = videos.length;

          totalImages += imageCount;
          totalVideos += videoCount;

          // Đếm số bài viết có ảnh/video
          if (imageCount > 0) postsWithImages++;
          if (videoCount > 0) postsWithVideos++;
          if (imageCount > 0 && videoCount > 0) postsWithBoth++;

          // Cập nhật phân phối
          const currentImageCount = imageCountMap.get(imageCount) || 0;
          imageCountMap.set(imageCount, currentImageCount + 1);

          const currentVideoCount = videoCountMap.get(videoCount) || 0;
          videoCountMap.set(videoCount, currentVideoCount + 1);
        });

        // Tạo phân phối cho ảnh
        const imageDistribution = Array.from(imageCountMap.entries())
          .map(([count, posts]) => ({
            count: count === 0 ? "Không có ảnh" : `${count} ảnh`,
            posts,
            percentage: (posts / totalPosts) * 100,
          }))
          .sort((a, b) => {
            if (a.count === "Không có ảnh") return -1;
            if (b.count === "Không có ảnh") return 1;
            return parseInt(a.count) - parseInt(b.count);
          });

        // Tạo phân phối cho video
        const videoDistribution = Array.from(videoCountMap.entries())
          .map(([count, posts]) => ({
            count: count === 0 ? "Không có video" : `${count} video`,
            posts,
            percentage: (posts / totalPosts) * 100,
          }))
          .sort((a, b) => {
            if (a.count === "Không có video") return -1;
            if (b.count === "Không có video") return 1;
            return parseInt(a.count) - parseInt(b.count);
          });

        setMediaStats({
          totalPosts,
          postsWithMedia: postsWithImages + postsWithVideos - postsWithBoth,
          totalImages,
          totalVideos,
          postsWithImages,
          postsWithVideos,
          postsWithBoth,
          imageDistribution,
          videoDistribution,
        });
        setLoading(false);
      } catch (error) {
        console.error("Error fetching media stats:", error);
        setLoading(false);
      }
    };

    fetchMediaStats();
  }, []);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-lg border bg-background p-3 shadow-sm">
          <div className="space-y-1.5">
            <p className="text-sm font-medium">{data.count}</p>
            <p className="text-xs text-muted-foreground">
              {data.posts} bài viết ({data.percentage.toFixed(1)}%)
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng số bài viết</CardTitle>
            <File className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mediaStats.totalPosts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Bài viết có media
            </CardTitle>
            <Image className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mediaStats.postsWithMedia}</div>
            <p className="text-xs text-muted-foreground">
              {((mediaStats.postsWithMedia / mediaStats.totalPosts) * 100).toFixed(1)}% tổng số bài viết
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng số ảnh
            </CardTitle>
            <Image className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mediaStats.totalImages}</div>
            <p className="text-xs text-muted-foreground">
              Trung bình {(mediaStats.totalImages / mediaStats.totalPosts).toFixed(1)} ảnh/bài viết
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng số video
            </CardTitle>
            <FileVideo className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mediaStats.totalVideos}</div>
            <p className="text-xs text-muted-foreground">
              Trung bình {(mediaStats.totalVideos / mediaStats.totalPosts).toFixed(1)} video/bài viết
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Chi tiết phân bố media</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground mb-4">
            <p>Số bài viết có cả ảnh và video: {mediaStats.postsWithBoth}</p>
            <p>Số bài viết chỉ có ảnh: {mediaStats.postsWithImages - mediaStats.postsWithBoth}</p>
            <p>Số bài viết chỉ có video: {mediaStats.postsWithVideos - mediaStats.postsWithBoth}</p>
          </div>
          
          <Tabs defaultValue="images">
            <TabsList>
              <TabsTrigger value="images">Phân bố ảnh</TabsTrigger>
              <TabsTrigger value="videos">Phân bố video</TabsTrigger>
            </TabsList>
            <TabsContent value="images">
              <ChartContainer config={chartConfig} className="mt-4 h-[400px] w-full">
                <BarChart
                  data={mediaStats.imageDistribution}
                  margin={{ top: 20, right: 0, bottom: 20, left: 0 }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="count"
                    tickLine={false}
                    axisLine={false}
                    interval={0}
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
                  <Bar
                    dataKey="posts"
                    fill="var(--color-posts)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            </TabsContent>
            <TabsContent value="videos">
              <ChartContainer config={chartConfig} className="mt-4 h-[400px] w-full">
                <BarChart
                  data={mediaStats.videoDistribution}
                  margin={{ top: 20, right: 0, bottom: 20, left: 0 }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="count"
                    tickLine={false}
                    axisLine={false}
                    interval={0}
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
                  <Bar
                    dataKey="posts"
                    fill="var(--color-posts)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

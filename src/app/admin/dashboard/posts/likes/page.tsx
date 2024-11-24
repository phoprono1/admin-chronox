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
import { Heart } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface PostLikes {
  title: string;
  likes: number;
  postId: string;
  hashTags?: string[];
  authorName?: string;
  authorAvatar?: string;
  createdAt?: string;
  image?: string[];
}

const chartConfig = {
  likes: {
    label: "Lượt thích",
    color: "hsl(346.8 77.2% 49.8%)", // Màu đỏ cho heart
  },
};

export default function PostLikesStatsPage() {
  const [postLikes, setPostLikes] = useState<PostLikes[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPostLikes = async () => {
      try {
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

        // Tạo map để đếm số lượt like cho mỗi post
        const likesMap = new Map<
          string,
          {
            likes: number;
            title: string;
            hashTags: string[];
            authorName: string;
            authorAvatar: string;
            createdAt: string;
            image?: string[];
          }
        >();

        const stripHtml = (html: string) => {
          const tmp = document.createElement("div");
          tmp.innerHTML = html;
          return tmp.textContent || tmp.innerText || "";
        };

        // Khởi tạo map với tất cả posts
        postsResponse.documents.forEach((post) => {
          likesMap.set(post.$id, {
            likes: 0,
            title: stripHtml(post.title) || "Không có tiêu đề",
            hashTags: post.hashTags,
            authorName: post.accountID?.username || "Không xác định",
            authorAvatar: post.accountID?.avatarId || "",
            createdAt: post.$createdAt,
            image: post.fileIds || [],
          });
        });

        // Đếm số lượt like
        likesResponse.documents.forEach((like) => {
          if (like.postCollections?.$id) {
            const postData = likesMap.get(like.postCollections.$id);
            if (postData) {
              postData.likes++;
            }
          }
        });

        // Chuyển map thành mảng và sắp xếp theo số lượt thích
        const likesData = Array.from(likesMap.entries())
          .map(([postId, data]) => ({
            postId,
            title: data.title,
            likes: data.likes,
            hashTags: data.hashTags,
            authorName: data.authorName,
            authorAvatar: data.authorAvatar,
            createdAt: data.createdAt,
            image: data.image,
          }))
          .sort((a, b) => b.likes - a.likes)
          .slice(0, 10);

        setPostLikes(likesData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching post likes:", error);
        setLoading(false);
      }
    };

    fetchPostLikes();
  }, []);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-lg border bg-background p-3 shadow-sm">
          <div className="space-y-1.5">
            <p className="text-sm font-medium">
              <span className="flex items-center gap-x-1">
                <Heart className="h-3 w-3 text-red-500" />
                {data.likes} lượt thích
              </span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const isVideo = (filename: string) => {
    const videoExtensions = [".mp4", ".avi", ".mov", ".wmv", ".flv", ".mkv"];
    return videoExtensions.some((ext) => filename.toLowerCase().endsWith(ext));
  };

  // Giữ nguyên CustomXAxisTick component từ code cũ
  const CustomXAxisTick = ({ x, y, payload }: any) => {
    const post = postLikes.find((p) => p.postId === payload.value);
    const avatarUrl = post?.authorAvatar
      ? `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${APPWRITE_CONFIG.buckets.avatars}/files/${post.authorAvatar}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`
      : "/default-avatar.png";

    // Tách riêng ảnh và video
    const mediaUrls =
      post?.image?.map((fileId) => ({
        id: fileId,
        url: `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${APPWRITE_CONFIG.buckets.posts}/files/${fileId}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`,
        isVideo: isVideo(fileId),
      })) || [];

    const images = mediaUrls.filter((media) => !media.isVideo);
    const videos = mediaUrls.filter((media) => media.isVideo);

    return (
      <g transform={`translate(${x},${y})`}>
        <foreignObject x={-60} y={0} width={120} height={50}>
          <div className="flex flex-col items-center justify-center gap-1">
            <HoverCard>
              <HoverCardTrigger asChild>
                <button className="flex flex-col items-center gap-1 group">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={avatarUrl} />
                    <AvatarFallback>
                      {post?.authorName?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground group-hover:text-primary truncate max-w-[100px]">
                    {post?.authorName}
                  </span>
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
                    <h4 className="text-sm font-semibold">{post?.title}</h4>
                    {post?.hashTags && post.hashTags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {post.hashTags.map((tag, index) => (
                          <span
                            key={index}
                            className="text-xs bg-muted px-2 py-1 rounded-full"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-x-2 text-xs text-muted-foreground">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={avatarUrl} />
                        <AvatarFallback>
                          {post?.authorName?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{post?.authorName}</span>
                      <span>•</span>
                      <span>
                        {post?.createdAt &&
                          new Date(post.createdAt).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                    {videos.length > 0 && (
                      <div className="relative aspect-video rounded-md overflow-hidden">
                        <video
                          src={videos[0].url}
                          controls
                          className="w-full h-full"
                          poster={images[0]?.url}
                        >
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    )}

                    {/* Hiển thị ảnh */}
                    {images.length > 0 && (
                      <div className="grid gap-2">
                        {images.length === 1 ? (
                          <div className="relative aspect-video rounded-md overflow-hidden">
                            <img
                              src={images[0].url}
                              alt={`${post?.title} - Ảnh 1`}
                              className="object-cover w-full h-full"
                            />
                          </div>
                        ) : images.length === 2 ? (
                          <div className="grid grid-cols-2 gap-2">
                            {images.map((image, index) => (
                              <div
                                key={image.id}
                                className="relative aspect-square rounded-md overflow-hidden"
                              >
                                <img
                                  src={image.url}
                                  alt={`${post?.title} - Ảnh ${index + 1}`}
                                  className="object-cover w-full h-full"
                                />
                              </div>
                            ))}
                          </div>
                        ) : (
                          images.length > 2 && (
                            <div className="grid grid-cols-2 gap-2">
                              <div className="col-span-2 relative aspect-video rounded-md overflow-hidden">
                                <img
                                  src={images[0].url}
                                  alt={`${post?.title} - Ảnh 1`}
                                  className="object-cover w-full h-full"
                                />
                              </div>
                              {images.slice(1, 3).map((image, index) => (
                                <div
                                  key={image.id}
                                  className="relative aspect-square rounded-md overflow-hidden"
                                >
                                  <img
                                    src={image.url}
                                    alt={`${post?.title} - Ảnh ${index + 2}`}
                                    className="object-cover w-full h-full"
                                  />
                                  {images.length > 3 && index === 1 && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-sm">
                                      +{images.length - 3}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )
                        )}
                      </div>
                    )}

                    {/* Hiển thị số lượng media */}
                    {(videos.length > 0 || images.length > 0) && (
                      <div className="text-xs text-muted-foreground">
                        {videos.length > 0 && (
                          <span>{videos.length} video</span>
                        )}
                        {videos.length > 0 && images.length > 0 && (
                          <span> • </span>
                        )}
                        {images.length > 0 && <span>{images.length} ảnh</span>}
                      </div>
                    )}

                    {/* Hiển thị số lượt thích */}
                    <div className="flex items-center gap-x-1">
                      <Heart className="h-4 w-4 text-red-500" />
                      <span className="text-sm">{post?.likes} lượt thích</span>
                    </div>
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
        <h2 className="text-lg font-medium">
          Top 10 bài viết có nhiều lượt thích nhất
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Thống kê dựa trên số lượt thích. Hover vào avatar để xem chi tiết bài
          viết.
        </p>
        <ChartContainer config={chartConfig} className="mt-4 h-[400px] w-full">
          <BarChart
            data={postLikes}
            margin={{ top: 20, right: 0, bottom: 60, left: 0 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="postId"
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
            <Bar
              dataKey="likes"
              fill="var(--color-likes)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </div>
    </div>
  );
}

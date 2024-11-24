"use client";

import { databases, storage } from "@/lib/appwrite-client";
import { APPWRITE_CONFIG } from "@/lib/constants";
import { Models, Query } from "appwrite";
import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Search, Image as ImageIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import React from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";

interface User {
  $id: string;
  username: string;
  email: string;
  bio: string;
  followed: number;
  follower: number;
  website: string | null;
  status: string;
  avatarId: string;
  location: string | null;
}

interface Post extends Models.Document {
  title: string;
  hashtags: string[];
  accountID: User; // Thay đổi kiểu dữ liệu ở đây
  fileIds: string[];
  $id: string;
  $createdAt: string;
  $updatedAt: string;
}

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const queries = [
          Query.orderDesc("$createdAt"),
          Query.limit(itemsPerPage),
          Query.offset((currentPage - 1) * itemsPerPage),
        ];

        if (searchQuery) {
          queries.push(Query.search("title", searchQuery));
        }

        const response = await databases.listDocuments(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collections.posts,
          queries
        );

        const postsData = response.documents as unknown as Post[];
        setPosts(postsData);

        // Tính tổng số trang
        setTotalPages(Math.ceil(response.total / itemsPerPage));
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [searchQuery, currentPage]); // Thêm currentPage vào dependencies

  // Thêm hàm xử lý chuyển trang
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await databases.deleteDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.posts,
        postId
      );

      setPosts(posts.filter((post) => post.$id !== postId));
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-40" />
        <div className="flex gap-4 mb-6">
          <Skeleton className="h-10 w-[300px]" />
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nội dung</TableHead>
                <TableHead>Tác giả</TableHead>
                <TableHead>Hashtags</TableHead>
                <TableHead>Hình ảnh</TableHead>
                <TableHead>Ngày đăng</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-[200px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[150px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[100px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[50px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[100px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-8" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminHeader />
      <h1 className="text-3xl font-bold">Quản lý bài viết</h1>

      <div className="flex gap-4 mb-6">
        <div className="relative w-[300px]">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm theo nội dung..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nội dung</TableHead>
              <TableHead>Tác giả</TableHead>
              <TableHead>Hashtags</TableHead>
              <TableHead>Hình ảnh</TableHead>
              <TableHead>Ngày đăng</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.map((post) => (
              <TableRow key={post.$id}>
                <TableCell>
                  <div
                    className="max-w-[300px] truncate"
                    dangerouslySetInnerHTML={{ __html: post.title }}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage
                        src={`${APPWRITE_CONFIG.endpoint}/storage/buckets/${APPWRITE_CONFIG.buckets.avatars}/files/${post.accountID.avatarId}/view?project=${APPWRITE_CONFIG.projectId}`}
                      />
                      <AvatarFallback>
                        {post.accountID.username[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">
                        {post.accountID.username}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {post.accountID.email}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1 flex-wrap">
                    {post.hashtags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  {post.fileIds.length > 0 ? (
                    <Badge variant="outline">
                      <ImageIcon className="h-3 w-3 mr-1" />
                      {post.fileIds.length}
                    </Badge>
                  ) : (
                    "Không có"
                  )}
                </TableCell>
                <TableCell>
                  {new Date(post.$createdAt).toLocaleDateString("vi-VN")}
                </TableCell>
                <TableCell>
                  <Dialog>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Mở menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Hành động</DropdownMenuLabel>
                        <DialogTrigger asChild>
                          <DropdownMenuItem>Xem chi tiết</DropdownMenuItem>
                        </DialogTrigger>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDeletePost(post.$id)}
                        >
                          Xóa bài viết
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <DialogContent className="sm:max-w-[625px]">
                      <DialogHeader>
                        <DialogTitle>Chi tiết bài viết</DialogTitle>
                        <DialogDescription>
                          Đăng bởi {post.accountID.username} vào{" "}
                          {new Date(post.$createdAt).toLocaleString("vi-VN")}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <h4 className="font-medium">Nội dung</h4>
                          <div
                            className="text-sm text-muted-foreground"
                            dangerouslySetInnerHTML={{ __html: post.title }}
                          />
                        </div>

                        {post.hashtags.length > 0 && (
                          <div className="grid gap-2">
                            <h4 className="font-medium">Hashtags</h4>
                            <div className="flex gap-1 flex-wrap">
                              {post.hashtags.map((tag, index) => (
                                <Badge key={index} variant="secondary">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {post.fileIds.length > 0 && (
                          <div className="grid gap-2">
                            <h4 className="font-medium">Hình ảnh</h4>
                            <div className="grid grid-cols-2 gap-2">
                              {post.fileIds.map((fileId) => (
                                <img
                                  key={fileId}
                                  src={`${APPWRITE_CONFIG.endpoint}/storage/buckets/${APPWRITE_CONFIG.buckets.posts}/files/${fileId}/view?project=${APPWRITE_CONFIG.projectId}`}
                                  alt="Post image"
                                  className="rounded-md w-full h-48 object-cover"
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="py-4 border-t">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(currentPage - 1);
                    // Kiểm tra xem có phải trang đầu tiên không
                    if (currentPage === 1) {
                      handlePageChange(1);
                    }
                  }}
                />
              </PaginationItem>

              {/* Hiển thị các số trang */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((page) => {
                  // Hiển thị trang đầu, trang cuối và các trang xung quanh trang hiện tại
                  if (page === 1 || page === totalPages) return true;
                  return Math.abs(page - currentPage) <= 1;
                })
                .map((page, index, array) => (
                  <React.Fragment key={page}>
                    {index > 0 && array[index - 1] !== page - 1 && (
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )}
                    <PaginationItem>
                      <PaginationLink
                        onClick={() => handlePageChange(page)}
                        isActive={currentPage === page}

                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  </React.Fragment>
                ))}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(currentPage + 1);
                    // Kiểm tra xem có phải trang cuối cùng không
                    if (currentPage === totalPages) {
                      handlePageChange(totalPages);
                    }
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  );
}

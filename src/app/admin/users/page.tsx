"use client";

import { databases } from "@/lib/appwrite-client";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { MoreHorizontal, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import React from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";

interface User extends Models.Document {
  // Kế thừa từ Models.Document
  username: string;
  email: string;
  bio: string;
  followed: number;
  follower: number;
  website: string | null;
  status: string;
  avatarId: string;
  location: string | null;
  $id: string; // Từ Models.Document
  $createdAt: string; // Từ Models.Document
  $updatedAt: string; // Từ Models.Document
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  // Thêm state cho phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const queries = [
          Query.orderDesc("$createdAt"),
          Query.limit(itemsPerPage),
          Query.offset((currentPage - 1) * itemsPerPage)
        ];

        if (searchQuery) {
          queries.push(Query.search("username", searchQuery));
        }

        const response = await databases.listDocuments(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collections.users,
          queries
        );

        setUsers(response.documents as unknown as User[]);
        // Tính tổng số trang
        setTotalPages(Math.ceil(response.total / itemsPerPage));
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [searchQuery, currentPage]); // Thêm currentPage vào dependencies

  // Thêm hàm xử lý chuyển trang
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleStatusChange = async (userId: string, newStatus: string) => {
    try {
      await databases.updateDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.users,
        userId,
        {
          status: newStatus,
        }
      );

      // Cập nhật state local
      setUsers(
        users.map((user) =>
          user.$id === userId ? { ...user, status: newStatus } : user
        )
      );
    } catch (error) {
      console.error("Error updating user status:", error);
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
                <TableHead>Người dùng</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Địa điểm</TableHead>
                <TableHead>Followers</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <Skeleton className="h-4 w-[150px]" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[200px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[120px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-12" />
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
      <h1 className="text-3xl font-bold">Quản lý người dùng</h1>

      <div className="flex gap-4 mb-6">
        <div className="relative w-[300px]">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm theo tên..."
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
              <TableHead>Người dùng</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Địa điểm</TableHead>
              <TableHead>Followers</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.$id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage
                        src={`${APPWRITE_CONFIG.endpoint}/storage/buckets/${APPWRITE_CONFIG.buckets.avatars}/files/${user.avatarId}/view?project=${APPWRITE_CONFIG.projectId}`}
                      />
                      <AvatarFallback>{user.username[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{user.username}</div>
                      <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                        {user.bio}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge
                    variant={user.status === "online" ? "default" : "secondary"}
                  >
                    {user.status}
                  </Badge>
                </TableCell>
                <TableCell>{user.location || "N/A"}</TableCell>
                <TableCell>{user.follower}</TableCell>
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
                        <DropdownMenuItem
                          onClick={() =>
                            handleStatusChange(
                              user.$id,
                              user.status === "online" ? "blocked" : "online"
                            )
                          }
                        >
                          {user.status === "online"
                            ? "Chặn người dùng"
                            : "Bỏ chặn"}
                        </DropdownMenuItem>
                        <DialogTrigger asChild>
                          <DropdownMenuItem
                            onSelect={(e) => {
                              e.preventDefault();
                              setSelectedUser(user);
                            }}
                          >
                            Xem chi tiết
                          </DropdownMenuItem>
                        </DialogTrigger>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Thông tin người dùng</DialogTitle>
                        <DialogDescription>
                          Chi tiết thông tin của người dùng {user.username}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-20 w-20">
                            <AvatarImage
                              src={`${APPWRITE_CONFIG.endpoint}/storage/buckets/${APPWRITE_CONFIG.buckets.avatars}/files/${user.avatarId}/view?project=${APPWRITE_CONFIG.projectId}`}
                            />
                            <AvatarFallback>{user.username[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium">{user.username}</h3>
                            <p className="text-sm text-muted-foreground">
                              {user.email}
                            </p>
                          </div>
                        </div>

                        <div className="grid gap-2">
                          <h4 className="font-medium">Giới thiệu</h4>
                          <p className="text-sm text-muted-foreground">
                            {user.bio || "Chưa có giới thiệu"}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium">Người theo dõi</h4>
                            <p className="text-sm text-muted-foreground">
                              {user.follower}
                            </p>
                          </div>
                          <div>
                            <h4 className="font-medium">Đang theo dõi</h4>
                            <p className="text-sm text-muted-foreground">
                              {user.followed}
                            </p>
                          </div>
                        </div>

                        <div className="grid gap-2">
                          <h4 className="font-medium">Website</h4>
                          <p className="text-sm text-muted-foreground">
                            {user.website ? (
                              <a
                                href={user.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                              >
                                {user.website}
                              </a>
                            ) : (
                              "Không có"
                            )}
                          </p>
                        </div>

                        <div className="grid gap-2">
                          <h4 className="font-medium">Địa điểm</h4>
                          <p className="text-sm text-muted-foreground">
                            {user.location || "Chưa cập nhật"}
                          </p>
                        </div>

                        <div className="grid gap-2">
                          <h4 className="font-medium">Ngày tham gia</h4>
                          <p className="text-sm text-muted-foreground">
                            {new Date(user.$createdAt).toLocaleDateString(
                              "vi-VN"
                            )}
                          </p>
                        </div>
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
              {currentPage > 1 && (
                <PaginationItem>
                  <PaginationPrevious 
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(currentPage - 1);
                      if (currentPage === 1) {
                        handlePageChange(1);
                      }
                    }}
                  />
                </PaginationItem>
              )}
              
              {Array.from({length: totalPages}, (_, i) => i + 1)
                .filter(page => {
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
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(page);
                        }}
                        isActive={currentPage === page}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  </React.Fragment>
                ))
              }
              
              {currentPage < totalPages && (
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(currentPage + 1);
                      if (currentPage === totalPages) {
                        handlePageChange(totalPages);
                      }
                    }}
                  />
                </PaginationItem>
              )}
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  );
}

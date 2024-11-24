import React from "react";

export default function VerifyErrorPage({
    searchParams,
  }: {
    searchParams: { error: string };
  }) {
    return (
      <div className="text-center p-8">
        <h1 className="text-2xl font-bold text-red-600 mb-4">
          Xác thực email thất bại
        </h1>
        <p className="text-gray-600">
          {searchParams.error || "Đã có lỗi xảy ra"}
        </p>
      </div>
    );
  }
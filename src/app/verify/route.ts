import { NextRequest, NextResponse } from "next/server";
import { Client, Account } from "node-appwrite";

export async function GET(req: NextRequest) {
  try {
    // Lấy userId và secret từ URL params
    const searchParams = req.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const secret = searchParams.get('secret');

    if (!userId || !secret) {
      return NextResponse.json(
        { error: "User ID và secret là bắt buộc" },
        { status: 400 }
      );
    }

    const serverClient = new Client()
      .setEndpoint(process.env.APPWRITE_ENDPOINT!)
      .setProject(process.env.APPWRITE_PROJECT_ID!)
      .setKey(process.env.APPWRITE_API_KEY!);

    const account = new Account(serverClient);

    // Gọi API xác thực của Appwrite
    await account.updateMagicURLSession(userId, secret);

    // Redirect về trang thành công
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/verify-success`
    );

  } catch (error: any) {
    console.error("Verification error:", error);
    // Redirect về trang lỗi
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/verify-error?error=${error.message}`
    );
  }
}
import { NextRequest, NextResponse } from "next/server";
import { Client, Account, Functions, Users } from "node-appwrite";

export async function POST(req: NextRequest) {
  try {
    const { userId, email } = await req.json();

    const serverClient = new Client()
      .setEndpoint(process.env.APPWRITE_ENDPOINT!)
      .setProject(process.env.APPWRITE_PROJECT_ID!)
      .setKey(process.env.APPWRITE_API_KEY!);

    const users = new Users(serverClient);
    const account = new Account(serverClient);
    const functions = new Functions(serverClient);
    
    // Lấy user để có target ID
    const user = await users.get(userId);
    
    // Lọc ra target có type là 'email'
    const emailTargets = user.targets.filter((target: any) => target.providerType === 'email');
    if (emailTargets.length === 0) {
      throw new Error('Không tìm thấy email target cho user này');
    }
    
    const targetIds = emailTargets.map((target: any) => target.$id);
    console.log('Email target IDs:', targetIds);
    
    const token = await account.createMagicURLToken(
      userId,
      email,
      `${process.env.NEXT_PUBLIC_APP_URL}/verify`
    );

    // Gửi mail với target IDs
    const mailResponse = await functions.createExecution(
      '6739bf9f0020406e65ed',
      JSON.stringify({
        subject: 'Xác thực email ChronoX',
        content: `
          <h2>Xác thực email của bạn</h2>
          <p>Chào mừng bạn đến với ChronoX!</p>
          <p>Vui lòng click vào link bên dưới để xác thực email của bạn:</p>
          <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/verify?userId=${userId}&secret=${token.secret}">
            Xác thực email
          </a></p>
          <p>Link này sẽ hết hạn sau 1 giờ.</p>
        `,
        targets: targetIds
      })
    );

    return NextResponse.json({
      success: true,
      secret: token.secret,
      token: token,
      mailResponse: mailResponse
    });
    
  } catch (error: any) {
    console.error("Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        errorDetails: error
      },
      { status: 500 }
    );
  }
}
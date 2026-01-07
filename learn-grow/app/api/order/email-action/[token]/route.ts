import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  const token = params.token;
  
  // Redirect to backend API
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  const redirectUrl = `${backendUrl}/api/orders/email-action/${token}`;
  
  return NextResponse.redirect(redirectUrl);
}

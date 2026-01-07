import { NextRequest, NextResponse } from "next/server";

// Disabled: Order actions are backend-only. Keep 410 to avoid Next.js handling.
export async function GET(_req: NextRequest) {
  return NextResponse.json(
    {
      success: false,
      message: "This route has been removed. Use backend /api/orders/email-action/:token",
    },
    { status: 410 }
  );
}

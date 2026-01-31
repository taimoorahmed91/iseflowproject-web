import { NextRequest, NextResponse } from "next/server";
import { validateDataUrl, validateBasicAuth } from "@/lib/validators";
import { sseEmitter } from "@/lib/eventEmitter";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  // Validate Basic Auth
  const authHeader = request.headers.get("authorization");

  if (!validateBasicAuth(authHeader)) {
    return NextResponse.json(
      {
        status: "error",
        message: "Unauthorized",
      },
      {
        status: 401,
        headers: {
          "WWW-Authenticate": 'Basic realm="ISE Visualizer"',
        },
      }
    );
  }

  try {
    // Parse request body
    const body = await request.json();
    const { dataUrl } = body;

    // Check if dataUrl is provided
    if (!dataUrl) {
      return NextResponse.json(
        {
          status: "error",
          message: "Missing required field: dataUrl",
        },
        { status: 400 }
      );
    }

    // Validate URL format
    const validation = validateDataUrl(dataUrl);

    if (!validation.valid) {
      return NextResponse.json(
        {
          status: "error",
          message: validation.error || "Invalid URL format",
        },
        { status: 400 }
      );
    }

    // Broadcast to all connected clients via SSE
    sseEmitter.emit({ dataUrl });

    console.log(`Data load triggered: ${dataUrl}`);
    console.log(`Broadcasting to ${sseEmitter.getListenerCount()} connected clients`);

    // Return success response
    return NextResponse.json({
      status: "loading",
      message: "Data fetch initiated",
      dataUrl,
    });
  } catch (error) {
    console.error("Error processing load request:", error);

    return NextResponse.json(
      {
        status: "error",
        message: "Internal server error",
        details: error instanceof Error ? error.message : "Failed to process request",
      },
      { status: 500 }
    );
  }
}

import { NextRequest } from "next/server";
import { sseEmitter } from "@/lib/eventEmitter";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  // Set up SSE headers
  const responseStream = new TransformStream();
  const writer = responseStream.writable.getWriter();
  const encoder = new TextEncoder();

  // Send initial connection message
  const sendEvent = async (event: string, data: any) => {
    const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    await writer.write(encoder.encode(message));
  };

  // Send connected event
  await sendEvent("connected", { message: "Connected to event stream" });

  // Set up listener for data updates
  const removeListener = sseEmitter.addListener(async (data) => {
    try {
      await sendEvent("data-update", data);
    } catch (error) {
      console.error("Error sending SSE event:", error);
    }
  });

  // Send keepalive ping every 30 seconds
  const keepaliveInterval = setInterval(async () => {
    try {
      await sendEvent("ping", { timestamp: new Date().toISOString() });
    } catch (error) {
      console.error("Error sending keepalive:", error);
      clearInterval(keepaliveInterval);
    }
  }, 30000);

  // Clean up on connection close
  request.signal.addEventListener("abort", () => {
    clearInterval(keepaliveInterval);
    removeListener();
    writer.close();
  });

  return new Response(responseStream.readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}

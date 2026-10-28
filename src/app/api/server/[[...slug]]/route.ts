import { RPCHandler } from "@orpc/server/fetch";
import { rootRouter } from "@/orpc/root-router";
import {
  checkRateLimit,
  getClientIp,
  tooManyRequestsResponse,
} from "@/shared/lib/rate-limit";

const handler = new RPCHandler(rootRouter);

/** General budget: all oRPC calls per IP. */
const IP_RATE_LIMIT = { window: 60, max: 180 };

const handle = async (request: Request) => {
  const ip = getClientIp(request.headers);

  const overall = checkRateLimit(`ip:${ip}`, IP_RATE_LIMIT);
  if (!overall.allowed) {
    return tooManyRequestsResponse(overall.retryAfter);
  }

  const { response } = await handler.handle(request, {
    context: {
      headers: request.headers,
    },
    prefix: "/api/server",
  });

  // `response` is undefined only when the path does not start with the RPC
  // prefix, which Next.js would otherwise turn into a 500.
  return response ?? new Response("Not Found", { status: 404 });
};

export const GET = handle;
export const POST = handle;

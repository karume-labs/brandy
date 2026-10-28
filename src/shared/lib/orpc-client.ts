import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { createORPCReactQueryUtils } from "@orpc/react-query";
import type { RouterClient } from "@orpc/server";
import type { RootRouter } from "@/orpc/root-router";

export type Client = RouterClient<RootRouter>;

const rpcLink = new RPCLink({
  // oRPC builds requests with `new URL(url)` (no base), so it needs an absolute
  // URL. Resolving the shared mount path against the current origin on every
  // call keeps it correct for any host/port.
  url: () => new URL("/api/server", window.location.origin),
});

export const orpcClient = createORPCClient<Client>(rpcLink);

export const orpcQuery = createORPCReactQueryUtils<Client>(orpcClient);

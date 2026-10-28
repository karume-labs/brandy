import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/features/auth/server/better-auth";

export const { GET, POST } = toNextJsHandler(auth);

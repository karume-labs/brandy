import { diskStorage } from "@/shared/lib/storage/disk";

/** The app-wide storage backend. Swap for S3 here when the time comes. */
export const storage = diskStorage;
export * from "@/shared/lib/storage/types";

import { notifications } from "@mantine/notifications";

/** Toast durations: 4s for informational, 5s for errors (extra read time). */
const AUTO_CLOSE_MS = 4000;
const AUTO_CLOSE_ERROR_MS = 5000;

export const notify = {
  success: (title: string, message?: string) =>
    notifications.show({
      title,
      message,
      autoClose: AUTO_CLOSE_MS,
    }),

  error: (title: string, message?: string) =>
    notifications.show({
      title,
      message,
      color: "red",
      autoClose: AUTO_CLOSE_ERROR_MS,
    }),

  info: (title: string, message?: string) =>
    notifications.show({
      title,
      message,
      color: "blue",
      autoClose: AUTO_CLOSE_MS,
    }),
};

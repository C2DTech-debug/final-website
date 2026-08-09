import { NotificationModel } from "../models/Notification";

export interface NotifyInput {
  type: "contact" | "lead" | "estimate" | "blog" | "career" | "system" | "login" | "error" | "payment";
  title: string;
  message?: string;
  link?: string;
  entityType?: string;
  entityId?: string;
  user?: string | null;
}

/** Create a notification. When `user` is omitted it is treated as a broadcast (user: null). */
export async function notify(input: NotifyInput): Promise<void> {
  try {
    await NotificationModel.create({
      user: input.user ?? null,
      type: input.type,
      title: input.title,
      message: input.message ?? "",
      link: input.link ?? "",
      entityType: input.entityType ?? "",
      entityId: input.entityId ?? "",
    });
  } catch (error) {
    console.error("[notify] failed to persist notification", error);
  }
}

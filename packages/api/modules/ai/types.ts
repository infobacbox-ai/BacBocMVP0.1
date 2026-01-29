import { AiChatSchema } from "@repo/database";
import { z } from "zod/v4";

export const MessageSchema = z.object({
	role: z.enum(["user", "assistant"]),
	content: z.string(),
	parts: z.array(z.object({ type: z.string(), text: z.string() })),
});

export const ChatSchema = AiChatSchema.extend({
	messages: z.array(MessageSchema),
});

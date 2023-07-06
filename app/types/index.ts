import { Conversation, Message, User } from "@prisma/client";

export type FullConversationType = Conversation & {
    members: User[];
    messages: Message[];
}
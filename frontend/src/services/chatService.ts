import api from "@/lib/axios";
import type { ConversationResponse, Message } from "@/types/chat";

interface FetchMessageProps {
  messages: Message[];
  cursor?: string;
}
const pageLimit = 50;
export const chatService = {
  fetchConversations: async (): Promise<ConversationResponse> => {
    const res = await api.get("/conversations", { withCredentials: true });
    return res.data;
  },
  fetchMessages: async (
    id: string,
    cursor?: string,
  ): Promise<FetchMessageProps> => {
    const res = await api.get(
      `/conversations/${id}/messages?limit=${pageLimit}&cursor=${cursor}`,
      {
        withCredentials: true,
      },
    );

    return { messages: res.data.messages, cursor: res.data.nextCursor };
  },
  sendDirectMessage: async (
    recipientId: string,
    content: string = "",
    imgUrl?: string,
    conversationId?: string,
  ) => {
    const res = await api.post("/messages/direct", {
      recipientId,
      content,
      imgUrl,
      conversationId,
    });
    return res.data.message;
  },
  sendGroupMessage: async (
    conversationId: string,
    content: string = "",
    imgUrl?: string,
  ) => {
    const res = await api.post("/messages/group", {
      conversationId,
      content,
      imgUrl,
    });
    return res.data.message;
  },
  maskAsSeen: async (conversationId: string) => {
    const res = await api.patch(`/conversations/${conversationId}/seen`);
    return res.data;
  },
  async createConversation(
    type: "direct" | "group",
    name: string,
    memberIds: string[],
  ) {
    const res = await api.post("/conversations", { type, name, memberIds });
    return res.data.conversation;
  },
};

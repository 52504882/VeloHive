import {
  createLocalConversation,
  createLocalTextMessage,
  sortMessagesAscending
} from "../src/services/messageRepository";

describe("messages", () => {
  it("sorts conversation messages oldest first", () => {
    expect(
      sortMessagesAscending([
        { id: "2", createdAt: "2026-07-23T09:00:00.000Z" },
        { id: "1", createdAt: "2026-07-23T08:00:00.000Z" }
      ]).map((message) => message.id)
    ).toEqual(["1", "2"]);
  });

  it("creates a local conversation for demo mode", () => {
    expect(
      createLocalConversation({
        buyerId: "buyer-1",
        sellerId: "seller-1",
        listingId: "listing-1"
      })
    ).toMatchObject({
      buyerId: "buyer-1",
      sellerId: "seller-1",
      listingId: "listing-1",
      meetupStatus: "chatting"
    });
  });

  it("creates local text messages with readable previews", () => {
    expect(createLocalTextMessage("conversation-1", "user-1", "  你好，周末可以看车吗？ ")).toMatchObject({
      body: "你好，周末可以看车吗？",
      conversationId: "conversation-1",
      senderId: "user-1",
      kind: "text"
    });
  });
});

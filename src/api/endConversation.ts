import toast from "react-hot-toast";

export const endConversation = async (
  token: string,
  conversationId: string,
) => {
  try {
    const response = await fetch(
      `https://tavusapi.com/v2/conversations/${conversationId}/end`,
      {
        method: "POST",
        headers: {
          "x-api-key": token ?? "",
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to end conversation");
    }

    toast.success("Conversation ended successfully!");
    return null;
  } catch (error) {
    console.error("Error:", error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to end conversation';
    toast.error(errorMessage);
    throw error;
  }
};
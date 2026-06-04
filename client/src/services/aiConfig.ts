import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const aiService = {
  summarizeNGO: async (description: string) => {
    const response = await axios.post(
      `${API_URL}/ai/summarize-ngo`,
      {
        description,
      }
    );

    return response.data;
  },
};
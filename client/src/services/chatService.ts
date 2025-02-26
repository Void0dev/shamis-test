/**
 * Service for interacting with the chat API
 */
export class ChatService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || '';
  }

  /**
   * Sends a chat message to the API and returns a readable stream of the response
   * @param prompt The user's message
   * @returns A ReadableStream of the AI response
   */
  async sendMessage(prompt: string): Promise<ReadableStream<Uint8Array> | null> {
    try {
      const response = await fetch(`${this.baseUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      return response.body;
    } catch (error) {
      console.error('Error in sendMessage:', error);
      throw error;
    }
  }

  /**
   * Parses a chunk from the stream into text content
   * @param chunk The raw chunk from the stream
   * @returns The extracted text content
   */
  parseStreamChunk(chunk: string): string {
    let textContent = '';
    
    // Split the chunk by newlines to process each line
    const lines = chunk.split('\n').filter(line => line.trim());
    
    for (const line of lines) {
      // Lines starting with "0:" contain the actual text content
      if (line.startsWith('0:')) {
        // Extract the content part (after the "0:")
        const content = line.substring(2);
        // Remove quotes if present
        const unquoted = content.startsWith('"') && content.endsWith('"') 
          ? content.substring(1, content.length - 1) 
          : content;
        textContent += unquoted;
      }
    }
    
    return textContent;
  }
}

// Create a singleton instance
export const chatService = new ChatService();

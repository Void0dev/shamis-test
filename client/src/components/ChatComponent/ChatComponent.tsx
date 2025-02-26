import { useState, useRef, useEffect } from 'react';
import './ChatComponent.css';
import { chatService } from '@/services/chatService';

const ChatComponent = () => {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant', content: string }>>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Create a new message for the assistant's response
      const assistantMessageIndex = messages.length;
      setMessages(prev => [...prev, { role: 'assistant' as const, content: '' }]);

      // Make the API call using our service
      const stream = await chatService.sendMessage(userMessage.content);
      
      if (!stream) {
        throw new Error('No stream available');
      }

      // Process the stream
      const reader = stream.getReader();
      let accumulatedContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Decode the chunk
        const chunk = new TextDecoder().decode(value);
        console.log('Received chunk:', chunk);
        
        try {
          // Parse the chunk to extract only the text content
          const textContent = chatService.parseStreamChunk(chunk);
          
          if (textContent) {
            accumulatedContent += textContent;
            
            // Update the assistant message with accumulated content
            setMessages(prev => {
              const updated = [...prev];
              updated[assistantMessageIndex] = {
                role: 'assistant',
                content: accumulatedContent
              };
              return updated;
            });
          }
        } catch (chunkError) {
          console.error('Error processing chunk:', chunkError, chunk);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [
        ...prev.slice(0, -1), // Remove the empty assistant message
        { role: 'assistant' as const, content: `Sorry, there was an error processing your request: ${error instanceof Error ? error.message : String(error)}` }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.role}`}>
            <div className="message-content">{message.content || (message.role === 'assistant' && isLoading ? 'Thinking...' : '')}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="chat-input-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={isLoading}
          className="chat-input"
        />
        <button type="submit" disabled={isLoading || !input.trim()} className="chat-submit">
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
};

export default ChatComponent;

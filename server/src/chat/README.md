# AI Chat Service

This module provides a streaming AI chat service using Anthropic's Claude model.

## Setup

1. Add your Anthropic API key to the `.env` file:

```
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

2. Make sure the ChatModule is imported in your AppModule (this should be done automatically).

## API Endpoints

### Basic Chat Endpoint

```
POST /chat
```

Request body:
```json
{
  "prompt": "Your question or prompt here"
}
```

### Advanced Streaming Endpoint

```
POST /chat/stream-data
```

Request body:
```json
{
  "prompt": "Your question or prompt here"
}
```

## Error Handling

If the Anthropic API key is not configured, the service will throw an error. The error message will be returned to the client.

## Client Integration

See the `ChatComponent` in the client directory for an example implementation of how to consume these streaming endpoints.

## Troubleshooting

If you see an error like `3:"An error occurred"`, check that:

1. Your Anthropic API key is correctly set in the `.env` file
2. The API key has sufficient permissions and credits
3. The server logs for more detailed error information

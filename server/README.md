# Server

A powerful backend server built with NestJS, featuring Telegram Bot integration, OpenAI proxy, and tRPC endpoints.

## Features

### Core Features
- **Authentication System**: Secure user authentication and authorization
- **Telegram Bot Integration**: Built-in Telegram bot functionality
- **OpenAI Proxy**: Proxy service for OpenAI API calls
- **tRPC Integration**: Type-safe API endpoints using tRPC
- **User Management**: Complete user handling system

### Technical Features
- Built with NestJS framework
- TypeScript support with strict type checking
- CORS enabled with configurable origins
- Cookie-based authentication
- Passport.js integration
- Pino logger implementation
- Environment-based configuration

## Project Structure

```
src/
├── app-config/      # Application configuration
├── auth/           # Authentication related code
├── config/         # Configuration modules
├── lib/            # Shared libraries
├── openai-proxy/   # OpenAI proxy service
├── telegram/       # Telegram bot integration
├── trpc/           # tRPC endpoints
├── user/           # User management
├── app.module.ts   # Main application module
└── main.ts         # Application entry point
```

## Getting Started

### Prerequisites
- Node.js (Latest LTS version recommended)
- npm or yarn
- TypeScript

### Installation

1. Install dependencies:
```bash
npm install
```

2. Copy the example environment file:
```bash
cp .env.example .env
```

3. Configure your environment variables in `.env`

### Development

Start the development server:
```bash
npm run dev
```

Other available commands:
- `npm run build`: Build the application
- `npm run start`: Start the production server
- `npm run lint`: Run linting
- `npm test`: Run tests

### Production

Build and start for production:
```bash
npm run build
npm run start:prod
```

## Environment Variables

Key environment variables needed:
- `FRONTEND_URL`: Your frontend application URL
- Database configuration
- Authentication secrets
- Telegram bot token
- OpenAI API configuration

## API Documentation

The server exposes several API endpoints:
- REST endpoints for traditional HTTP requests
- tRPC endpoints for type-safe API calls
- Webhook endpoints for Telegram bot integration

## Testing

Run tests using:
- `npm test`: Unit tests
- `npm run test:e2e`: End-to-end tests
- `npm run test:cov`: Test coverage

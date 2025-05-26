# Treew Project Documentation

## Overview
Treew Project is a web application built with Angular that provides task management capabilities by integrating with the Trello API and ChatGPT for intelligent analysis.

## Core Features

### Authentication
- Trello OAuth integration via `TrelloAuthService`
- Token-based authentication flow
- Secure session management

### Board Management
- Create new boards
- View and edit board details
- Archive boards
- Multiple boards support

### List Management 
- Create, edit and archive lists within boards
- Drag & drop reordering via `updateListOrder`
- List progress tracking

### Card Management
- Create and edit cards with:
  - Title and description
  - Due dates
  - Labels/priority
  - Checklists
  - Members
- Card filtering and sorting
- Progress tracking via `getChecklistProgress`

### AI Analysis
- Board analysis using ChatGPT integration
- Workflow optimization suggestions
- Bottleneck identification
- WIP (Work in Progress) limit recommendations

## Technical Architecture

### Core Services

#### `TrelloAuthService`
Handles Trello API authentication and data operations:
- Board CRUD operations
- List management
- Card management
- Member management

#### `GlobalVariablesService`
Manages application state:
- Selected board/list/card tracking
- Change notifications
- State synchronization

#### `ToastService`
Provides notification system:
- Success/error/warning messages
- Customizable duration
- Position control

### Key Components

#### `DashboardComponent`
Main interface showing:
- Board overview
- List management
- Card organization

#### `ListComponent`
Handles individual list functionality:
- Card display
- Sorting options
- Progress tracking

#### `ModalComponent`
Reusable modal dialog for:
- Creating/editing items
- Confirmations
- Form displays

## Utilities

### `utils.ts`
Common utility functions:
- Card priority calculation
- Checklist progress tracking
- Activity monitoring
- Filtering capabilities

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
ng serve
```

3. Build for production:
```bash
ng build
```

4. Run tests:
```bash
ng test
```

## Testing
- Unit tests via Karma
- Component testing
- Service testing
- E2E testing configuration available

To run tests in watch mode:
```bash
ng test --watch
```

This will start Karma test runner in watch mode, automatically re-running tests when files change.

# Environment Configuration

The project uses Angular's environment configuration system to manage different settings across environments (development, production, etc).

## Environment Files

Environment files are located in the `src/environments/` directory. The main file structure is:

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  openaiKey: 'your-openai-api-key'
};
```

## Available Configurations

Current environment variables include:

- `production`: Boolean flag indicating if it's a production build
- `openaiKey`: API key for OpenAI services

## Setting Up Environment Variables

1. Create environment files for different environments:

```typescript
// environment.ts (development)
export const environment = {
  production: false,
  openaiKey: 'your-dev-key'
};

// environment.prod.ts (production)
export const environment = {
  production: true,
  openaiKey: 'your-prod-key'
};
```

2. Use environment variables in your components/services:

```typescript
import { environment } from '../environments/environment';

@Injectable()
export class MyService {
  constructor() {
    // Access environment variables
    const isProd = environment.production;
    const apiKey = environment.openaiKey;
  }
}
```

## Security Considerations

- Never commit sensitive API keys to version control
- Use `.gitignore` to exclude environment files containing sensitive data
- Consider using environment variables during deployment

## License
MIT License

Copyright (c) 2025 Treew Project

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

This documentation provides a high-level overview of the project structure and key functionality. For detailed API documentation, please refer to the individual component and service files.
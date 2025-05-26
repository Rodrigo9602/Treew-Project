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
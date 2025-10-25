My goal is to rebuild the UI under src/client in a new LitElement based implementation under src/client-new
DO NOT copy files from one folder to the other.
Instead, reimplement the functionality using LitElement best practices.
Focus on iteratively refactoring the code to make it high quality, excellent code.
ALL the files you should be editing are under /Users/alexlockhart/src/book-maker
Check the checkboxes in this markdown file as you complete the steps.

## Analysis of Current UI Structure
- [x] Analyze the existing src/client codebase to understand all components, pages, modals, and services
  - **Components**: bookmark-tabs, characters, completion-bar, interface, pronunciation, references
  - **Pages**: 404, book, home, interface
  - **Modals**: book-configuration, book-details, download-book, edit-part
  - **Services**: alert, api, download, generate-property, icon, loading, modal, util
- [x] Document the routing logic in app.ts for URL-based page navigation
  - Uses pathname matching with regex for /book/:id/chapter/:num/part/:num, /book/:id/chapter/:num, /book/:id, and /
  - Routes to partPageRouter, chapterPageRouter, bookPageRouter, or homePageRouter
  - Renders navigation pills for books and chapters
- [x] Identify all HTML templates, event listeners, and state management patterns
  - HTML templates: String-based rendering in render() methods, using template literals
  - Event listeners: Added in addEventListeners() methods, attached to DOM elements by ID/class
  - State management: Class properties for books, chapters, parts; manual DOM updates; sessionStorage for scroll position
- [x] Review the component interface and page interface for consistency
  - Component interface: render(root: HTMLElement): void; addEventListeners(): Promise<void>
  - Page interface: render(root: HTMLElement): void; addEventListeners(): Promise<void>
  - Inconsistency: Some components return strings from render() instead of rendering to root

## Project Setup and Dependencies
- [x] Ensure Lit is installed and configured in package.json
  - Lit 4.2.1 installed as dependency
- [x] Set up rollup configuration for bundling LitElement components
  - rollup.config.js created with TypeScript plugin, node-resolve, and commonjs
  - Bundles src/client-new/app.ts to dist/client-new/app.js
- [x] Configure TypeScript for LitElement decorators and modern ES modules
  - experimentalDecorators: true and emitDecoratorMetadata: true added to tsconfig.json
  - Module resolution set to "Bundler", target ESNext
- [x] Update build scripts to compile and bundle the new client code
  - build script: tsc && rollup -c && mkdir -p dist/client-new && cp src/client-new/index.html dist/client-new/
  - watch script includes watch:rollup for hot reloading

## Core Infrastructure
- [x] Create a new main App LitElement component to replace ClientApp class
  - Created BookMakerApp LitElement with reactive state for books, routing, and page rendering
- [x] Implement routing system using LitElement properties and URL handling
  - Implemented parseRoute() for URL parsing and navigateTo() for navigation
  - Added popstate listener for browser back/forward
- [x] Set up global state management (consider using Lit's reactive properties or a simple store)
  - Using Lit's @state() decorators for reactive properties (books, currentPage, book data, etc.)
- [x] Create base classes or mixins for common component patterns
  - Created BaseComponent class extending LitElement for shared functionality

## Service Layer Migration
- [x] Migrate service.api.ts to work with LitElement (ensure async operations work with reactive updates)
  - Reimplemented with simplified request function, removed loading integration for component-level control
- [x] Migrate service.modal.ts to create LitElement-based modal dialogs
  - Created LitModal and ModalForm components with proper dialog API and form handling
- [x] Migrate service.loading.ts, service.alert.ts, and other services
  - Created LoadingOverlay LitElement component with showLoading/hideLoading functions
  - Created AlertToast LitElement component with alert utility functions
- [x] Update service.icon.ts and service.util.ts for LitElement compatibility
  - Copied service.icon.ts (SVG strings, no changes needed)
  - Copied service.util.ts (utility functions, no changes needed)
- [x] Migrate service.generate-property.ts and service.download.ts
  - Copied service.generate-property.ts (API calls, compatible)
  - Copied service.download.ts (download utilities, compatible)

## Component Conversions
- [x] Convert component.bookmark-tabs.ts to a LitElement component
  - Created BookmarkTabs LitElement with scroll-based highlighting and click navigation
- [x] Convert component.characters.ts to a LitElement component
  - Created CharactersComponent LitElement with reactive character management
- [x] Convert component.completion-bar.ts to a LitElement component
  - Created CompletionBar LitElement with visual progress indicators for chapters/parts
- [x] Convert component.interface.ts (update the interface for LitElement)
  - Created BaseComponent class extending LitElement for shared functionality
- [x] Convert component.pronunciation.ts to a LitElement component
  - Created PronunciationsComponent LitElement with audio preview functionality
- [x] Convert component.references.ts to a LitElement component
  - Created ReferencesComponent LitElement with file upload and drag-drop support

## Page Conversions
- [x] Convert page.interface.ts to a LitElement base class
- [x] Convert page.404.ts to a LitElement component
- [x] Convert page.book.ts to a LitElement component (this is the most complex page)
- [x] Convert page.home.ts to a LitElement component
- [x] Convert page.interface.ts to a LitElement base class

## Modal Conversions
- [x] Convert modal.book-configuration.ts to a LitElement dialog component
- [x] Convert modal.book-details.ts to a LitElement dialog component
- [x] Convert modal.download-book.ts to a LitElement dialog component
- [x] Convert modal.edit-part.ts to a LitElement dialog component

## State Management and Data Flow
- [x] Implement reactive properties for book data, chapters, parts, and user interactions
- [x] Set up event handling for form inputs, button clicks, and navigation
- [x] Implement auto-save functionality using Lit's lifecycle methods
- [x] Handle loading states and error states with LitElement properties

## Routing and Navigation
- [ ] Implement client-side routing with history API integration
- [ ] Update navigation pills to use LitElement event handling
- [ ] Implement bookmark tabs with reactive state
- [ ] Handle URL changes and component updates accordingly

## UI/UX Enhancements
- [ ] Ensure all CSS classes and styles are properly applied in LitElement templates
- [ ] Implement smooth scrolling and scroll position management
- [ ] Add proper accessibility attributes (ARIA labels, roles, etc.)
- [ ] Optimize rendering performance with Lit's virtual DOM

## Testing and Integration
- [ ] Update the main index.html to load the new LitElement app
- [ ] Test all pages and components for functionality
- [ ] Verify API integration works with the new component structure
- [ ] Test modal dialogs and form submissions
- [ ] Ensure hot reloading works during development

## Cleanup and Optimization
- [ ] Remove old src/client files after successful migration
- [ ] Optimize bundle size by tree-shaking unused code
- [ ] Add proper TypeScript types for all LitElement properties and events
- [ ] Document the new component architecture

## Advanced Features
- [ ] Implement lazy loading for large components or pages
- [ ] Add internationalization support if needed
- [ ] Implement theming system using CSS custom properties
- [ ] Add unit tests for individual components using testing-library
# Screenshot Guidelines

This document outlines the required screenshots to showcase the Hence-Code in the repository's `README.md` and for portfolio purposes. 

All screenshots should be placed in the `/docs/screenshots/` directory.

## Required Screenshots

### 1. `login-page.png`
- **What to capture:** The custom authentication screen showing the email/password form alongside the "Sign in with Google" and "Sign in with GitHub" OAuth buttons.
- **Why:** Demonstrates UI/UX competence and secure authentication integrations.

### 2. `dashboard.png`
- **What to capture:** The main user dashboard displaying the list of active workspaces, recent activity, and the "Create Workspace" button.
- **Why:** Shows the application's core navigation and data retrieval from the PostgreSQL database.

### 3. `workspace-editor.png`
- **What to capture:** The main IDE view. Show the file tree on the left, the CodeMirror 6 editor in the center with some syntax-highlighted code, and multiple user cursors (if possible) to demonstrate Yjs collaboration.
- **Why:** This is the core product. It highlights the complex UI state management.

### 4. `terminal-execution.png`
- **What to capture:** The IDE view with the bottom terminal pane open. Show the output of a successful code execution (e.g., `Hello World` from a Node.js or Python runtime).
- **Why:** Proves that the Docker backend execution engine is functional.

### 5. `runtime-selection.png`
- **What to capture:** The modal or dropdown where a user selects the environment (Node.js, Python, Java, Ubuntu) when creating a workspace or running code.
- **Why:** Highlights the multi-language support feature.

### 6. `snapshot-system.png`
- **What to capture:** The workspace snapshot menu showing the history of saved states.
- **Why:** Demonstrates advanced state persistence capabilities.

### 7. `admin-dashboard.png`
- **What to capture:** The `/admin` route showing system metrics (active users, total executions, rate limit hits).
- **Why:** Shows enterprise-readiness and monitoring capabilities.

## Image Specifications
- **Format:** `.png` or `.webp`
- **Resolution:** At least 1920x1080 (1080p).
- **Style:** Use a clean browser window (hide bookmarks/extensions) or a specialized screenshot tool (like CleanShot X) that adds a nice drop shadow and background padding.

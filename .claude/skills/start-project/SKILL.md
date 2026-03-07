---
name: start-project
description: Starts the dozu-ui-service project locally. Use this skill when you need to run the application for development, testing, or user verification.
---

# Start out dozu-ui-service locally

The `dozu-ui-service` is a Next.js application. Follow these instructions to start the development server.

## 1. Start the Next.js Dev Server

Use the `run_command` tool to execute the dev script in the root directory (`d:\product\dozu\dozu-ui-service`).

```bash
npm run dev
```

*   **Note:** Use a long-running process approach (e.g., `WaitMsBeforeAsync: 2000`) since this command will not exit. 
*   After the command goes into the background, use `command_status` to wait for the server to be ready. You should look for output similar to `Ready in Xms` or `Local: http://localhost:3000`.

## 2. Access the Application

Once the server has started successfully, you can access the application locally at:
`http://localhost:3000`

If you are asked to test or verify the application visually, you can use the `browser_subagent` tool to navigate to this URL and capture a screenshot or extract information.

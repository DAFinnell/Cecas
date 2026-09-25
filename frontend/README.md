# CECAS Frontend

This folder contains the React and TypeScript app used by students and program chairs.

For first-time setup of the complete project, follow [Run CECAS Locally](../README.md#run-cecas-locally) in the main README.

## Start the app

From the repository root, after creating `.env` as described in the main README:

```bash
docker compose up --build -d
```

Open [http://localhost:5173](http://localhost:5173). The [local demo](http://localhost:5173/demo) is available there too.

The Vite development server sends `/api` requests to the `backend` service in Docker Compose. Running `npm run dev` directly on your computer will not find that Docker service name without changing the proxy setup.

For formatting, lint, test, and build commands, see [Testing](../README.md#testing) in the main README.

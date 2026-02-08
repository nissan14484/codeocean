# CodeOcean FE Challenge

React + TypeScript app for the FE challenge. It renders a virtualized, lazy-loaded table and supports search by name or email.

## Stack

- React + TypeScript
- Vite
- Ant Design (dark theme)
- Virtualized table with lazy loading

## Prerequisites

- Node 20.19.0
- npm

## Mock Server (json-server)

This project expects the mock API from `fechallenge` to be running on port `3001`.

### Required json-server version

The mock repo uses `json-server@1.0.0-beta.3`, but filtering behaves inconsistently. Downgrade to the stable version:

```bash
npm install json-server@0.17.4
npm start
```

## Run the App

```bash
npm install
npm run dev
```

The app expects:

- `http://localhost:3001/users`
- `http://localhost:3001/reviewers`

## Search

Search is handled by sending `q` to the server and then applying a local filter to ensure matches are in:

- `firstName`
- `lastName`
- `email`

## Tests

```bash
npm run test
```

CI-style run:

```bash
npm run test:ci
```

## Notes

- Lazy loading fetches in pages of 100 rows.
- Search input is debounced to avoid excessive calls.

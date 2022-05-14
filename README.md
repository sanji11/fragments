# Fragments Microservice

A highly scalable service for working with fragments of text and images. A fragment can be any piece of text (e.g., `text/plain`, `text/markdown`, `text/html`, etc.), JSON data (`application/json`), or an image in any formats (`image/png`, `image/jpeg`, `image/webp`, `image/gif`, etc.)

# How to run

## Lint

To run eslint and make sure there are no errors that need to be fixed:

```sh
npm run lint
```

## Start

To start script runs the server normally:

```sh
npm start
```

## Dev

To run the server via nodemon, which watches the src/\*\* folder for any changes, restarting the server whenever something is updated:

```sh
npm run dev
```

## Debug

To run the server via nodemon, which watches the src/\*\* folder for any changes, restarting the server whenever something is updated (same as `dev`) and also starts the node inspector on port `9229`, so that you can attach a debugger (e.g., VSCode):

```sh
npm run debug
```

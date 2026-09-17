# Productivity API

A simple REST API built with Node.js using the built-in `http` module.

The API manages three independent resources:

- Notes
- Tasks
- Contacts

## How to Run

Make sure Node.js is installed.

Run the server with:

```bash
node server.js
```

The server will start on:

```text
http://localhost:4001
```

You can test the API using Postman.

## Structure

The three resources are handled using the same generic CRUD logic.

The `resources` object stores the data for each resource, its required fields, and its default values.

For example:

- Notes require `title` and `content`.
- Tasks require `title` and have `completed: false` by default.
- Contacts require `name` and `email`, and have `phone: null` by default.

The server gets the resource name from the URL, such as `/notes`, `/tasks`, or `/contacts`, and then uses the same handlers for GET, POST, PUT, and DELETE.

This keeps the code shorter and avoids repeating the same CRUD logic three times.

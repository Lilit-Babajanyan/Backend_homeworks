const http = require("node:http");

const PORT = 4001;

const resources = {
  notes: {
    items: [],
    nextId: 1,
    required: ["title", "content"],
  },

  tasks: {
    items: [],
    nextId: 1,
    required: ["title"],
    defaultValues: {
      completed: false,
    },
  },

  contacts: {
    items: [],
    nextId: 1,
    required: ["name", "email"],
    defaultValues: {
      phone: null,
    },
  },
};

function bodyHelper(req, callback) {
  let body = "";

  req.on("data", (chunk) => {
    body += chunk.toString();
  });

  req.on("end", () => {
    callback(body);
  });
}

function sendJSON(res, statusCode, data) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(data));
}

function createItem(resource, data) {
  const item = {
    id: resource.nextId,
  };

  for (const field of resource.required) {
    item[field] = data[field];
  }

  if (resource.defaultValues) {
    for (const field in resource.defaultValues) {
      if (data[field] === undefined) {
        item[field] = resource.defaultValues[field];
      } else {
        item[field] = data[field];
      }
    }
  }

  resource.items.push(item);
  resource.nextId++;

  return item;
}

function findItem(resource, id) {
  return resource.items.find((item) => item.id === id);
}

const server = http.createServer((req, res) => {
  console.log(req.method, req.url);

  try {
    const parts = req.url.split("/");
    const resourceName = parts[1];
    const id = parts[2];

    const resource = resources[resourceName];

    if (!resource) {
      sendJSON(res, 404, {
        error: "Route not found",
      });

      return;
    }

    if (req.method === "GET" && !id) {
      sendJSON(res, 200, resource.items);

      return;
    }

    if (req.method === "POST" && !id) {
      bodyHelper(req, (body) => {
        let data;

        try {
          data = JSON.parse(body);
        } catch (error) {
          sendJSON(res, 400, {
            error: "Invalid JSON",
          });

          return;
        }

        for (const field of resource.required) {
          if (!data[field]) {
            sendJSON(res, 400, {
              error: `${field} is required`,
            });

            return;
          }
        }

        const item = createItem(resource, data);

        sendJSON(res, 201, item);
      });

      return;
    }

    if (req.method === "GET" && id) {
      const itemId = Number(id);
      const item = findItem(resource, itemId);

      if (!item) {
        sendJSON(res, 404, {
          error: `Item ${id} not found`,
        });

        return;
      }

      sendJSON(res, 200, item);

      return;
    }

    if (req.method === "PUT" && id) {
      const itemId = Number(id);
      const item = findItem(resource, itemId);

      if (!item) {
        sendJSON(res, 404, {
          error: `Item ${id} not found`,
        });

        return;
      }

      bodyHelper(req, (body) => {
        let data;

        try {
          data = JSON.parse(body);
        } catch (error) {
          sendJSON(res, 400, {
            error: "Invalid JSON",
          });

          return;
        }

        for (const field of resource.required) {
          if (data[field] !== undefined) {
            item[field] = data[field];
          }
        }

        if (resource.defaultValues) {
          for (const field in resource.defaultValues) {
            if (data[field] !== undefined) {
              item[field] = data[field];
            }
          }
        }

        sendJSON(res, 200, item);
      });

      return;
    }

    if (req.method === "DELETE" && id) {
      const itemId = Number(id);

      const index = resource.items.findIndex((item) => item.id === itemId);

      if (index === -1) {
        sendJSON(res, 404, {
          error: `Item ${id} not found`,
        });

        return;
      }

      resource.items.splice(index, 1);

      sendJSON(res, 200, {
        deleted: itemId,
      });

      return;
    }

    sendJSON(res, 405, {
      error: "Method not allowed",
    });
  } catch (error) {
    sendJSON(res, 500, {
      error: "Internal server error",
    });
  }
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

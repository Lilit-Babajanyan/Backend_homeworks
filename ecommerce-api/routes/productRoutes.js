const express = require("express");
const { readData, writeData } = require("../utils/fileDB");
const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");

const productsRouter = express.Router();

productsRouter.get("/", (req, res) => {
  let products = readData("products.json");

  const { category, sort } = req.query;

  if (category) {
    products = products.filter((product) => {
      return product.category === category;
    });
  }

  if (sort === "price") {
    products = products.sort((a, b) => {
      return a.price - b.price;
    });
  }

  res.json(products);
});

productsRouter.get("/:id", (req, res) => {
  const products = readData("products.json");

  const productId = Number(req.params.id);

  const product = products.find((product) => {
    return product.id === productId;
  });

  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }

  res.json(product);
});

productsRouter.post("/", authenticate, authorize("admin"), (req, res) => {
  const { name, price, category, stock } = req.body;

  if (!name || price === undefined) {
    return res.status(400).json({ error: "Name and price are required" });
  }

  if (
    !Number.isFinite(price) ||
    price < 0 ||
    (stock !== undefined && (stock < 0 || !Number.isInteger(stock)))
  ) {
    return res
      .status(400)
      .json({ error: "Price and stock should be valid numbers" });
  }

  const products = readData("products.json");

  const productIds = products.map((product) => {
    return product.id;
  });

  const newProduct = {
    id: products.length ? Math.max(...productIds) + 1 : 1,
    name: name,
    price: price,
    category: category || "other",
    stock: stock ?? 0,
  };

  products.push(newProduct);

  writeData("products.json", products);

  res.status(201).json(newProduct);
});

productsRouter.put("/:id", authenticate, authorize("admin"), (req, res) => {
  const { name, price, category, stock } = req.body;

  if (
    name === undefined ||
    price === undefined ||
    category === undefined ||
    stock === undefined
  ) {
    return res.status(400).json({ error: "All fields are required" });
  }

  if (
    !Number.isFinite(price) ||
    price < 0 ||
    !Number.isInteger(stock) ||
    stock < 0
  ) {
    return res
      .status(400)
      .json({ error: "Price and stock should be valid numbers" });
  }

  const products = readData("products.json");

  const productId = Number(req.params.id);

  const product = products.find((product) => {
    return product.id === productId;
  });

  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }

  product.name = name;
  product.price = price;
  product.category = category;
  product.stock = stock;

  writeData("products.json", products);

  res.json(product);
});

productsRouter.delete("/:id", authenticate, authorize("admin"), (req, res) => {
  const productId = Number(req.params.id);

  const products = readData("products.json");

  const index = products.findIndex((product) => {
    return product.id === productId;
  });

  if (index === -1) {
    return res.status(404).json({ error: "Product not found" });
  }

  products.splice(index, 1);

  writeData("products.json", products);

  res.status(204).end();
});

module.exports = productsRouter;

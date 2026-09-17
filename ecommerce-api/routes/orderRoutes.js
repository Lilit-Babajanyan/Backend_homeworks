const express = require("express");
const { readData, writeData } = require("../utils/fileDB");
const authenticate = require("../middleware/authenticate");

const ordersRouter = express.Router();

ordersRouter.post("/", authenticate, async (req, res) => {
  const { items } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Items are required" });
  }

  const products = readData("products.json");
  const orders = readData("orders.json");

  let total = 0;
  const orderItems = [];

  for (const item of items) {
    const productId = Number(item.productId);
    const product = products.find((p) => p.id === productId);

    if (!product) {
      return res.status(400).json({ error: "Product not found" });
    }

    if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
      return res.status(400).json({ error: "Invalid quantity" });
    }

    if (product.stock < item.quantity) {
      return res.status(400).json({ error: "Not enough stock" });
    }

    total += product.price * item.quantity;

    orderItems.push({
      productId: product.id,
      quantity: item.quantity,
    });
  }

  for (const item of items) {
    const productId = Number(item.productId);
    const product = products.find((p) => p.id === productId);

    product.stock -= item.quantity;
  }

  const orderIds = orders.map((order) => order.id);

  const newOrder = {
    id: orders.length ? Math.max(...orderIds) + 1 : 1,
    userId: req.user.id,
    items: orderItems,
    total,
    createdAt: new Date().toISOString(),
  };

  orders.push(newOrder);

  writeData("products.json", products);
  writeData("orders.json", orders);

  res.status(201).json(newOrder);
});

ordersRouter.get("/", authenticate, async (req, res) => {
  const orders = readData("orders.json");

  const userOrders = orders.filter((order) => {
    return order.userId === req.user.id;
  });

  res.json(userOrders);
});

ordersRouter.get("/:id", authenticate, async (req, res) => {
  const orders = readData("orders.json");

  const orderId = Number(req.params.id);

  const order = orders.find((order) => order.id === orderId);

  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }

  if (order.userId !== req.user.id && req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied" });
  }

  res.json(order);
});

module.exports = ordersRouter;

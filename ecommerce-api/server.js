require('dotenv').config();
const express = require("express");

const authRoutes = require("./routes/authRoutes");
const productsRouter = require("./routes/productRoutes");
const ordersRouter = require("./routes/orderRoutes");

const app = express();

const PORT = 4000;

app.use(express.json());

app.use("/auth", authRoutes);
app.use("/products", productsRouter);
app.use("/orders", ordersRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

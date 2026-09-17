const express = require("express");
const { readData, writeData } = require("../utils/fileDB");
const bcrypt = require("bcryptjs");
const router = express.Router();
const jwt = require("jsonwebtoken");

const SECRET = process.env.SECRET;
router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username and password are required" });
  }

  const users = readData("users.json");

  const existingUser = users.find((user) => {
    return user.username === username;
  });

  if (existingUser) {
    return res.status(409).json({ error: "Username already exists" });
  }

  const userIds = users.map((user) => {
    return user.id;
  });

  const newUser = {
    id: users.length ? Math.max(...userIds) + 1 : 1,
    username: username,
    passwordHash: await bcrypt.hash(password, 10),
    role: "customer",
  };

  users.push(newUser);

  writeData("users.json", users);

  res.status(201).json({
    id: newUser.id,
    username: newUser.username,
    role: newUser.role,
  });
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username and password are required" });
  }

  const users = readData("users.json");

  const user = users.find((user) => {
    return user.username === username;
  });

  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const passwordCorrect = await bcrypt.compare(password, user.passwordHash);

  if (!passwordCorrect) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role,
    },
    SECRET,
    {
      expiresIn: "1h",
    },
  );

  res.json({
    token: token,
  });
});

module.exports = router;

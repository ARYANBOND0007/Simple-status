require("dotenv").config();

const express = require("express");
const path = require("path");
const session = require("express-session");

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));


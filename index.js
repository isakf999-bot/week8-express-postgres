import express from "express";
import { pool } from "./db.js";

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome to the library!");
});

app.get("/books", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM books");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/books/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ message: "Id must be a number" });
  }

  try {
    const result = await pool.query("SELECT * FROM books WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Book not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/books", async (req, res) => {
  const { title, genre, published_year } = req.body;
  if (!title) {
    return res.status(400).json({ message: "Title is required" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO books (title, genre, published_year) VALUES ($1, $2, $3) RETURNING *",
      [title, genre, published_year]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put("/books/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { title, genre, published_year } = req.body;
  if (!Number.isInteger(id)) {
    return res.status(400).json({ message: "Id must be a number" });
  }
  if (!title) {
    return res.status(400).json({ message: "Title is required" });
  }

  try {
    const result = await pool.query(
      "UPDATE books SET title = $1, genre = $2, published_year = $3 WHERE id = $4 RETURNING *",
      [title, genre, published_year, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Book not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.delete("/books/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ message: "Id must be a number" });
  }

  try {
    const result = await pool.query("DELETE FROM books WHERE id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Book not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.listen(process.env.PORT, () => {
  console.log("Server running on port " + process.env.PORT);
});

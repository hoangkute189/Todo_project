const express = require("express");

const app = express();

require("dotenv").config();

app.use(express.json());

const connectDB = require("./connectMongo");

connectDB();

const TodoModel = require("./models/todo.model");
const redis = require('./redis')

const deleteKeys = async (pattern) => {
  const keys = await redis.keys(`${pattern}::*`)
  console.log(keys)
  if (keys.length > 0) {
    redis.del(keys)
  }
}

app.get("/api/v1/todos", async (req, res) => {
  const { limit = 5, orderBy = "todo", sortBy = "asc", todo, completed } = req.query;
  let page = +req.query?.page;

  if (!page || page <= 0) page = 1;

  const skip = (page - 1) * +limit;

  const query = {};

  if (todo) query.todo = { $regex: todo, $options: "i" };
  if (completed) query.completed = completed; 

  const key = `Todo::${JSON.stringify({query, page, limit, orderBy, sortBy})}`
  let response = null
  try {
    const cache = await redis.get(key)
    if (cache) {
      response = JSON.parse(cache)
    } else {
      const data = await TodoModel.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ [orderBy]: sortBy });
      const totalItems = await TodoModel.countDocuments(query);

      response = {
        msg: "Ok",
        data,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        limit: +limit,
        currentPage: page,
      }

      redis.setex(key, 600, JSON.stringify(response))
    }

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      msg: error.message,
    });
  }
});

app.get("/api/v1/todos/:id", async (req, res) => {
  try {
    const data = await TodoModel.findById(req.params.id);

    if (data) {
      return res.status(200).json({
        msg: "Ok",
        data,
      });
    }

    return res.status(404).json({
      msg: "Not Found",
    });
  } catch (error) {
    return res.status(500).json({
      msg: error.message,
    });
  }
});

app.post("/api/v1/todos", async (req, res) => {
  try {
    const { todo, completed, userId } = req.body;
    const newTodo = new TodoModel({
      todo,
      completed,
      userId
    });
    const data = await newTodo.save();
    deleteKeys('Todo')
    return res.status(200).json({
      msg: "Ok",
      data,
    });
  } catch (error) {
    return res.status(500).json({
      msg: error.message,
    });
  }
});

app.put("/api/v1/todos/:id", async (req, res) => {
  try {
    const { todo, completed } = req.body;
    const { id } = req.params;

    const data = await TodoModel.findByIdAndUpdate(
      id,
      {
        todo,
        completed
      },
      { new: true }
    );
    deleteKeys('Todo')
    return res.status(200).json({
      msg: "Ok",
      data,
    });
  } catch (error) {
    return res.status(500).json({
      msg: error.message,
    });
  }
});

app.delete("/api/v1/todos/:id", async (req, res) => {
  try {
    await TodoModel.findByIdAndDelete(req.params.id);
    deleteKeys('Todo')
    return res.status(200).json({
      msg: "Ok",
    });
  } catch (error) {
    return res.status(500).json({
      msg: error.message,
    });
  }
});

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log("Server is running on port " + PORT);
});

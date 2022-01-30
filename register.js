const express = require("express");
const { open } = require("sqlite");
const path = require("path");
const sqlite3 = require("sqlite3");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
//const format = require("date-fns/format");
let db;
const app = express();
app.use(express.json());
app.use(cors());
const initializeDBandServer = async () => {
  try {
    db = await open({
      filename: path.join(__dirname, "register.db"),
      driver: sqlite3.Database,
    });
    console.log(process.env.PORT);
    app.listen(process.env.PORT || 9254, () => {
      console.log("Server is running on http://localhost:9254");
    });
  } catch (error) {
    console.log("database error");
    process.exit(1);
  }
};

initializeDBandServer();

//API

app.post("/users/", async (request, response) => {
  const { username, name, password, gender, location } = request.body;
  const hashedPassword = await bcrypt.hash(request.body.password, 10);
  const selectUserQuery = `SELECT * FROM users WHERE username = '${username}'`;
  const dbUser = await db.get(selectUserQuery);
  if (dbUser === undefined) {
    const createUserQuery = `
      INSERT INTO 
        users (username, name, password, gender, location) 
      VALUES 
        (
          '${username}', 
          '${name}',
          '${hashedPassword}', 
          '${gender}',
          '${location}'
        )`;
    const dbResponse = await db.run(createUserQuery);
    const newUserId = dbResponse.lastID;
    response.send(`Created new user with ${newUserId}`);
  } else {
    response.status = 400;
    response.send("User already exists");
  }
});

//API 2
app.get("/user/", async (request, response) => {
  const getBooksQuery = `
    SELECT
      *
    FROM
      users
    ORDER BY
      name;`;
  const booksArray = await db.all(getBooksQuery);
  response.send(booksArray);
});
module.exports = app;

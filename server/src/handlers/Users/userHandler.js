const sqlQuery = require("../../database/my_sql_query");
const dbConnection = require("../../database/db_connection");
const jwt = require("jsonwebtoken");
const USER_ATTRIBUTE = require("./userAttribute");
const auth = require("../../middlewares/authentication/authentication");
const bcrypt = require("bcrypt");
const saltRounds = 10;
module.exports = {
  register: async (req, res) => {
    const { userName, password } = req.body;
    try {
      let connection = await dbConnection();
      let getUserNameQuery = `SELECT userName FROM users WHERE userName = ? `;
      let getUserName = await sqlQuery(connection, getUserNameQuery, [
        userName,
      ]);
      let hashedPassword = await bcrypt.hashSync(password, 10);

      if (getUserName.length !== 0) {
        console.log(getUserName);
        connection.end();
        res.json({
          message: "Username has already existed!!!",
        });
      } else {
        let registerQuery = `INSERT INTO users (${USER_ATTRIBUTE.userName},${USER_ATTRIBUTE.password}) 
                      VALUES (?, ?)`;
        let createUser = sqlQuery(connection, registerQuery, [
          userName,
          hashedPassword,
        ]);
        connection.end();
        res.json({
          message: "Register Successfully",
        });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: error,
      });
    }
  },
  login: async (req, res) => {
    const { userName, password } = req.body;
    const token = auth.generateAccessToken(userName);
    try {
      const connection = await dbConnection();
      const getUserNameQuery = `SELECT userName FROM users WHERE userName = ?`;
      let getUserName = await sqlQuery(connection, getUserNameQuery, [
        userName,
      ]);
      let getPasswordQuery = `SELECT password FROM users WHERE password = ?`;
      let getPassword = await sqlQuery(connection, getPasswordQuery, [
        password,
      ]);
      if (getUserName.length === 0 && getPassword.length === 0) {
        connection.end();
        res.json({
          message: "Invalid Username or Password",
        });
      } else {
        connection.end();
        res.json({
          message: "Login Successfully",
          token,
        });
      }
    } catch (err) {
      console.log(err);
      res.status(500).json({
        message: error,
      });
    }
  },
};

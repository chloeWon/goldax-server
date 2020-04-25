const express = require('express');
const mysql = require('mysql2/promise');
const {dbConfig} = require('../config/dbConfig');

const router = express.Router();

const pool = mysql.createPool(dbConfig);

router.post('/join', async (req, res, next) => {
  const email = req.body.email;
  const pw = req.body.pw;
  const nickname = req.body.nickname;
  const studentNum = req.body.studentNum;

  const NICKNAME_CHECK_QUERY = 'SELECT nickname FROM Users WHERE nickname = ?';
  const EMAIL_CHECK_QUERY = 'SELECT email FROM Users WHERE email = ?';
  const USER_JOIN_QUERY = 'INSERT INTO Users (email, pw, nickname, studentNum) VALUES (?, ?, ?, ?)';

  let connection
  try {
    connection = await pool.getConnection(async (conn) => conn);
    const [nicknames] = await connection.query(NICKNAME_CHECK_QUERY, nickname);
    if (nicknames.length >= 1) {
      return res.status(400).json({message: "DUPLICATED_NICKNAME"})
    }

    const [emails] = await connection.query(EMAIL_CHECK_QUERY, email);
    if (emails.length >= 1) {
      return res.status(400).json({message: "DUPLICATED_EMAIL"})
    }

    await connection.query(USER_JOIN_QUERY, [email, pw, nickname, studentNum]);
    connection.release();

  } catch (e) {
    console.log(e)
    connection.release();
    return res.status(500).json({message: "JOIN ERROR"})
  }
  return res.status(200).json({message: "JOIN SUCCESS"});
})

module.exports = router;

const db = require("../config/db");

exports.saveToken = (userId, token) => {

  const userId = req.user.userid
  console.log(userId,token);
  
  const sql = "UPDATE users SET fcm_token=? WHERE id=?";

  db.query(sql, [token, userId], (err, result) => {
    if (err) {
      console.log(err);
    }
  });

};
var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit : 10,
  host            : 'classmysql.engr.oregonstate.edu',
  user            : 'cs361_elliochr',
  password        : 'group20',
  database        : 'cs361_elliochr',
  insecureAuth    : true
});

module.exports.pool = pool;

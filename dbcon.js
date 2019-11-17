var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit : 10,
  host            : '',
  user            : '',
  password        : '',
  database        : 'STMA',
  insecureAuth    : true
});

module.exports.pool = pool;

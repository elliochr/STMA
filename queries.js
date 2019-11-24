module.exports = {

    // login authentication queries: comes from login route
    getUser: function(res, mysql, password, userLoggedIn) {
        // find matching password query
        let sql = `SELECT idpersonnel AS id, position, first_name, last_name FROM personnel WHERE password = ?`;
        let insert = [password];

        mysql.pool.query(sql, insert, function(err, results, fields){
            if (err) {
                console.log(err);
                return;
            }
    console.log(results);
            if(results[0]){                                         // user was found
                // find position's access permissions query
                let sql = `SELECT permissions FROM positions WHERE idpositions = ?`;
                let insert = [results[0].position]

                mysql.pool.query(sql, insert, function(err, res, f){
                    if(err){
                        console.log(err);
                        return;
                    }
                    userLoggedIn(results[0], res[0].permissions);   // run provided callback function
                })
            }
            else{
                userLoggedIn(null,null);                            // no user found
            }
        })
    }

}
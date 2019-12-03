module.exports = {
    // list staffing positions
    getPosistions: function (res, mysql, listPositions) {
        let sql = `SELECT idpositions AS id, position_title AS title FROM positions`;
        mysql.pool.query(sql, function(err, results, fields){
            if(err){
                console.log(err);
                return;
            }
            listPositions(results);
        })
    },

    // login authentication queries: comes from login route
    getUser: function(res, mysql, password, userLoggedIn) {
        // find matching password query
        let sql = `SELECT idpersonnel AS id, position, first_name, last_name, pto_available, sto_available FROM personnel WHERE password = ?`;
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
    },

    // gets user schedule by user id
    getUserSchedule: function(res, mysql, context, complete) {
        var sql = "SELECT start_time, end_time FROM daily_schedule WHERE idpersonnel = ?";
        var inserts = [context.userId];

        mysql.pool.query(sql, inserts, function(err, results, fields){
            if(err){
                console.log(err);
                res.end();
            }
            if (results[0]){
                context.schedule = results;
                complete();
            }
        });
    }



}

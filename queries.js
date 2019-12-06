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
        // customized format to be sent to the schedule view        
        function formatTime(date) {
            var hours = date.getHours();
            var minutes = date.getMinutes();
            var meridiem = hours >= 12 ? 'PM' : 'AM';
        
            hours %= 12;
            hours = hours ? hours : 12;
            minutes = minutes < 10 ? '0'+minutes : minutes;
            
            return hours + ':' + minutes + ' ' + meridiem;
        }

        // currentDate will filter only the current on-going schedule.
        var currentDate = new Date().toISOString().slice(0,19).replace('T', ' ');
        var sql = "SELECT start_time, end_time FROM daily_schedule WHERE idpersonnel = ? AND start_time >= \'" + currentDate + "\'";
        var inserts = [context.userId];

        mysql.pool.query(sql, inserts, function(err, results, fields){
            if(err){
                console.log(`error: ${err}`);
                res.end();
            }
            if (results[0]){
                // reformat each date, start time, and end time so the view can work with the parts.
                results.forEach(e => {
                    e["date"] = e.start_time.toDateString();    // add date as key:value
                    e.start_time = formatTime(e.start_time)     // just time
                    e.end_time = formatTime(e.end_time)         // just time
                });
                console.log(results)
                context.schedule = results;
            }
            complete();
        });
    },

    getStaffList: function(res, mysql, complete){
        let sql = `SELECT per.idpersonnel AS id, per.first_name AS fName, per.last_name AS lName, pos.position_title AS position FROM personnel per INNER JOIN positions pos on per.position = pos.idpositions WHERE per.position > 1 GROUP BY per.idpersonnel ASC`;
        mysql.pool.query(sql, function(err, results, fields){
            if(err){
                console.log(`error: ${err}`);
                res.end();
            }
            complete(results);
        });
    },

    writeSchedDate: function(res, mysql, schedule, complete){
        console.log([schedule]);
        let sql = `INSERT INTO daily_schedule (idpersonnel, start_time, end_time) VALUES ?`;
        mysql.pool.query(sql, [schedule], function(err, result){
            if(err){
                console.log(JSON.stringify(err));
                res.write(JSON.stringify(err));
                res.end();
            }
            else{
                console.log(result.affectedRows);
                complete(result);
            }
        });
    }

    }
}

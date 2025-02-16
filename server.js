let http = require('http');
let db = require('mysql2');
let url = require('url');
let messages = require('./messages');


let connectionString = "mysql://doadmin:AVNS_9SRi_k8cAXyPWn39Gp7@db-mysql-tor1-19416-do-user-18794098-0.d.db.ondigitalocean.com:25060/defaultdb?ssl-mode=REQUIRED";
let con = db.createConnection(connectionString);

con.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
});

con.query("CREATE DATABASE IF NOT EXISTS Clinic", function (err, result) {
    if (err) throw err;
    console.log("Database created");
    con.query("USE Clinic", function (err, result) {
        con.query("CREATE TABLE IF NOT EXISTS Patients (patientID INT(11) AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100), dateOfBirth DATETIME,created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)ENGINE=InnoDB", function (err, result) {
            if (err) throw err;
            console.log("Table created");
        });
    });
});
http.createServer(function (req, res) {

    let q = url.parse(req.url, true);
    if (req.method === "POST" && q.pathname === "/insertPredefined") {
        res.writeHead(200, { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*' });
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            let patientData = JSON.parse(body);
            console.log(patientData);
            let sql = "INSERT INTO Patients (name, dateOfBirth) VALUES ?";
            let values = patientData.map(patient => [patient.name, patient.dateofbirth]);
            con.query(sql, [values], function (err, result) {
                if (err) throw err;
                res.end(messages.userMessages.successfullInsert);
            });
        });
    } else if (q.pathname === "/lab5/api/v1/sql") {

        let q = url.parse(req.url, true);
        let sqlQuery = q.query.query;
        if (req.method === "GET" || req.method === "POST") {
            if(sqlQuery.toUpperCase().startsWith("SELECT") || sqlQuery.toUpperCase().startsWith("INSERT")) {
            con.query(sqlQuery, function (err, result, fields) {
                if (err) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(result));
                    return;
                }
                res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
                if (req.method === "GET") {
                    res.end(JSON.stringify(result));
                } else {
                    res.end(messages.userMessages.successfulQuery);
                }
            });
            }else {
            res.writeHead(400, { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*' });
            res.end(messages.userMessages.methodError);
        }
        }

    }

}).listen(8080);

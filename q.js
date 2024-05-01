const db = require('./db.js');
const query = "SELECT * from users";
db.all(query, function (err, rows) {
    if (err) {
        throw err;
    }
    rows.forEach(function (row) {
        console.log(row);
    })
})
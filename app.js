const express = require('express')
const bodyParser = require('body-parser')

const app = express()
const port = 3000
const mysql = require('mysql')

app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'pug')


var connection = mysql.createConnection({
    host: '198.199.91.241',
    user: 'ethan',
    password: process.env.ABSPASS
});

connection.connect(function(err) {
    if (err) {
        console.error('error connecting: ' + err.stack);
        return;
    }
    console.log('connected as id ' + connection.threadId)
});

// ROUTES
app.get('/', function(req, res) {
    res.render('index.pug');
})

app.get('/es', function(req, res) {
    res.render('esindex.pug');
})

app.get('/symposium', function(req, res) {
    res.render('symposium.pug');
})

app.post('/postform', function(req, res) {

    var names = [];
    var values = [];

    for (name in req.body) {

        var name = connection.escapeId(name);
        names.push(name);

        if (name == '') {
            values.push('NULL');
        } else {
            var value = connection.escape(req.body[name])
            values.push(value);
        }
    }

    connection.query('INSERT INTO abstract.mainEnglish (' + names.join(', ') + ') VALUES (' + values.join(', ') + ')', function(err, rows, fields) {
        if (err) {console.log(err); return;}
    });

    res.redirect('/tetwetwetwet');

});

app.listen(port, () => console.log(`Listening on port ${port}!`))
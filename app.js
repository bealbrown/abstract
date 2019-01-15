const express = require('express')
const bodyParser = require('body-parser')

const app = express()
const port = 3000
const mysql = require('mysql')

app.use(express.json({limit: '50mb'}));


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

// -------- GET ROUTES -------- 
app.get('/', function(req, res) {
    res.render('index.pug');
})

app.get('/es', function(req, res) {
    res.render('esindex.pug');
})

app.get('/symposium', function(req, res) {
    res.render('symposium.pug');
})

// -------- POST ROUTES ---------
app.post('/postform', function(req, res) {

    var names = [];
    var values = [];

    var whichDB = req.body.whichDB;
    var theForm = req.body.theForm;


    for (row in theForm) {
        names.push(connection.escapeId(theForm[row].name));
        var value = connection.escape(theForm[row].value);
        if (value == '') {
            values.push('NULL');
        } else {
            values.push(value);
        }
    }

    // storing authors as json object. Perhaps not ideal, but will have to do post-processing on data anyway
    // appears to handle all unicode characters fine and produce valid object notation, so easy later on...

    names.push("authors");
    values.push(connection.escape(JSON.stringify(req.body.authors)));

    connection.query('INSERT INTO abstract.'+ whichDB + ' (' + names.join(', ') + ') VALUES (' + values.join(', ') + ')', function(err, result) {
        if (err) {
            console.log(err);
            return;
        } else {
            console.log(result.insertId);
        }
    });

    // console.log(values);

    res.redirect('/');

});

app.listen(port, () => console.log(`Listening on port ${port}!`))
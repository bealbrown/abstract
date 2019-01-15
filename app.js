const express = require('express')
const bodyParser = require('body-parser')

const app = express()
const port = 3000
const mysql = require('mysql')

app.use(express.json({limit: '50mb'}));


app.set('view engine', 'pug')


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
app.post('/postEnglish', function(req, res) {
    writetoDB(req,res,"mainEnglish");
});

app.post('/postSpanish', function(req, res) {
    writetoDB(req,res,"mainEnglish");
});


var writetoDB = function(req, res, whichDB) {

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
    });

    var names = [];
    var values = [];

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

    connection.end(function(err) {
        if (err) {
            console.log(err);
            return;
        }
    });

}

app.listen(port, () => console.log(`Listening on port ${port}!`))
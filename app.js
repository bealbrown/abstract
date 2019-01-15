const express = require('express')
const bodyParser = require('body-parser')

const app = express()
const port = 3000
const mysql = require('mysql')

app.use(express.json({limit: '50mb'}));


app.set('view engine', 'pug')


// -------- GET ROUTES -------- 
app.get('/', function(req, res) {
    res.render('abstract.pug');
})

app.get('/es', function(req, res) {
    res.render('abstract_es.pug');
})

app.get('/thanks_en', function(req, res) {
    res.render('thanks.pug');
})

app.get('/thanks_es', function(req, res) {
    res.render('thanks_es.pug');
})

app.get('/symposium', function(req, res) {
    res.render('symposium.pug');
})

app.get('/symposium_es', function(req, res) {
    res.render('symposium_es.pug');
})


// -------- POST ROUTES ---------
app.post('/postEnglish', function(req, res) {
    writetoDB(req,res,"mainEnglish");
    res.redirect("/thanks_en");
});

app.post('/postSpanish', function(req, res) {
    writetoDB(req,res,"mainSpanish");
    res.redirect("/thanks_es");
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
            console.log(result.insertId + " " + whichDB);
        }
    });

    // console.log(values);    

    connection.end(function(err) {
        if (err) {
            console.log(err);
            return;
        }
    });

    return;
}

app.listen(port, () => console.log(`Listening on port ${port}!`))
const express = require('express')
const bodyParser = require('body-parser')

const app = express()
const port = 3000
const mysql = require('mysql')
// const connection = mysql.createConnection({
//   host     : 'localhost',
//   user     : 'dbuser',
//   password : 's3kreee7',
//   database : 'my_db'
// });

app.use(bodyParser.urlencoded({extended: true}));

app.set('view engine', 'pug')

app.get('/', function (req, res) {
  res.render('index.pug');
})

app.get('/es', function (req, res) {
  res.render('esindex.pug');
})

app.get('/symposium', function (req, res) {
  res.render('symposium.pug');
})

app.post('/postform', function(req , res){
   console.log(req.body);
   res.redirect('/');
});



// connection.connect()

// connection.query('SELECT 1 + 1 AS solution', function (err, rows, fields) {
//   if (err) throw err

//   console.log('The solution is: ', rows[0].solution)
// })

// connection.end()


app.listen(port, () => console.log(`Example app listening on port ${port}!`))
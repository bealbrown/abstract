const express = require('express')
const app = express()
const port = 3000
const mysql = require('mysql')
// const connection = mysql.createConnection({
//   host     : 'localhost',
//   user     : 'dbuser',
//   password : 's3kreee7',
//   database : 'my_db'
// });
app.set('view engine', 'pug')

app.get('/', function (req, res) {
  res.render('pindex.pug');
})

app.post('/postform', function(req , res){
   console.log(req.body.formData);
});

app.get('/test', function(req,res) {
	console.log("test");
})




// connection.connect()

// connection.query('SELECT 1 + 1 AS solution', function (err, rows, fields) {
//   if (err) throw err

//   console.log('The solution is: ', rows[0].solution)
// })

// connection.end()


app.listen(port, () => console.log(`Example app listening on port ${port}!`))

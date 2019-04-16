const express = require('express')
const bodyParser = require('body-parser')
// const { Parser } = require('json2csv');
var Excel = require('exceljs');

const app = express()
const port = 3000
const mysql = require('mysql')

app.use(express.json({limit: '50mb'}));


app.set('view engine', 'pug')


// -------- GET ROUTES -------- 
app.get('/', function(req, res) {
    res.render('home.pug');
})

app.get('/abstract', function(req, res) {
    res.render('abstract.pug');
})

app.get('/abstract_es', function(req, res) {
    res.render('abstract_es.pug');
})

app.get('/thanks_en', function(req, res) {
    res.render('thanks_en.pug');
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

app.get('/' + process.env.EXPORTSTR, function(req, res) {
    res.render('export.pug', { exportstr: process.env.EXPORTSTR} );
})

app.get('/' + process.env.EXPORTSTR + 'abstractExport', function(req, res) {
    exportDB(req,res,'mainEnglish');
})

app.get('/' + process.env.EXPORTSTR + 'abstractSpanishExport', function(req, res) {
    exportDB(req,res,'mainSpanish');
})

app.get('/' + process.env.EXPORTSTR + 'symposiumExport', function(req, res) {
    exportDB(req,res,'Symposium');
})

app.get('/' + process.env.EXPORTSTR + 'symposiumSpanishExport', function(req, res) {
    exportDB(req,res,'SymposiumSpanish');
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

app.post('/postSymposium', function(req, res) {
    writetoDB(req,res,"Symposium");
    res.redirect("/thanks_en");
});

app.post('/postSymposiumSpanish', function(req, res) {
    writetoDB(req,res,"SymposiumSpanish");
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

    var theForm = req.body;

    for (row in theForm) {
        names.push(connection.escapeId(theForm[row].name));
        var value = connection.escape(theForm[row].value);
        if (value == '') {
            values.push('NULL');
        } else {
            values.push(value);
        }
    }

    connection.query('INSERT INTO abstract.'+ whichDB + ' (' + names.join(', ') + ') VALUES (' + values.join(', ') + ')', function(err, result) {
        if (err) {
            console.log(err);
            return;
        } else {
            console.log(result.insertId + " " + whichDB);
        }
    });

    connection.end(function(err) {
        if (err) {
            console.log(err);
            return;
        }
    });

    return;
}

var exportDB = function(req,res,whichDB) {

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

    connection.query('SELECT * FROM abstract.   ' + whichDB, function(err, result) {
        if (err) {
            console.log(err);
            return;

        } else {

            try {

                var workbook = new Excel.Workbook();
                var mainSheet = workbook.addWorksheet('Main');
                var authorSheet = workbook.addWorksheet('Authors');
                var topicSheet = workbook.addWorksheet('Topics');
                var rowsObj = JSON.parse(JSON.stringify(result));

                colObj = rowsObj[0];
                delete colObj.authors;
                delete colObj.topics;
                columnsData = Object.keys(colObj);                
                mainSheet.addRow([whichDB]);     
                mainSheet.addRow([""]);     
                mainSheet.addRow(columnsData);     

                // Main Sheet

                for (i = 0; i < rowsObj.length; i++ ) {

                    authorsJSON = rowsObj[i]["authors"];   
                    topicsJSON = rowsObj[i]["topics"]; 

                    delete rowsObj[i].authors;
                    delete rowsObj[i].topics;

                    rowData = Object.values(rowsObj[i]);                
                    mainSheet.addRow(rowData);

                    function IsJsonString(str) {
                        try {
                            JSON.parse(str);
                        } catch (e) {
                            return false;
                        }
                        return true;
                    }

                    var idRow = authorSheet.addRow([rowsObj[i]["id"],rowsObj[i]["englishTitleInput"],rowsObj[i]["englishTitle"]]);
                    idRow.fill = {type: 'pattern', pattern: 'darkVertical', fgColor: {argb: 'CACACA'}};

                    var idRow = topicSheet.addRow([rowsObj[i]["id"],rowsObj[i]["englishTitleInput"],rowsObj[i]["englishTitle"]]);
                    idRow.fill = {type: 'pattern', pattern: 'darkVertical', fgColor: {argb: 'CACACA'}};


                    if (IsJsonString(authorsJSON)) {

                        authors = JSON.parse(authorsJSON);

                       
                        authorCols = Object.keys(authors[0]);   
                        authorCols.unshift("");             
                        authorSheet.addRow(authorCols);    

                        authors.forEach(function(author){

                            rowData = Object.values(author);    
                            rowData.unshift("");
                            authorSheet.addRow(rowData);

                        });

                        authorSheet.addRow(null);
                    } 

                    if (IsJsonString(topicsJSON)) {

                        topics = JSON.parse(topicsJSON);

                        topicCols = Object.keys(topics[0]);   
                        topicCols.unshift("");             
                        topicSheet.addRow(topicCols);    

                        topics.forEach(function(topic){

                            rowData = Object.values(topic);    
                            rowData.unshift("");
                            topicSheet.addRow(rowData);

                        });

                        topicSheet.addRow(null);
                    } 
                }   

            var fileName = whichDB + '.xlsx';

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader("Content-Disposition", "attachment; filename=" + fileName);

            workbook.xlsx.write(res).then(function(){
                res.end();
            });          


            } catch (err) {
              console.error(err);
            }
        }
    });

    connection.end(function(err) {
        if (err) {
            console.log(err);
            return;
        }
    });
}

app.listen(port, () => 
    console.log(`Listening on port ${port}!`)
)
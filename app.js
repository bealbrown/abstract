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



// -------- EXPORT ROUTES ---------

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

app.get('/'  + process.env.EXPORTSTR + 'contacteng', function(req, res) {
    contactinfo(req,res,"mainEnglish");
})

app.get('/'  + process.env.EXPORTSTR + 'contactesp', function(req, res) {
    contactinfo(req,res,"mainSpanish");
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

                if (whichDB == "Symposium" || whichDB == "SymposiumSpanish") {
                    var topicSheet = workbook.addWorksheet('Topics');
                }
                
                var rowsObj = JSON.parse(JSON.stringify(result));

                columnsData = Object.keys(rowsObj[0]);  


                // add in main author info to main table
           
                columnsData.splice(1,0,"Presenter Last Name");   
                console.log(columnsData); 

                for (var i = columnsData.length-1; i--;) {
                    if ( columnsData[i] === 'authors' || columnsData[i] === 'topics') {
                        columnsData.splice(i, 1);  
                    } 
                }

                console.log(columnsData); 
                // formatting of spreadsheet data display
                mainSheet.addRow([whichDB]);     
                mainSheet.addRow([""]);     
                mainSheet.addRow(columnsData);     

                // Main Sheet


                for (i = 0; i < rowsObj.length; i++ ) {


                    // --------------------- Initalize main Data Objects ---------------------

                    authorsJSON = rowsObj[i]["authors"];   
                    topicsJSON = rowsObj[i]["topics"]; 

                    // if (i == 0 ) {
                    //     console.log(rowsObj[i]);
                    // }

                    delete rowsObj[i].authors;
                    delete rowsObj[i].topics;


                    // ------------------------------------------
                    function IsJsonString(str) {
                        try {
                            JSON.parse(str);
                            // console.log(rowsObj[i]["id"], "success!");
                        } catch (e) {
                            // console.log(i, rowsObj[i]["id"], e);
                            return false;
                        }
                        return true;
                    }

                    // --------------------- Display formatting for Author, Topic sheets ---------------------
                    var idRow = authorSheet.addRow([rowsObj[i]["id"],rowsObj[i]["englishTitleInput"],rowsObj[i]["englishTitle"]]);
                    idRow.fill = {type: 'pattern', pattern: 'darkVertical', fgColor: {argb: 'CACACA'}};

                    if (whichDB == "Symposium" || whichDB == "SymposiumSpanish") {       
                        var idRow = topicSheet.addRow([rowsObj[i]["id"],rowsObj[i]["englishTitleInput"],rowsObj[i]["englishTitle"]]);
                        idRow.fill = {type: 'pattern', pattern: 'darkVertical', fgColor: {argb: 'CACACA'}};
                    }

                    // --------------------- Author Sheet data ---------------------
                    if (IsJsonString(authorsJSON)) {

                        authors = JSON.parse(authorsJSON);

                       
                        authorCols = Object.keys(authors[0]);   
                        authorCols.unshift("");             
                        authorSheet.addRow(authorCols);    

                        var presenterLast = "";
                        authors.forEach(function(author){

                            rowData = Object.values(author);    
                            rowData.unshift("");


                            // Main presenter 
                            if (rowData[8] == "on") {
                                rowData[8] = rowData[4];
                                presenterLast = rowData[4];

                            }

                            authorSheet.addRow(rowData);
                            
                        });

                        authorSheet.addRow(null);
                    } 

                    // --------------------- TOPIC SHEET INFO ---------------------
                    if (whichDB == "Symposium" || whichDB == "SymposiumSpanish") {

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

                    // --------------------- MAIN SHEET INFO ---------------------

                    rowData = Object.values(rowsObj[i]);    
                    rowData.splice(1,0,presenterLast);            
                    mainSheet.addRow(rowData);



                }   

            // --------------------- EXPORT XLSX ---------------------

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


var contactinfo = function(req,res,whichDB) {

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


                var rowsObj = JSON.parse(JSON.stringify(result));

                mainSheet.addRow(["id", "englishTitle", "First Name", "Last Name", "Email"]);

                for (i = 0; i < rowsObj.length; i++ ) {

                    authorsJSON = rowsObj[i]["authors"];   
                    authors = JSON.parse(authorsJSON);
                   
                    var firstname = "";
                    var lastname = "";
                    var email = "";

                    authors.forEach(function(author){
                        if (author['presenter'] == "on") {
                            firstname = author['first'];
                            lastname = author['last'];
                            email = author['email'];
                        }
                    });

                    newrow = [rowsObj[i]["id"], rowsObj[i]["englishTitle"], firstname, lastname, email];
                    mainSheet.addRow(newrow);

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
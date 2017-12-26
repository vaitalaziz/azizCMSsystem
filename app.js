var express = require('express');
var path = require('path');
var mongoose = require('mongoose'); 
var config = require('./config/database');

// DB connection
mongoose.connect(config.database);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Successfull connection to MongoDB!');
});


// Initialize ap
var app = express();

//view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//setup public folder
app.use(express.static(path.join(__dirname, 'public')));


app.get('/', function(req, res){
//    res.send('Server listening!!!');
    res.render('index', {
        title: 'Clients'
    });
})

// Server startup
var port = 3000;
app.listen(port, function(){
    console.log('Server listening on port: '+ port)
});
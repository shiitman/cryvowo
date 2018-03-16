var express = require('express');
var app = express();

app.use('/js', express.static('js'));
app.use('/css', express.static('css'));
app.use('/3dpart', express.static('3dpart'));
app.use('/index.html', express.static('index.html'));
app.use('/sw', express.static('sw'));

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.listen(3000, function() {});
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require("dns");
var bodyParser = require('body-parser')
const fs = require('fs');
const { json } = require('body-parser');
const ip = require('ip');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static('./public'));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', function(req, res) {
  var rendomNumber = parseInt(Math.random()*1000)
  var orignalURL = req.body.url;
  const REPLACE_REGEX = /^https?:\/\//i;
  orignalURL = orignalURL.replace(REPLACE_REGEX, '');
  orignalURL = orignalURL.slice(0,orignalURL.indexOf("/"));
  dns.lookup(orignalURL, (error, address, family) => {
    if (error) {
      return res.send({ error: 'invalid url' })
    } 
    var short_URLObj = {"original_url":req.body.url,"short_url":rendomNumber};
    try
    {
    var shortData = fs.readFileSync(`./short_url.json`);
    shortData = JSON.parse(shortData.toString());
    shortData.push(short_URLObj);
    fs.writeFile("./short_url.json", JSON.stringify(shortData), (err) => {
      if (err)
        return res.send(err);
    });
    }
    catch(e)
    {
      fs.writeFileSync(`short_url.json`,JSON.stringify([short_URLObj]))
    }
    res.send(short_URLObj);
  });
});

app.get('/api/shorturl/:number', function(req, res) {
  var inner = false;
  var number = req.params.number;
  var fetchData = fs.readFileSync('./short_url.json');
  fetchData = fetchData.toString();
  fetchData = JSON.parse(fetchData);
  fetchData.map((val)=>
  {
    if(val.short_url == number)
    {
      res.redirect(val.original_url);
      inner = true;
    }
  })
  if(!inner)
    {
      res.send(`Invalid Number`);
    }
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log(`Your app is listening on http://${ip.address()}:${listener.address().port}`)
})

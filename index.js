require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { urlencoded } = require('body-parser');
const { MongoClient } = require('mongodb');
const urlparser = require('url');
const dns = require('dns');
const { error } = require('console');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;
const client = new MongoClient(process.env.DB_CLIENT)
const db = client.db("urlshortner");
const urls = db.collection("urls");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint 
app.post('/api/shorturl', function (req, res) {
  const url = req.body.url;
  const dnslookup=dns.lookup(urlparser.parse(url).hostname, async(err,address)=>{
    if(!address){
      res.json({error:"Invalid URL"});
    }else{
      const urlCount = await urls.countDocuments({});
      const urlDoc={
        url:url,
        short_url:urlCount
      }
      const result = await urls.insertOne(urlDoc);
      res.json({original_url: url, short_url:urlCount})
    }
  })
});

app.get('/api/shorturl/:shorturl',async(req,res)=>{
const shorturl = req.params.shorturl;
const urlDoc = await urls.findOne({short_url:+shorturl});
res.redirect(urlDoc.url)
});

app.listen(port, function () {
  console.log(`Listening on port http://localhost:${port}`);
});

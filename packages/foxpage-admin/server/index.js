const path = require('path');
const fs = require('fs');
const request = require('request');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const favicon = require('serve-favicon');
const packageJson = require('../package.json');
const config = require('../config.profile');

const port = packageJson.config ? packageJson.config.port : '3002';
let ENV = 'dev'; // default ENV fat
if (packageJson.config && packageJson.config.env) {
  ENV = packageJson.config.env.toLowerCase();
}

const slug = (config[ENV] || config.fat)?.slug || '';

// express app
const app = express();

app.use(cookieParser());

if (process.env.NODE_ENV !== 'test') {
  app.use(favicon(path.join(__dirname, '../dist/images', 'favicon.ico')));
}

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

  next();
});

// health check
app.get(`${slug}/healthcheck`, (req, res) => {
  res.send('OK');
});

app.post(`${slug}/_foxpage/*`, (req, res) => {
  const { originalUrl, query = {} } = req;
  const { host } = query;
  req.pipe(request(host + originalUrl)).pipe(res);
});

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: false,
  }),
);

app.get(`${slug}/`, (req, res) => {
  const data = fs.readFileSync(`${__dirname}/../dist/index.html`, 'utf8');
  res.send(data.replace('{{APP_CONFIG}}', JSON.stringify(config[ENV])));
});

// static file serve
app.use(`${slug}/dist`, express.static(path.join(__dirname, '../dist')));

// start up
app.listen(port);

console.log(`server ready on ${port}`);

module.exports = app;

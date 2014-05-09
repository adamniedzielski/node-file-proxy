var express = require('express');
var router = express.Router();
var db = require('../db');

router.get('/', function (req, res) {
  db.getAllFiles(function (files) {
    res.render('files/index', { files: files });
  });
});

router.get('/:id', function (req, res) {
  var id = req.params.id;
  db.getFile(id, function (file) {
    res.render('files/show', { file: file, url: '/files/' + id + '/buy' });
  });
});

router.post('/:id/buy', function (req, res) {
  db.addEmail(req.body.email);
  db.createToken(req.params.id, function (token) {
    res.render('files/token', { url: '/download/' + token });
  });
});

module.exports = router;

var express = require('express');
var request = require('request');

var router = express.Router();
var db = require('../db');

router.get('/:token', function (req, res) {
  db.getFileUrl(req.params.token, function (error, fileUrl) {
    if(error) {
      return res.end('Token invalid or expired!');
    }

    request.get(fileUrl).pipe(res);
  });
});

module.exports = router;


var level = require('levelup');
var sub = require('level-sublevel');
var crypto = require('crypto');

var db = sub(level('./db', { encoding: 'json' }));
var filesDb = db.sublevel('files');
var emailsDb = db.sublevel('emails');
var tokensDb = db.sublevel('tokens');

module.exports.getAllFiles = function (callback) {
  var files = [];

  filesDb.createReadStream().on('data', function (data) {
    files.push({ name: data.value.name, url: '/files/' + data.key });
  }).on('end', function (){
    callback(files);
  });
}

module.exports.getFile = function (id, callback) {
  filesDb.get(id, function (error, data) {
    callback({ name: data.name });
  });
}

module.exports.addFile = function (key, value) {
  filesDb.put(key, value);
}

module.exports.addEmail = function (email) {
  emailsDb.put(email, {});
}

module.exports.createToken = function (fileId, callback) {
  var token = crypto.randomBytes(20).toString('hex');
  tokensDb.put(token, { file: fileId, remaining: 3 }, function (error) {
    callback(token);
  });
}

module.exports.getFileUrl = function (token, callback) {
  tokensDb.get(token, function (error, value) {
    if (error) {
      return callback(true);
    }

    value.remaining--;
    tokensDb.del(token, function () {
      if(value.remaining > 0) {
        tokensDb.put(token, value, function () {
          sendFileUrl(value, callback);
        });
      }
      else {
        sendFileUrl(value, callback);
      }
    });
  });
}

function sendFileUrl (value, callback) {
  filesDb.get(value.file, function (error, file) {
    callback(null, file.url);
  });
} 

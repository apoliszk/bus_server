var config = require('../config').config;
var model = require('../model');
var proxy = require('../proxy');
var mongoose = require('mongoose');

mongoose.connect(config.db);
var db = mongoose.connection;
db.on('error', function () {
    console.log('connect to db failed');
});
db.once('open', function () {
    model.init(mongoose);

    var num = 0;
    var optimize = true;
    proxy.getLineInfo(num, optimize, getLineInfoCompleteHandler, saveToDb);

    function getLineInfoCompleteHandler() {
        num++;
        if (num < 10) {
            proxy.getLineInfo(num, optimize, getLineInfoCompleteHandler, saveToDb)
        } else {
            setTimeout(function () {
                db.close();
                console.log('db initialize over');
            }, 5000);
        }
    }

    function saveToDb(obj) {
        if (obj.stations && obj.stations.length > 0) {
            global.models.Line.findOne({_id: obj._id}, function (err, doc) {
                if (doc) {
                    doc.refreshValues(obj);
                    doc.save();
                } else {
                    global.models.Line.create(obj);
                }
            });
        }
    }
});

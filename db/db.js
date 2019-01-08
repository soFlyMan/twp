//数据库接口库
var util = require('util');
var sqlite3 = require('sqlite3');

sqlite3.verbose();
var db = undefined;

/*
 数据库名是直接硬编码的，所以当调用connect和setup函数时，当前目录中就会生成chap06.sqlite3文件
 */

exports.connect = function (callback) {
    db = new sqlite3.Database("twp.sqlite3", sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
        function (err) {
            if (err) {
                util.log('FAIL on creating database ' + err);
                callback(err);
            } else {
                callback(null);
            }
        });
}

//此处的disconnect函数是空的
exports.disconnect = function (callback) {
    callback(null);
}

exports.setup = function (callback) {
    db.run("CREATE TABLE IF NOT EXISTS routes " +
        "(ts DATETIME, twp TEXT, route TEXT, alipay TEXT, more TEXT, xiaoweiba TEXT, picUrl TEXT)",
        function (err) {
            if (err) {
                util.log('FAIL on creating table ' + err);
                callback(err);
            } else {
                callback(null);
            }
        });
}



exports.emptyNote = { "ts": "", "twp": "", "route": "", "alipay": "", "more": "", "xiaoweiba": "", "picUrl": "" };
exports.add = function (twp, route, alipay, more, xiaoweiba, picUrl, callback) {
    db.run("INSERT INTO routes (ts, twp, route, alipay, more, xiaoweiba, picUrl) " +
        "VALUES (?, ?, ?, ?, ?, ?, ?);",
        [new Date(), twp, route, alipay, more, xiaoweiba, picUrl],
        function (error) {
            if (error) {
                util.log('FAIL on add ' + error);
                callback(error);
            } else {
                callback(null);
            }
        });
}
/*
run函数接受一个字符串参数，其中?表示占位符，占位符的值必须通过一个数组传递进来
调用者提供了一个回调函数，然后通过这个回调函数来声明错误
 */

exports.delete = function (ts, callback) {
    db.run("DELETE FROM routes WHERE ts = ?;",
        [ts],
        function (err) {
            if (err) {
                util.log('FAIL to delete ' + err);
                callback(err);
            } else {
                callback(null);
            }
        });
}

exports.edit = function (ts, twp, route, callback) {
    db.run("UPDATE routes " +
        "SET ts = ?, twp = ?, route = ? " +
        "WHERE ts = ?",
        [ts, twp, route, ts],
        function (err) {
            if (err) {
                util.log('FAIL on updating table ' + err);
                callback(err);
            } else {
                callback(null);
            }
        });
}

exports.allNotes = function (callback) {
    util.log(' in allroute');
    db.all("SELECT * FROM routes", callback);
}
exports.forAll = function (doEach, done) {
    db.each("SELECT * FROM routes", function (err, row) {
        if (err) {
            util.log('FAIL to retrieve row ' + err);
            done(err, null);
        } else {
            doEach(null, row);
        }
    }, done);
}
/*
allNotes和forAll函数是操作所有数据的两种方法，allNotes把数据库中所有的数据行收集到一个数组里，
而forAll方法可以接受两个回调函数，每当从数据集中拿一行数据，回调函数doEach都会执行一遍，当读完所有数据时，回调函数done就会执行
 */

exports.findNoteById = function (ts, callback) {
    var didOne = false;
    db.each("SELECT * FROM routes WHERE ts = ?",
        [ts],
        function (err, row) {
            if (err) {
                util.log('FAIL to retrieve row ' + err);
                callback(err, null);
            } else {
                if (!didOne) {
                    callback(null, row);
                    didOne = true;   //保证回调函数只被执行一次
                }
            }
        });
}


exports.findNoteByRoute = function (route, callback) {
    var didOne = false;
    db.each("SELECT * FROM routes WHERE route = ?",
        [route],
        function (err, row) {
            if (err) {
                util.log('FAIL to retrieve row ' + err);
                callback(err, null);
            } else {
                if (!didOne) {
                    callback(null, row);
                    didOne = true;   //保证回调函数只被执行一次
                }
            }
        });
}

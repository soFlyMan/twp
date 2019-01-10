var express = require('express');
var router = express.Router();
var fetch = require('node-fetch');
var db = require('../db/db');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'MkStone' });
});


router.post('/api/other/wx/tb/midpage/', function(req, res, next) {
  var reqBody = req.body
  var twp = reqBody.twp
  console.log('twp', twp)
  
  var api_url = `http://api.taokouling.com/tkl/tkljm?apikey=yyEARRKhpk&tkl=${twp}`;
  fetch(api_url, {})
    .then((response) => {
      if (response.ok) {
        response.json().then(data => {
          console.log(data);
          var picUrl = data.picUrl || data.msg;
          var route = Date.now().toString();
          db.add(reqBody.twp, route, reqBody.alipay, reqBody.more, reqBody.xiaoweiba, picUrl, function() {
            res.send({
              route: `http://13.115.66.202:3000/twp/${route}`,
              picUrl: picUrl,
            });
          })
        })
      } 
      // 可以透過 blob(), json(), text() 轉成可用的資訊

    }).catch((err) => {
      console.log('錯誤:', err);
    });
});



router.get('/twp/*', function(req, res, next) { 
  var route = req.url.replace(/\/twp\//g, '')
  db.findNoteByRoute(route, function(err, row) {
    var picUrl = row.picUrl
    res.render('taokouling', {
      koulingPre: '复制框内整段文字，打开「手机掏寶ApP」即可「领取秘密券」并购买',
      kouling: row.twp,
      alipay: row.alipay,
      wangzhan: row.more,
      xiaoweiba: row.xiaoweiba,
      picUrl: row.picUrl,
        })
      })
});

module.exports = router;

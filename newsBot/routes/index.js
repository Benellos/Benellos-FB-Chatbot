var express = require('express');
var request = require('request');
var rssReader = require('feed-read');
var router = express.Router();
var token = "EAAbZA6M9RPGgBAMZBKTxTGznEeeA4voEDRW9WB9NU5NFHGnjWg3kngOKnd6ZAouaamZB2DCsTj0a2yMML14lXhFLkfJihi6lZBygF1wVU07SNUygZAm7BjRuPeCxwHgtbJuAD4tP6Xpqb9zVV4cQSKnUuloZAm82zIPdyyXS70KTwZDZD";

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.get('/',function(req,res){
  res.sendFile(path.join(__dirname+'/index.html'));
  //__dirname : It will resolve to your project folder.
});
router.get('/webhook/', function(req, res) {
  if (req.query['hub.mode'] === 'subscribe' &&
      req.query['hub.verify_token'] === "hello_token_success") {
    console.log("Validating webhook");
    res.status(200).send(req.query['hub.challenge']);
  } else {
    console.error("Failed validation. Make sure the validation tokens match.");
    res.sendStatus(403);          
  }  
});
router.post('/webhook/', function (req, res) {
  var data = req.body;
  if (data.object === 'page') {
    data.entry.forEach(function(entry) {
      var pageID = entry.id;
      var timeOfEvent = entry.time;
      entry.messaging.forEach(function(event) {
        if (event.message) {
          var sender = event.sender.id;

          receivedMessage(event);
        } else {
          console.log("Webhook received unknown event: ", event);
        }
      });
    });
    res.sendStatus(200);
  }
});

var feedEndpoints = ["http://www.highsnobiety.com/category/footwear/feed/", "https://news.google.de/news?cf=all&hl=de&pz=1&ned=de&output=rss"];
var fashionEndpoints = ["http://www.highsnobiety.com/category/lifestyle/feed/", "http://www.highsnobiety.com/category/fashion/clothing/feed/", "http://www.highsnobiety.com/category/footwear/feed/"];

function getArticles(endpoints, callback) {
  rssReader(endpoints, function(err, articles){
    if(err){
      callback(err);
    } else {
        if(articles.length > 0 ){
          callback(null, articles);
        } else {
          callback("keine artikel bekommen!")
        }
    }
  })
}

function receivedMessage(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var message = event.message;

  var messageId = message.mid;

  var messageText = message.text;
  var messageAttachments = message.attachments;

  if (messageText) {

    switch (messageText) {
      case 'sneaker':
        getArticles(fashionEndpoints[2], function(err, articles){
          sendGenericMessage(senderID, articles);
        });
        break;

      case 'lifestyle':
        getArticles(fashionEndpoints[0], function(err, articles){
          sendGenericMessage(senderID, articles);
        });
        break;

      case 'fashion':
        getArticles(fashionEndpoints[1], function(err, articles){
          sendGenericMessage(senderID, articles);
        });
        break;

      case 'HELP':
        sendTextMessage(senderID, "Gib 'sneaker', 'fashion' oder 'lifestyle' ein um nice Artikel darüber zu bekommen!");
        break;

      default:
        sendTextMessage(senderID, "Du hast nach: "+messageText+" gesucht, aber wenn du wissen willst, was ich kann dann gib HELP ein.");
    }
  } else if (messageAttachments) {
    sendTextMessage(senderID, "Message with attachment received");
  }
}
function callSendAPI(messageData) {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: token },
    method: 'POST',
    json: messageData

  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var recipientId = body.recipient_id;
      var messageId = body.message_id;

      console.log("Successfully sent generic message with id %s to recipient %s", 
        messageId, recipientId);
    } else {
      console.error("Unable to send message.");
      console.error(response);
      console.error(error);
    }
  });  
}
function sendTextMessage(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText
    }
  };

  callSendAPI(messageData);
}
function sendGenericMessage(recipientId, articles) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [{
            title: articles[0].title,
            subtitle: articles[0].published.toString(),
            item_url: articles[0].link,               
            buttons: [{
              type: "web_url",
              url: articles[0].link,
              title: "Öffne den Artikel"
            }, {
              type: "web_url",
              url: "http://nandobenelli.com",
              title: "Besuche Nando Benelli!"
            }],
          }, {
            title: articles[1].title,
            subtitle: articles[1].published.toString(),
            item_url: articles[1].link,               
            buttons: [{
              type: "web_url",
              url: articles[1].link,
              title: "Öffne den Artikel"
            }, {
              type: "web_url",
              url: "http://nandobenelli.com",
              title: "Besuche Nando Benelli!"
            }],
          }, {
            title: articles[2].title,
            subtitle: articles[2].published.toString(),
            item_url: articles[2].link,               
            buttons: [{
              type: "web_url",
              url: articles[2].link,
              title: "Öffne den Artikel"
            }, {
              type: "web_url",
              url: "http://nandobenelli.com",
              title: "Besuche Nando Benelli!"
            }],
          }, {
            title: articles[3].title,
            subtitle: articles[3].published.toString(),
            item_url: articles[3].link,               
            buttons: [{
              type: "web_url",
              url: articles[3].link,
              title: "Öffne den Artikel"
            }, {
              type: "web_url",
              url: "http://nandobenelli.com",
              title: "Besuche Nando Benelli!"
            }],
          }, {
            title: articles[4].title,
            subtitle: articles[4].published.toString(),
            item_url: articles[4].link,               
            buttons: [{
              type: "web_url",
              url: articles[4].link,
              title: "Öffne den Artikel"
            }, {
              type: "web_url",
              url: "http://nandobenelli.com",
              title: "Besuche Nando Benelli!"
            }],
          }, {
            title: articles[5].title,
            subtitle: articles[5].published.toString(),
            item_url: articles[5].link,               
            buttons: [{
              type: "web_url",
              url: articles[5].link,
              title: "Öffne den Artikel"
            }, {
              type: "web_url",
              url: "http://nandobenelli.com",
              title: "Besuche Nando Benelli!"
            }],
          }, {
            title: articles[6].title,
            subtitle: articles[6].published.toString(),
            item_url: articles[6].link,               
            buttons: [{
              type: "web_url",
              url: articles[6].link,
              title: "Öffne den Artikel"
            }, {
              type: "web_url",
              url: "http://nandobenelli.com",
              title: "Besuche Nando Benelli!"
            }],
          }]
        }
      }
    }
  };  

  callSendAPI(messageData);
}
module.exports = router;

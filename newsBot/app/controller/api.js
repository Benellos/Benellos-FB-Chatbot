//api.js
var request = require('request');
var rssReader = require('feed-read');
var properties = require('../config/properties.js')

var User = require('../model/user.js');

exports.tokenVerification = function(req, res) {
	if (req.query['hub.verify_token'] === properties.facebook_challenge) {
    res.send(req.query['hub.challenge']);
  } else {
  	res.send('Error, wrong validation token');
  }
}

exports.handleMessage = function(req, res) {
	messaging_events = req.body.entry[0].messaging;
	for (i = 0; i < messaging_events.length; i++) {
		event = req.body.entry[0].messaging[i];
		sender = event.sender.id;
		if (event.message && event.message.text) {
		  	text = event.message.text;

        normalizedText = text.toLowerCase().replace(' ', '');
        
        switch(normalizedText) {
          case properties.chat_keywords[0].toString():
          getArticlesOld(properties.endpoints[2], function(err, articles){
            sendGenericMessage(sender, articles);
          });
            break;

          case properties.chat_keywords[2].toString():
            getArticlesOld(properties.endpoints[0], function(err, articles){
              sendGenericMessage(sender, articles);
            });
            break;

          case properties.chat_keywords[1].toString():
            getArticlesOld(properties.endpoints[1], function(err, articles){
              sendGenericMessage(sender, articles);
            });
            break;

          case "hilfe":
            sendTextMessage(sender, "Gib '"+properties.chat_keywords[0]+"', '"+properties.chat_keywords[1]+"' oder '"+properties.chat_keywords[2]+"' ein um nice Artikel darüber zu bekommen! Oder abonniere sogar tägliche News mit /abonnieren | deabonniere mit /deabonnieren und rufe den Status mit /abostatus ab!");
            break;

          case "/abonnieren":
            subscribeUser(sender)
            break;
          case "/deabonnieren":
            unsubscribeUser(sender)
            break;
          case "/abostatus":
            subscribeStatus(sender)
            break;
          default:
            sendTextMessage(sender, "Damn! Ich weiss nicht, was du mit: '"+normalizedText+"' meinst! Gib 'hilfe' ein, falls du nicht weiterkommst!")
            break;
             
          }
  		}
    }
	res.sendStatus(200);
}
function sendGenericMessage(recipientId, articles) {
  var btnText = properties.button_text;
  var btnLink = properties.button_link;
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
              url: btnLink,
              title: btnText
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
              url: btnLink,
              title: btnText
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
              url: btnLink,
              title: btnText
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
              url: btnLink,
              title: btnText
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
              url: btnLink,
              title: btnText
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
              url: btnLink,
              title: btnText
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
              url: btnLink,
              title: btnText
            }],
          }]
        }
      }
    }
  };  

  callSendAPI(messageData);
}
function subscribeUser(id) {
  var newUser = new User({
    fb_id: id,
  });

  User.findOneAndUpdate({fb_id: newUser.fb_id}, {fb_id: newUser.fb_id}, {upsert:true}, function(err, user) {
    if (err) {
      sendTextMessage(id, "Da war ein Fehler beim abonnieren!");
    } else {
      console.log('User saved successfully!');
      sendTextMessage(newUser.fb_id, "Du hast abonniert!")
    }
  });
}

function unsubscribeUser(id) {
  User.findOneAndRemove({fb_id: id}, function(err, user) {
    if (err) {
      sendTextMessage(id, "Da war ein Fehler beim abonnieren!");
    } else {
      sendTextMessage(id, "Du hast deabonniert!")
    }
  });
}

function subscribeStatus(id) {
  User.findOne({fb_id: id}, function(err, user) {
    subscribeStatus = false
    if (err) {
      console.log(err)
    } else {
      if (user != null) {
        subscribeStatus = true
      }
      subscribedText = "Dein Abonnement Status ist: " + subscribeStatus
      sendTextMessage(id, subscribedText)
    }
  })
}
function getArticlesOld(endpoints, callback) {
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

function _getArticles(callback, articles) {
  rssReader(properties.endpoints, function(err, articles) {
    if (err) {
      callback(err)
    } else {
      if (articles.length > 0) {
        callback(null, articles)
      } else {
        callback("no articles received")
      }
    }
  })
}

exports.getArticles = function(callback) {
	_getArticles(callback)
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

function callSendAPI(messageData) {
  request({
    uri: properties.facebook_message_endpoint,
    qs: { access_token: properties.facebook_token },
    method: 'POST',
    json: messageData

  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var recipientId = body.recipient_id;
      var messageId = body.message_id;

      console.log("Successfully sent generic message with id %s to recipient %s", 
        messageId, recipientId);
    } else {
      console.log(response.statusCode)
      console.error("Unable to send message.");
      console.error(error);
    }
  });  
}

function _sendArticleMessage(sender, article) {
  messageData = {
    recipient: {
      id: sender
    },
    message: {
    attachment:{
          type:"template",
          payload:{
            template_type:"generic",
            elements:[
              {
                title:article.title,
                subtitle: article.published.toString(),
                item_url:article.link
                }
        ]
        }
        }
      }
  }
  
  callSendAPI(messageData)
}

exports.sendArticleMessage = function(sender, article) {
  _sendArticleMessage(sender, article)
}
var Trello = require('node-trello'),
     async = require('async'),
    moment = require('moment');

var api;
var boards;

var tick = function() { process.stdout.write('.') };

var passed_date = new Date(2013, 4-1, 24);

var createStatus = function(api_key, api_token, new_boards, callback) {
  api = new Trello(api_key, api_token);
  boards = new_boards;

  async.waterfall([
    getBoards,
    appendListAndCardInfos,
    appendComments,
    callback
  ]);
}

var getBoards = function(callback) {
    callback(null, boards);
}

var appendListAndCardInfos = function(data, callback) {
  var data2 = [];
  async.forEach(
    data, 
    function(item, callback2) {
      api.get('/1/board/' + item.board_id + '/lists/all', {'cards':'all'}, function(err, response) {
        tick();
        console.log('Got response for board ' + item.board_id);
        console.log('Found ' + response.length + ' lists');
        if(err) throw err;
        for (var j=0; j < response.length; j++) {
          var list_name = response[j].name;
          var list_id = response[j].id;
          if(response[j].cards)
            console.log('Found ' + response[j].cards.length + " cards for list " + list_name);
          for (var i = 0; response[j].cards && i < response[j].cards.length; i++) {
            var card = response[j].cards[i];
            var card_name = card.name;
            var n = card_name.match(/\((\d)\)/);
            var estimate = n ? n[1] : 0;
            //var idMembers = card.idMembers;
            data2.push({ 
              //board_id: item.board_id, 
              card_id: card.id, 
              list_name : list_name,
              //list_id : list_id,
              card_name : card_name,
              //idMembers : idMembers
              url: card.url,
              labels: card.labels
            });
          };
        }
        callback2(null);
      });
    },
    function() {
      callback(null, data2);
    }
  );
}


var appendComments = function(data, callback) {
  console.log('\nappendComments passed ' + passed_date)
  var data2 = [];
  async.forEach(
    data, 
    function(card, callback2) {
      api.get('/1/cards/' + card.card_id + '/actions', {filter:'commentCard'}, function(err, comments) {
        tick();
        comments.forEach( function (comment) {
          var comment_date = new Date(comment.date);
          if(passed_date.getTime() < comment_date.getTime()) {
            card.owner = comment.memberCreator.fullName;
            if(!card.comments) card.comments = [];
            card.comments.push( { 'text' : comment.data.text, 'date' : comment_date } );
          }
        });

        if(card.comments) {
          data2.push(card);
        }
        callback2(null);
      });
    },
    function() {
      callback(null, data2);
    }
  );
}

exports.createStatus = module.exports.createStatus = createStatus;

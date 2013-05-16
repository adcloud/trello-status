var Trello = require('node-trello'),
     async = require('async'),
    moment = require('moment');

var api;
var boards;

var tick = function() { process.stdout.write('.') };

var createStatus = function(api_key, api_token, boards2, passed_date2, callback) {
  api = new Trello(api_key, api_token);
  boards = boards2;
  passed_date = passed_date2;

  async.waterfall([
    getBoards,
    appendListAndCardInfos,
    appendComments,
    appendCardMember,
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
      api.get('/1/board/' + item.board_id + '/lists/open', {'cards':'open'}, function(err, lists) {
        console.log('Got response for board ' + item.board_id);
        if(err) throw err;
        console.log('Found ' + lists.length + ' lists');
        if(err) throw err;
        lists.forEach( function (list) {
          var list_name = list.name;
          var list_id = list.id;
          if(list.cards)
            console.log('Found ' + list.cards.length + " cards for list " + list_name);

          list.cards.forEach( function(card) {
            var card_name = card.name;
            data2.push({ 
              card_id: card.id, 
              list_name : list_name,
              card_name : card_name,
              id_members : card.idMembers,
              url: card.url,
              labels: card.labels,
              members: []
            });
          });
        });
        callback2(null);
      });
    },
    function() {
      callback(null, data2);
    }
  );
}


var appendComments = function(data, callback) {
  console.log('\nAppending comments passed ' + passed_date)
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

        if(card.comments) data2.push(card);
        callback2(null);
      });
    },
    function() {
      callback(null, data2);
    }
  );
}

var appendCardMember = function(data, callback) {
  console.log('\nAppending members')
  var data2 = [];
  async.forEach(
    data,
    function(card, callback2) {
      //TODO cache member names
      card.id_members.forEach( function(member_id) {
        api.get('/1/members/' + member_id, {}, function(err, member) {
          tick();
          card.members.push(member.fullName);
          data2.push(card);
          callback2(null);
        });
      });
    },
    function() {
      callback(null, data2);
    }
  );
}

exports.createStatus = module.exports.createStatus = createStatus;


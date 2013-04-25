var stats = require('./lib/status'),
   config = require('./config'),
   moment = require('moment');

var boards = [];
boards.push({ board_name : 'Product Board', board_id: '4f71c65cdbc70d8a1a8bcf85'});

// create a map with cards by label
var cardsByLabel = function(cards) {
  var cards_by_label = {};
  cards.forEach( function( card ) {
    var labels = [];
    card.labels.forEach( function(l) { labels.push(l.name); });
    labels.sort();
    var label = labels.join();
    if(!cards_by_label[label]) {
      cards_by_label[label] = [];
    } 
    cards_by_label[label].push(card);
  });
  return cards_by_label;
}

var cb = function(data, callback) {
  console.log('\n\n\nSummary:')

  var cards_by_label = cardsByLabel(data);
  for (var label in cards_by_label) {
    console.log('\n\n\nTeam: ' + label);
    var cards = cards_by_label[label];
    cards.forEach(function(card) {
      var comment = card.comments[0]; //TODO
      console.log(' - "' + card.card_name + '" (Currently in ' + card.list_name + ')');
      console.log('   Comment from ' + moment(comment.date).format('DD.MM.:'), comment.text);
    //console.log(' ' + comment.text);
    //console.log(' - for more info contact ' + card.id_members) //WRONG owner
      console.log('   Details: ' + card.url );
      console.log('   Contact: ' + card.members.join() );
    })
  }
  



}

stats.createStatus(config.api_key, config.api_token, boards, config.passed_date, cb);

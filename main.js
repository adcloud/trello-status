var stats = require('./lib/status'),
   config = require('./config'),
   moment = require('moment');

var boards = [];
boards.push({ board_name : 'Product Board', board_id: '4f71c65cdbc70d8a1a8bcf85'})

var cb = function(data, callback) {
  console.log('\n\n\nSummary:')
  data.forEach( function( card ) {
    var comment = card.comments[0]; //TODO
    var label = card.labels[0]; //TODO

    console.log('\nTeam: ' + label.name);
    console.log(' Update on "' + card.card_name + '". Currently in ' + card.list_name);
    //console.log(moment(comment.date).format(' - DD.MM.'), ': ', comment.text);
    console.log(' ' + comment.text);
    //console.log(' - for more info contact ' + card.id_members) //WRONG owner
    console.log(' See also ' + card.url );
  });
}

var passed_date = new Date(2013, 4-1, 24);
stats.createStatus(config.api_key, config.api_token, boards, passed_date, cb);

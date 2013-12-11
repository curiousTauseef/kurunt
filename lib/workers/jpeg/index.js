//
// Kurunt JPEG Worker
//
// JPEG binary image 'worker' for Kurunt, processing jpeg data.
// Version: 0.2
// Author: Mark W. B. Ashcroft (mark [at] kurunt [dot] com)
// License: MIT or Apache 2.0.
//
// Copyright (c) 2013 Mark W. B. Ashcroft.
// Copyright (c) 2013 Kurunt.
//


// must export 'work' module.
module.exports.work = function (message, wk, fn, callback) {

  // 'message.message' Format: string
  // Sample: "hello world"
  //
  // See: http://docs.kurunt.com/String_Worker

  //console.log('string@workers> MESSAGE: ' + require('util').inspect(message, true, 99, true));    // uncomment to debug message.

  // use try catch so can skip over invalid messages.
  try {
  
    // (1) convert the incoming message.message from buffer to string (text).
    var string = message.message.toString(wk['config']['encoding']);    // "hello world" or whatever sent.
    
    //console.log('string@workers> string: ' + require('util').inspect(string, true, 99, true));
    
    // (2) add string value to this attribute, which get's added to this messages: stores: schema.
    var attributes = [];
    attributes['text'] = string;    // "hello world" or whatever sent.

    // (3) return processed message (required) and attributes (optional, set manually within message otherwise) back to kurunt.
    return callback( [ message, attributes ] );
  
  } catch(e) {
    //console.log('string@workers> ERROR: ' + require('util').inspect(e, true, 99, true));     // uncomment to debug errors.
    return callback( false );
  }

};

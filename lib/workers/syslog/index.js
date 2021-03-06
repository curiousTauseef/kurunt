//
// Kurunt Syslog Worker
//
// Syslog 'worker' for Kurunt, processing rsyslog data.
// Version: 0.2
// Author: Mark W. B. Ashcroft (mark [at] kurunt [dot] com)
// License: MIT or Apache 2.0.
//
// Copyright (c) 2013-2014 Mark W. B. Ashcroft.
// Copyright (c) 2013-2014 Kurunt.
//


// must export 'work' module.
module.exports.work = function (message, wk, fn, callback) {

  // 'message.message' Format: <pre>timestamp userid tag[pid]: message
  // Sample (rsyslog): <13>Nov 11 14:57:16 marcoxps test[10108]: mary had a little lamb
  // To test syslog: logger -i -t test "mary had a little lamb"
  //
  // See: http://docs.kurunt.com/Syslog_Worker
  // See rsyslog: http://www.rsyslog.com/doc/syslog_parsing.html
  
  
  fn.logging.log('syslog@workers> MESSAGE: ', message);

  // use try catch so can skip over invalid messages.
  try {
  
    // convert the incoming message.message from buffer to string.
    var syslog = message.message.toString(wk['config']['encoding']);
		
		fn.logging.log('syslog@workers> syslog: ', syslog);

		try {
		
			syslog = syslog.replace("  ", " ", "g");		// BUG FIX, replace any double spaces like: '<46>Feb  7 12:23:50 comp rsyslogd: groupid changed to 101'
		
			var regex = /^\<(.*?)\>(\S+) (\S+) (\S+) (\S+) (\S+) (.*?)$/;
		  var values = syslog.match(regex);  
		      
		  fn.logging.log('syslog@workers> values: ', values);

			var timestamp = values[2] + ' ' + values[3] + ' ' + new Date().getFullYear() + ' ' + values[4] + ' UTC';		// form date time for parsing.

		  var dt = Date.parse(timestamp);
		  unixtime = parseInt(dt / 1000);	
		  
		  var tag = values[6];
			var pid = 0;
			if ( tag.indexOf('[') != -1 ) {
				pid = Number(tag.substring(tag.indexOf('[') + 1, tag.indexOf(']')));
				tag = tag.substring(0, tag.indexOf('['));
			}
			if ( tag.substring(tag.length -1) === ':' ) {
				tag = tag.substring(0, tag.length -1);
			}

			var attributes = [];

		  attributes['pre'] = values[1];		// could set as number if sure all are!
		  attributes['unixtime'] = unixtime;
		  attributes['userid'] = values[5];
		  attributes['tag'] = tag;
		  attributes['pid'] = pid;

			if ( config["trim_message"] ) {
		  	attributes['message'] = values[7].trim();
		  } else {
		  	attributes['message'] = values[7];
		  }

		} catch(rxe) {
			// something irregular about the format for this syslog, so will set within attributes['message'].
			var attributes = [];
			fn.logging.log('syslog@workers> err, iregular syslog format.');
			if ( config["trim_message"] ) {
		  	attributes['message'] = syslog.trim();
		  } else {
		  	attributes['message'] = syslog;
		  }
		}

    // return processed message (required) and attributes (optional, set manually within message otherwise) back to kurunt.
    return callback( [ message, attributes ] );
  
  } catch(e) {
    fn.logging.log('syslog@workers> ERROR: ', e);
    return callback( false );
  }

};


var config = {
	"name": "syslog",
	"title": "Syslog",	
	"description": "Syslog, for processing rsyslog data.",
	"icon": "",
	"url": "http://docs.kurunt.com/Syslog_Worker",
	"version": 0.2,	
	"date_mod": "10/22/2013",
	"inputs": [ "tcp", "udp" ],
	"reports": [ "stream" ],
	"encoding": "utf8",
	"trim_message": true,	
	"stores": [
		{
			"stream": {
				"schema": {
					"userid": { },
					"pid": { },
					"tag": { },
					"pre": { },					
					"unixtime": { },
					"message": { }
				}
			}
		},
		{
			"mongo": {
				"schema": {
					"userid": { },
					"pid": { },
					"tag": { },
					"pre": { },					
					"unixtime": { },
					"message": { }
				}
			}
		},
		{
			"redis": {
				"schema": {
					"userid": { },
					"pid": { },
					"tag": { },
					"pre": { },					
					"unixtime": { },
					"message": { }
				}
			}
		},
		{
			"mysql": {
				"schema": {
					"userid": { "type": "varchar(128)" },
					"pid": { "type": "INT" },
					"tag": { "type": "varchar(128)" },
					"pre": { "type": "varchar(128)" },					
					"unixtime": { "type": "BIGINT" },
					"message": { "type": "varchar(512)" }
				}
			}
		}				
	]
};
exports.config = config;		// must export the config so kurunt can read it.

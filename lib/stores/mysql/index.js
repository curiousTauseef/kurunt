//
// Kurunt MySQL Store
//
// MySQL Store
// Version: 0.2
// Author: Mark W. B. Ashcroft (mark [at] kurunt [dot] com)
// License: MIT or Apache 2.0.
//
// Copyright (c) 2013-2014 Mark W. B. Ashcroft.
// Copyright (c) 2013-2014 Kurunt.
//


var config = {
	"name": "mysql",
	"encoding": "utf8",
	"db": "kurunt",
	"host": "localhost",
	"user": "root",
	"pass": "pass"
};
exports.config = config;		// must export the config so kurunt can read it.


var connection	= undefined;


module.exports.init = function (processID, cf, fn) {

	try {

		var mysql = require('mysql');
		// NOTE: set your own mysql credentials...
		connection = mysql.createConnection({
			host     : config['host'],
			user     : config['user'],
			password : config['pass'],
		});

		connection.connect(function(err) {
			if (err) throw err;
			fn.logging.log('mysql@store> db connected.');
		});

		connection.on('error', function(err) {
			fn.logging.log('mysql@store> error code: ' + err.code + ' error message: ' + err.message);
		});

	} catch(e) {
		fn.logging.log('mysql@store> To use the MySQL store you\'ll need to install the mysql module: npm install mysql -g');
	}

};



// must export 'store' module.
module.exports.store = function (message, fn, callback) {

  // See: http://docs.kurunt.com/MySql_Store

  fn.logging.log('mysql@stores, MESSAGE>', message);    // uncomment to debug message.
	
  // use try catch so can skip over invalid messages.
  try {
  
  	if ( connection === undefined ) {
  		return callback( false );
  	}
  
  	// NOTE: you can write your mysql store anyway you prefer! 
  	// You could also apply batch inserting to make this faster.
  	
  	// NOTE: in this example the 'worker' is the db table and it's schema is used as the db table schema.

		var table = message.worker.object.toString() + '_' + message.apikey.toString();		// uses the workers schema to define table structure, so table is message.worker (name) and message.apikey.

		// in this example is setting a ID auto increment primary key and a _ID as message.id.
		var sql_table = 'CREATE TABLE IF NOT EXISTS `' + config['db'] + '`.`' + table + '` (`id` int NOT NULL AUTO_INCREMENT, `message_id` bigint NOT NULL,'

		var sql_insert = 'INSERT INTO `' + config['db'] + '`.`' + table + '` ';
		var sql_insert_fields = '(message_id,';
		var sql_insert_values = '(\'' + message.id.uid + '\',';

		var hasdata = false;
		// extract data from 'mysql' schema.
		
		for ( var s in message.stores ) {
			//console.log('s: ' + s + ' value: ' + message.stores[s]);
			for ( var st in message.stores[s] ) { 
				//console.log('st: ' + st + ' value: ' + message.stores[s][st]);
				if ( st === config['name'] ) {
				
        	// NOTE: data, as set by stores.schema will need to be cloned if want complete seperation from original message stores.schema.
          //var dataObj  = message.stores[s]['mysql'];		// faster but effects original message shema.
          var dataObj  = JSON.parse(JSON.stringify(message.stores[s]['mysql']));		// this will slow kurunt, use line 86 otherwise.				

					//console.log('mysql> dataObj: ' + require('util').inspect(dataObj, true, 99, true));
				
					// schema items are a collection of objects, key = name of object.
					var schemaItems = Object.keys(dataObj['schema']);
	
					//console.log('index@workers> schemaItems: ' + require('util').inspect(schemaItems, true, 99, true));
				
					schemaItems.forEach(function(item) {
						hasdata = true;
						//console.log('mysql> attr: ' + require('util').inspect(dataObj['schema'][item], true, 99, true));
						
						sql_table += '`' + item + '` ' + dataObj['schema'][item]['type'] + ',';
					
						sql_insert_fields += item + ',';	
					
						//console.log('mysql> value: ' + require('util').inspect(dataObj['schema'][item]['value'], true, 99, true));
						// if the value is itself a object as mysql is one dimentional, stringify object.
						if ( typeof(dataObj['schema'][item]['value']) === 'object' ) {
							dataObj['schema'][item]['value'] = JSON.stringify(dataObj['schema'][item]['value']);
						}
						
						
						if ( dataObj['schema'][item]['value'] === undefined ) {
							sql_insert_values += 'null,';
						} else {
							sql_insert_values += connection.escape(dataObj['schema'][item]['value']) + ',';		// should escape values to avoid SQL injection attacks.
						}					
						
					});		
				
				}
			}
		}

		//sql_table = sql_table.substring(0, sql_table.length - 1);		// trim off trailing ',' 
		sql_insert_fields = sql_insert_fields.substring(0, sql_insert_fields.length - 1);		// trim off trailing ','
		sql_insert_values = sql_insert_values.substring(0, sql_insert_values.length - 1);		// trim off trailing ','
		
		sql_table += ' PRIMARY KEY (`id`), KEY (`message_id`))';		// end sql.
		//console.log('mysql sql_table> ' + sql_table);
		
		sql_insert += sql_insert_fields + ') VALUES ' + sql_insert_values + ')';
		//console.log('mysql sql_insert> ' + sql_insert);

		if ( hasdata === false ) {		
			return callback( false );
		}

		connection.query('CREATE DATABASE IF NOT EXISTS `' + config['db'] + '`', function(err) {
			if (err) throw err;
			//if (err) return callback( true );
			
			connection.query(sql_table, function(err) {
				if (err) throw err;
				//if (err) return callback( true );
			
				connection.query(sql_insert, function(err, rows, fields) {
					if (err) throw err;
					//if (err) return callback( true );

					//console.log('The solution is: ', rows[0].solution);
				});
				
			});
			
		});
		
		
		// NOTE: for example to query a table named 'string_5555' in SQL> use kurunt; show tables; describe string_5555; select * from string_5555;
		

		// return true for grabage collection.
    return callback( true );
  
  } catch(e) {
  	fn.logging.log('mysql@stores, ERROR> ', e);
    return callback( false );
  }

};


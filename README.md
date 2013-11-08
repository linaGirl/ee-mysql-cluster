

mysql cluster implementation.




	var MySQLCluster = require( "ee-mysql-cluster" );




	var cluster = new MySQLCluster( [
		  timeout: 5000
		, procedures: [ "createTickets", "createLogs" ]
		, functions: [ "deleteLogs" ]
	] );


	// master, allow 50 concurrent connections
	var node = cluster.addNode( {		
		  host: ""
		, port: 0
		, user: ""
		, pass: ""
		, maxConnections: 50
	} );

	// slave, allow 2k concurrent connections
	var node2 = cluster.addNode( {		
		  host: ""
		, port: 0
		, user: ""
		, pass: ""
		, readonly: true
		, maxConnections: 2000
	} );


	// you can only query on the transaction object
	// but there is no need to start a transaction on it
	cluster.transaction( function(err, transaction ){

		// optional
		transaction.start();

		transaction.query( "", [], function( err, result ){
			if ( err ) transaction.rollback();
			else {
				transaction.query( "", [], function( err, result ){
					if ( err ) transaction.rollback();
					else transaction.commit( function( err ){
						if ( err ) log( "not good!" );
						else {
							log( "nice!" );
						}
					} );
				} );
			}
		} );
	} );



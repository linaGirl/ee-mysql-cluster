


	var   Class 		= require( "ee-class" )
		, Events 		= require( "ee-event-emitter" );




	module.exports = new Class( {
		inherits: Events

		// can this transaction be used for queries?
		, open: true

		// was a transaction openend?
		, transaction: false


		, init: function( cluster ){
			this.cluster = cluster;

			// this is used to check if a query does reads or writes
			this._writeReg = /UPDATE|GRANT|DELETE|CREATE|INSERT|DROP|TRUNCATE|CALL|SELECT INTO/i
			this._bleedReg = /SET|TRANSACTION|DECLARE|CALL|DELIMITER|RETURNS|BEGIN|EXEC/i
		}


		, query: function( query, parameters, callback ){
			if ( typeof parameters === "function" ) callback = parameters, parameters = undefined;

			this.cluster.getConnection( function( err, connection ){
				if ( err ) callback( err );
				else {
					if ( this.transaction ){
						connection.query( "START TRANSACTION;" );
					} 
					else connection.query( query, parameters, callback );
				}
			}.bind( this ) );
		}


		, _writeQuery: function( query ){

		}


		, start: function(){
			this.transaction = true;
		}


		, commit: function(){

		}


		, rollback: function(){

		}

	} );
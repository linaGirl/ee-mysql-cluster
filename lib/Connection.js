


	var   Class 		= require( "class" )
		, Events 		= require( "ee-event-emitter" )
		, myslq			= require( "mysql" )
		, log 			= require( "ee-log" );



	module.exports = new Class( {
		inherits: Events

		// do we need to close this connection becuase
		// of the risk tto bleed into the next query?
		, closeOnFree: false

		// open connection?
		, open: false


		, init: function( config ){

			this._createConnection( config );

			// we need to check if there is anything executed which will start bleeding
            this._bleedReg = /SET|TRANSACTION|DECLARE|CALL|DELIMITER|RETURNS|BEGIN|EXEC|LOCK/i
		}



		, _createConnection: function( config ){
			this.connection = mysql.createConnection( config );
			this.connection.connect( function( err ){
				if ( err ) this._handleConnectionError( err );
				else {
					this.open = true;
					this.emit( "connect", this );
				}
			}.bind( this ) );

			this.connection.on( "error", this._handleConnectionError.bind( this ) );
		}



		, _handleConnectionError: function( err ){
			switch ( err.code ){
				case "ER_TOO_MANY_USER_CONNECTIONS":
				case "ER_CON_COUNT_ERROR":
					this.emit( "tooManyConnections", this );
					break;

				case "PROTOCOL_CONNECTION_LOST":
					this.emit( "connectionLost", this );
					break;

				default: 
					this.emit( "error", err, this );
			}

			log.warn( "mysql-cluster connection error: " + err.code );

			this.emit( "close", err, this );
		}



		, query: function( query, parameters, callback ){
			if ( !this.open ) callback( new Error( "The connection was clsoed, could not execute the query!" ).setName( "ConnectionClosedException" ) );
			else {
				this._bleedReg.lastIndex = 0;
				if ( this._bleedReg.test( query ) ) this.closeOnFree = true;

				this.connection.query( query, parameters, callback );
			}
		}


		// return the connection to the pool
		, free: function(){
			if ( this.closeOnFree ) this.close();
			else this.emit( "free", this );
		}


		, close: function(){
			this.connection.end();
		}
	} );
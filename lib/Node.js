

	var   Class 		= require( "ee-class" )
		, EventEmitter	= require( "ee-event-emitter" )
		, type 			= require( "ee-types" );


	var   Connection 	= require( "./Connection")




	module.exports = new Class( {
		inherits: EventEmitter


		, maxConnections: 50 
		, connections: []


		, connecting: false
		, online: false



		, init:  function( options ){
			if ( type.number( options.maxConnections ) ) ? this.maxConnections = options.maxConnections;
			this.config = options;
		}


		// return a connection
		, getConnection: function( callback ){
			if ( this.connecting ) callback( new Error( "Cannot create two connections at the same time!" ).setName( "ConnectingInProgressException" ) );
			else if ( this.connections.length >= this.maxConnections ) callback( new Error( "Maximum connections reached for host, aborting!" ).setName( "MaxConnectionsReachedException" ) );
			else {
				this.connecting = true;
				var connection = new Connection( this.config );

				var closeHandler = function(){
					// this is called when the connection could not be established
					log.warn( "failed to create conenction to db «%s:%s», retrying in 2 secs ..", this.config.host, this.config.port );
					setTimeout( this.getConnection.bind( this ), 2000, callback );
				}.bind( this );

				connection.on( "close", closeHandler );

				connection.on( "connect", function(){
					this.connecting = false;
					if ( !this.online ) this.online = true;

					// remove the original close handler
					connection.off( "close", closeHandler );

					// add a new one
					connection.on( "close", function( err ){
						var idx = this.connections.indexOf( connection );
						if ( idx >= 0 ) this.connections.splice( idx, 1 );
					}.bind( this ) );

					// store
					this.connections.push( connection );

					// return
					callback( null, connection );
				}.bind( this ) );
			}			
		}
	} );
	
	
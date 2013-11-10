


	var   Class 		= require( "ee-class" )
		, Events 		= require( "ee-event-emitter" )
		, Arguments 	= require( "ee-arguments" );




	module.exports = new Class( {
		inherits: Events

		// is this transaction finisehd?
		, finished: false

		
		// does this transaction make use of a mysql transaction?
		, transaction: false

		// was the start transaction command sent to the server
		, transactionStarted: false

		// was the commit / roolback comand sent to the server?
		, transactionEnded: false

		// the connection we're working on
		, connection: null



		, init: function( cluster ){
			this.cluster = cluster;
		}


		, query: function(){
			var   args 			= new Arguments( arguments )
				, readonly 		= args( "boolean", false )
				, callback 		= args( "function", function(){} )
				, query 		= args( "string", "SELECT 1;" )
				, parameters 	= args( "array", [] );

			if ( this.finished ) callback( new Error( "The transaction was finished already, cannot execute another query on it!" ).setName( "TransactionFinishedException" ) );
			else if ( this.transaction && this.transactionEnded ) callback( new Error( "The transaction has ended already, cannot execute another query on it!" ).setName( "TransactionEndedException" ) );
			else {
				if ( this.transaction && this.connection ){
					this._doTransactionalQeries( query, parameters, callback );
				}
				else {
					this.emit( "connectionRequest", readonly, function( err, connection ){
						this.connection = connection;

						if ( !this.transaction ){
							// single query
							this.connection.query( query, parameters, function( err, results ){
								this.finished = true;
								this.connection.free();
								callback( err, results );
							}.bind( this ) );
						}
						else {
							this._doTransactionalQeries( query, parameters, callback );
						}
					}.bind( this ) );
				}
			}
		}


		, _doTransactionalQeries: function( query, parameters, callback ){
			if ( !this.transactionStarted ){
				this.transactionStarted = true;
				this.connection.query( "START TRANSACTION;" );
			}

			this.connection.query( query, parameters, callback );
		}


		, start: function(){
			this.transaction = true;
		}


		, commit: function( callback ){
			this._end( true, callback );
		}


		, rollback: function( callback ){
			this._end( false, callback );
		}


		, _end: function( commit, callback ){
			var query = commit ? "commit" : "rollback";

			if ( !this.transaction ) callback( new Error( "cannot "+query+" on a non transaction!" ).setName( "NotATransactionException" ) );
			else if ( this.finished ) callback( new Error( "The transaction was finished already, cannot "+query+"!" ).setName( "TransactionFinishedException" ) );
			else if ( this.transactionEnded ) callback( new Error( "The command "+query+" was already sent, cannot "+query+" twice!" ).setName( "TransactionEndedException" ) );
			else {
				this.transactionEnded = true;
				this.connection.query( query + ";" , function( err ){
					this.finished = true;
					this.connection.free();
					callback( err );
				}.bind( this ) );
			}
		}

	} );
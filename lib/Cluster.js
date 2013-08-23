


	var   Class 		= require( "ee-class" )
		, EventEmitter	= require( "ee-event-emitter" )
		, log 			= require( "ee-log" )
		, type 			= require( "ee-types" )
		, mysql 		= require( "mysql" );


	var Node 			= require( "./Node" );





	module.exports = new Class( {
		inherits: EventEmitter

		, nodes: []
		, nodeIdConter: 0

		, masterConnections: []
		, slaveConnections: []

		, queue: []


		, init: function( options ){
		}


		, getConnection: function( role, callback ){
			if ( role === "master" && this.masterConnections.length > 0 ) callback( this.masterConnections.shift() );
			else if ( role === "slave" && this.slaveConnections.length > 0 ) callback( this.slaveConnections.shift() );
			else this.requestConnection( role, callback );
		}


		, requestConnection: function( role, callback ){
			if ( role )
		}


		, addNode: function( id, config ){
			if ( type.object( id ) ) config = id;
			id = ++this.nodeIdConter;

			new Node( { 
				  id: id
				, config: config 
				, on: {
					  load: 		this.onNodeLoad
					, connection: 	this.onConnection
				}
			} );

			return id;
		}

		, onNodeLoad: function( node ){
			this.nodes.push( node );
		}

		, onConnection: function( connection ){
			this.nodes.push( connection );
		}



		, removeNode: function( id ){
			for( var i = 0, l = this.nodes.length; i < l; i++ ){
				if ( this.nodes[ i ].id === id ){
					var node = this.nodes.splice( i, 1 )[ 0 ];
					node.end();
					return node;
				}
			}
		}
	} );
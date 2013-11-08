


	var   Class 		= require( "ee-class" )
		, Events 		= require( "ee-event-emitter" )
		, log 			= require( "ee-log" )
		, Options 		= require( "ee-options" );


	var   LoadBalancer 	= require( "./lb/Weigthed" )
		, Transaction 	= require( "./Transaction" );



	module.exports = new Class( {
		inherits: Events

		, nodes: {}


		, init: function( options ){
			var o = new Options( this, options );
			o( "timeout", "number", 10000 );

			this.lb = new LoadBalancer( this );
		}


		// return a transaction to the calling code
		, transaction: function(){
			return new Transaction( this );
		}


		, addNode: function( config ){
			var node = new Node( config );
			this.nodes[ node.id ] = node;
			this.emit( "nodeAdded", node );
			return node;
		}


		, removeNode: function( node ){
			if ( this.nodes[ node.id ] ) {
				var node = this.nodes[ node.id ];
				delete this.nodes[ node.id ];
				this.emit( "nodeRemoved", node );
				return true;
			}
			return false;
		}
	} ); 



	var   Class 		= require( "ee-class" )
		, Events 		= require( "ee-event-emitter" )
		, log 			= require( "ee-log" )
		, type 			= require( "ee-types" )
		, crypto 		= require( "crypto" );




	module.exports = new Class( {
		inherits: Events

		, nodes: []
		, index: 0


		, init: function( cluster ){
			this.cluster = cluster;
			this.cluster.on( "nodeAdded", this.handleAddedNode.bind( this ) );
			this.cluster.on( "nodeRemoved", this.handleRemovedNode.bind( this ) );
		}
		

		, getNode: function( index ){

			// move the index to the next node
			if ( !type.number( index ) ) {
				this.index = this.index === this.nodes.length - 1 ? 0 : this.index + 1;	
				index = this.index + 1;
			}
			else index++;

			if ( index === this.nodes.length ) index = 0;

			// return the first node with free connections
			// or the first node originally selected if there aren't any free connections
			if ( this.nodes.length === 1 ) return this.nodes[ 0 ];
			else if ( index !== this.index ) return this.nodes[ index ].freeConnections > 0 ? this.nodes[ index ] : this.getNode( index );
			else return this.nodes[ index ];
		}



		, handleRemovedNode: function( node ){
			var num = node.weigth || 1, x = false;
			while( num-- ) {
				if ( !x ) this.nodes.push( node );
				else this.nodes.unshift( node );
				x = !x;
			}
		}

		, handleAddedNode: function( node ){
			var idx;
			while( idx = this.nodes.indexOf( node ) ) this.nodes.splice( idx, 1 );
		}
	} ); 
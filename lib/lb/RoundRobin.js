


	var   Class 		= require( "ee-class" )
		, Events 		= require( "ee-event-emitter" )
		, log 			= require( "ee-log" )
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


		, getNode: function(){
			this.index++;
			if ( this.index === this.nodes.length ) this.index = 0;
			return this.nodes[ this.index ];
		}



		, handleRemovedNode: function( node ){
			this.nodes.push( node );
		}

		, handleAddedNode: function( node ){
			var idx = this.nodes.indexOf( node );
			if ( idx >= 0 ) this.nodes.splice( idx, 1 );
		}
	} ); 
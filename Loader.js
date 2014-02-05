define("core/Loader", [
	"dojo/_base/declare",
	"dojo/dom",
	"dojo/dom-construct"
], function(declare, dom, domConstruct){
	return declare("core.Loader", {
			hide: function(){
				domConstruct.destroy(dom.byId('loader'));
			},
			show: function(){
				// create a div node
				var node = domConstruct.create("div", { id: 'loader'});

				// get a reference to another node
				var refNode = dom.byId("htmlbody");

				// place the constructed node at the referenced node
				domConstruct.place(node, refNode);
			}
		}
	);
});
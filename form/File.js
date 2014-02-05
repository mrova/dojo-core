define("core/form/File", [
	"dojo/_base/declare", // declare
	"dojox/form/Uploader",
	"dijit/registry"
], function(declare, uploader, dijitRegistry){

	var file = declare("core.form.File", [uploader], {
		required: false,
		url:"/uploads/default/add",

		postCreate: function(){
			console.log('postCreate');
		},

		onChange: function(/*Array*/ fileArray){
			this.containerNode.innerHTML = this._files[0].name;
			dijitRegistry.byNode(query('.submit .dijitButton', this.domNode)).set('disabled', false);
		}
	});

	return file;
});

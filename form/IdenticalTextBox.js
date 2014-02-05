define("core/form/IdenticalTextBox", [
	"dojo/_base/declare", // declare
	"dijit/form/ValidationTextBox",
	"dijit/registry"
], function(declare, ValidationTextBox, dijitRegistry){

	// module:
	//		core/form/IdenticalTextBox


	var IdenticalTextBox;
	return IdenticalTextBox = declare("core.form.IdenticalTextBox", ValidationTextBox, {
		field: '',

		// required: Boolean
		//		User is required to enter data into this field.
		required: true,

		validator: function(/*anything*/ value, /*__Constraints*/ constraints){
			// summary:
			//		Overridable function used to validate the text input against the regular expression.
			// tags:
			//		protected

			return value === dijitRegistry.byId(this.field).get('value');
		}
	});
});

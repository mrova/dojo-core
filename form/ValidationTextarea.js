define("core/form/ValidationTextarea", [
	"dojo/_base/declare", // declare
	"dojo/i18n", // i18n.getLocalization
	"dijit/Tooltip", // declare
	"dijit/form/Textarea",
	"dijit/form/ValidationTextBox",
	"dojo/i18n!dijit/form/nls/validate"
], function(declare, i18n, Tooltip, Textarea, ValidationTextBox){

	return declare("core.form.ValidationTextarea", [ValidationTextBox,Textarea], {
		rows: 10,
		cols: 83,
		invalidMessage: "This field is required",

		postCreate: function() {
			this.inherited(arguments);
		},

		validator: function(/*anything*/ value, /*__Constraints*/ constraints){
			// summary:
			//		Overridable function used to validate the text input against the regular expression.
			// tags:
			//		protected
			return (new RegExp("^(?:" + this._computeRegexp(constraints) + ")"+(this.required?"":"?")+"$", 'm')).test(value) &&
				(!this.required || !this._isEmpty(value)) &&
				(this._isEmpty(value) || this.parse(value, constraints) !== undefined); // Boolean
		},

		onFocus: function() {
			if (!this.isValid()) {
				this.displayMessage(this.getErrorMessage());
			}
		},

		onBlur: function() {
			this.validate(false);
		}

	});
});
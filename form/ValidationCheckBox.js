define("core/form/ValidationCheckBox", [
	"dojo/_base/declare", // declare
	"dojo/i18n", // i18n.getLocalization
	"dijit/Tooltip", // declare
	"dijit/form/CheckBox",
	"dojo/i18n!dijit/form/nls/validate"
], function(declare, i18n, Tooltip, CheckBox){

	return declare("core/form/ValidationCheckBox", [dijit.form.CheckBox], {
		required: true,

		promptMessage: "",

		// missingMessage: String
		//		The message to display if value is empty and the field is required.
		//		The translated string value is read from the message file by default.
		//		Set to "" to use the invalidMessage instead.
		missingMessage: "$_unset_$",

		// message: String
		//		Currently error/prompt message.
		//		When using the default tooltip implementation, this will only be
		//		displayed when the field is focused.
		message: "",

		// tooltipPosition: String[]
		//		See description of `dijit/Tooltip.defaultPosition` for details on this parameter.
		tooltipPosition: [],

		getErrorMessage: function(/*Boolean*/ /*===== isFocused =====*/){
			// summary:
			//		Return an error message to show if appropriate
			// tags:
			//		protected
			return this.missingMessage == "$_unset_$" ? this.messages.missingMessage : this.missingMessage; // String
		},

		getPromptMessage: function(/*Boolean*/ /*===== isFocused =====*/){
			// summary:
			//		Return a hint message to show when widget is first focused
			// tags:
			//		protected
			return this.promptMessage; // String
		},

		_refreshState: function(){
			if(this._created){
				this.validate(this.focused);
			}
			this.inherited(arguments);
		},

		_onClick: function(/*Event*/ e){
			// summary:
			//		Internal function to handle click actions
			var ok = this.inherited(arguments);

			this._refreshState();

			return ok;
		},

		validate: function(/*Boolean*/ isFocused){
			var isValid = this.disabled || this.checked;

			this._set("state", isValid ? "" : "Error");
			this.focusNode.setAttribute("aria-invalid", isValid ? "false" : "true");

			this.set("message", this.getErrorMessage(isFocused));

			return isValid;
		},

		displayMessage: function(/*String*/ message){
			// summary:
			//		Overridable method to display validation errors/hints.
			//		By default uses a tooltip.
			// tags:
			//		extension
			if(message && this.focused){
				Tooltip.show(message, this.domNode, this.tooltipPosition, !this.isLeftToRight());
			}else{
				Tooltip.hide(this.domNode);
			}
		},

		_onBlur: function(){
			this.displayMessage();

			this.inherited(arguments);
		},

		_setMessageAttr: function(/*String*/ message){
			this._set("message", message);
			this.displayMessage(message);
		},

		_setFocusedAttr: function(/*String*/ focused){
			this._set("focused", focused);
			this._refreshState();
		},

		_setRequiredAttr: function(/*Boolean*/ value){
			this._set("required", value);
			this.focusNode.setAttribute("aria-required", value);
			this._refreshState();
		},

		postMixInProperties: function(){
			this.inherited(arguments);
			this.messages = i18n.getLocalization("dijit.form", "validate", this.lang);
		}
	});
});
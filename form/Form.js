define("core/form/Form", [
	"dojo/_base/declare", // declare
	"dojo/_base/array",
	"dijit/form/Form",
	"dojo/window" // winUtils.scrollIntoView
], function(declare, array, Form, winUtils){

	return declare("core.form.Form", [dijit.form.Form], {
		validate: function(){
			// summary:
			//		returns if the form is valid - same as isValid - but
			//		provides a few additional (ui-specific) features:
			//
			//		1. it will highlight any sub-widgets that are not valid
			//		2. it will call focus() on the first invalid sub-widget
			var didFocus = false;
			return array.every(array.map(this._getDescendantFormWidgets(), function(widget){
				// Need to set this so that "required" widgets get their
				// state set.
				widget._hasBeenBlurred = true;
				var valid = widget.disabled || !widget.validate || widget.validate();
				if(!valid && !didFocus){
					// Set focus of the first non-valid widget
					winUtils.scrollIntoView(widget.containerNode || widget.domNode);
//					widget.focus();
					didFocus = true;
				}
				return valid;
			}), function(item){ return item; });
		}
	});
});
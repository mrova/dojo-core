define("core/dialog/Alert", [
	'dojo/_base/lang',
	'dojo/_base/declare',
	'dojo/dom-construct',
	'dojo/_base/Deferred',
	'dijit/Dialog',
	'dijit/form/Button'
], function(lang, declare, construct, Deferred, Dialog, Button) {

	return declare('core.dialog.Alert', [Dialog], {
		okButton: null,
		hasOkButton: true,
		hasUnderlay: true,
		dfd: null,

		/**
		 * Instantiates the confirm dialog.
		 */
		constructor: function(props) {
			lang.mixin(this, props);
		},

		/**
		 * Creates the OK/Cancel buttons.
		 */
		postCreate: function() {
			this.inherited('postCreate', arguments);

			var div = construct.create('div', { className: 'dialogAlertButtons'	}, this.containerNode, 'last');
			this.okButton = new Button({
				label: 'OK',
				onClick: lang.hitch(this, function() {
					this.hide();
				})
			}, construct.create('div'));
			div.appendChild(this.okButton.domNode);
		},

		/**
		 * Shows the dialog.
		 * @return {dojo/_base/Deferred}
		 */
		show: function() {
			this.inherited('show', arguments);
			if (!this.hasUnderlay) {
				construct.destroy(this.id + '_underlay');
			}
			this.dfd = new Deferred();
			return this.dfd;
		}
	});
});
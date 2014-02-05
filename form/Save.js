define("core/form/Save", [
	"dojo/_base/declare", // declare
	"dijit/form/Button",
	"dojo/request/iframe",
], function(declare, Button, iframe){

	return declare("core.form.Save", [Button], {
		onClick: function() {
			var form = this.domNode.parentNode.parentNode.form;

			this.attr('disabled', true);
			
			console.log(this);
			console.log(form);
			console.log(form.id);

			var promise = iframe.post('/uploads/default/add', {
				preventCache: true,
				form: form
			}).then(function(data){
				console.log('iframe.post(): ok');
				console.log(data);
				return true;
			}, function(err){
				console.log('iframe.post(): err');
				console.log(err);
				return false;
			});

			return false;
		}
	});
});

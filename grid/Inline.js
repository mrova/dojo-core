define([
	"dojo/_base/declare",
	"dojo/query",
	"dijit/Dialog",
	"core/dialog/Confirm",
	"dojo/on",
	"dojo/dom",
	"dojo/dom-class",
	"dojo/dom-attr",
	"dojo/dom-style",
	"dojo/dom-construct",
	"dijit/registry",
	"dojo/request",
	"dojo/window",
	"dojo/dom-geometry",
	"dojo/fx",
	"dojo/_base/fx",
	"dojo/fx/easing",
	"dijit/_WidgetBase",
	"dojo/_base/array",
	"dojo/NodeList-traverse",
	"dojo/NodeList-manipulate"
], function(declare, query, Dialog, Confirm, on, dom, domClass, domAttr, domStyle, domConstruct, dijitRegistry, request, winUtils, domGeometry, fx, basefx, easing, _WidgetBase, arrayUtil){

	return declare([_WidgetBase], {
		// module: string
		// 		moduł Zend
		module: '',

		// controller: string
		// 		kontroler Zend
		controller: '',

		postCreate: function() {
			this.module = this.get('module');
			this.controller = this.get('controller');
			var t = this;

			on(query("thead th.actions a.add", this.domNode), "click", this._createRow);
			on(query("tbody td.actions a.delete", this.domNode), "click", function(e) { return t._deleteRow(e, t, this); } );
		},

		startup: function() {
			var widgets = dijitRegistry.findWidgets(this.domNode);
			var t = this;
			arrayUtil.forEach(widgets, function(widget, i){
				on(widget, 'change', function(e) { return t._changeRow(e, t, this); } );
			});
		},

		_createRow: function(event) {
			event.preventDefault();
			event.stopPropagation();

			var toRefresh = dijitRegistry.byNode(dijitRegistry.getEnclosingWidget(this).domNode.parentElement);

			var options = {
					method: 'get',
					handleAs: "text"
			};
			request(this.href, options).then(function(data){
				toRefresh.refresh();
				return true;
			}, function(err){
				// Handle the error condition
				console.log(err);
				alert('Wystąpił błąd w trakcie komunikacji');
			});
		},

		_deleteRow: function(event, grid, t) {
			event.preventDefault();
			event.stopPropagation();

			var id = domAttr.get(query(t).parents('tr')[0], 'oid');
			var url = grid.url('delete', [{'name': 'id', 'value': id}]);

			var toRefresh = dijitRegistry.byNode(dijitRegistry.getEnclosingWidget(t).domNode.parentElement);

			var myDialog = new Confirm({
				title: this.title,
				content: 'Czy na pewno usunąć?',
				draggable: false,
				onHide: function(){
					this.destroyRecursive();
				}
			}).show().then(
				// OK
				function() {
					var options = {
						method: 'delete',
						handleAs: "json"
					};
					request(url, options).then(function(data){
						toRefresh.refresh();
						return true;
					}, function(err){
						// Handle the error condition
						console.log(err);
						alert('Wystąpił błąd w trakcie komunikacji');
					});
				}
			);
		},

		_changeRow: function(event, grid, t) {
			var id = domAttr.get(query(t.domNode).parents('tr')[0], 'oid');
			var url = grid.url('edit', [{'name': 'id', 'value': id}]);

			var options = {
				method: 'post',
				data: { 'name': t.get('name'), 'value': t.get('value') },
				handleAs: "json"
			};
			request(url, options).then(function(data){
				if (data.status != 'success') {
					if (data.status == 'error') {
						alert('Wystąpił błąd w trakcie zapisywania');
						console.log(data);
					}
					if (data.status == 'invalid') {
						alert('Formularz zawiera nieprawdiłowe dane');
						console.log(data);
					}
				} else {
					return true;
				}
			}, function(err){
				// Handle the error condition
				console.log(err);
				alert('Wystąpił błąd w trakcie komunikacji');
			});
		},

		url: function(action, params) {
			var url = '/' + this.module + '/' + this.controller + '/' + action;

			arrayUtil.forEach(params, function(v, i) {
				url = url + '/' + v.name + '/' + v.value;
			});

			return url + '/format/json';
		}

	});
});
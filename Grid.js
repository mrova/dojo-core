define([
	"dojo/_base/declare",
	"dojo/query",
	"dojo/mouse",
	"crm/app",
	"core/dialog/Grid",
	"core/dialog/Confirm",
	"dojo/on",
	'dojo/_base/array',
	"dojo/dom",
	"dojo/dom-class",
	"dojo/dom-attr",
	"dojo/dom-style",
	"dojo/dom-construct",
	"dijit/registry",
	"dojo/request",
	"dijit/_WidgetBase",
	"dojo/_base/array",
	"dojo/_base/event",
	"dojo/NodeList-traverse",
	"dojo/NodeList-manipulate"
], function(declare, query, mouse, app, Dialog, Confirm, on, array, dom, domClass, domAttr, domStyle, domConstruct, dijitRegistry, request, _WidgetBase, arrayUtil, event){

	return declare([_WidgetBase], {
		postCreate: function(){
			var t = this;
			on(query("thead th.sortable", this.domNode), "click", this._handleSorting);
			on(query("thead th.actions a.add, tbody td.actions a.edit", this.domNode), "click", function(e) { event.stop(e); return t._dialogForm(this); });
			on(query("tbody tr", this.domNode), "click", function(e) { event.stop(e); return t._dialogDetails(this); });
			on(query("tbody td.actions a.delete", this.domNode), "click", this._dialogDelete);
			on(query("form.filters", this.domNode), "submit", this._handleFilters);
			on(query("form.filters", this.domNode), "reset", this._handleReset);
			on(query("tfoot .pagination a", this.domNode), "click", this._handlePagination);
			on(query("a.print", this.domNode), "click", this._handlePrint);
			query(".download").on(mouse.enter, function(e) {
				window.onbeforeunload=null;
			});
			query(".download").on(mouse.leave, function(e) {
				window.onbeforeunload=app.onBeforeUnload;
			});

			if (parentWidget = dijitRegistry.getEnclosingWidget(this.domNode.parentNode)) {
				if (parentWidget.trigger == 'add') {
					parentWidget.trigger = false;
					query("thead th.actions a.add", this.domNode)[0].click();
				}
			}
		},

		showDialog: function(title, href, toRefresh) {
			dial = new Dialog({
				title: title,
				href: href,
				toRefresh: toRefresh
			});

			dial.show();
		},

		highlight: function(t) {
			query(".highlight", query(t).closest('.grid').parent()[0]).removeClass("highlight");
			domClass.add(query(t).closest('tr')[0], "highlight");
		},

		_dialogForm: function(t){
			this.highlight(t);
			this.showDialog(t.title, t.href, dijitRegistry.byNode(dijitRegistry.getEnclosingWidget(t).domNode.parentElement));
			return false;
		},

		_dialogDetails: function(t){
			this.highlight(t);
			var d = query("a.details", t)[0];

			if (d) {
				this.showDialog(d.title, d.href);

			} else {
				var d = query("a.download", t)[0];
				if (d) {
					document.location = d.href;
					return true;
				}
			}

			return false;
		},

		_dialogDelete: function(event){
			event.preventDefault();
			event.stopPropagation()
			var href = this.href.replace(/\/$/, '') + '/format/json';
			var toRefresh = dijitRegistry.byNode(dijitRegistry.getEnclosingWidget(this).domNode.parentElement);

			var myDialog = new Confirm({
				title: this.title,
				content: 'Czy na pewno usunąć?',
				draggable: false,
				onHide: function(){
					// refresh table
					toRefresh.refresh();
					this.destroyRecursive();
				}
			}).show().then(
				// OK
				function() {
					// process request
					var xhrArgs = {
						method: "delete",
						handleAs: "json"
					};

					request(href, xhrArgs).then(
						function(data) {
							console.log(data);
						},
						function(err) {
							console.log(err);
						}
					);
				}
			);
		},

		_handleFilters: function(event) {
			event.preventDefault();
			event.stopPropagation();

			var tab = dijitRegistry.byNode(dijitRegistry.getEnclosingWidget(this).domNode.parentElement);
			tab.href = 'contractors/default/list/query/' + query(".search", this)[0].value
				+ '/in/' + query(".searchIn:checked", this)[0].value
				+ '/group/' + query("#group", this).val()
				+ '/trade/' + query("#trade", this).val();
			tab.refresh();
		},

		_handleReset: function(event) {
			event.preventDefault();
			event.stopPropagation();

			var firstRadio = false;

			var elements = this.elements;

			for(i=0; i<elements.length; i++) {
				field_type = elements[i].type.toLowerCase();
				switch(field_type) {
					case "text":
					case "password":
					case "textarea":
					case "hidden":
						elements[i].value = "";
						break;
					case "radio":
						if (firstRadio === false) {
							firstRadio = i;
						}
					case "checkbox":
						if (elements[i].checked) {
							elements[i].checked = false;
						}
						break;

					case "select-one":
					case "select-multi":
						elements[i].selectedIndex = 0;
						break;

					default:
					break;
				}
			}

			if (firstRadio !== false) elements[firstRadio].checked = true;
		},

		_handlePrint: function(event) {
			event.preventDefault();
			event.stopPropagation();

			var href = this.href;
			if (dijit.byId('icc') && !dijit.byId('icc').get('checked')) {
				href += '/icc/h';
			}
			if (dijit.byId('ico') && !dijit.byId('ico').get('checked')) {
				href += '/ico/h';
			}
			if (dijit.byId('icf') && !dijit.byId('icf').get('checked')) {
				href += '/icf/h';
			}

			nw = window.open(href, 'printing','height=' + window.height + ',width=' + window.width + ',left:0,top:0');
			if (window.focus) {nw.focus();}
			nw.print();

			return false;
		},

		_handlePagination: function(event) {
			event.preventDefault();
			event.stopPropagation();

			var tab = dijitRegistry.byNode(dijitRegistry.getEnclosingWidget(this).domNode.parentElement);
			var href = tab.href;
			var page = this.href.match(/(\/page\/\d+)/)[0];
			if (tab.href.match(/\/page\/\d+/)) {
				href = tab.href.replace(/\/page\/\d+/, page);
			} else {
				href += page;
			}
			tab.href = href;
			tab.refresh();
		},

		_handleSorting: function(event) {
			event.preventDefault();
			event.stopPropagation();

			var tab = dijitRegistry.byNode(query(dijitRegistry.getEnclosingWidget(this).domNode).closest('.dijitContentPane')[0]);
			var href = tab.href;
			var fieldOrder = domAttr.get(this, 'order'); // nazwa pola do sortowania
			var fieldSort = domAttr.get(this, 'sort'); // kierunek sortowania

			var currentOrder = tab.href.match(/\/order\/([0-9a-zA-Z_]+)/i);
			if (currentOrder) {
				currentOrder = currentOrder[1];
			}

			var currentSort = tab.href.match(/\/sort\/(asc|desc)/i);
			if (currentSort) {
				currentSort = currentSort[1];
			}

			// ORDER: do href-a zawsze bierzemy fieldOrder

			// SORT
			// 1. jeśli currentOrder != fieldOrder to bierzemy fieldSort
			// 2. jeśli currentOrder == fieldOrder to:
			//    a) jeśli !currentSort to bierzemy fieldSort
			//    b) jeśli currentSort && currentSort == fieldSort to bierzemy negację
			//    c) jeśli currentSort && currentSort != fieldSort to usuwamy w ogóle sortowanie (przywracamy domyślne sortowanie z PHP)

			var finalSort, finalOrder;

			if (currentOrder != fieldOrder) {
				finalSort = fieldSort;
			} else {
				if (!currentSort) {
					finalSort = fieldSort;
				} else if (currentSort == fieldSort) {
					if (currentSort == 'asc') {
						finalSort = 'desc';
					} else {
						finalSort = 'asc';
					}
				} else if (currentSort != fieldSort) {
					currentOrder = null;
					finalSort = null;
				}
			}

			if (finalSort) {
				finalSort = '/sort/' + finalSort;
				finalOrder = '/order/' + fieldOrder;
			} else {
				finalSort = '';
				finalOrder = '';
			}

			if (tab.href.match(/\/order\/[0-9a-zA-Z_]+/)) {
				href = href.replace(/\/order\/[0-9a-zA-Z_]+/, finalOrder);
			} else {
				href += finalOrder;
			}

			if (currentSort) {
				href = href.replace(new RegExp('/sort/' + currentSort), finalSort);
			} else {
				href += finalSort;
			}

			tab.href = href;
			tab.refresh();
		}
	});
});
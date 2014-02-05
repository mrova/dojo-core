define([
	'dojo/_base/lang',
	'dojo/_base/declare',
	"dojo/aspect",
	"dojo/query",
	'dojo/dom-construct',
	'dojo/_base/Deferred',
	'dojo/_base/array',
	'dojo/on',
	"dijit/registry",
	'dijit/Dialog',
	'dijit/form/Button',
	'dijit/form/CheckBox',
	"dojo/sniff", // has("ie") has("opera") has("dijit-legacy-requires")
	"dojo/window", // winUtils.getBox, winUtils.get
	"dojo/dom-geometry", // domGeometry.position
	"dijit/layout/utils"
], function(lang, declare, aspect, query, construct, Deferred, array, on, dijitRegistry, Dialog, Button, CheckBox, has, winUtils, domGeometry, utils) {

	return  declare("core.dialog.Grid", [Dialog], {
		draggable: false,
		duration: 450,
		maxRatio: 0.99,
		toRefresh: false,
		preload: true,

		postCreate: function(){
			aspect.after(this, "onLoad", lang.hitch(this, "_afterLoad"), true);
			aspect.after(this, "hide", lang.hitch(this, "_afterHide"), true);

			this.inherited(arguments);
		},

		_afterLoad: function() {
			if (query('form', this.containerNode)) {
				dijitRegistry.byNode(query('form', this.containerNode)[0]).setDialog(this);
			}
		},

		_afterHide: function() {
			this.destroyRecursive();
			if (this.toRefresh) {
				this.toRefresh.refresh();
			}
		},

		resize: function(dim) {
			if(this.domNode.style.display != "none"){

				this._checkIfSingleChild();

				if(!dim){
//					if(this._shrunk){
//						// If we earlier shrunk the dialog to fit in the viewport, reset it to its natural size
//						if(this._singleChild){
//							if(typeof this._singleChildOriginalStyle != "undefined"){
//								this._singleChild.domNode.style.cssText = this._singleChildOriginalStyle;
//								delete this._singleChildOriginalStyle;
//							}
//						}
//						array.forEach([this.domNode, this.containerNode, this.titleBar], function(node){
//							domStyle.set(node, {
//								position: "static",
//								width: "auto",
//								height: "auto"
//							});
//						});
//						this.domNode.style.position = "absolute";
//					}

					// If necessary, shrink Dialog to fit in viewport and have some space around it
					// to indicate that it's a popup.  This will also compensate for possible scrollbars on viewport.
					var viewport = winUtils.getBox(this.ownerDocument);
					viewport.w *= this.maxRatio;
					viewport.h *= this.maxRatio;

					var bb = domGeometry.position(this.domNode);
					if(bb.w >= viewport.w || bb.h >= viewport.h){
						dim = {
							w: Math.min(bb.w, viewport.w),
							h: Math.min(bb.h, viewport.h)
						};
						this._shrunk = true;
					}else{
						this._shrunk = false;
					}
				}

				// Code to run if user has requested an explicit size, or the shrinking code above set an implicit size
				if(dim){
					// Set this.domNode to specified size
					domGeometry.setMarginBox(this.domNode, dim);

					// And then size this.containerNode
					var contentDim = utils.marginBox2contentBox(this.domNode, dim),
						centerSize = {domNode: this.containerNode, region: "center"};
					utils.layoutChildren(this.domNode, contentDim,
						[ {domNode: this.titleBar, region: "top"}, centerSize ]);

					// And then if this.containerNode has a single layout widget child, size it too.
					// Otherwise, make this.containerNode show a scrollbar if it's overflowing.
					if(this._singleChild){
						var cb = utils.marginBox2contentBox(this.containerNode, centerSize);
						// note: if containerNode has padding singleChildSize will have l and t set,
						// but don't pass them to resize() or it will doubly-offset the child
						this._singleChild.resize({w: cb.w, h: cb.h});
						// TODO: save original size for restoring it on another show()?
					}else{
						this.containerNode.style.overflow = "auto";
						this._layoutChildren();		// send resize() event to all child widgets
					}
				}else{
					this._layoutChildren();		// send resize() event to all child widgets
				}

				if(!has("touch") && !dim){
					// If the user has scrolled the viewport then reposition the Dialog.  But don't do it for touch
					// devices, because it will counteract when a keyboard pops up and then the browser auto-scrolls
					// the focused node into view.
					this._position();
				}
			}
		}
	});
});
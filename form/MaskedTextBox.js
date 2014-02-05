define("core/form/MaskedTextBox", [
	"dojo/_base/declare", // declare
	"dojo/i18n", // i18n.getLocalization
	"dijit/form/MappedTextBox",
	"dijit/form/_TextBoxMixin",
	"dojo/_base/event",
	"dojo/keys"
], function(declare, i18n, MappedTextBox, _TextBoxMixin, event, keys){

	// module:
	//		core/form/MaskedTextBox


	var MaskedTextBox = declare("core.form.MaskedTextBox", [MappedTextBox], {
		selectOnClick: false,

		// #FIXME: Sprawdzić czy _TextBoxMixin.selectInputText _TextBoxMixin._setSelectionRange nie robią tego samego co _setCaretPos i _getCaretPos
		_setCaretPos: function (begin, end) {
			if (typeof (begin) !== "number") {
				if (this.focusNode.setSelectionRange) {
					begin = this.focusNode.selectionStart;
					end = this.focusNode.selectionEnd;
				} else if (document.selection && document.selection.createRange) {
					var range = document.selection.createRange();
					begin = 0 - range.duplicate().moveStart("character", -100000);
					end = begin + range.text.length;
				}
				return {
					"begin": begin,
					"end": end
				};
			}

			end = (typeof (end) === "number") ? end : begin;
			if (this.focusNode.setSelectionRange) {
				var _t = this.focusNode;
				window.setTimeout(function() {
					return _t.setSelectionRange(begin, end);
				}, 0);
			} else {
				var range = this.focusNode.createTextRange();
				range.collapse(true);
				range.moveEnd("character", end);
				range.moveStart("character", begin);
				range.select();
				return range;
			}
		},

		_getCaretPos: function(){
			// khtml 3.5.2 has selection* methods as does webkit nightlies from 2005-06-22
			var pos = 0;
			if(typeof(this.focusNode.selectionStart) == "number"){
				// FIXME: this is totally borked on Moz < 1.3. Any recourse?
				pos = this.focusNode.selectionStart;
			} else if(has("ie")){
				// in the case of a mouse click in a popup being handled,
				// then the win.doc.selection is not the textarea, but the popup
				// var r = win.doc.selection.createRange();
				// hack to get IE 6 to play nice. What a POS browser.
				var tr = this.focusNode.ownerDocument.selection.createRange().duplicate();
				var ntr = this.focusNode.createTextRange();
				tr.move("character",0);
				ntr.move("character",0);
				try{
					// If control doesn't have focus, you get an exception.
					// Seems to happen on reverse-tab, but can also happen on tab (seems to be a race condition - only happens sometimes).
					// There appears to be no workaround for this - googled for quite a while.
					ntr.setEndPoint("EndToEnd", tr);
					pos = String(ntr.text).replace(/\r/g,"").length;
				}catch(e){
					// If focus has shifted, 0 is fine for caret pos.
				}
			}
			return pos;
		},

		_isSelected: function(){
			var startPos = this.focusNode.selectionStart;
			var endPos = this.focusNode.selectionEnd;

			return endPos-startPos > 0;
		},

		_replace: function(){
			i = this._getCaretPos();

			var cp = i;
			if (!this._isReservedChar(this.textbox.value.substr(i + 1, 1))) {
				cp += 1;
			}

			this.textbox.value = this.textbox.value.substr(0, i) + this.textbox.value.substr(i + 1);

			this._setCaretPos(cp);
		},

		_onBackspace: function(){
			i = this._getCaretPos();
			if (!this.textbox.value) {

			} else {
				if (i > 0) {
					this.textbox.value = this.textbox.value.substr(0, i-1) + this.placeHolder.substr(i-1, 1) + this.textbox.value.substr(i);
					this._setCaretPos(i-1);
				}
			}
		},

		_onDelete: function(){
			i = this._getCaretPos();
			this.textbox.value = this.textbox.value.substr(0, i) + this.placeHolder.substr(i, 1) + this.textbox.value.substr(i + 1);
			this._setCaretPos(i + 1);
		},

		_onBlur: function(/*Event*/ e){
			if(this.disabled || this.readOnly){ return; }

			if (!this.isValid()) {
				this.textbox.value="";
			}
			this.inherited(arguments);
		},

		_onFocus: function(/*String*/ by){
			if (!this.textbox.value) {
				this.textbox.value=this.placeHolder;
			}
			if(this.disabled){ return; }
			this.inherited(arguments);
			this._setCaretPos(0);
			_TextBoxMixin.selectInputText(this.textbox, 0, 0);
		},

		onInput: function(/*Event*/ e){
			if (e.ctrlKey || e.altKey || e.shiftKey || e.metaKey) {
				return true;
			}

			switch (e.keyCode) {
				case keys.BACKSPACE:
					this._onBackspace();
					event.stop(e);
					return false;

				case keys.DELETE:
					this._onDelete();
					event.stop(e);
					return false;

				case keys.UP_ARROW:
				case keys.LEFT_ARROW:
					this._setCaretPos(this._getCaretPos()-1);
					event.stop(e);
					return false;

				case keys.DOWN_ARROW:
				case keys.RIGHT_ARROW:
					this._setCaretPos(this._getCaretPos()+1);
					event.stop(e);
					return false;

				case keys.ESCAPE:
					event.stop(e);
					return false;

				case keys.END:
					this._setCaretPos(this.textbox.value.length);
					event.stop(e);
					return false;

				case keys.HOME:
					_TextBoxMixin.selectInputText(this.textbox, 0, 0);
					event.stop(e);
					return false;

				case keys.TAB:
					return true;

				default:
					if (this._isSelected()) {
						_TextBoxMixin.selectInputText(this.textbox, 0, 0);
					}
					return this._isValidChar(e.charOrCode);
			}
		},

		_onInput: function(/*Event*/ e){
			switch (e.keyCode) {
				case keys.TAB:
					return true;
				default:
					this._replace();
			}

			return true;
		},

		_isReservedChar: function(/*String*/ chr) {
			return /[a-zA-Z0-9_]/.test(chr);
		},

		_isValidChar: function(/*String*/ s) {
			i = this._getCaretPos();
			phc = this.placeHolder.substr(i, 1);

			switch (true) {
				case phc == '_':
					return true;

//				case /\d/.test(phc) && /\d/.test(s):
//					return true;
//
//				case /[a-zA-Z]/.test(phc) && /[a-zA-Z]/.test(s):
//					return true;

				case !this._isReservedChar(phc):
					this._setCaretPos(i + 1);
			}

			return false;
		}
	});

	return MaskedTextBox;
});

define("core/Caret",["dojo/_base/lang", "dojo/dom"], function (lang, dom) {
    if (dojo.caret) {
        return;
    }

    lang.mixin(dojo, {
        caret: function (node, begin, end) {
            if (typeof (node) === "string") {
                node = dom.byId(node);
            }

            if (!node) {
                throw new Error("Node is undefined.");
            }

            if (typeof (begin) !== "number") {
                if (node.setSelectionRange) {
                    begin = node.selectionStart;
                    end = node.selectionEnd;
                }
                else if (document.selection && document.selection.createRange) {
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
            if (node.setSelectionRange) {
                return node.setSelectionRange(begin, end);
            }
            else {
                var range = node.createTextRange();
                range.collapse(true);
                range.moveEnd("character", end);
                range.moveStart("character", begin);
                range.select();
                return range;
            }
        }
    });
});
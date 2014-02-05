define("core/form/Uploader", [
	"dojo/_base/declare",
	"dojox/form/Uploader",
	"dojo/_base/array"
],function(declare, uploader, arrayUtil){

	return declare("core.form.Uploader", [uploader], {
		uploadWithFormData: function(/*Object*/ data){
			// summary:
			//		Used with WebKit and Firefox 4+
			//		Upload files using the much friendlier FormData browser object.
			// tags:
			//		private

			if(!this.getUrl()){
				console.error("No upload url found.", this); return;
			}
			var fd = new FormData(), fieldName=this._getFileFieldName();
			arrayUtil.forEach(this._files, function(f, i){
				fd.append(fieldName, f);
			}, this);

			if(data){
				data.uploadType = this.uploadType;
				for(var nm in data){
					fd.append(nm, data[nm]);
				}
			}

			var xhr = this.createXhr();
			return xhr.send(fd);
		}
	});

});

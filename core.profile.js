var profile = {
	resourceTags : {
		amd : function(filename, mid) {
			return /\.js$/.test(filename);
		},
		declarative: function(filename){
		    return /\.js$/.test(filename);
		}
	}
}
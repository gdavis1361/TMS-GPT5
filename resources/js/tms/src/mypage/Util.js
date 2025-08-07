Ext.define('TMS.mypage.Util', {
	extend: 'Ext.util.Observable',
	singleton: true,
	statTypes: false,
	utilProcessingPage: '/at-ajax/modules/stats/util/',
	
	getStatTypes: function(){
		if(!this.statTypes){
			Ext.Ajax.request({
				scope: this,
				async: false,
				url: this.utilProcessingPage + 'stat-types',
				success: function(r){
					var response = Ext.JSON.decode(r.responseText);
					this.statTypes = response.records;
				}
			});
		}
		
		return this.statTypes;
	}
});
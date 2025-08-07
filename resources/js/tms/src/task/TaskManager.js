Ext.define('TMS.task.TaskManager', {
	extend:'Ext.util.Observable',
	processingPage:'/at-ajax/modules/task/process/',
	
	config: {
		checkIntervalWait:60000
	},
	
	constructor: function(config) {
		this.initConfig(config);
		this.initCheckInterval();
        return this;
    },
	
	initCheckInterval: function() {
		this.checkInterval = setInterval(Ext.Function.bind(this.checkNewNotifications, this), this.checkIntervalWait);
	},
	
	checkNewNotifications: function() {
		Ext.Ajax.request({
			scope:this,
			method:'post',
			url:this.processingPage + 'check-new',
			success: function(r) {
				var response = Ext.decode(r.responseText);
				if (response.newTasks) {
					TMS.task.NotifierInstance.show({
						title:response.title,
						content:response.content,
						url:response.url,
						icon:response.icon
					});
				}
			}
		});
	}
	
});
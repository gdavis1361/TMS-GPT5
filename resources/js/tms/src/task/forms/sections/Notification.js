Ext.define('TMS.task.forms.sections.Notification', {
	extend:'TMS.ActionWindow',
	
	//Config
	title:'Notification',
	processingPage:'/at-ajax/modules/task/process/',
	widthPercent: .9,
	heightPercent: .9,
	comment_id:0,
	bodyPadding:10,
	
	init: function() {
		if (this.comment_id) {
			this.loadData(this.comment_id);
		}
		this.initButtons();
		this.initListeners();
	},
	
	initButtons: function() {
		this.approveButton = Ext.create('Ext.button.Button', {
			scope:this,
			text:'Mark as Complete',
			handler:this.complete,
			scale:'medium',
			icon: '/resources/icons/check-24.gif'
		});
		this.addTopButton([
			this.approveButton
		]);
	},
	
	complete: function() {
		this.setLoading();
		Ext.Ajax.request({
			scope:this,
			method:'post',
			url:this.processingPage + 'complete-task',
			params:{
				taskId:this.task_id
			},
			success: function(r) {
				this.setLoading(false);
				var response = Ext.decode(r.responseText);
				this.fireEvent('taskcomplete');
				this.close();
			}
		});
	},
	
	initListeners: function() {
		
	},
	
	loadData: function(comment_id) {
		this.comment_id = comment_id || this.comment_id;
		Ext.Ajax.request({
			scope:this,
			method:'post',
			url:this.processingPage + 'get-comment',
			params:{
				comment_id:this.comment_id
			},
			success: function(r) {
				var response = Ext.decode(r.responseText);
				if (response.success) {
					this.update(response.comment);
				}
				else {
					this.update(response.errorStr);
				}
			}
		});
	}
	
});
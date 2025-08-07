Ext.define('TMS.task.view.Grid', {
	extend: 'TMS.grid.Grid',
	
	//Requires
	requires:[
		'TMS.TimeDifference'
	],
	
	//Config
	processingPage: '/at-ajax/modules/task/grid/',
	timeDifference:false,
	
	initComponent: function() {
		this.init();
		this.callParent(arguments);
	},
	
	//Init Functions
	init: function() {
		this.initColumns();
		this.initStore();
		this.initPager();
		this.initListeners();
	},
	
	initColumns: function() {
		this.columns = [{
			header: 'Description',
			dataIndex: 'task_type_id',
			flex: 4,
			renderer: function(value, a, record) {
				var str = '';
				if (record.data.user_id == record.data.myId || !record.data.claimable) {
					str = '<a class="task-link" href="' + record.data.taskUrl + '">' + record.data.taskDisplay + '</a>';
				}
				else {
					str = record.data.taskDisplay;
				}
				return str;
			}
		},{
			header: 'Created By',
			dataIndex: 'created_by',
			flex: 1,
			renderer: function(value, a, record) {
				if (record.data.user_id == record.data.user_id2) {
					return 'TMS';
				}
				else {
					
				}
				return record.data.created_by;
			}
		},{
			header: 'Assigned To',
			dataIndex: 'assigned_to',
			flex: 1,
			renderer: function(value, a, record) {
				if (record.data.employee_id == '0' && record.data.role_id && record.data.canClaim) {
					var str = '<div class="rounded5 button box-right">' +
							'<a href="#" class="claim-task-button" id="claim-task-' + record.data.task_id + '">Claim Task</a>' +
						'</div>';
					return str;
				}
				else if (record.data.employee_id == '0' && record.data.role_id) {
					return record.data.role_name;
				}
				return record.data.assigned_to;
			}
		},{
			header:'Due',
			dataIndex:'due_at',
			flex: 1
		},{
			header:'Duration',
			dataIndex:'created_at',
			flex: 1,
			xtype:'templatecolumn',
			tpl:'<span class="time-difference x-hidden">{created_at}</span>'
		}];
	},
	
	initStore: function(){
		this.store = new Ext.data.Store({
			fields: [
				'task_id',
				'role_id',
				'employee_id',
				'taskDisplay',
				'taskUrl',
				'created_by',
				'assigned_to',
				'myId',
				'user_id',
				'user_id2',
				'due',
				'duration',
				'due_at',
				'created_at',
				'canClaim',
				'role_name',
				'task_type_id',
				'claimable'
			],
			remoteSort: true,
			pageSize: 25,
			proxy: {
				type: 'ajax',
				url : this.processingPage + 'get-records',
				reader: {
					type: 'json',
					root: 'records',
					totalProperty: 'total'
				}
			}
		});
	},
	
	initPager: function(){
		this.pager = new Ext.toolbar.Paging({
			store: this.store,
			displayInfo: true
		});
		this.tbar = this.pager;
	},
	
	initListeners: function() {
		this.on('afterrender', function(){
			this.store.loadPage(this.store.currentPage);
		}, this);
		
		this.store.on('load', function() {
			if (this.timeDifference) {
				this.timeDifference.remove();
			}
			this.timeDifference = Ext.create('TMS.TimeDifference');
			
			// look for claim buttons
			var claimButtons = Ext.select('a.claim-task-button', true);
			var numClaimButtons = claimButtons.elements.length;
			for (var i = 0; i < numClaimButtons; i++) {
				claimButtons.elements[i].on('click', function(e, el) {
					var parts = el.id.split('-');
					var taskId = parts[parts.length-1];
					this.setLoading(true);
					Ext.Ajax.request({
						scope:this,
						method:'post',
						url:'/at-ajax/modules/task/process/claim-task',
						params:{
							taskId:taskId
						},
						success: function(r) {
							this.setLoading(false);
							var response = Ext.decode(r.responseText);
							this.store.load();
						}
					});
				}, this);
			}
			
			// look for tasks that have an action window
			var links = Ext.select('a.task-link', true);
			var numLinks = links.elements.length;
			for (var i = 0; i < numLinks; i++) {
				if (links.elements[i].dom.href.match(/#action/)) {
					// set up click event to call a function that will know what class to create to pass this data to
					var parts = links.elements[i].dom.href.split('#')[1].split('-');
					var taskId = parts[1];
					
					links.elements[i].on('click', function(e, el, options) {
						// look up details for this task
						Ext.Ajax.request({
							scope:this,
							method:'post',
							url:'/at-ajax/modules/task/process/get-details',
							params:{
								taskId:options.taskId
							},
							success: function(r) {
								var response = Ext.decode(r.responseText);
								if (response.cls) {
									var cls = Ext.create(response.cls, response.details);
									cls.on('taskcomplete', function() {
										this.store.load();
									}, this);
								}
							}
						});
					}, this, {taskId:taskId});
				}
			}
		}, this);
	}
	
});
Ext.define('TMS.task.filter.Task', {
	extend: 'TMS.filter.Abstract',
	processingPage: '/at-ajax/modules/task/grid/',
	
	//Requires
	requires:[
		'Ext.ux.form.field.RealComboBox'
	],
	
	init: function(){
		this.initTaskTypes();
		this.initTaskOwners();
		this.initCreatedBy();
		this.initAssignedTo();
		this.initDueDateOn();
		this.initDueDateFrom();
		this.initDueDateTo();
	},
	
	initTaskTypes: function() {
		this.typeStore = Ext.create('Ext.data.Store', {
			fields: [
				'task_type_id',
				'task_name'
			],
			proxy: {
				type: 'ajax',
				url: this.processingPage + 'get-task-type-list',
				reader: {
					type: 'json',
					root: 'records'
				}
			}
		});
		this.typeStore.load();
		
		this.items.push({
			xtype:'realcombobox',
			queryMode:'local',
			name: 'status',
			displayField:'task_name',
			valueField:'task_type_id',
			fieldLabel: 'Task Type',
			store:this.typeStore
		});
	},
	
	initTaskOwners: function() {
		var data = {
			data:[{
				'value':'all',
				'display':'All'
			},{
				'value':'unclaimed',
				'display':'Unclaimed'
			},{
				'value':'me',
				'display':'Me'
			},{
				'value':'others',
				'display':'Others'
			}]
		};
		this.taskOwnerStore = Ext.create('Ext.data.Store', {
			autoLoad: true,
			fields:['value', 'display'],
			data:data,
			proxy: {
				type: 'memory',
				reader: {
					type: 'json',
					root: 'data'
				}
			}
		});
		this.items.push({
			xtype:'realcombobox',
			queryMode:'local',
			name: 'taskOwner',
			displayField:'display',
			valueField:'value',
			fieldLabel: 'Task Owners',
			store:this.taskOwnerStore
		});
	},
	
	initCreatedBy: function(){
		this.items.push({
			name: 'created_by',
			fieldLabel: 'Created By'
		});
	},
	
	initAssignedTo: function() {
		this.items.push({
			name: 'assigned_to',
			fieldLabel: 'Assigned To'
		});
	},
	
	initDueDateOn: function() {
		this.items.push({
			xtype:'datefield',
			name:'dueDateOn',
			fieldLabel:'Due Date On'
		});
	},
	
	initDueDateFrom: function() {
		this.items.push({
			xtype:'datefield',
			name:'dueDateFrom',
			fieldLabel:'Due Date From'
		});
	},
	
	initDueDateTo: function() {
		this.items.push({
			xtype:'datefield',
			name:'dueDateTo',
			fieldLabel:'Due Date To'
		});
	}
	
});
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
Ext.define('TMS.task.view.FilteredGrid', {
	extend: 'Ext.panel.Panel',
	requires:[
		'TMS.task.filter.Task',
		'TMS.task.view.Grid'
	],
	
	layout:'border',
	height: 500,
	title: 'Tasks',
	
	collapsible:true,
	titleCollapse:true,
	extraFilters:{},
	
	initComponent: function(){
		this.items = this.items || [];
		this.init();
		this.callParent(arguments);
	},
	
	//Init Functions
	init: function() {
		this.initFilters();
		this.initGrid();
		this.initListeners();
	},
	
	initFilters: function() {
		this.filterPanel = Ext.create('TMS.task.filter.Task', {
			region:'east',
			width: 250,
			collapsible:true,
			collapsed:true,
			titleCollapse:true,
			title:'Search',
			extraFilters: this.extraFilters 
		});
		this.items.push(this.filterPanel);
	},
	
	initGrid: function() {
		this.gridPanel = Ext.create('TMS.task.view.Grid', {
			region:'center',
			filter: this.filterPanel
		});
		this.items.push(this.gridPanel);
	},
	
	initListeners: function() {
	
	}
	
});
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
Ext.define('TMS.task.Notifier', {
	extend:'Ext.util.Observable',
	singleton: true,
	config: {
		
	},
	defaultParams:{
		title:'',
		content:'',
		icon:'/resources/img/thumb_icon.png',
		url:false,
		timeout:false
	},
	enabled:false,
	
	constructor: function(config) {
        if (window.webkitNotifications) {
			this.enabled = true;
			this.requestPermission();
		}
		
        return this;
    },
	
	show: function(params) {
		var settings = {};
		Ext.apply(settings, this.defaultParams);
		Ext.apply(settings, params);
		
		if (window.webkitNotifications != null && window.webkitNotifications.checkPermission() == 0) {
			var notification = webkitNotifications.createNotification(settings.icon, settings.title, settings.content);

			if (settings.url) {
				notification.onclick = function() {
					notification.cancel();
					location.href = settings.url;
				}
			}

			if (settings.timeout) {
				setTimeout(Ext.Function.bind(function() {
					this.cancel();
				}, notification), settings.timeout);
			}
			notification.show();
			return notification;
		}
		else{
			TMS.Application.showMessage(settings);
		}
	},
	
	requestPermission: function() {
		if (window.webkitNotifications.checkPermission() != 0) {
			if (!Ext.util.Cookies.get('tmsNotifications')) {
				// Create text to click
				Ext.EventManager.on(window, 'load', function(){
					this.message = Ext.get(Ext.core.DomHelper.insertFirst(Ext.get('content'), {
						tag: 'div',
						id: 'notify-request',
						html: 'Click here to enable browser notifications for TMS',
						style:{
							display: 'none'
						}
					}));
					this.message.slideIn();
					this.message.on('click', function() {
						Ext.util.Cookies.set('tmsNotifications');
						window.webkitNotifications.requestPermission();
						this.message.slideOut('t', {
							callback: function(){
								this.message.remove();
							}
						});
					}, this);
					/*
					this.message = Ext.get(document.createElement('p'));
					this.message.dom.id = 'notify-request';
					this.message.update('Click here to enable browser notifications for TMS');
					Ext.get('contentWrap').insertFirst(this.message);
					*/
				});
			}
		}
	}
	
});
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

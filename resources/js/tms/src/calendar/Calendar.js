Ext.override(Extensible.calendar.view.Month, {
    onDetailViewUpdated : function(view, dt, numEvents){
		var p = this.detailPanel,
			dayEl = this.getDayEl(dt),
			box = dayEl.getBox();
		
		p.setWidth(Math.max(box.width, 220));
		var height = box.height;
		if(height < 100){
			height = 100;
		}
		p.setHeight(height);
		p.setAutoScroll(true);
		p.show();
		p.doComponentLayout();
		p.getPositionEl().alignTo(dayEl, 'tl');
	}
});
Ext.define('TMS.calendar.Calendar', {
	extend: 'Extensible.calendar.CalendarPanel',
	
	//Config
	extraParams:{},
	activeItem: 0,
	enableEditDetails: false,

	//View Configs
	showDayView: false,
	showWeekView: false,
	
	
	//Init Functions
	initComponent: function(){
		this.init();
		this.callParent(arguments);
	},
	
	init: function(){
		this.initEventStore();
		this.initCalendarStore();
		this.initListeners();
	},
	
	initListeners: function(){
		this.on('eventclick', function(){
			return false;
		});
		this.on('dayclick', function(){
			return false;
		});
	},
	
	initEventStore: function(){
		this.eventStore = Ext.create('Extensible.calendar.data.EventStore', {
			autoLoad: true,
			proxy: {
				type: 'ajax',
				url: '/at-ajax/modules/calendar/process/event',
				reader: {
					type: 'json',
					root: 'records'
				},
				extraParams: this.extraParams
			}
		});
	},
	
	initCalendarStore: function(){
		this.calendarStore = Ext.create('Ext.data.Store', {
			model: 'Extensible.calendar.data.CalendarModel',
			autoLoad: true,
			proxy: {
				type: 'ajax',
				url: '/at-ajax/modules/calendar/process/calendar',
				reader: {
					type: 'json',
					root: 'records'
				}
			}
		 });
	},
	
	moreClick: function(){
		//console.log(this);
	}
});


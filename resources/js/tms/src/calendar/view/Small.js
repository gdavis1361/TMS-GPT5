Ext.define('TMS.calendar.view.Small', {
	extend: 'Ext.panel.Panel',
	
	//requires
	requires:[
		'TMS.calendar.Calendar'
	],
	
	//Config
	layout: 'fit',
	
	//Init Functions
	initComponent: function(){
		this.items = [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function(){
		this.initCalendar();
	},
	
	initCalendar: function(){
		this.calendar = Ext.create('TMS.calendar.Calendar', Ext.apply({
			showDayView : false,
			showMonthView : false,
			showMultiDayView : false,
			showMultiWeekView : true,
			showWeekView: false,
			showNavJump: false,
			showTime: false
		}, this.calendarConfig));
		this.items.push(this.calendar);
	}
});
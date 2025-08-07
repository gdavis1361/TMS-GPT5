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
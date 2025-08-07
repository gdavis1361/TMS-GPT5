Ext.define('TMS.Application', {
	extend: 'Ext.util.Observable',
    singleton: true,
	
	//Config
	messageContainer: false,
	
	constructor: function(){
		this.callParent(arguments);
		this.initMenu();
	},
	
	/**
	 * Quick navigation rig
	 */
	initMenu: function(){
		this.mainMenu = Ext.getBody().down('.header-main-nav');
		this.mainMenu.show();
		this.activeMenu = this.mainMenu.down('li a.active').up('li');
		this.activeSubMenu = this.activeMenu.down('ul');
		if(this.activeSubMenu){
			this.activeSubMenu.show();
			this.currentSubMenu = this.activeSubMenu;
		}
		Ext.select('.header-navigation').each(function(el){
			el.on('mouseleave', function(){
				if(this.currentSubMenu != null && this.currentSubMenu != this.activeSubMenu){
					this.onHideMenu(this.currentSubMenu);
				}
				if(this.activeSubMenu != null){
					this.onShowMenu(this.activeSubMenu);
				}
			}, this);
		}, this);
		this.mainMenu.select('> li').each(function(el){
			el.on('mouseover', function(event, element, options){
				var target = Ext.get(event.getTarget('li'));
				var subMenu = target.down('ul');
				if(subMenu == null){
					return;
				}
				if(this.currentSubMenu == subMenu){
					return;
				}
				if(this.currentSubMenu != null){
					this.onHideMenu(this.currentSubMenu);
				}
				if(this.activeSubMenu != null){
					this.onHideMenu(this.activeSubMenu);
				}
				
				this.onShowMenu(subMenu);
			}, this);
			el.on('mouseleave', function(event, element, options){
				var target = Ext.get(event.getTarget('li'));
				var subMenu = target.down('ul');
				if(subMenu == null){
					return;
				}
				if(this.currentSubMenu == subMenu){
					this.currentSubMenu = null;
				}
				this.onHideMenu(subMenu);
			}, this);
		}, this);
	},
	
	onShowMenu: function(subMenu){
		if(!subMenu.isVisible()){
			subMenu.show(true);
		}
		subMenu.up('li').down('a').addCls('active');
		this.currentSubMenu = subMenu;
	},
	
	onHideMenu: function(subMenu){
		subMenu.hide();
		subMenu.up('li').down('a').removeCls('active');
		if(this.currentSubMenu == null && this.activeSubMenu != null && subMenu != this.activeSubMenu){
			this.onShowMenu(this.activeSubMenu);
		}
	},
	
	showMessage: function(userConfig){
		var config = {};
		var defaultConfig = {
			title:'',
			content:'',
			icon:'/resources/img/thumb_icon.png',
			url:false,
			timeout:false
		}
		Ext.apply(config, userConfig, defaultConfig);
		
		if(!this.messageContainer){
			this.messageContainer = Ext.core.DomHelper.insertFirst(Ext.getBody(), {
				id:'tms-application-messages-container'
			}, true);
		}
		var messageBox = Ext.core.DomHelper.append(this.messageContainer, this.createMessageBox(config), true);
		messageBox.config = config;
		messageBox.hide();
		messageBox.slideIn('t');
		if(config.timeout){
			setTimeout(Ext.bind(function(){
				this.fadeOut({remove: true});
			}, messageBox), config.wait);
		}
		
		//Setup listeners
		messageBox.on('click', function(event){
			if(event.getTarget('.close') != null){
				this.fadeOut({remove: true});
			}
			else if(messageBox.config.url){
				location.href = messageBox.config.url;
			}
		}, messageBox);
		
	},
	createMessageBox: function(config){
		var messageBoxTemplate = new Ext.XTemplate(
			'<div class="tms-application-message">',
				'<div class="close"></div>',
				'<div class="title">{title}</div>',
				'<div class="icon"><img src="{icon}" /></div>',
				'<div class="message">{content}</div>',
			'</div>'
		);
		return messageBoxTemplate.apply(config);
	},
	
	addJs: function(src) {
		var needToAdd = true;
		Ext.select('script').each(function(el) {
			if (el.dom.src.replace(src, '') != el.dom.src) {
				needToAdd = false;
			}
		});
		if (needToAdd) {
			var newEl = Ext.core.DomHelper.append(Ext.getDoc().down('head'), {
				tag:'script',
				type:'text/javascript',
				src:src
			});
			return newEl;
		}
		else {
			return false;
		}
	},
	
	addCss: function(href) {
		var needToAdd = true;
		Ext.select('link').each(function(el) {
			if (el.dom.href.replace(href, '') != el.dom.href) {
				needToAdd = false;
			}
		});
		if (needToAdd) {
			var newEl = Ext.core.DomHelper.append(Ext.getDoc().down('head'), {
				tag:'link',
				type:'text/css',
				href:href
			});
			return newEl;
		}
		else {
			return false;
		}
	}
});

Ext.define('TMS.ActionWindow', {
	extend:'Ext.window.Window',
	
	//Config
	baseCls: 'x-panel',
	modal:true,
	frame: false,
	resizable:false,
	draggable:false,
	autoShow:true,
	autoSize:true,
	widthPercent: 0.5,
	heightPercent: 0.7,
	sizePercent: null,
	minWidth: 300,
	minHeight: 300,
	minSize: null,
	topItems: [],
	bottomItems: [],
	
	constructor: function(){
		this.topItems = [];
		this.bottomItems = [];
		this.callParent(arguments);
	},
	
	initComponent: function(){
		this.items = this.items || [];
		this.dockedItems = this.dockedItems || [];
		this.initTopBar();
		this.initBottomBar();
		this.initSizing();
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {},
	
	initTopBar: function() {
		this.topToolbar = Ext.create('Ext.toolbar.Toolbar', {
			dock:'top',
			items: this.topItems || []
		});
		this.dockedItems.push(this.topToolbar);
		
		this.topToolbar.on('afterrender', function(){
			if(!this.topToolbar.items.items.length){
				this.topToolbar.hide();
			}
		}, this);
	},
	
	initBottomBar: function() {
		this.bottomToolbar = Ext.create('Ext.toolbar.Toolbar', {
			dock:'bottom',
			ui:'footer',
			layout:{
				pack:'center'
			},
			items: this.bottomItems || []
		});
		this.dockedItems.push(this.bottomToolbar);
		
		this.bottomToolbar.on('afterrender', function(){
			if(!this.bottomToolbar.items.items.length){
				this.bottomToolbar.hide();
			}
		}, this);
	},
	
	initSizing: function(){
		if(!this.autoSize){
			return;
		}
		
		if(this.sizePercent != null){
			this.widthPercent = this.sizePercent;
			this.heightPercent = this.sizePercent;
		}
		if(this.minSize != null){
			this.minWidth = this.minSize;
			this.minHeight = this.minSize;
		}
		
		 //Sizing Listeners
		this.on('show', function(){
			var width = Ext.Element.getViewportWidth() * this.widthPercent;
			var height = Ext.Element.getViewportHeight() * this.heightPercent;
			if(width < this.minWidth){
				width = this.minWidth;
			}
			if(height < this.minHeight){
				height = this.minHeight;
			}
			this.setWidth(width);
			this.setHeight(height);
			this.center();
		}, this);
		
		Ext.EventManager.onWindowResize(function(){
			var width = Ext.Element.getViewportWidth() * this.widthPercent;
			var height = Ext.Element.getViewportHeight() * this.heightPercent;
			if(width < this.minWidth){
				width = this.minWidth;
			}
			if(height < this.minHeight){
				height = this.minHeight;
			}
			this.setWidth(width);
			this.setHeight(height);
			this.center();
		}, this);
	},
	
	addTopButton: function(button) {
		this.topToolbar.show();
		this.topToolbar.add(button);
	},
	
	addBottomButton: function(button) {
		this.bottomToolbar.show();
		this.bottomToolbar.add(button);
	},
	
	showCloseButton: function() {
		this.bottomToolbar.removeAll();
		this.addBottomButton({
			scope:this,
			text:'Close',
			handler:this.close
		});
		
	}
	
});
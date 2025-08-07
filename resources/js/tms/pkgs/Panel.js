Ext.define('TMS.panel.plugin.AutoHeight', {

	// private
    init: function(panel) {
        //Sizing Listeners
		this.panel = panel;
		this.panel.on('afterrender', function(){
			this.panel.setHeight(Ext.Element.getViewportHeight() - this.panel.getEl().getY() - 10);
			this.panel.doLayout();
		}, this);
		
		Ext.EventManager.onWindowResize(function(){
			this.panel.setHeight(Ext.Element.getViewportHeight() - this.panel.getEl().getY() - 10);
			this.panel.doLayout();
		}, this);
    }
});
Ext.define('TMS.panel.plugin.FullScreen', {
	extend: 'Ext.util.Observable',
	
	// private
    init: function(panel) {
		this.panel = panel;
    },

	maximize: function(panel){
		this.panel = panel;
		this.lastOwner = panel.ownerCt;
		this.lastIndex = 0;
		if(this.lastOwner != null && this.lastOwner.items != null){
			Ext.each(this.lastOwner.items.items, function(item, index){
				if(item == this.panel){
					this.lastIndex = index;
				}
			}, this);
		}
		if(this.window == null){
			this.window = Ext.create('Ext.window.Window', {
				scope: this,
				layout: 'fit',
				baseCls: 'x-panel',
				frame: false,
				closeAction: 'hide',
				closable: false,
				draggable: false,
				resizable: false,
				width: Ext.Element.getViewportWidth(),
				height: Ext.Element.getViewportHeight()
			});
			
			this.window.on('show', function(){
				this.window.setWidth(Ext.Element.getViewportWidth());
				this.window.setHeight(Ext.Element.getViewportHeight());
				this.window.center();
				this.window.doLayout();
			}, this);
			
			Ext.EventManager.onWindowResize(function(){
				this.window.setWidth(Ext.Element.getViewportWidth());
				this.window.setHeight(Ext.Element.getViewportHeight());
				this.window.center();
				this.window.doLayout();
			}, this);
		}
		this.window.add(this.panel);
		this.window.show();
		this.fireEvent('maximize', this, this.panel, this.window);
	},
	
	minimize: function(){
		this.window.hide();
		this.window.remove(this.panel, false);
		if(this.lastOwner != null){
			this.lastOwner.insert(this.lastIndex, this.panel);
		}
		this.panel.doLayout();
		this.fireEvent('maximize', this, this.panel);
	}
});

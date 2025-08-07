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
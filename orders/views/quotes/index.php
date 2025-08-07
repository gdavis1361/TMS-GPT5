<div class="content-container">
	<div id="grid-render"></div>
</div>
<script type="text/javascript">
	Ext.require([
		'TMS.orders.view.PreOrderFilteredGrid',
		'TMS.panel.plugin.AutoHeight'
	]);
	
	Ext.onReady(function(){
		var grid = Ext.create('TMS.orders.view.PreOrderFilteredGrid', {
			renderTo: 'grid-render',
			collapsible:false,
			plugins: [Ext.create('TMS.panel.plugin.AutoHeight')]
		});
	});
</script>
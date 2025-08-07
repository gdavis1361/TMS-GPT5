<div class="content-container">
	<div id="grid-render"></div>
</div>
<script type="text/javascript">
	Ext.require([
		'TMS.orders.view.FilteredGrid',
		'TMS.panel.plugin.AutoHeight'
	]);
	
	Ext.onReady(function(){
		var grid = Ext.create('TMS.orders.view.FilteredGrid', {
			renderTo: 'grid-render',
			plugins: [Ext.create('TMS.panel.plugin.AutoHeight')]
		});
	});
</script>
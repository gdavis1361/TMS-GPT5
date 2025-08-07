<div class="content-container">
	<div id="grid-render"></div>
	<script type="text/javascript">
		Ext.require([
			'TMS.customer.filter.Customer',
			'TMS.customer.view.Grid',
			'TMS.panel.plugin.AutoHeight'
		]);
		Ext.onReady(function(){
			var filter = Ext.create('TMS.customer.filter.Customer', {
				title: 'Search',
				region: 'east',
				width: 250,
				collapsible: true,
				collapsed: true,
				titleCollapse: true,
				split: true,
				floatable: false
			});
			filter.on('filter', function(form, values){
				grid.store.proxy.extraParams.filter = Ext.JSON.encode(values);
				grid.store.loadPage(1);
			});
			var grid = Ext.create('TMS.customer.view.Grid', {
				region: 'center'
			});
			var panel = Ext.create('Ext.panel.Panel', {
				title: 'Customers',
				renderTo: 'grid-render',
				layout: 'border',
				border: false,
				items:[filter, grid],
				plugins: [Ext.create('TMS.panel.plugin.AutoHeight')]
			});
		});
	</script>
</div>
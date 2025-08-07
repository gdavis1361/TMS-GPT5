<div class="content-container">
	<div id="grid-render"></div>
</div>
<script type="text/javascript">
	Ext.require([
		'TMS.contacts.view.FreeAgentsGrid',
		'TMS.panel.plugin.AutoHeight'
	]);
	
	Ext.onReady(function(){
		var grid = Ext.create('TMS.contacts.view.FreeAgentsGrid', {
			renderTo: 'grid-render',
			collapsible:false,
			plugins: [Ext.create('TMS.panel.plugin.AutoHeight')]
		});
	});
</script>
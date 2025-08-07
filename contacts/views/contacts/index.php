<div class="content-container">
		<div id="grid-render"></div>
		<script type="text/javascript">
			Ext.require([
				'TMS.contacts.view.Interface',
				'TMS.panel.plugin.AutoHeight'
			]);
			
			Ext.onReady(function(){
				Ext.create('TMS.contacts.view.Interface', {
					renderTo: 'grid-render',
					plugins: [Ext.create('TMS.panel.plugin.AutoHeight')]
				});
			});
		</script>
</div>
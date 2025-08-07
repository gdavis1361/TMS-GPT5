<div class="content-container">
		<div id="lookup-render"></div>
		<script type="text/javascript">
			Ext.require([
				'TMS.carrier.view.FilteredGrid'
			]);
			
			Ext.onReady(function(){
				var grid = Ext.create('TMS.carrier.view.FilteredGrid', {
					renderTo: 'lookup-render',
					title: 'Carriers',
					plugins: [Ext.create('TMS.panel.plugin.AutoHeight')]
				});
				
				/*
				lookup.on('select', function(combo, records){
					lookup.disable();
					if(records.length){
						var record = records[0];
						location.href = '/carriers/?d=carriers&action=view&id=' + record.get('carrier_id');
					}
				});
				*/
			});
		</script>
	</div>
</div>
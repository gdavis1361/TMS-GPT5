<div style="padding:10px;">
	<div id="grid-render"></div>
</div>
<script type="text/javascript">
	Ext.require([
		'TMS.documents.view.Interface'
	]);
	
	Ext.onReady(function(){
		var grid = Ext.create('TMS.documents.view.Interface', {
			renderTo: 'grid-render',
			collapsible:false,
			extraParams:{
				allDocuments:1
			},
			height:600
		});
	});
</script>
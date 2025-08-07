<div id="posting-grid"></div>
<script type="text/javascript">
	Ext.require([
		'TMS.orders.view.PostGrid'
	]);
	
	Ext.onReady(function(){
	   var grid = Ext.create('TMS.orders.view.PostGrid', {
			renderTo: 'posting-grid',
			height: 500
		});
	});
</script>
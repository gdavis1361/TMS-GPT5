<div class="content-container">
	<div id="form-render"></div>
</div>
<script type="text/javascript">
	Ext.require('TMS.orders.forms.Order');
	Ext.onReady(function(){
		Ext.create('TMS.orders.forms.Order', {
			renderTo: 'form-render',
			orderId: '<?php echo $nId; ?>'
		});
	}, this);
</script>
<div class="content-container">
	<div id="form-render"></div>
</div>

<script type="text/javascript">
	Ext.require('TMS.contacts.forms.Contact');
	Ext.onReady(function() {
		Ext.create('TMS.contacts.forms.Contact', {
			renderTo: 'form-render',
			preloadCustomerId: '<?php echo getParam('customer_id', 0); ?>',
			preloadCarrierId: '<?php echo getParam('carrier_id', 0); ?>'
		});
	});
</script>

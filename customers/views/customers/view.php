<?php
$customerId = intval(getParam('id', 0));
if (!$customerId) {
	redirect('/customers/');
}
$customer = new CustomerBase();
$customer->load($customerId);
?>

<div class="content-container">
	<div id="form-render"></div>
</div>

<script type="text/javascript">
	Ext.require([
		'TMS.customer.forms.Customer'
	]);
	
	Ext.onReady(function() {
		Ext.create('TMS.customer.forms.Customer', {
			renderTo: 'form-render',
			customer_id: '<?php echo $customerId; ?>',
			record: Ext.decode('<?php echo json_encode($customer->get()); ?>')
		});
	});
</script>

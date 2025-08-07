<?php
$preOrderId = $nId;
?>
<div class="content-container"
	<div id="form-render"></div>
</div>
<script type="text/javascript">
	Ext.require([
		'TMS.preorders.forms.PreOrder'
	]);
	Ext.onReady(function(){
		Ext.create('TMS.preorders.forms.PreOrder', {
			renderTo: 'form-render',
			preOrderId: '<?php echo $preOrderId; ?>'
		});
	}, this);
</script>
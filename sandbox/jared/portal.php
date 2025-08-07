<?php
require_once('../../at-includes/engine.php');
require_once('../../resources/functions.php');
LP_ResourceManager::getInstance()->addJs("http://maps.google.com/maps/api/js?sensor=false");
require_once SITE_ROOT . '/resources/header.php';
?>
<div id="render"></div>
<script type="text/javascript">
	Ext.onReady(function(){
		Ext.create('TMS.orders.forms.sections.Loads', {
			renderTo: 'render'
		});
	});
</script>


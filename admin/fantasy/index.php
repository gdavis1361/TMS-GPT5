<?php
	LP_ResourceManager::getInstance()->addCss('/admin/fantasy/css/fantasy.css');
?>
<div id="league-render"></div>
<script type="text/javascript">
	Ext.require([
		'TMS.league.view.League',
	]);
	
	Ext.onReady(function(){
		Ext.create('TMS.league.view.League', {
			renderTo: 'league-render',
			height: 400
		});
	});
</script>
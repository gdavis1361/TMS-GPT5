<?php
$sSection  = 'dashboard';
$sPage     = 'my list';

// Include engine and functions before the header so operations can be done before html output begins
require_once($_SERVER['DOCUMENT_ROOT'] . '/at-includes/engine.php');
require_once($_SERVER['DOCUMENT_ROOT'] . '/resources/functions.php');

// Add resource files
$resourceManager = LP_ResourceManager::getInstance();
$resourceManager->addResources(array(
	'js' => array(
		'/lib/min/f=/resources/js/tms/dashboard.js'
	),
	'css' => array(
		'/lib/min/f=/resources/css/dashboard.css'
	)
));

// Begin html output
require_once($_SERVER['DOCUMENT_ROOT'] . '/resources/header.php');
?>

<div class="content-container">
	<div id="grid-render"></div>
</div>
<script type="text/javascript">
	Ext.require([
		'TMS.task.view.FilteredGrid',
		'TMS.panel.plugin.AutoHeight'
	]);
	
	Ext.onReady(function(){
		var grid = Ext.create('TMS.task.view.FilteredGrid', {
			renderTo: 'grid-render',
			collapsible:false,
			plugins:[Ext.create('TMS.panel.plugin.AutoHeight')]
		});
	});
</script>

<?php
require_once($_SERVER['DOCUMENT_ROOT'] . '/resources/footer.php');
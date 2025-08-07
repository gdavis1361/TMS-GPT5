<?php
require_once($_SERVER['DOCUMENT_ROOT'] . '/at-includes/engine.php');
require_once($_SERVER['DOCUMENT_ROOT'] . '/resources/functions.php');

$sSection  = 'dashboard';
$sPage     = 'calendar';

$resourceManager = LP_ResourceManager::getInstance();
$resourceManager->addResources(array(
	"js" => array(
		"/lib/min/f=/resources/js/extensible/extensible-all.js"
	),
	"css" => array(
		"/lib/min/f=/resources/js/extensible/resources/css/extensible-all.css"
	)
));
require_once($_SERVER['DOCUMENT_ROOT'] . '/resources/header.php');
?>


<script type="text/javascript">
	Ext.require([
		'TMS.calendar.view.Full',
	]);
	
	Ext.onReady(function(){
		Ext.create('TMS.calendar.view.Full');
	});
</script>
<div id="calendar-render"></div>


<?php
require_once($_SERVER['DOCUMENT_ROOT'] . '/resources/footer.php');
?>
<?php

/**
 * Groups configuration for default Minify implementation
 * @package Minify
 */
/**
 * You may wish to use the Minify URI Builder app to suggest
 * changes. http://yourdomain/min/builder/
 *
 * See http://code.google.com/p/minify/wiki/CustomSource for other ideas
 * */
require_once($_SERVER['DOCUMENT_ROOT'] . '/at-includes/engine.php');

$config = array(
	'js' => array(
		// jQuery + Extend
		'//resources/js/jquery-1.4.3.min.js',
		'//resources/js/jquery.qtip-1.0.0-rc3.min.js',
		'//resources/js/jquery.hint.js',
		'//resources/js/jquery.ajaxmanager.js',
		'//resources/js/jquery.scrollTo-min.js',
		'//resources/js/elasticbox/jquery.elastic.js',
		'//resources/js/fancybox/jquery.fancybox-1.3.2.pack.js',
		'//resources/js/fancybox/jquery.easing-1.3.pack.js',
		'//resources/js/jquery-aat-ajaxcomplete.js',
		'//resources/js/jquery.json.js',
		// jQuery UI
		'//resources/js/jquery-ui/js/jquery-ui-1.8.6.custom.min.js',
		'//resources/js/jquery-ui/development-bundle/ui/jquery.ui.core.js',
		'//resources/js/jquery-ui/development-bundle/ui/jquery.ui.widget.js',
		'//resources/js/jquery-ui/development-bundle/ui/jquery.ui.mouse.js',
		'//resources/js/jquery-ui/development-bundle/ui/jquery.ui.sortable.js',
		'//resources/js/jquery-ui/development-bundle/ui/jquery.ui.draggable.js',
		'//resources/js/jquery-ui/development-bundle/ui/jquery-ui-1.8.6.custom.js',
		'//resources/js/jquery-ui/js/jquery-ui-combobox.js',
		// Header
		'//resources/js/tms/header.js',
		// Ext files
		'//resources/js/extjs/ext-all.js',
		'//resources/js/extjs/ext-fix.js',
		'//resources/js/tms/bootstrap.js',
		'//resources/js/tms/tms.js',
		'//resources/js/tms/src/AjaxController.js',
		//Nodejs
		// Other
		'//resources/js/plupload/plupload.js',
		'//resources/js/plupload/plupload.html5.js'
	),
	'css' => array(
		'//resources/fonts/fonts.css',
		'//resources/js/fancybox/jquery.fancybox-1.3.2.css',
		'//resources/js/jquery-ui/development-bundle/themes/base/jquery.ui.all.css',
		'//resources/js/extjs/resources/css/tms-theme.css',
		'//resources/js/extjs/src/ux/form/field/BoxSelect.css',
		'//resources/js/extjs/src/ux/statusbar/css/statusbar.css',
		'//resources/css/style.css'
	)
);

//Configure the tms js
//if (ENVIRONMENT == 'production' || ENVIRONMENT == 'staging') {
//	$tmsFile = '//resources/js/tms/tms.js';
//	$tmsAllFile = '//resources/js/tms/tms-all-debug.js';
//	$tmsIndex = array_search($tmsFile, $config['js']);
//	array_splice($config['js'], $tmsIndex, 0, $tmsAllFile);
//}

//Return the config
return $config;
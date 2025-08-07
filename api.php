<?php 

require_once('at-includes/engine.php');
require_once('resources/functions.php');

$nUserId = get_user_id();

?>
<!DOCTYPE html>
<html>
<head>
    <script src="/resources/js/jquery-1.4.3.min.js" type="text/javascript"></script>
    <script>
		$(window).resize(function(){
			refit_window();
		});

		$(document).ready(function(){
			refit_window();
		});

		function refit_window(){
	    	var view_width  = $(window).width();
	    	var view_height = $(window).height();

	    	$('#Navigation').height( view_height );
	    	$('#Navigation').width( 200 );

	    	$('#Request').height( 275 - 4 );
	    	$('#Request').width(  view_width - $('#Navigation').width() - 11 );
	    	$('#Request').css( 'border', 'solid #333 0px' );
	    	$('#Request').css( 'border-width', '0 0 1px 1px' ); 
	    	$('#RequestURL').width( view_width - $('#Navigation').width() - 100 );
	    	$('#RequestData').width( view_width - $('#Navigation').width() - 100 );

	    	$('#Result').css( 'padding', '5px' ); // 10w 10h
	    	$('#Result').css( 'border', 'solid #333 0px' );
	    	$('#Result').css( 'border-width', '0 0 0 1px' ); // 1w
	    	$('#Result').height( view_height - $('#Request').height() - 10 );
	    	$('#Result').width(  view_width - $('#Navigation').width() - 11 );
		}
    	
    </script>
<style>
	html, body{padding:0;margin:0;height:100%;width:100%;overflow:hidden;font-family:Arial;}
	.bgHeaders{padding:0;color:#eee;position:absolute;z-index:-1;text-transform:uppercase;font-size:78px;font-weight:bold;}
	/* .Header{padding:} */
	#Navigation{float:left;overflow:auto;}
	#Request{float:left;padding:3px 0 0 10px;}
	#Result{float:left;overflow:auto;}
	#ResultReturn{font-family:"Andale Mono", "Courier New", Arial;font-size:12px;z-index:100;}
	#RequestURL{padding:2px 4px;font-size:13px;width:500px;}
	#RequestData{padding:2px 4px; font-size:13px;width:550px;height:160px;resize:none;font-size:11px;font-family:"Andale Mono", "Courier New", Arial;}
	
</style>
</head>
<body>

<div id="Navigation">
	<div class="bgHeaders">API</div>
	<div class="Header">Select an API</div>
	<div id="SelectAPI" style="display:none;">
		<div>Carrier 411</div>
		<div>Dynamics SL(Not available)</div>
		<div>SwitchVox</div>
		<div>Internet Truckstop</div>
	</div>
</div>

<div id="Request">
	<div class="bgHeaders">Request</div>
	<div>URL</div>
	<div><input type="text" id="RequestURL" width="100%" value="http://acatsql/v3/wscontractrating/rates.asmx"></div>
	<div>Send Data</div>
	<div><textarea id="RequestData" width="100%"></textarea></div>
	<div><input type="button" id="RequestSubmit" value="Send Request" width="100%"></div>
</div>

<div id="Result">
	<div class="bgHeaders">Response <span id="ResultStatus"></span></div>
	<div id="ResultReturn">I'm a response!</div>
</div>
</body></html>
<?php
require_once('../at-includes/engine.php');
require_once('../resources/functions.php');

function throw_error($msg){
	die('<!DOCTYPE html><html><head><style>body{font-family:\'Trebuchet MS\', Arial;font-size:14px;}</style></head><body><h1 style="margin:0 0 5px 0;color:#f00;padding:0;">THIS SHOULD NEVER HAPPEN</h1><div style="width:600px;"><div style="float:left;margin-right:7px;"><img src="http://www.hongejib.com/hongs_blog/images/cute%20kitten(weee).jpg" width="150"></div><div style="float:left;width:250px;">'.$msg.'</div><div style="clear:both"></div></div></body></html>');
}

$nUserId = get_user_id();

$nOrderId = request('order_id');

if ( !is_numeric($nOrderId) ) {throw_error('No Order Id was provided');}

$oPreOrder = new PreOrderBase;
$oGeoData  = new GeoData;
$oCarrierBase = new CarrierBase;

$oPreOrder->load( $nOrderId );
$aStops = $oPreOrder->get_stops();

$oDestination = array_pop($aStops);
$oOrigin = array_shift($aStops);

if ( !is_object($oOrigin) ) {
	throw_error('<b>whar u from?</b><br>No Origin was found.');
}elseif( !is_object($oDestination) ){
	throw_error('<b>whare you tink chu go\'in?</b><br>No Destinations were found.');
}

$oDestinationGeo = $oGeoData->lookup_zip( $oDestination->get_zip_code() );
$sDestination = $oDestinationGeo->City . ", " . $oDestinationGeo->State . " (" . $oDestination->get_zip_code() . ")";
$oOriginGeo = $oGeoData->lookup_zip( $oOrigin->get_zip_code() );
$sOrigin = $oOriginGeo->City . ", " . $oOriginGeo->State . " (" . $oOrigin->get_zip_code() . ")";
//$oCarrierBase->find_preferred_routes_in_range( OLAT, OLON, ORadiMiles, DLAT, DLON, DRadiMiles );
?>
<!DOCTYPE html>
<html>
<head>
    <script>
		function init() {
			var mapCenter = new google.maps.LatLng(0, 0);
			var map = new google.maps.Map( document.getElementById('mapper') , {
			  'zoom': 1,
			  'center': mapCenter,
			  'mapTypeId': google.maps.MapTypeId.ROADMAP
			});

			// Create a draggable marker which will later on be binded to a
			// Circle overlay.
			var marker = new google.maps.Marker({
			  map: map,
			  position: new google.maps.LatLng(55, 0),
			  draggable: true,
			  title: 'Drag me!'
			});

			// Add a Circle overlay to the map.
			var circle = new google.maps.Circle({
			  map: map,
			  radius: 3000000 // 3000 km
			});

			// Since Circle and Marker both extend MVCObject, you can bind them
			// together using MVCObject's bindTo() method.  Here, we're binding
			// the Circle's center to the Marker's position.
			// http://code.google.com/apis/maps/documentation/v3/reference.html#MVCObject
			circle.bindTo('center', marker, 'position');
		}

		function handleApiReady() {
			var mapCenter = new google.maps.LatLng(<?=($oOriginGeo->Lat + $oDestinationGeo->Lat)/2?>, <?=($oOriginGeo->Long + $oDestinationGeo->Long)/2?>);

			var map = new google.maps.Map(document.getElementById("map"), {
				zoom: 5,
				mapTypeControl: false,
				streetViewControl: false,
				center: mapCenter,
				mapTypeId: google.maps.MapTypeId.ROADMAP
			});

			var origin = new google.maps.Marker({
			  map: map,
			  position: new google.maps.LatLng(<?=$oOriginGeo->Lat?>, <?=$oOriginGeo->Long?>),
			  title: 'Origin'
			});

			var destination = new google.maps.Marker({
			  map: map,
			  position: new google.maps.LatLng(<?=$oDestinationGeo->Lat?>, <?=$oDestinationGeo->Long?>),
			  title: 'Destination'
			});
			//pre( map.getBounds() );

			//var latlngbounds = new map.getBounds();
			//pre(map);
			/*
			latlng.each(function(n){
				latlngbounds.extend(n);
			});
			map.setCenter(latlngbounds.getCenter());
			map.fitBounds(latlngbounds);
			*/
			
			google.maps.event.addListenerOnce(map, 'tilesloaded', function(){

				var LatLngList = [new google.maps.LatLng(<?=$oOriginGeo->Lat?>, <?=$oOriginGeo->Long?>), new google.maps.LatLng(<?=$oDestinationGeo->Lat?>, <?=$oDestinationGeo->Long?>)];
				var bounds = new google.maps.LatLngBounds();
				for (var i = 0, LtLgLen = LatLngList.length; i < LtLgLen; i++) {
				  bounds.extend(LatLngList[i]);
				}
				map.fitBounds(bounds);
			});
		}

		function appendBootstrap() {
			var script = document.createElement("script");
			script.type = "text/javascript";
			script.src = "http://maps.google.com/maps/api/js?sensor=false&callback=handleApiReady";
			document.body.appendChild(script);
		}

		function pre(object,indent) {
			var output = '';

			if (!indent){indent = 0;}
			var indenttext='';
			for ( ix=0; ix<indent; ix++ ){ indenttext += "    "; }

			if ( object != '[object Object]' ) {
				output = indenttext + object;
			}
			else {

				for (var property in object) {

					var thistext = object[property];

					
					thistext += '\n';


					if ( !thistext ) { thistext = ''; }

					output += indenttext + property + ': ' + thistext;
					thistext = null;
				}
			}

				alert(output);
		}

    </script>

</head>
<body>
	<div style="padding:0;width:750px;">
		<div id="map"></div>
		<div id="carriers">
			<div class="carrier_heading">High Probability Carriers</div>
			<div id="carrier_listings">
				<div class="carrier_listing s">
					<div class="data">
						<div class="name">Carrier Name</div>

					</div>
					<a href="#" class="select">Select</a>
					<a href="#" class="call">Call</a>
				</div>
				<div class="carrier_listing">
					<div class="data">
						<div class="name">Carrier Name</div>

					</div>
					<a href="#" class="select">Select</a>
					<a href="#" class="call">Call</a>
				</div>

				<div class="carrier_listing">
					<div class="data">
						<div class="name">Carrier Name</div>

					</div>
					<a href="#" class="select">Select</a>
					<a href="#" class="call">Call</a>
				</div>

				<div class="carrier_listing">
					<div class="data">
						<div class="name">Carrier Name</div>

					</div>
					<a href="#" class="select">Select</a>
					<a href="#" class="call">Call</a>
				</div>

				<div class="carrier_listing">
					<div class="data">
						<div class="name">Carrier Name</div>

					</div>
					<a href="#" class="select">Select</a>
					<a href="#" class="call">Call</a>
				</div>

				<div class="carrier_listing">
					<div class="data">
						<div class="name">Carrier Name</div>

					</div>
					<a href="#" class="select">Select</a>
					<a href="#" class="call">Call</a>
				</div>
			</div>
		</div>
		<div style="height:175px;background:#bbb;clear:both;">
			Order Route
		</div>
	</div>
	<script>
		appendBootstrap();
	</script>
	<style type="text/css">
		body{font-family:'Trebuchet MS', Arial;font-size:14px;}
		#map{float:left;width:430px;height:300px;background:#ccc;}
		#carriers{float:left;width:320px;height:300px;}
		#carriers .carrier_heading{height:16px;font-size:16px;font-weight:bold;padding:2px;margin:0 0 4px 10px;}
		#carrier_listings{height:276px;overflow-x:auto;}
		#carriers .carrier_listing{height:44px;margin:0 0 3px 10px;padding:2px;background:#fff;border:1px solid #eee;}
		#carriers .carrier_listing .data{float:left;width:178px;height:44px;font-size:11px;}
		#carriers .carrier_listing .data .name{font-weight:bold;}
		#carriers .carrier_listing .call{float:right;width:50px;height:20px;padding-top:24px;font-size:11px;text-align:center;display:block;background:url('/resources/silk_icons/phone.png') no-repeat center 5px;-moz-border-radius: 2px;border-radius: 2px;}
		#carriers .carrier_listing .select{float:right;width:50px;height:20px;margin-left:5px;padding-top:24px;font-size:11px;text-align:center;display:block;background:url('/resources/silk_icons/accept.png') no-repeat center 5px;-moz-border-radius: 2px;border-radius: 2px;}
		#carriers .carrier_listing a:hover{background-color:#333;color:#eee;}
		#carriers .s{background:#eee;border:1px solid #ddd;}
	</style>
</body></html>

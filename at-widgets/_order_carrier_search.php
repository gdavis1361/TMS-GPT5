<?php
	require_once('../at-includes/engine.php');
	require_once('../resources/functions.php');

	$nOrderId = request('order_id');
	
	?>
<html>
	<head>
		<script src="../resources/js/extjs/ext-all.js" type="text/javascript"></script>
		<script src="../resources/js/tms/tms.js" type="text/javascript"></script>
		<script src="../resources/js/tms/task/Notifier.js" type="text/javascript"></script>
		<script src="../resources/js/tms/task/TaskManager.js" type="text/javascript"></script>
		<script src="../resources/js/tms/form/Submission.js" type="text/javascript"></script>
		<script src="../resources/js/Redokes/bootstrap.js" type="text/javascript"></script>
		<link rel="stylesheet" type="text/css" href="../resources/js/extjs/resources/css/tms-theme.css" />
		<link rel="stylesheet" type="text/css" href="../resources/js/extjs/src/ux/form/field/BoxSelect.css" />
		
	</head>
	<body>
		<form action="/orders/loads.php">
			<div id="contact-search" style="width:950px; height: 100px"></div>
		</form>
		
		<script type="text/javascript">
			Ext.create('TMS.orders.forms.sections.Carrier', {
				renderTo: 'contact-search',
				width: 950,
				order_id: <?php echo $nOrderId;?> 
			});
		</script>
	</body>
</html> 
<?


/*
die();
?>





<?php
include_once $_SERVER['DOCUMENT_ROOT']. '/orders/carriers/CarrierSearch.php';
?>
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
	
	function recenter_map(){
		var originLat = <?php echo $oOriginGeo->Lat;?>;
		var originLon = <?php echo $oOriginGeo->Long;?>;
		var destLat = <?php echo $oDestinationGeo->Lat;?>;
		var destLon = <?php echo $oDestinationGeo->Long;?>;
		
		if (window.activeMarker != null) {
			var markerLat = window.activeMarker.getPosition().lat();
			var markerLon = window.activeMarker.getPosition().lng();

			var centerLat = (markerLat + originLat + destLat) / 3;
			var centerLon = (markerLon + originLon + destLon) / 3;
		}else{
			var centerLat = (originLat + destLat) / 2;
			var centerLon = (originLon + destLon) / 2;
		}
		
		
		var mapcenter = new google.maps.LatLng(centerLat);
		window.googlemap.setCenter(mapcenter);
	}

	function handleApiReady() {
		var mapCenter = new google.maps.LatLng(<?php echo ($oOriginGeo->Lat + $oDestinationGeo->Lat)/2?>, <?php echo ($oOriginGeo->Long + $oDestinationGeo->Long)/2?>);

		var map = new google.maps.Map(document.getElementById("map"), {
			zoom: 5,
			mapTypeControl: false,
			streetViewControl: false,
			center: mapCenter,
			mapTypeId: google.maps.MapTypeId.ROADMAP
		});
		
		window.googlemap = map;

		var origin = new google.maps.Marker({
		  map: map,
		  position: new google.maps.LatLng(<?php echo $oOriginGeo->Lat?>, <?php echo $oOriginGeo->Long?>),
		  title: 'Origin'
		});

		var destination = new google.maps.Marker({
		  map: map,
		  position: new google.maps.LatLng(<?php echo $oDestinationGeo->Lat?>, <?php echo $oDestinationGeo->Long?>),
		  title: 'Destination'
		});

		google.maps.event.addListenerOnce(map, 'tilesloaded', function(){
			find_markers();
		});
	}
	
	function find_markers(){
		var LatLngList = [new google.maps.LatLng(<?php echo $oOriginGeo->Lat?>, <?php echo $oOriginGeo->Long?>), 
						new google.maps.LatLng(<?php echo $oDestinationGeo->Lat?>, <?php echo $oDestinationGeo->Long?>)];
		if (window.activeMarker != null){
			LatLngList[2] = window.activeMarker.getPosition();
		}
		var bounds = new google.maps.LatLngBounds();
		for (var i = 0, LtLgLen = LatLngList.length; i < LtLgLen; i++) {
		  bounds.extend(LatLngList[i]);
		}
		window.googlemap.fitBounds(bounds);
	}
	
	function add_marker(lat, lon, title) {
		return new google.maps.Marker({
		  map: window.googlemap,
		  position: new google.maps.LatLng(lat, lon),
		  title: title
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
	<div style="padding:0;width:750px;">
		<div id="map"></div>
		<div id="carriers">
			<div class="carrier_heading">Nearby Carriers</div>
			<div id="carrier_listings">
				<?php if (empty($aCarriers)) echo "<div class='data'><strong>Something isn't right...</strong><br>Either the destination or origin could not be determined</div>"; ?>
                <?php foreach ($aCarriers as $carrier) : ?>
				<div class="carrier_listing">
					<div class="data">
						<div class="name"><?php echo $carrier->carrier->carrier_name;?></div>
						<?php foreach($carrier->locations as $location) : ?>
						<div class="carrier_location_info" location_id="<?php echo $location->location_id;?>" latitude="<?php echo $location->Lat;?>" longitude="<?php echo $location->Long;?>">
							<?php echo $location->location_name_1 . " " . $location->zip . " (" . round($aDistance[$location->zip]) . " miles)";?>
							<span></span>
						</div>
						<?php endforeach; ?>
					</div>
					<a carrier_name="<?php echo $carrier->carrier->carrier_name;?>" carrier_id="<?php echo $carrier->carrier->carrier_id;?>" order_id="<?php echo $nOrderId?>" href="#" class="select">Select</a>
					<!-- <a href="#" class="call">Call</a> -->
					<div class="c"></div>
				</div>
                <?php endforeach; ?>
			</div>
		</div>
		<div style="height:175px;background:#bbb;clear:both; display: none;">
			Order Route
		</div>
		<div style="clear:both;"></div>
	</div>
<div style="display: none;"> 
	<div id="cost_info">
		<form action="loads.php" method="post" autocomplete="off">
			<div>
				<input type="hidden" name="carrier_id" value=""/>
				<input type="hidden" name="order_id" value=""/>
				<input type="hidden" name="action" value="carrier"/>
				<div class="carrier">No Carrier Set</div>
				<table>
					<tr><th></th>
						<th>Cost</th>
						<th width="75">Charge</th>
						<th width="75">Profit</th></tr>
					<tr><td>Linehaul:</td>
						<td><input type="text" id="linehaul_cost" name="linehaul_cost" value="0"></td>
						<td>$<span id="linehaul_charge_ref"><?php echo round($nLinehaulCharge, 2);?></span></td>
						<td>$<span id="linehaul_profit">0.00</span></td></tr>
					<tr><td>Fuel:</td>
						<td><input type="text" id="fuel_cost" name="fuel_cost" value="0"/></td>
						<td>$<span id="fuel_charge_ref"><?php echo round($nFuelCharge, 2);?></span></td>
						<td>$<span id="fuel_profit">0.00</span></td></tr>
					<tr><td>Accessorials:</td>
						<td><input type="text" id="accessorial_cost" name="accessorial_cost" value="0"></td>
						<td>$<span id="accessorial_charge_ref"><?php echo round($nAccessorialCharge, 2);?></span></td>
						<td>$<span id="accessorial_profit">0.00</span></td></tr>
					<tr><td colspan="3" style="text-align: right;"><span>Total Profit:</span></td>
						<td><span id="total_profit">$0.00</span></td></tr>
				</table>
				<input type="submit" id="carrier_save" style="display: none"/>
			</div>
		</form>
	</div>
</div>

	<script>
		appendBootstrap();
		
		window.activeMarker = null;
		
		$('.carrier_listing').live('mouseover', function(){
			var data = $(this).find('.carrier_location_info');
			var lat = data.attr('latitude');
			var lon = data.attr('longitude');
			
			if (window.activeMarker != null)
				window.activeMarker.setVisible(false);
			
			
			window.activeMarker = add_marker(lat, lon, data.html());
			window.activeMarker.setVisible(true);
			
			
			window.googlemap.setCenter(new google.maps.LatLng(lat, lon));
			window.googlemap.setZoom(6);
		});
		
		$('.carrier_listing').live('mouseout', function(){
			if (window.activeMarker != null){
				window.activeMarker.setVisible(false);
				find_markers();
			}
		});
		
		$('.select').click(function(){
			$('input[name=carrier_id]').val($(this).attr('carrier_id'));
			$('input[name=order_id]').val($(this).attr('order_id'));
			$('.carrier').html($(this).attr('carrier_name'));
			
			$('#cost_info').dialog({
				title: "Cost", 
				zIndex: 4000,
				minWidth: 400,
				modal: true,
				buttons: { 
					"Save": function() { 
						$('input#carrier_save').click();
					}}
			});
			return false;
		});
		
		$('#linehaul_cost').keyup(function(){
			var cost = parseFloat($(this).val());
			var charge = parseFloat( $('#linehaul_charge_ref').text() );
			if (isNaN(cost)) cost = 0;
			
			var profit = charge - cost;
			
			$('span#linehaul_profit').html(profit);
			total_profits()
		});
		
		$('#fuel_cost').keyup(function(){
			var cost = parseFloat($(this).val());
			var charge = parseFloat( $('#fuel_charge_ref').text() );
			if (isNaN(cost)) cost = 0;
			
			
			var profit = charge - cost;
			
			$('span#fuel_profit').html(profit);
			total_profits()
		});
		
		$('#accessorial_cost').keyup(function(){
			var cost = parseFloat($(this).val());
			var charge = parseFloat( $('#accessorial_charge_ref').text() );
			if (isNaN(cost)) cost = 0;
			
			var profit = charge - cost;
			
			$('span#accessorial_profit').html(profit);
			total_profits()
		});
		
		function total_profits(){
			var linehaul = parseFloat( $('span#linehaul_profit').html() );
			var fuel = parseFloat( $('span#fuel_profit').html() );
			var accessorial = parseFloat( $('span#accessorial_profit').html() );
			
			if (isNaN(linehaul)){ alert('linehaul');  linehaul = 0; }
			if (isNaN(fuel)) {alert('fuel'); fuel = 0; }
			if (isNaN(accessorial)) {alert('accessorial'); accessorial = 0; }
			
			total = linehaul + fuel + accessorial;
			
			$('span#total_profit').html('$' + total);
		}
	</script>
	<style type="text/css">
		body{font-family:'Trebuchet MS', Arial;font-size:14px;}
		#map{float:left;width:430px;height:300px;background:#ccc;}
		#carriers{float:left;width:320px;height:300px;}
		#carriers .carrier_heading{height:16px;font-size:16px;font-weight:bold;padding:2px;margin:0 0 4px 10px;}
		#carrier_listings{overflow-x:auto;}
		#carriers .carrier_listing{height:44px;margin:0 0 3px 10px;padding:2px;background:#fff;border:1px solid #eee;}
		#carriers .carrier_listing .data{float:left;width:178px;height:44px;font-size:11px;}
		#carriers .carrier_listing .data .name{font-weight:bold;}
		#carriers .carrier_listing .call{float:right;width:50px;height:20px;padding-top:24px;font-size:11px;text-align:center;display:block;background:url('/resources/silk_icons/phone.png') no-repeat center 5px;-moz-border-radius: 2px;border-radius: 2px;}
		#carriers .carrier_listing .select{float:right;width:50px;height:20px;margin-left:5px;padding-top:24px;font-size:11px;text-align:center;display:block;background:url('/resources/silk_icons/accept.png') no-repeat center 5px;-moz-border-radius: 2px;border-radius: 2px;}
		#carriers .carrier_listing a:hover{background-color:#333;color:#eee;}
		#carriers .s{background:#eee;border:1px solid #ddd;}
		.carrier, #charge_heading { font-weight: bold; font-size: 15px}
		#cost_info table td{
			padding: 5px;
			text-align: center;
		}
		#cost_info table th{
			font-family: sans-serif;
			font-size: 1.25em;
			font-weight: bold;
			text-align: center;
		}
		#cost_info input {
			width: 50px;
			border: 1px solid #333;
			padding: 3px;
			margin: 0px 5px;
		}
		#total_profit{ 
			font-size: 13px;
			color: #080;
			font-weight: bold;
		}
	</style>
	
	<?
	//info();
	?>
 * 
 * 
 */
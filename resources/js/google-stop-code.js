window.ActiveMarkers = [];

function find_markers(){
	var LatLngList = [];
	for(var i = 0; i < window.ActiveMarkers.length; i++){
		LatLngList.push(window.ActiveMarkers[i].getPosition());
	}

	if (window.activeMarker != null){
		LatLngList = [LatLngList[0], window.activeMarker.getPosition()];
	}
	var bounds = new google.maps.LatLngBounds();
	for (var i = 0, LtLgLen = LatLngList.length; i < LtLgLen; i++) {
	  bounds.extend(LatLngList[i]);
	}

	window.googlemap.fitBounds(bounds);
}

function add_marker(lat, lon, title) {
	var marker = new google.maps.Marker({
	  map: window.googlemap,
	  position: new google.maps.LatLng(lat, lon),
	  title: title
	});
	window.ActiveMarkers[window.ActiveMarkers.length] = marker;
	find_markers();
	return marker;
}

function remove_marker(lat, lon){
	 if (window.ActiveMarkers.length == 0) return;

	 var markers = window.ActiveMarkers;

	 var mark = new google.maps.LatLng(lat, lon);

	 for(var x = 0; x < markers.length; x++){
		 if (markers[x].getPosition().lat() == mark.lat() && markers[x].getPosition().lng() == mark.lng()) {

			 window.ActiveMarkers[x].setVisible(false);
			 window.ActiveMarkers.splice(x,1);
//				 console.log('killed '  + x);
			 find_markers();
			 return;
		 }
	 }
}

function sort_markers(){
	var markers = window.ActiveMarkers;

	for(var x = 0; x < markers.length; x++){
		window.ActiveMarkers[x].setVisible(false);
	}
	window.ActiveMarkers = [];

	$('#sortable>.ui-state-default').each(function(i,d){
		var lat = $(d).attr('lat');
		var lon = $(d).attr('lng');
		add_marker(lat, lon, '');
	});
	find_markers();
}

var mapCenter = new google.maps.LatLng(35.0455556, -85.3097222); //Chattanooga <?php /* echo ($oOriginGeo->Lat + $oDestinationGeo->Lat)/2?>, <?php echo ($oOriginGeo->Long + $oDestinationGeo->Long)/2 */?>);

var map = new google.maps.Map(document.getElementById("map"), {
	zoom: 7,
	scrollwheel: false,
	mapTypeControl: false,
	streetViewControl: false,
	center: mapCenter,
	mapTypeId: google.maps.MapTypeId.ROADMAP
});

window.googlemap = map;

sort_markers();
find_markers();


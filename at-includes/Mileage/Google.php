<?php

class Mileage_Google {

	public $url = 'http://maps.googleapis.com/maps/api/distancematrix/json';
	
	public function getStopDistances($stops) {
		$numStops = count($stops);
		$response = array(
			'distance' => 0,
			'movements' => array()
		);
		$total = 0;
		
		$defaults = array(
			'street' => '',
			'city' => '',
			'state' => '',
			'zip' => ''
		);
		
		// Build array of locations
		$locations = array();
		for ($i = 0; $i < $numStops; $i++) {
			$stops[$i] = array_merge($defaults, $stops[$i]);
			$locations[] = $stops[$i]['street'] . ' ' . $stops[$i]['city'] . ' ' . $stops[$i]['state'] . ' ' . $stops[$i]['zip'];
		}
		$params = array(
			'sensor' => 'false',
			'units' => 'imperial',
			'mode' => 'driving',
			'origins' => implode('|', $locations),
			'destinations' => implode('|', $locations)
		);
		
		$result = LP_Util::curlGet($this->url, $params);
		$jsonResult = json_decode($result, true);
		if ($jsonResult['status'] == 'OK') {
			// Loop through each result
			for ($i = 0; $i < $numStops - 1; $i++) {
				$element = $jsonResult['rows'][$i]['elements'][$i+1];
				$distance = 0;
				if (isset($element['distance'])) {
					$distance = preg_replace('/[^\d\.]/', '', $element['distance']['text']);
				}
				$total += $distance;
				$response['movements'][] = array(
					'origin' => $jsonResult['origin_addresses'][$i],
					'destination' => $jsonResult['destination_addresses'][$i+1],
					'distance' => $distance,
					'distanceDisplay' => number_format($distance, 2) . ' mi.'
				);
			}
		}
		$response['json'] = $jsonResult;
		
		$response['distance'] = $total;
		$response['distanceDisplay'] = number_format($total, 2) . ' mi.';
		return $response;
	}

}
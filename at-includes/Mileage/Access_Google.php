<?php

class Access_Google {

	public $url = "http://maps.googleapis.com/maps/api/distancematrix/json";

	public function sendRequest($params) {

		$params = strtr($params, '&', 'n');

		$json = json_decode($params);

		foreach ($json as $key => $leg) {

			$st = $leg->start;
			$en = $leg->end;
			$mo = $leg->mode;

			$GoogleFormat = "origins=";

			if (isset($st->street) && $st->street != "")
				$GoogleFormat .= strtr($st->street, ' ', '+') . "+";

			if (isset($st->city) && $st->city != "")
				$GoogleFormat .= strtr($st->city, ' ', '+') . "+";

			if (isset($st->state) && $st->state != "")
				$GoogleFormat .= strtr($st->state, ' ', '+') . "+";

			if (isset($st->zip) && $st->zip != "")
				$GoogleFormat .= strtr($st->zip, ' ', '+') . "+";

			$GoogleFormat = substr($GoogleFormat, 0, -1);

			$GoogleFormat.= "&destinations=";

			if (isset($en->street) && $en->street != "")
				$GoogleFormat .= strtr($en->street, ' ', '+') . "+";

			if (isset($en->city) && $en->city != "")
				$GoogleFormat .= strtr($en->city, ' ', '+') . "+";

			if (isset($en->state) && $en->state != "")
				$GoogleFormat .= strtr($en->state, ' ', '+') . "+";

			if (isset($en->zip) && $en->zip != "")
				$GoogleFormat .= strtr($en->zip, ' ', '+') . "+";

			$GoogleFormat = substr($GoogleFormat, 0, -1);

			$GoogleFormat .= "&sensor=false&units=imperial";

			//return $GoogleFormat;

			$ch = curl_init($this->url . "?" . $GoogleFormat);
			curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
			curl_setopt($ch, CURLOPT_HEADER, 0);  // DO NOT RETURN HTTP HEADERS
			curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);  // RETURN THE CONTENTS OF THE CALL
			curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);
			$response = curl_exec($ch);
			curl_close($ch);

			//return $response;

			$result = json_decode($response);

			//echo "<br /><br />" . $response . "<br /><br />";


			if (isset($result->status)) {
				$leg->status = $result->status;
			}
			else {
				$leg->status = $result->statu = "ERROR_NO_DATA";
			}

			if (isset($result->rows[0]->elements[0]->distance->text)) {
				$leg->distance = $result->rows[0]->elements[0]->distance->text;
			}
			else {
				$leg->distance = 0;
			}
		}

		return '"Google":' . json_encode($json);
	}

}

//acatdb

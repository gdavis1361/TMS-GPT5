<?php

class LP_Util {
	
	public static function timeDifference($from, $to = false) {
		if (!$to) {
			$to = time();
		}
		$since = abs($to - $from);
		$chunks = array(
			array(60 * 60 * 24 * 365 , 'year'),
			array(60 * 60 * 24 * 30 , 'month'),
			array(60 * 60 * 24 * 7, 'week'),
			array(60 * 60 * 24 , 'day'),
			array(60 * 60 , 'hour'),
			array(60 , 'minute'),
			array(1 , 'second')
		);

		for ($i = 0, $j = count($chunks); $i < $j; $i++) {
			$seconds = $chunks[$i][0];
			$name = $chunks[$i][1];
			if (($count = floor($since / $seconds)) != 0) {
				break;
			}
		}

		$print = ($count == 1) ? '1 '.$name : "$count {$name}s";
		return $print;
	}
	
	public static function buildQuery($query, $order, $numRows, $offset) {
		if (!strlen($order)) {
			 $order = '(SELECT 0)';
		}
		$numRows = intval($numRows);
		if ($numRows < 1) {
			$numRows = 1;
		}
		$offset = intval($offset);
		if ($offset < 0) {
			$offset = 0;
		}
		$offset += 1;
		
		$startRow = $offset;
		$stopRow = $startRow + $numRows - 1;
		$query = "WITH outer_tbl AS (SELECT ROW_NUMBER() OVER (ORDER BY $order) AS ZEND_DB_ROWNUM, * FROM ($query) AS inner_tbl) SELECT * FROM outer_tbl WHERE ZEND_DB_ROWNUM BETWEEN $startRow AND $stopRow";
		return $query;
	}
	
	public static function buildQueryPage($query, $order, $pageNum, $perPage) {
		if (!strlen($order)) {
			 $order = '(SELECT 0)';
		}
		$pageNum = intval($pageNum);
		if ($pageNum < 1) {
			$pageNum = 1;
		}
		$perPage = intval($perPage);
		if ($perPage < 1) {
			$perPage = 1;
		}
		
		$startRow = ($pageNum - 1) * $perPage + 1;
		$stopRow = $startRow + $perPage - 1;
		$query = "WITH outer_tbl AS (SELECT ROW_NUMBER() OVER (ORDER BY $order) AS ZEND_DB_ROWNUM, * FROM ($query) AS inner_tbl) SELECT * FROM outer_tbl WHERE ZEND_DB_ROWNUM BETWEEN $startRow AND $stopRow";
		return $query;
	}
	
	public static function makeSelectFromArray($rows, $options = array(), $matchValue = null) {
		$defaultOptions = array(
			'name' => '',
			'id' => '',
			'class' => '',
			'default' => false,
			'valueField' => '',
			'displayField' => '',
		);
		$options = array_merge($defaultOptions, $options);
		
		$str = '<select name="'.$options['name'].'" id="'.$options['id'].'" class="'.$options['class'].'">';
		$numRows = count($rows);
		
		if (is_array($options['default'])) {
			foreach($options['default'] as $key => $value) {
				$str .= '<option value="'.$key.'">'.$value.'</option>';
			}
		}
		
		for ($i = 0; $i < $numRows; $i++) {
			$selected = '';
			if ($rows[$i][$options['valueField']] == $matchValue) {
				$selected = 'selected="selected"';
			}
			$str .= '<option value="'.$rows[$i][$options['valueField']].'" '.$selected.'>'.$rows[$i][$options['displayField']].'</option>';
		}
		$str .= '</select>';
		
		return $str;
		
	}
	
	public static function curlPost($url, $params = array()) {
		$keyValues = array();
		foreach($params as $key => $value) {
			$keyValues[] = $key . '=' . urlencode($value);
		}
		$params = implode('&', $keyValues);
		$ch = curl_init($url);
		curl_setopt($ch, CURLOPT_POST, 1);
		curl_setopt($ch, CURLOPT_VERBOSE, 1);
		curl_setopt($ch, CURLOPT_POSTFIELDS, $params);
		curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
		curl_setopt($ch, CURLOPT_HEADER, 0);  // DO NOT RETURN HTTP HEADERS
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);  // RETURN THE CONTENTS OF THE CALL
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);
		curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, FALSE);
		curl_setopt($ch, CURLOPT_TIMEOUT, 20);
		curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 20);
		$response = curl_exec($ch);
		curl_close($ch);
		return $response;
	}
	
	public static function curlGet($url, $params = array()) {
		$keyValues = array();
		foreach($params as $key => $value) {
			$keyValues[] = $key . '=' . urlencode($value);
		}
		$params = implode('&', $keyValues);
		$url .= '?' . $params;
		$ch = curl_init($url);
		curl_setopt($ch, CURLOPT_VERBOSE, 1);
		curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
		curl_setopt($ch, CURLOPT_HEADER, 0);  // DO NOT RETURN HTTP HEADERS
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);  // RETURN THE CONTENTS OF THE CALL
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);
		curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, FALSE);
		curl_setopt($ch, CURLOPT_TIMEOUT, 20);
		curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 20);
		$response = curl_exec($ch);
		curl_close($ch);
		return $response;
	}
}
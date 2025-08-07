<?php

class LP_Timer {
	public static $times = array();
	public static $timeDifferences = array();
	public static $startTaskNames = array();
	public static $stopTaskNames = array();
	public static $report = array();
	
	public static function start($str = '') {
		self::$report[] = array(
			'str' => $str,
			'level' => count(self::$times),
			'duration' => 0,
			'start' => true
		);
		self::$times[] = microtime(true);
		self::$startTaskNames[] = $str;
	}
	
	public static function stop() {
		// need to pop time before getting the time count for level
		$difference = microtime(true) - array_pop(self::$times);
		self::$report[] = array(
			'str' => array_pop(self::$startTaskNames),
			'level' => count(self::$times),
			'duration' => $difference,
			'start' => false
		);
	}
	
	public static function showReport($stopLevel = 0) {
		$numResults = count(self::$report);
		$str = '';
		for ($i = 0; $i < $numResults; $i++) {
			$result = self::$report[$i];
			if ($result['duration'] < 0.00001) {
				$result['duration'] = 0;
			}
			
			// get indent amount
			$level = $result['level'];
			if ($level < $stopLevel || !$stopLevel) {
				$padLength = $level * 4;
				$padStr = str_pad('', $padLength, ' ', STR_PAD_LEFT);
				$padStr = str_replace(' ', '&nbsp;', $padStr);

				$display = '';
				if ($result['start']) {
					$display = $result['str'];
				}
				else {
					$display = $result['duration'] . ' Finished ' . $result['str'];
				}

				$str .= $padStr . $display . "\n";
			}
		}
		return $str;
	}
	
}
<?php

/**
 * Simple hard coded event firing system.
 * 
 * To Listen for an event, create a .php file in /resources/events/
 * with a static function name on each line.
 * 
 * Fire an event by calling LP_EventManager::fireEvent('eventName', [arg1], ...)
 * The return values of all functions will be returned in an associative array with
 * keys as the static function name.
 * 
 * Firing Event Example:
 * LP_EventManager::fireEvent('MyClass.update', $row, $moreData, $extra);
 * Loads /resources/events/MyClass.update.php
 * 
 * Sample event file contents:
 * AnotherClass::callMe
 * AnotherClass::callMe2
 * 
 * Sample return array from calling these two functions in the event
Array (
    [AnotherClass::callMe] => Array (
		[one] => some data
		[two] => more data
	)

    [AnotherClass::callMe2] => Array (
		[one] => different data
		[two] => also different
	)
)
 */

class LP_EventManager {
	
	public static function getCachePath() {
		return $_SERVER['DOCUMENT_ROOT'] . '/resources/events/';
	}
	
	/**
	 * Any number of arguments can be passed as extra parameters after the event name
	 * @param string $event
	 * @return array
	 */
	public static function fireEvent($event) {
		$args = func_get_args();
		$returnValues = array();
		$fileName = self::getCachePath() . $event . '.php';
		if (is_file($fileName)) {
			// process each line
			$contents = file_get_contents($fileName);
			$functions = explode("\n", $contents);
			$numFunctions = count($functions);
			for ($i = 0; $i < $numFunctions; $i++) {
				if (strlen($functions[$i])) {
					// try to call the static function
					$functionCall = explode('::', $functions[$i]);
					if (count($functionCall) == 1) {
						$returnValues[$functions[$i]] = @call_user_func_array($functions[$i], $args);
					}
					else {
						$returnValues[$functions[$i]] = @call_user_func_array($functionCall, $args);
					}
				}
			}
		}
		
		return $returnValues;
	}
	
}
<?php

/**
 * This exists just so there aren't global references all over the place
 * and it will be easier to update the way the class works rather than
 * every instance of a global variable
 *
 * @author wesokes
 */
class LP_Db {

	private static $_db;

	/**
	 * 
	 * @return DBModel
	 */
	public static function getDb() {
		if (!isset(self::$_db)) {
			self::$_db = $GLOBALS['oDB'];
		}
		return self::$_db;
	}

	public static function fetchAll($query) {
		$db = self::getDb();
		$rows = array();
		$result = $db->query($query);
		while ($row = mssql_fetch_assoc($result)) {
			$rows[] = $row;
		}
		mssql_free_result($result);
		return $rows;
	}

	public static function fetchRow($query) {
		$rows = self::fetchAll($query);
		if (count($rows)) {
			return $rows[0];
		}
		return false;
	}
	
	public static function execute($query) {
		$db = self::getDb();
		$success = $db->query($query);
		return $success;
	}

	/**
	 * Prepares a string for mssql db use
	 * @param string $item
	 * @return string 
	 */
	public static function escape($data) {
		if (is_numeric($data)){
			return $data;
		}
		
		if (!isset($data) or empty($data)) {
			return '';
		}

		$non_displayables = array(
			'/%0[0-8bcef]/', // url encoded 00-08, 11, 12, 14, 15
			'/%1[0-9a-f]/', // url encoded 16-31
			'/[\x00-\x08]/', // 00-08
			'/\x0b/', // 11
			'/\x0c/', // 12
			'/[\x0e-\x1f]/'			 // 14-31
		);
		foreach ($non_displayables as $regex) {
			$data = preg_replace($regex, '', $data);
		}
		$data = str_replace("'", "''", $data);
		return $data;
	}

}

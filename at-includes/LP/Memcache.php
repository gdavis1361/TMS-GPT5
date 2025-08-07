<?php
/**
 * Uses the Zend Cache system
 * Usage
$cache = LP_Memcache::getInstance()->cache;
$cacheId = 'uniqueString';
$data = '';
if (!$cache->test($cacheId)) {
	// Cache miss
	$data = ''; // Calculate data
	$cache->save($data, $cacheId, array(), 60); // cache for 60 seconds
}
else {
	// Cache hit
	$data = $cache->load($cacheId);
}
 *
 * @author wesokes
 */
class LP_Memcache {
	private static $_instance;
	
	/**
	 *
	 * @var Zend_Cache_Core|Zend_Cache_Frontend 
	 */
	public $cache;
	
	/**
	 * Returns the single instance of LP_Memcache
	 *
	 * @return LP_Memcache
	 */
	public static function getInstance() {
		if (!isset(self::$_instance)) {
			$c = __CLASS__;
			self::$_instance = new $c;
		}

		return self::$_instance;
	}
	
	
	
	public function __construct() {
		$backend = new Zend_Cache_Backend_Memcached(array(
			'servers' => array(
				array(
					'host' => 'accessresults.com',
					'port' => 11211,
//					'persistent' => true,
//					'weight' => 1,
//					'timeout' => 5,
//					'retry_interval' => 15,
//					'status' => true,
//					'failure_callback' => ''
				)
			),
			'compression' => true
		));
		
		$frontend = new Zend_Cache_Core(array( 
			'caching' => true, 
			'cache_id_prefix' => 'myApp', 
			'write_control' => true,
			'automatic_serialization' => true,
			'ignore_user_abort' => true,
			'lifetime' => 60
		));
		
		$this->cache = Zend_Cache::factory($frontend, $backend);
	}
	
}

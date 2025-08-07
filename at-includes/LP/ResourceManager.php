<?php

/**
 * Description of ResourceManager
 *
 * @author wesokes
 */
class LP_ResourceManager {
	private static $_instance;
	
	public $cssFiles = array();
	public $jsFiles = array();
	public $useMinify = false;
	public $favIcon = false;
	
	/**
	 * Returns the single instance of LP_ResourceManager
	 *
	 * @return LP_ResourceManager
	 */
	public static function getInstance() {
		if (!isset(self::$_instance)) {
			$c = __CLASS__;
			self::$_instance = new $c;
		}

		return self::$_instance;
	}
	
	public function enableMinify() {
		$this->useMinify = true;
	}
	
	public function disableMinify() {
		$this->useMinify = false;
	}
	
	/**
	 * Add multiple resources with one function call
	 * addResources(array('js' => array(), 'css' => array()))
	 * @param array $resources Can contain arrays of js and css resources
	 * @param bool $push Push resource to end of array. if false, resources will be put at the front. This is so core js library files can be bumped to the front of the array and loaded before subpage js files
	 */
	public function addResources($resources, $push = true) {
		if (isset($resources['js'])) {
			$this->addJs($resources['js'], $push);
		}
		if (isset($resources['css'])) {
			$this->addCss($resources['css']);
		}
		if (isset($resources['icon'])) {
			$this->setFavIcon($resources['icon'], $push);
		}
	}
	
	public function addJs($url, $push = true) {
		if (!is_array($url)) {
			$url = array($url);
		}
		$numUrls = count($url);
		if ($push) {
			for ($i = 0; $i < $numUrls; $i++) {
				$this->jsFiles[] = $url[$i];
			}
		}
		else {
			for ($i = 0; $i < $numUrls; $i++) {
				array_splice($this->jsFiles, $i, 0, $url[$i]);
			}
		}
			
		return $this;
	}
	
	public function addCss($url) {
		if (!is_array($url)) {
			$url = array($url);
		}
		$numUrls = count($url);
		for ($i = 0; $i < $numUrls; $i++) {
			$this->cssFiles[] = $url[$i];
		}
		return $this;
	}
	
	public function setFavIcon($url) {
		$this->favIcon = $url;
	}
	
	public function outputScripts() {
		if(!MINIFY_ENABLED){
			$this->jsFiles = $this->replaceMinify($this->jsFiles);
		}
		
		if ($this->useMinify) {
			
		}
		else {
			$num = count($this->jsFiles);
			for ($i = 0; $i < $num; $i++) {
				echo '<script src="'.$this->jsFiles[$i].'" type="text/javascript"></script>';
			}
		}
	}
	
	public function outputStyles() {
		if(!MINIFY_ENABLED){
			$this->cssFiles = $this->replaceMinify($this->cssFiles);
		}
		
		if ($this->useMinify) {
			
		}
		else {
			$num = count($this->cssFiles);
			for ($i = 0; $i < $num; $i++) {
				echo '<link rel="stylesheet" type="text/css" href="'.$this->cssFiles[$i].'" />';
			}
		}
	}
	
	public function outputFavIcon() {
		if ($this->favIcon) {
			echo '<link rel="shortcut icon" type="image/x-icon" href="'.$this->favIcon.'">';
		}
	}
	
	public function outputAll() {
		$this->outputScripts();
		$this->outputStyles();
		$this->outputFavIcon();
	}
	
	private function replaceMinify($files){
		$num = count($files);
		$returnFiles = array();
		for ($i = 0; $i < $num; $i++) {
			$file = $files[$i];
			if(preg_match("/^\/lib\/min\/g=([^\"']+)/i", $file, $matches)){
				$group = $matches[1];
				$config = (include SITE_ROOT . '/lib/' . 'min/groupsConfig.php');
				$groupFiles = $config[$group];
				foreach ($groupFiles as $file){
					$file = str_replace('//', '/', $file);
					$returnFiles[] = $file;
				}
			}
			else{
				$returnFiles[] = $file;
			}
		}
		return $returnFiles;
	}
	
}
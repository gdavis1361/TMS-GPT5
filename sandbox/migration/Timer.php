<?php

class Timer {

	public $startTime = 0;
	public $stopTime = 0;
	public $elapsedTime = 0;

	public function __construct($start = true) {
		if ($start){
			$this->start();
		}
	}

	public function start() {
		$mtime = microtime();
		$mtime = explode(' ', $mtime);
		$mtime = $mtime[1] + $mtime[0];
		$this->startTime = $mtime;
	}

	public function stop() {
		$mtime = microtime();
		$mtime = explode(' ', $mtime);
		$mtime = $mtime[1] + $mtime[0];
		$this->stopTime = $mtime;
		$this->elapsedTime = ($this->stopTime - $this->startTime);
		return $this->elapsedTime;
	}

	public function reset() {
		$this->start   = 0;
		$this->stop    = 0;
		$this->elapsed = 0;
	}
}

?>
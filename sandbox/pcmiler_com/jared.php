<?php 
ini_set("display_errors", 1);
ini_set("display_startup_errors", 1);
error_reporting(E_ALL);

function pre( $a ){
	echo '<pre>'. preg_replace('/Array\n[ \t]*\(/', 'Array (', print_r( $a, 1 ) ) .'</pre>';
}


//$COMobject = new COM("PCMServer.PCMServer");
$pcm = new COM("PCMServer.PCMServer") or die("Unable to instantiate Word");
pre($pcm->CalcDistance2("Chattanooga, TN", "Memphis, TN", 0)/10);
<?php
//Start the session thats built into php
session_start();

// Set some vars
$_DB = array();
$_SITE = array();

//Setup the environment
$ip = $_SERVER['SERVER_ADDR'];
$host = $_SERVER['HTTP_HOST'];
$environment = 'development';
switch ($ip){
	case '169.130.182.195':
		$environment = 'production';
	break;

	default:
		$environment = 'development';
	break;
}

//Is this staging
if(preg_match('/staging/', strtolower($host))){
	$environment = 'staging';
}
define('ENVIRONMENT', $environment);

// Set pre-config constants
define( 'SITE_ROOT',       $_SERVER['DOCUMENT_ROOT'] );
define( 'CONFIG_FILE',     SITE_ROOT.'/at-config.php' );
define( 'INCLUDES_DIR',    SITE_ROOT.'/at-includes' );
define( 'EXTEND_DIR',      SITE_ROOT.'/at-extend' );
define( 'FRAMEWORK_DIR',   INCLUDES_DIR.'/framework' );
define( 'FUNCTIONS_DIR',   INCLUDES_DIR.'/functions' );
define( 'DATABASE_DIR',    INCLUDES_DIR.'/database' );
define( 'THIRD_PARTY_DIR', INCLUDES_DIR.'/3rd-party' );
define('TMS_VERSION', file_get_contents(INCLUDES_DIR .'/config/version'));


if(ENVIRONMENT == 'production' || ENVIRONMENT == 'staging') {
	define("MINIFY_ENABLED", true);
}
else{
	define("MINIFY_ENABLED", false);
}


// Include Framework Functions
require_once( FUNCTIONS_DIR   .'/general.php' );
require_once( DATABASE_DIR   .'/DBModel.php' );

// Include Site Config file
require_once( CONFIG_FILE );

// Add to the current include path for zend framework include commands to work
set_include_path(get_include_path() . PATH_SEPARATOR . INCLUDES_DIR);

// Connect to Database
$oDB = new DBModel( );
$vConnected = $oDB->connect( $_DB['TMS']['DB_TYPE'] .'://'. $_DB['TMS']['DB_USERNAME'] .':'. $_DB['TMS']['DB_PASSWORD'] .'@'. $_DB['TMS']['DB_HOST'] .'/'. $_DB['TMS']['DB_SCHEMA'].'.'.$_DB['TMS']['DB_DATABASE'], 'DEFAULT' );

if (!$vConnected) die(' <div align="center">Couldn\'t Connect to Database<div><img src="/resources/img/Antoine-Dodson-Dumb.gif"></div>The VPN is so Dumb</div>');

$oSession = new Session( $_CONFIG_DEFAULTS['SESSION_LENGTH'], $_CONFIG_DEFAULTS['SESSION_RECORD_LENGTH'] );

$aURL = explode( ".", $_SERVER["SERVER_NAME"] );

if ( isset( $aURL[2] ) ) {
	$error_log = "/home/" . $aURL[1] . "/www/" . $aURL[0] . ".log";

	if ( is_dir("/home/" . $aURL[1] . "/www/") ){
		ini_set('error_log', $error_log);
	}
}
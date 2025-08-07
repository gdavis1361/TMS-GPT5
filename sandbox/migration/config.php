<?php
// Set some vars
$_DB = array();
$_SITE = array();

// Set pre-config constants
define( 'SITE_ROOT',       $_SERVER['DOCUMENT_ROOT'] );
define( 'CONFIG_FILE',     SITE_ROOT.'/at-config.php' );
define( 'INCLUDES_DIR',    SITE_ROOT.'/at-includes' );
define( 'EXTEND_DIR',      SITE_ROOT.'/at-extend' );
define( 'FRAMEWORK_DIR',   INCLUDES_DIR.'/framework' );
define( 'FUNCTIONS_DIR',   INCLUDES_DIR.'/functions' );
define( 'DATABASE_DIR',    INCLUDES_DIR.'/database' );
define( 'THIRD_PARTY_DIR', INCLUDES_DIR.'/3rd-party' );

// Include Framework Functions
require_once( FUNCTIONS_DIR   .'/general.php' );
require_once( DATABASE_DIR   .'/DBModel.php' );

// Include Site Config file
require_once( CONFIG_FILE );

//Overwrite the db info
//$_DB['TMS']['DB_HOST']     = '192.168.10.115';
//$_DB['TMS']['DB_USERNAME'] = 'tmsuser';
//$_DB['TMS']['DB_PASSWORD'] = 'pRCseCGRE4pV3pGdJ4cBcUSF';
//$_DB['TMS']['DB_DATABASE'] = 'TMS';
//$_DB['TMS']['DB_SCHEMA']   = 'dbo';
$_DB['TMS']['DB_HOST']     = '184.106.79.198';
$_DB['TMS']['DB_DATABASE'] = 'tms_lme';

// Connect to Database
$oDB = new DBModel( );
$vConnected = $oDB->connect( $_DB['TMS']['DB_TYPE'] .'://'. $_DB['TMS']['DB_USERNAME'] .':'. $_DB['TMS']['DB_PASSWORD'] .'@'. $_DB['TMS']['DB_HOST'] .'/'. $_DB['TMS']['DB_SCHEMA'].'.'.$_DB['TMS']['DB_DATABASE'], 'DEFAULT' );

if (!$vConnected) die(' <div align="center">Couldn\'t Connect to Database<div><img src="/resources/img/Antoine-Dodson-Dumb.gif"></div>The VPN is so Dumb</div>');

//Set the time limit
set_time_limit(600);

//Turn errors on
error_reporting(E_ALL);
ini_set('display_errors', '1');

//Additional requires
require_once($_SERVER['DOCUMENT_ROOT'] . '/resources/functions.php');
require_once 'Timer.php';
require_once 'Migration.php';
require_once 'LmeToTms.php';
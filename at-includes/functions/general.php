<?php
/**
 *  For: <RDS>
 *  Type: General Functions
 * 
*/

/**
 * Generates Random Text
 * @param int $nChars Length of string to return 
 * 
*/
function generate( $nChars = 32 ) {
	$c='0987654321ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
	
	$cl=strlen($c);
	$str='';
	for($x=0;$x<$nChars;$x++)
	{
		$str.=substr($c,rand(0,$cl),1);
	}
	return $str;
}

/**
 * 
 * @param 
 * 
*/
function info(){
	pre( $GLOBALS['_SITE']['INFO']['PHP_NOTES'] );

	$count = 0;
	foreach( $GLOBALS['_SITE']['INFO']['PHP_NOTES'] as $note) {
		if ( is_string($note) ) {
			if ($note == 'DBModel Query: Success') $count++;
		}
	}
	echo $count . " Successful Queries";
}

function query_info() {
	$s = 0;
	$r = "<pre>";
	foreach ( $GLOBALS['_SITE']['INFO']['PHP_NOTES'] as $note ) {
		if ( is_string($note) && strpos($note, "DBModel TMS Query") !== false ){
			$r .= $note . "\n";
			$s++;
		}
	}
	$r .= "\nFound $s queries</pre>";
	echo $r;
}

/**
 * 
 * @param 
 * 
*/
function pre( $a ){
	echo '<pre>'. preg_replace('/Array\n[ \t]*\(/', 'Array (', print_r( $a, 1 ) ) .'</pre>';
}

/**
 * 
 * @param 
 * 
*/
function siteinfo( $name = FALSE, $value = FALSE ) {
	if ( $name && $value ) 
		return $GLOBALS['_SITE']['INFO'][$name] = $value;
	elseif ( $name )
		return ( isset($GLOBALS['_SITE']['INFO'][$name]) ) ? $GLOBALS['_SITE']['INFO'][$name] : FALSE;
	else
		return (object) $GLOBALS['_SITE']['INFO'];
}


/**
 * 
 * @param 
 * 
*/
function set_dbo( $dbo, $sDatabaseName = FALSE, $vIsPrimary = FALSE ) {
	addNote("DBModel: DBO ".$sDatabaseName." set.");
	if ( !isset( $GLOBALS['_SITE']['PRIMARY_DBO'] ) || $vIsPrimary ) {
		$GLOBALS['_SITE']['PRIMARY_DBO'] = $sDatabaseName;
		addNote("DBModel: ".$sDatabaseName." is Primary");
	}
	$GLOBALS['_SITE']['DBO'][$sDatabaseName] = $dbo;
	
}

/**
 * 
 * @param 
 * 
*/
function get_dbo( $sDatabaseName = FALSE ) {
	if ( !$sDatabaseName && isset( $GLOBALS['_SITE']['PRIMARY_DBO'] ) && isset( $GLOBALS['_SITE']['DBO'][$GLOBALS['_SITE']['PRIMARY_DBO']] ) ) {
		return $GLOBALS['_SITE']['DBO'][$GLOBALS['_SITE']['PRIMARY_DBO']];
	}
	elseif ( $sDatabaseName && isset($GLOBALS['_SITE']['DBO'][$sDatabaseName]) ) {
		return $GLOBALS['_SITE']['DBO'][$sDatabaseName];
	}
	return FALSE;
}

/**
 * 
 * @param 
 * 
*/
function set_session( $o ) {
	$GLOBALS['_SITE']['SESSION'] = $o;
}

/**
 * 
 * @param 
 * 
*/
function get_session() {
	return ( isset($GLOBALS['_SITE']['SESSION']) ) ? $GLOBALS['_SITE']['SESSION'] : FALSE;
}

/**
 * Directory/Variable/Get/Post Check Functions
 * @param 
 * 
*/
function d( $n, $d = FALSE ) {
	return (isset($GLOBALS['_DIR'][$n]))?$GLOBALS['_DIR'][$n]:$d;
}

/**
 * 
 * @param 
 * 
*/
function check( $v, $d = FALSE ) {
	return (isset($v) && strlen($v) > 0 )?$v:$d;
}

/**
 * Checks a string for a regular expression match against normally formatted email addresses
 * @param string Email
 * @return bool
*/
function check_email( $sEmail ) {
	return preg_match("/(?:[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*|\"(?:[\\x01-\\x08\\x0b\\x0c\\x0e-\\x1f\\x21\\x23-\\x5b\\x5d-\\x7f]|\\\\[\\x01-\\x09\\x0b\\x0c\\x0e-\\x7f])*\")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\\x01-\\x08\\x0b\\x0c\\x0e-\\x1f\\x21-\\x5a\\x53-\\x7f]|\\\\[\\x01-\\x09\\x0b\\x0c\\x0e-\\x7f])+)\\])/", $sEmail );
}

/**
 * 
 * @param 
 * 
*/
function get( $v, $d = FALSE ) {
	return (isset($_GET[$v])&&!empty($_GET[$v]))?$_GET[$v]:$d;
}

/**
 * 
 * @param 
 * 
*/
function post( $v, $d = FALSE ) {
	return (isset($_POST[$v])&&!empty($_POST[$v]))?$_POST[$v]:$d;
}

/**
 *
 * @param
 *
*/
function request_file( $v, $d = FALSE ) {
	return (isset($_FILES[$v])&&!empty($_FILES[$v]))?$_FILES[$v]:$d;
}

/**
 * 
 * @param 
 * 
*/
function cookie( $v, $d = FALSE ) {
	return (isset($_COOKIE[$v])&&strlen($_COOKIE[$v])>0)?$_COOKIE[$v]:$d;
}

/**
 * 
 * @param 
 * 
*/
function session( $v, $d = FALSE ) {
	return (isset($_SESSION[$v])&&strlen($_SESSION[$v])>0)?$_SESSION[$v]:$d;
}

/**
 * 
 * @param 
 * 
*/
function request( $v, $d = false, $sourceArray = false) {
	return getParam($v, $d, $sourceArray);
}

function getPostParam($key, $defaultValue) {
	if (isset($_POST[$key])) {
		return $_POST[$key];
	}
	else {
		return $defaultValue;
	}
}

function getGetParam($key, $defaultValue) {
	if (isset($_GET[$key])) {
		return $_GET[$key];
	}
	else {
		return $defaultValue;
	}
}

function getParam($key, $defaultValue = false, $sourceArray = false) {
	if (!$sourceArray) {
		$sourceArray = $_REQUEST;
	}
	if (isset($sourceArray[$key])) {
		return $sourceArray[$key];
	}
	else {
		return $defaultValue;
	}
}

/**
 * 
 * @param 
 * 
*/
function globals( $v, $d = FALSE ) {
	return ( isset($GLOBALS[$v]) ) ? $GLOBALS[$v] : $d ;
}

/**
 * 
 * @param 
 * 
*/
function config( $v, $d = FALSE ) {
	return (isset($GLOBALS['_CONFIG'][$v])&&strlen($GLOBALS['_CONFIG'][$v])>0)?$GLOBALS['_CONFIG'][$v]:$d;
}

function redirect( $sUrl = '/' ) {
	//header( "HTTP/1.1 301 Moved Permanently" );
	header( "HTTP/1.1 303 See Other" );
	header( "Location: ". $sUrl );
	exit;
}

/**
 * Loads whenever a new class instance is initiated
 * Checks Site Directory first, then extensions
 * @param 
 * 
*/
function __autoload( $class_name ) {
	$class_name = preg_replace('/.php/i', '', $class_name);
	$inc[] = FRAMEWORK_DIR .'/'. $class_name .'.class.php';
	$inc[] = EXTEND_DIR    .'/'. $class_name .'.php';
	
	foreach( $inc as $v ) {
		if ( file_exists($v) ) {
			addNote('Autoloading Class: ' . $class_name);
			require_once $v;
		}
	}
	
	// autoload classes based on dir structure
	$parts = explode('_', $class_name);
	$upperFile = implode('/', $parts). '.php';
	$file = INCLUDES_DIR . '/' . $upperFile;
	if (is_file($file)) {
		include_once $file;
	}
}

/**
 * Register this autoload function with spl_autoload_register, so other
 * libraries can use their custom autoloaders
 * @param string $class_name 
 */
function tmsAutoload($class_name) {
	$class_name = preg_replace('/.php/i', '', $class_name);
	$inc[] = FRAMEWORK_DIR .'/'. $class_name .'.class.php';
	$inc[] = EXTEND_DIR    .'/'. $class_name .'.php';
	
	foreach( $inc as $v ) {
		if ( file_exists($v) ) {
			addNote('Autoloading Class: ' . $class_name);
			require_once $v;
		}
	}
	
	// autoload classes based on dir structure
	$parts = explode('_', $class_name);
	$upperFile = implode('/', $parts). '.php';
	$file = INCLUDES_DIR . '/' . $upperFile;
	if (is_file($file)) {
		include_once $file;
	}
}

spl_autoload_register('tmsAutoload', true, true);


/**
 * 
 * @param 
 * 
*/
function hook( $hook_name, $function_name ){
	$GLOBALS['_SITE']['HOOKS'][strtoupper($hook_name)][$function_name] = 1;
}

/**
 * 
 * @param 
 * 
*/
function do_hook( $hook_name ){
	if ( isset($GLOBALS['_SITE']['HOOKS'][strtoupper($hook_name)]) ){
		foreach($GLOBALS['_SITE']['HOOKS'][strtoupper($hook_name)] as $k=>$v) {
			if ( function_exists($k) ) {
				$k();
			}
		}
	}
}

/**
 * 
 * @param 
 * 
*/
function unhook( $hook_name, $function_name = FALSE ){
	if ( isset($GLOBALS['_SITE']['HOOKS'][strtoupper($hook_name)]) ){
		if ( $function_name && isset($GLOBALS['_SITE']['HOOKS'][strtoupper($hook_name)][$function_name]) ) {
			unset($GLOBALS['_SITE']['HOOKS'][strtoupper($hook_name)][$function_name]);
		} else {
			unset($GLOBALS['_SITE']['HOOKS'][strtoupper($hook_name)]);
		}
	}
}

/**
 * 
 * @param 
 * 
*/
function getFileExtension( $sFile ) {
	if ( strrpos($sFile,'.') ) {
		return substr( $sFile, strrpos($sFile,'.')+1 );
	}
	return '';
}

/**
 * 
 * @param 
 * 
*/
function addNote( $msg ) {
	return $GLOBALS['_SITE']['INFO']['PHP_NOTES'][] = $msg;
}

function add_note($msg){
	addNote($msg);
}

/**
 * 
 * @param 
 * 
*/
function add_error( $sMsg, $sScope = FALSE ) {
	error_log($sMsg . ' (' . $sScope . ')');
	$GLOBALS['_SITE']['INFO']['ERRORS']['GLOBAL'][] = $sMsg . '['.( $sScope ? $sScope : 'GLOBAL' ).']';
	if ( $sScope ) {
		$GLOBALS['_SITE']['INFO']['ERRORS'][$sScope][] = $sMsg;
	}
}

/**
 * 
 * @param 
 * 
*/
function get_last_error( $sScope = 'GLOBAL' ) {
	if ( isset($GLOBALS['_SITE']['INFO']['ERRORS'][$sScope]) && count( $GLOBALS['_SITE']['INFO']['ERRORS'][$sScope] ) > 0 ) {
		return $GLOBALS['_SITE']['INFO']['ERRORS'][$sScope][count($GLOBALS['_SITE']['INFO']['ERRORS'][$sScope])];
	}
	return FALSE;
}

/**
 * 
 * @param 
 * 
*/
function get_errors( $sScope = 'GLOBAL' ) {
	if ( isset($GLOBALS['_SITE']['INFO']['ERRORS'][$sScope]) && count( $GLOBALS['_SITE']['INFO']['ERRORS'][$sScope] ) > 0 ) {
		return $GLOBALS['_SITE']['INFO']['ERRORS'][$sScope];
	}
	return array();
}

/**
 *
 * @param
 *
*/
function print_errors( $sScope = 'GLOBAL') {
	$a = get_errors($sScope);
	$sErrors = '';
	if (!empty($a)){
		$sErrors .= '<div id="error_dialog">';
		foreach ($a as $s) {
			$sErrors .= $s . "<br>";
		}
		$sErrors .= '</div>';
	}
	echo $sErrors;
}

/*
 * Useful for rewriting querystrings with existing filters
 * @param arr queryname(lowercase) => queryvalue 
 */
function rewrite_querystring( $aNewValues ) {
	if ( !is_array($aNewValues) ) return $_SERVER['QUERYSTRING'];
	
	$aQueryString = $_GET;
	$aReturnQuery = array();
	
	// Rewrite old Querystring
	foreach ( $aQueryString as $sName =>$sValue ) {
		if ( isset($aNewValues[strtolower($sName)]) && $aNewValues[strtolower($sName)] !== FALSE ) {
			if ( !is_array($aNewValues[strtolower($sName)]) ) 
				$aNewValues[strtolower($sName)] = array($aNewValues[strtolower($sName)]);
				
			foreach ( $aNewValues[strtolower($sName)] as $sMultiValue ) {
				$aReturnQuery[] = $sName .'='. $sMultiValue;
			}
			unset( $aNewValues[strtolower($sName)] );
		} 
	}
	
	// Append New Querystrings
	foreach ( $aNewValues as $sName => $sValue ) {
		if ( !is_array($sValue) ) 
			$sValue = array($sValue);
			
		foreach ( $sValue as $sMultiValue ) {
			$aReturnQuery[] = $sName .'='. $sMultiValue;
		}
		unset( $aNewValues[strtolower($sName)] );
	}
	
	
	$sReturnQuery = implode( '&', $aReturnQuery );
	
	return $sReturnQuery;
} 

// In the Pipe - Code snippet didn't work :(
function since_date( $sDateFrom, $sDateTo = FALSE ){
	
	if ( $sDateTo === FALSE) {
		$nDateTo = time();
	}elseif ( !is_numeric($sDateTo) ){
		$nDateTo = strtotime($sDateTo);
	}else{
		$nDateTo = $sDateTo;
	}
	
	if ( !is_numeric($sDateFrom) ){
		$nDateFrom = strtotime($sDateFrom);
	}else{
		$nDateFrom = $sDateFrom;
	}
	
	$result=""; 
	$second=1; 
	$minute=$second*60; 
	$hour=$minute*60; 
	$day=$hour*24; 
	$week=$day*7; 
	
	$timestamp1 = $nDateTo; 
	$timestamp2 = $nDateFrom; 
	
	$diffrence = $timestamp2-$timestamp1; 
	
	$weeks     = round((((($diffrence/$minute)/$hour)/$day)/$week)); 
	$r_days    = $diffrence-($weeks*$week*$day*$hour*$minute*$second); 
	$days      = round(((($r_days/$minute)/$hour)/$day)); 
	$r_hours   = $r_days-($days*$day*$hour*$minute*$second); 
	$hours     = round((($r_hours/$minute)/$hour)); 
	$r_minutes = $r_hours-($hours*$hour*$minute*$second); 
	$minutes   = round($r_minutes/$minute); 
	$seconds   = $r_minutes-($minutes*$minute*$second);
	
	$aReturnDate            = array();
	$aReturnDate['weeks']   = $weeks;
	$aReturnDate['days']    = $days;
	$aReturnDate['hours']   = $hours;
	$aReturnDate['minutes'] = $minutes;
	$aReturnDate['seconds'] = $seconds;
	
	return $aReturnDate;
}



/*******************************************************************************
Version: 1.11 ($Rev: 175 $)
Website: http://sourceforge.net/projects/simplehtmldom/
Author: S.C. Chen <me578022@gmail.com>
Acknowledge: Jose Solorzano (https://sourceforge.net/projects/php-html/)
Contributions by:
    Yousuke Kumakura (Attribute filters)
    Vadim Voituk (Negative indexes supports of "find" method)
    Antcs (Constructor with automatically load contents either text or file/url)
Licensed under The MIT License
Redistributions of files must retain the above copyright notice.
*******************************************************************************/

define('HDOM_TYPE_ELEMENT', 1);
define('HDOM_TYPE_COMMENT', 2);
define('HDOM_TYPE_TEXT',    3);
define('HDOM_TYPE_ENDTAG',  4);
define('HDOM_TYPE_ROOT',    5);
define('HDOM_TYPE_UNKNOWN', 6);
define('HDOM_QUOTE_DOUBLE', 0);
define('HDOM_QUOTE_SINGLE', 1);
define('HDOM_QUOTE_NO',     3);
define('HDOM_INFO_BEGIN',   0);
define('HDOM_INFO_END',     1);
define('HDOM_INFO_QUOTE',   2);
define('HDOM_INFO_SPACE',   3);
define('HDOM_INFO_TEXT',    4);
define('HDOM_INFO_INNER',   5);
define('HDOM_INFO_OUTER',   6);
define('HDOM_INFO_ENDSPACE',7);

// helper functions
// -----------------------------------------------------------------------------
// get html dom form file
function file_get_html() {
    $dom = new simple_html_dom;
    $args = func_get_args();
    $dom->load(call_user_func_array('file_get_contents', $args), true);
    return $dom;
}

// get html dom form string
function str_get_html($str, $lowercase=true) {
    $dom = new simple_html_dom;
    $dom->load($str, $lowercase);
    return $dom;
}

// dump html dom tree
function dump_html_tree($node, $show_attr=true, $deep=0) {
    $lead = str_repeat('    ', $deep);
    echo $lead.$node->tag;
    if ($show_attr && count($node->attr)>0) {
        echo '(';
        foreach($node->attr as $k=>$v)
            echo "[$k]=>\"".$node->$k.'", ';
        echo ')';
    }
    echo "\n";

    foreach($node->nodes as $c)
        dump_html_tree($c, $show_attr, $deep+1);
}

// get dom form file (deprecated)
function file_get_dom() {
    $dom = new simple_html_dom;
    $args = func_get_args();
    $dom->load(call_user_func_array('file_get_contents', $args), true);
    return $dom;
}

// get dom form string (deprecated)
function str_get_dom($str, $lowercase=true) {
    $dom = new simple_html_dom;
    $dom->load($str, $lowercase);
    return $dom;
}
/*********************************************************************
*********************************************************************/

function get_commission_rate($nMargin, $nMultiplier = 1) {
	$nMarginThreshold = 40000;
	$nCommissionCap = 0.15;

	$nCommissionPct = ($nMargin / $nMarginThreshold) * $nCommissionCap;
	if ($nCommissionPct > $nCommissionCap) $nCommissionPct = $nCommissionCap;

	return array( 'comm_pct' => $nCommissionPct,
				'commission' => ($nCommissionPct * $nMargin * $nMultiplier) );
}

function mssql_real_escape_string($data) {
	if ( !isset($data) or empty($data) ) return '';
	if ( is_numeric($data) ) return $data;

	$non_displayables = array(
		'/%0[0-8bcef]/',            // url encoded 00-08, 11, 12, 14, 15
		'/%1[0-9a-f]/',             // url encoded 16-31
		'/[\x00-\x08]/',            // 00-08
		'/\x0b/',                   // 11
		'/\x0c/',                   // 12
		'/[\x0e-\x1f]/'             // 14-31
	);
	foreach ( $non_displayables as $regex )
		$data = preg_replace( $regex, '', $data );
	$data = str_replace("'", "''", $data );
	return $data;
}

function displayErrors() {
	if (!empty($GLOBALS['_SITE']['INFO']['ERRORS']) && count($GLOBALS['_SITE']['INFO']['ERRORS']) > 0) {
		echo '<div id="user_message" class="rounded7">';
		foreach ($GLOBALS['_SITE']['INFO']['ERRORS']['GLOBAL'] as $sMessage) {
			echo "<p class=\"user_message\">$sMessage</p>";
		}
		echo '</div>';
	}
}
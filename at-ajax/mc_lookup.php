<?php
require_once($_SERVER['DOCUMENT_ROOT'] . '/at-includes/engine.php');
require_once($_SERVER['DOCUMENT_ROOT'] . '/resources/functions.php');


$o = new Carrier411();
$sSessionId = $o->session_id();
$nNum = request('mc', '');
if ( empty($nNum) ) die('{"success": "false"}');

$oCarrier = new CarrierBaseExtended();

$oCarrier->where('mc_no', '=', $nNum);
$a = $oCarrier->list()->rows;
if (count($a)) die( json_encode(array('FAULTMESSAGE' => 'MC' . $nNum . 
	' Already exists in our system. Can not create duplicate entry.') ) );


$nDocketNum = 'MC' . $nNum;
$a = $o->get_company($nDocketNum, $sSessionId);

$a['success'] = 'true';

echo json_encode($a);

?>
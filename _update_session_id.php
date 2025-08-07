<?php
require_once('at-includes/engine.php');
require_once('resources/functions.php');

$oCarrier411 = new Carrier411();
$aCarrier411 = $oCarrier411->list()->rows;
$sUser = 'testpost';
$sPass = 'lamppost';

foreach ($aCarrier411 as $row) {
    $sSessionId = $row->get_session_id();
    $sCreatedAt = $row->get_created_at();
    $aStart = explode(" ", $sCreatedAt);
    $aStartDate = explode("-", $aStart[0]);
    $nCreatedDay = $aStartDate[2]; 
}

$aCurrentTime = getdate();
$nCurrentDay = $aCurrentTime['mday'];
$oCarrier411->where('session_id', '=', $sSessionId);
$oCarrier411->delete();

/*if ($nCreatedDay != $nCurrentDay) {
    $oCarrier411->login($sUser, $sPass);
    $oCarrier411->create($oCarrier411->get_session_uuid($oCarrier411->last_response()));
} */
    $oCarrier411->login($sUser, $sPass);
    $oCarrier411->create($oCarrier411->get_session_uuid($oCarrier411->last_response()));

?>

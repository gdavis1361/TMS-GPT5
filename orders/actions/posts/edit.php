<?php
require_once('set_stops_vars.php');
$preOrder = new PreOrderBase();
$preOrder->doPreOrder($nId, $nCustomerId, $nOrderedById, $nUserId, $vIsQuote, $vIsContractedRate, $vIsPost, $vTeamRequired, $nFuelCharge, $nLineHaulCharge, $aAccessorials, $nBillToId, $sOrderComment, $aOrderDetails, $aEquipmentAllowed, $aModesAllowed, $aStops);
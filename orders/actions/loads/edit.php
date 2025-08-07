<?php
$order = new OrderBase();
$order->doOrder($nId, $nCustomerId, $nOrderedById, $nUserId, $vIsQuote, $vIsContractedRate, $vIsPost, $vTeamRequired, $nFuelCharge, $nLineHaulCharge, $aAccessorials, $nBillToId, $sOrderComment, $aOrderDetails, $aEquipmentAllowed, $aModesAllowed, $aStops, $nStatusId);

$order = new OrderBase();
$order->load($nId);
$order->checkTasks();
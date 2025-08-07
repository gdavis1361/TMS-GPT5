<?php
$oOrder = new OrderBase();
$oOrder->load($nId);
$oOrder->set_inactive($nId);
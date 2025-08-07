<?php
require_once($_SERVER['DOCUMENT_ROOT'] . '/at-includes/engine.php');
require_once($_SERVER['DOCUMENT_ROOT'] . '/resources/functions.php');

$nLocId = request( 'id' );
if( empty( $nLocId ) ){echo json_encode( array() );return;}

echo json_encode( LocationInstructions::get_instructions_by_location_id( $nLocId ) );
?>
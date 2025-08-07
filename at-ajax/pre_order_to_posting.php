<?
require_once($_SERVER['DOCUMENT_ROOT'] . '/resources/init.php');

$nPreOrderId = request( 'id' );
$nPostingServiceId = request( 'posting_service_id' );
$nUserId = get_user_id();
$nServiceStatus = 1;

// unit testing data
/*$nPreOrderId = 124;
$nPostingServiceId =1;
$nUserId = 137;*/

// create new posting_base
$oPosting = new PostingBase();
$oPosting->create( $nUserId );

$nPostingId = $oPosting->get_posting_id();

// add posting_id and $nPreOrderId to pre_order_to_posting table (use object)
$oPreOrderToPosting = new PreOrderToPosting();
$oPreOrderToPosting->create( $nPreOrderId, $nPostingId );
// create posting_to_service table entry
foreach( $nPostingServiceId as $nId ){
	$oPostingToService = new PostingToService();
	$oPostingToService->create( $nPostingId, $nId, $nServiceStatus, $nUserId );
}

echo json_encode( array( true ) );
?>
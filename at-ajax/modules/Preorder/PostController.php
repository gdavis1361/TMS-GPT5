<?php

class Preorder_PostController extends AjaxController {

	public function doPostAction() {
		$this->setParam('post', $_POST);
		$preOrderIds = json_decode(getPostParam('preOrderIds', array()), true);
		$postingServiceIds = json_decode(getPostParam('postingServiceIds', array()), true);
		$numPreOrders = count($preOrderIds);
		$numPostingServices = count($postingServiceIds);

		$nUserId = get_user_id();
		for ($i = 0; $i < $numPreOrders; $i++) {
			$preOrderId = intval($preOrderIds[$i]);

			for ($j = 0; $j < $numPostingServices; $j++) {
				$postingServiceId = intval($postingServiceIds[$j]);


				$nServiceStatus = 1;

				// create new posting_base
				$oPosting = new PostingBase();
				$oPosting->create($nUserId);

				$nPostingId = $oPosting->get_posting_id();

				// add posting_id and $nPreOrderId to pre_order_to_posting table (use object)
				$oPreOrderToPosting = new PreOrderToPosting();
				$oPreOrderToPosting->create($preOrderId, $nPostingId);
				
				// create posting_to_service table entry
				$oPostingToService = new PostingToService();
				$oPostingToService->create($nPostingId, $postingServiceId, $nServiceStatus, $nUserId);
			}
		}

		$this->setParam('preOrderIds', $preOrderIds);
	}

}
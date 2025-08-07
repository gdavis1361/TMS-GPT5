<?php
// do the post cancelation code here
$oPosting = new PostingBase();
$oPosting->load($nId);
$oPosting->cancel();
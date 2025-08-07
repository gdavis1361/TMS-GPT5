<div class="contentBox2">
	<div class="header_text Delicious">My Page</div>
	<div class="contentBox2_body" style="padding-top: 10px;">
		
		<?php include_once dirname(__FILE__) . '/../includes/header.php'; ?>
		
		<?php include_once dirname(__FILE__) . '/../includes/navigation.php'; ?>
		
		<div id="mypage-dashboard" class="mypage-content"></div>
		
		<div class="clear"></div>
		
	</div>
</div>
<script type="text/javascript">
	//Require any files we need
	Ext.require([
		'MyPage.user.Margin',
	]);
	
	Ext.onReady(function() {
		new MyPage.user.Margin({
			title: 'My Stats - Margin',
			renderTo: 'mypage-dashboard'
		});
	});
</script>
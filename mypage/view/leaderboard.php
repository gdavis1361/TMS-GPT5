<div class="contentBox2_body" style="padding-top: 10px;">
	<div id="mypage-dashboard" class="mypage-content"></div>
	<div class="clear"></div>
</div>
<script type="text/javascript">
	Ext.require([
		'TMS.mypage.dashboard.Leaderboard'
	]);
	
	Ext.onReady(function() {
		Ext.create('TMS.mypage.dashboard.Leaderboard', {
			renderTo: 'mypage-dashboard'
		});
	});
</script>
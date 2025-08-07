<div id="mypage-dashboard" class="content-container"></div>
<script type="text/javascript">
	Ext.require([
		'TMS.mypage.dashboard.Leaderboard'
	]);
	
	Ext.onReady(function() {
		Ext.create('TMS.mypage.dashboard.Leaderboard', {
			title: 'Stats',
			renderTo: 'mypage-dashboard',
			bodyPadding: 10
		});
	});
</script>
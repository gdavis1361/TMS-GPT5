<div id="mypage-dashboard" class="content-container"></div>

<script type="text/javascript">
	Ext.require([
		'TMS.mypage.dashboard.Stats',
	]);
	
	Ext.onReady(function() {
		Ext.create('TMS.mypage.dashboard.Stats', {
			title: 'My Page',
			renderTo: 'mypage-dashboard',
			bodyPadding: 10
		});
	});
</script>
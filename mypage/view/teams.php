<div id="mypage-dashboard" class="content-container"></div>
<script type="text/javascript">
	Ext.require([
		'TMS.mypage.dashboard.Teams',
		'TMS.panel.plugin.AutoHeight'
	]);
	
	Ext.onReady(function() {
		Ext.create('TMS.mypage.dashboard.Teams', {
			title: 'Teams',
			renderTo: 'mypage-dashboard',
			plugins:[Ext.create('TMS.panel.plugin.AutoHeight')]
		});
	});
</script>
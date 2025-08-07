<script>
Ext.onReady(function() {
	var stops = [{
		zip:37379
	},{
		city:'atlanta',
		state:'ga'
	},{
		zip:37377
	}];
	Ext.Ajax.request({
		scope:this,
		method:'post',
		url:'/at-ajax/modules/mileage/process/calculate-miles',
		params:{
			stops:Ext.encode(stops)
		},
		success: function(r) {
			var response = Ext.decode(r.responseText);

		}
	});
});
</script>
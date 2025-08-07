Ext.define('TMS.TimeDifference', {
	extend: 'Ext.util.Observable',
	
	config: {
		selectorCls:'time-difference',
		futurePrefix:'In',
		futureSuffix:'',
		pastPrefix:'',
		pastSuffix:'ago'
	},
	
	displays:false,
	
	constructor: function(config) {
		this.initConfig(config);
		this.displays = Ext.select('.' + this.selectorCls, true);
		this.displays.removeCls(this.selectorCls);
		this.initDisplays();
		this.updateDisplays();
		this.interval = setInterval(Ext.Function.bind(this.updateDisplays, this), 1000);
	},
	
	remove: function() {
		clearInterval(this.interval);
	},
	
	initDisplays: function() {
		this.displays.addCls('x-hidden');
		var numDisplays = this.displays.elements.length;
		var originalDate = new Date();
		for (var i = 0; i < numDisplays; i++) {
			originalDate.setTime(this.displays.elements[i].dom.innerHTML + '000');
			this.displays.elements[i].originalTime = originalDate.getTime();
		}
		this.displays.update('');
		this.displays.removeCls('x-hidden');
	},
	
	updateDisplays: function() {
		var numDisplays = this.displays.elements.length;
		var now = (new Date()).getTime();
		for (var i = 0; i < numDisplays; i++) {
			this.displays.elements[i].update(this.getDisplayText(now - this.displays.elements[i].originalTime));
		}
	},
	
	getDisplayText: function(ts) {
		ts /= 1000;
		var isPositive = true;
		if (ts < 0) {
			isPositive = false;
			ts = -ts;
		}
		var chunks = [
			[31536000, 'year'],
			[2592000 , 'month'],
			[604800, 'week'],
			[86400 , 'day'],
			[3600 , 'hour'],
			[60 , 'minute'],
			[1 , 'second']
		];

		var name = '';
		var seconds = '';
		var numChunks = chunks.length;
		var count = 0;
		for (var i = 0; i < numChunks; i++) {
			seconds = chunks[i][0];
			name = chunks[i][1];
			count = Math.floor(ts / seconds);
			if (count) {
				break;
			}
		}
		
		var display = count + ' ' + name;
		if (count > 1) {
			display += 's';
		}
		
		if (isPositive) {
			display = this.pastPrefix + ' ' + display + ' ' + this.pastSuffix;
		}
		else {
			display = this.futurePrefix + ' ' + display + ' ' + this.futureSuffix;
		}
		
		return display;
		
		var days = Math.floor(ts / 86400);
		var hours = Math.floor((ts - (days * 86400 ))/3600);
		var minutes = Math.floor((ts - (days * 86400 ) - (hours *3600 ))/60);
		var seconds = Math.floor((ts - (days * 86400 ) - (hours *3600 ) - (minutes*60)));
		var x = days + " Days " + hours + " Hours " + minutes + " Minutes and " + seconds + " Seconds ";
		return x;
	}
	
});
Ext.define('TMS.mypage.user.Info', {
	extend: 'Ext.container.Container',
	
	//Config
	border: false,
	unstyled: true,
	cls: 'mypage-user-info',
	height: 250,
	
	initComponent: function(){
		this.init();
		this.callParent(arguments);
	},
	
	//Init Functions
	init: function(){
		this.items = [];
		this.initInfoTemplate();
	},
	
	initInfoTemplate: function(){
		this.infoTemplate = new Ext.XTemplate(
			'<div class="name">',
				'{name} | {team_name}',
			'</div>',
			'<div class="branch">',
				'{branch_name}',
			'</div>',
			'<div class="image">',
				'<img src="{image}" />',
			'</div>',
			'<div class="points">',
				'<span class="points-text">Points: </span>{points}',
			'</div>',
			'<div class="rank">',
				'<span class="rank-text">Rank: </span>{[Ext.util.Inflector.ordinalize(values.rank)]} of {total} ({[this.getPercentile(values.rank, values.total)]})',
			'</div>',
			{
				getPercentile: function(rank, total){
					var percent = Math.floor((rank/total) * 100);
					var verb = "Top";
					if(percent > 50){
						verb = "Bottom";
						percent = 100 - percent;
						
						//Round Up
						if(percent > 10){
							percent = ((Math.ceil((percent/10))) * 10);
						}
					}
					else{
						//Round down
						if(percent > 10){
							percent = (Math.floor((percent/10))) * 10;
						}
					}
					
					//check for 0
					if(percent == 0){
						percent = 1;
					}
					
					return verb + " " + percent + "%";
				}
			}
		);
	},
	
	update: function(data){
		this.callParent([this.infoTemplate.apply(data)]);
	}
});
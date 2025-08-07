Ext.define('TMS.league.form.Game', {
	extend:'Ext.form.Panel',
	requires:[
		'TMS.league.store.Team',
		'TMS.league.model.Game'
	],
	
	//Config
	bodyPadding: 10,
	showFooter: true,
	
	initComponent: function(){
		this.items = this.items || [];
		this.dockedItems = this.dockedItems || [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.initStore();
		this.initHomeTeam();
		this.initAwayTeam();
		this.initHidden();
		this.initFooter();
	},
	
	initStore: function(){
		this.store = Ext.create('TMS.league.store.Team');
	},
	
	initHomeTeam: function(){
		this.homeTeam = new Ext.form.ComboBox({
			name: 'home_team_id',
			fieldLabel: 'Home Team',
			store: this.store,
			queryMode: 'local',
			displayField: 'team_name',
			valueField: 'league_team_id'
		});
		this.store.on('load', function(){
			this.homeTeam.setValue(this.homeTeam.getValue());
		}, this);
		this.items.push(this.homeTeam);
	},
	
	initAwayTeam: function(){
		this.awayTeam = new Ext.form.ComboBox({
			name: 'away_team_id',
			fieldLabel: 'Away Team',
			store: this.store,
			queryMode: 'local',
			displayField: 'team_name',
			valueField: 'league_team_id'
		});
		this.store.on('load', function(){
			this.awayTeam.setValue(this.awayTeam.getValue());
		}, this);
		this.items.push(this.awayTeam);
	},
	
	initHidden: function() {
		this.gameId = Ext.create('Ext.form.field.Hidden', {
			name: 'game_id'
		});
		this.items.push(this.gameId);
	},
	
	initFooter: function(){
		if(!this.showFooter){
			return false;
		}
		
		this.footer = new Ext.toolbar.Toolbar({
			dock: 'bottom',
			ui: 'footer',
			items: ['->', {
				scope: this,
				itemId: 'save',
				text: 'Save',
				formBind: true,
				handler: this.save
			}]
		});
		this.dockedItems.push(this.footer);
	},
	
	save: function(){
        var form = this.getForm();
		var record = form.getRecord();

		//If form is invalid return
		if(!form.isValid()){
			return;
		}
		
		//If there is not a record fire the create event, else update the record and fire the update event
        if (!record) {
			record = Ext.create('TMS.league.model.Game', form.getValues());
			this.setLoading('Saving...');
			record.save({
				scope: this,
				callback: function(records){
					this.setLoading(false);
					this.fireEvent('create', this, records);
				}
			});
        }
        else{
			this.setLoading('Saving...');
            form.updateRecord(record);
			record.save({
				scope: this,
				callback: function(records){
					this.setLoading(false);
					this.fireEvent('update', this, records);
				}
			});
        }
    },
	
	cancel: function(){
		this.fireEvent('cancel', this);
	}
});
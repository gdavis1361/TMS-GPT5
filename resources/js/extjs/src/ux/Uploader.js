Ext.define('Ext.ux.Uploader', {
	extend:'Ext.panel.Panel',
	
	alias: ['widget.uploader'],
	
	url:false,
	autoUpload:false,
	useSmallDisplay:false,
	
	numToUpload:0,
	numUploaded:0,
	extraParams:{},
	
	initComponent: function() {
		this.items = this.items || [];
		this.addEvents('uploadcomplete');
		this.initButton();
		this.initProgressBar();
		this.initListeners();
		this.callParent(arguments);
	},
	
	initButton: function() {
		this.button = Ext.create('Ext.button.Button', {
			text:'Upload',
			icon:this.icon,
			scale:this.scale || 'small'
		});
		this.items.push(this.button);
	},
	
	initProgressBar: function() {
		this.progressBar = Ext.create('Ext.ProgressBar', {
			hidden:true
		});
		this.items.push(this.progressBar);
	},
	
	initPlupload: function() {
		this.plupload = new plupload.Uploader(Ext.apply({
			runtimes : 'html5',
			url : this.url,
			browse_button:this.getEl().dom.id
		}, this.config));
		this.plupload.bind('FilesAdded', function(uploader, files) {
			if (this.autoUpload) {
				setTimeout(Ext.bind(this.start, this), 200);
			}
		}, this);
		this.plupload.bind('UploadProgress', function(uploader, file) {
			this.progressBar.updateProgress(file.percent/100, file.name);
		}, this);
		
		this.plupload.bind('BeforeUpload', function(uploader, file) {
			uploader.settings.multipart_params = {
				extraParams:Ext.encode(this.extraParams)
			};
		}, this);
		
		this.plupload.bind('FileUploaded', function(uploader, file, response) {
			this.numUploaded++;
			response = Ext.decode(response.response);
		}, this);
		this.plupload.bind('UploadComplete', function(uploader, files) {
			this.progressBar.hide();
			this.button.show();
			this.setWidth(null);
			this.fireEvent('uploadcomplete');
		}, this);
		
		this.plupload.init();
	},
	
	start: function() {
		this.button.hide();
		this.progressBar.show();
		this.setWidth(200, true);
		this.numToUpload = this.plupload.files.length;
		this.plupload.start();
	},
	
	initListeners: function() {
		this.on('afterrender', function() {
			this.initPlupload();
		}, this);
		
	}
	
});
Ext.define('TMS.IframeWindow', {
	extend:'TMS.ActionWindow',
	
	iframe:false,
	iframeHtml:false,
	title:' ',
	url:false,
	
	init: function() {
		this.initIframe();
		this.initButtons();
	},
	
	initIframe: function() {
		this.iframeHtml = Ext.core.DomHelper.markup({
			tag:'iframe',
			cls:'rate-confirmation-iframe',
			border:0,
			frameborder:0,
			width:'100%',
			height:'100%'
		});
		this.html = this.iframeHtml;
		this.on('afterrender', function(){
			this.iframe = this.getEl().down('iframe');
			this.setHeight(Ext.Element.getViewportHeight() * .8);
			this.setWidth(Ext.Element.getViewportWidth() * .9);
			this.center();
			if (this.url) {
				this.loadUrl(this.url);
			}
		}, this);
	},
	
	initButtons: function() {
		this.showCloseButton();
	},
	
	loadUrl: function(url) {
		this.url = url;
		this.setLoading(true);
		
		this.iframe.on('load', function() {
			this.setLoading(false);
		}, this);
		this.iframe.dom.src = this.url;
	}
});
Ext.define('TMS.portal.Column', {
    extend: 'Ext.container.Container',
    alias: 'widget.portalcolumn',
	requires:[
		'TMS.portal.Portlet'
	],
	
    layout: {
        type: 'anchor'
    },
    defaultType: 'portlet',
    cls: 'x-portal-column'
    //
    // This is a class so that it could be easily extended
    // if necessary to provide additional behavior.
    //
});
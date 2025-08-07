var RedokesPath = '/resources/js/Redokes/src';
if (Ext.Loader.config.enabled) {
	Ext.Loader.setPath('Redokes', RedokesPath);
}
else {
	Ext.Loader.setConfig({
		enabled: true,
		paths:{
			Redokes: RedokesPath
		}
	});
}
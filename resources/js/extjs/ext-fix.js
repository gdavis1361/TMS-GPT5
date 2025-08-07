/*
 * BUG: FILTERREPLACE
 * When applying a filter for the second time with the same property but a different value, the value is not replaced but added.
 *
 * http://www.sencha.com/forum/showthread.php?133008-4.0.0-Store-filter-not-replaced.
 * 
 * Original Author: JanVenekamp, Sencha User: http://www.sencha.com/forum/member.php?186299-JanVenekamp
 */
Ext.syncRequire('Ext.data.AbstractStore');

Ext.override(Ext.data.AbstractStore, {

    //documented above
    constructor: function(config) {
        var me = this,
            filters;
        
        me.addEvents(
            /**
             * @event add
             * Fired when a Model instance has been added to this Store
             * @param {Ext.data.Store} store The store
             * @param {[Ext.data.Model]} records The Model instances that were added
             * @param {Number} index The index at which the instances were inserted
             */
            'add',

            /**
             * @event remove
             * Fired when a Model instance has been removed from this Store
             * @param {Ext.data.Store} store The Store object
             * @param {Ext.data.Model} record The record that was removed
             * @param {Number} index The index of the record that was removed
             */
            'remove',
            
            /**
             * @event update
             * Fires when a Record has been updated
             * @param {Store} this
             * @param {Ext.data.Model} record The Model instance that was updated
             * @param {String} operation The update operation being performed. Value may be one of:
             *
             *     Ext.data.Model.EDIT
             *     Ext.data.Model.REJECT
             *     Ext.data.Model.COMMIT
             */
            'update',

            /**
             * @event datachanged
             * Fires whenever the records in the Store have changed in some way - this could include adding or removing
             * records, or updating the data in existing records
             * @param {Ext.data.Store} this The data store
             */
            'datachanged',

            /**
             * @event beforeload
             * Fires before a request is made for a new data object. If the beforeload handler returns false the load
             * action will be canceled.
             * @param {Ext.data.Store} store This Store
             * @param {Ext.data.Operation} operation The Ext.data.Operation object that will be passed to the Proxy to
             * load the Store
             */
            'beforeload',

            /**
             * @event load
             * Fires whenever the store reads data from a remote data source.
             * @param {Ext.data.Store} this
             * @param {[Ext.data.Model]} records An array of records
             * @param {Boolean} successful True if the operation was successful.
             */
            'load',

            /**
             * @event beforesync
             * Fired before a call to {@link #sync} is executed. Return false from any listener to cancel the synv
             * @param {Object} options Hash of all records to be synchronized, broken down into create, update and destroy
             */
            'beforesync',
            /**
             * @event clear
             * Fired after the {@link #removeAll} method is called.
             * @param {Ext.data.Store} this
             */
            'clear'
        );
        
        Ext.apply(me, config);
        // don't use *config* anymore from here on... use *me* instead...

        /**
         * Temporary cache in which removed model instances are kept until successfully synchronised with a Proxy,
         * at which point this is cleared.
         * @private
         * @property {[Ext.data.Model]} removed
         */
        me.removed = [];

        me.mixins.observable.constructor.apply(me, arguments);
        me.model = Ext.ModelManager.getModel(me.model);

        /**
         * @property {Object} modelDefaults
         * @private
         * A set of default values to be applied to every model instance added via {@link #insert} or created via {@link #create}.
         * This is used internally by associations to set foreign keys and other fields. See the Association classes source code
         * for examples. This should not need to be used by application developers.
         */
        Ext.applyIf(me, {
            modelDefaults: {}
        });

        //Supports the 3.x style of simply passing an array of fields to the store, implicitly creating a model
        if (!me.model && me.fields) {
            me.model = Ext.define('Ext.data.Store.ImplicitModel-' + (me.storeId || Ext.id()), {
                extend: 'Ext.data.Model',
                fields: me.fields,
                proxy: me.proxy || me.defaultProxyType
            });

            delete me.fields;

            me.implicitModel = true;
        }
        
        // <debug>
        if (!me.model) {
            if (Ext.isDefined(Ext.global.console)) {
                Ext.global.console.warn('Store defined with no model. You may have mistyped the model name.');
            }
        }
        // </debug>

        //ensures that the Proxy is instantiated correctly
        me.setProxy(me.proxy || me.model.getProxy());

        if (me.id && !me.storeId) {
            me.storeId = me.id;
            delete me.id;
        }

        if (me.storeId) {
            Ext.data.StoreManager.register(me);
        }
        
        me.mixins.sortable.initSortable.call(me);        
        
        /**
         * @property {Ext.util.MixedCollection} filters
         * The collection of {@link Ext.util.Filter Filters} currently applied to this Store
         */
        filters = me.decodeFilters(me.filters);
        me.filters = Ext.create('Ext.util.MixedCollection');
        
        /**
         * @override {Ext.util.MixedCollection.getKey}
         * Override the getKey Method, so that filters will be replaced if there 
         * is already a filter for that property
         */
        me.filters.getKey = function(item) { 
            return item.property;
        };
        
        me.filters.addAll(filters);
    }
});



/**
 * Prevent the page from scrolling when you click on a grid
 */
Ext.override(Ext.selection.RowModel, {
	onRowMouseDown: function(view, record, item, index, e) {
		//view.el.focus();
		this.selectWithEvent(record, e);
	}
});

Ext.override(Ext.selection.CheckboxModel, {
	onRowMouseDown: function(view, record, item, index, e) {
		//view.el.focus();
		this.selectWithEvent(record, e);
	}
});

/*
 * BUG: Draggable panel, when hidden
 */
Ext.override(Ext.panel.DD, {
	constructor : function(panel, cfg){
        this.panel = panel;
        this.dragData = {panel: panel};
        this.proxy = Ext.create('Ext.panel.Proxy', panel, cfg);

        this.callParent([panel.el, cfg]);

        Ext.defer(function() {
            var header = panel.header,
                el = panel.body;
            if(header){
                this.setHandleElId(header.id);
				if(header.rendered){
					el = header.el;
				}
				else{
					header.on('afterrender', function(header){
						header.el.setStyle('cursor', 'move');
					}, this);
				}
            }
			else{
				el.setStyle('cursor', 'move');
			}
            this.scroll = false;
        }, 200, this);
    }
});

/*
 * BUG: Basic form id not found
 * When a field is removed from the form, the field still exists when getFields() is called
 */
Ext.override(Ext.form.Basic, {
	getFields: function() {
		var fields = this._fields = Ext.create('Ext.util.MixedCollection');
		fields.addAll(this.owner.query('[isFormField]'));
        return fields;
    }
});


/*
Ext.define = function (className, data, createdFn) {
	if(Ext.ClassManager.get(className) != null){
		console.log('existed');
		return;
	}
	if (!data.override) {
		return Ext.ClassManager.create.apply(Ext.ClassManager, arguments);
	}

	var requires = data.requires,
		uses = data.uses,
		overrideName = className;

	className = data.override;

	// hoist any 'requires' or 'uses' from the body onto the faux class:
	data = Ext.apply({}, data);
	delete data.requires;
	delete data.uses;
	delete data.override;

	// make sure className is in the requires list:
	if (typeof requires == 'string') {
		requires = [ className, requires ];
	} else if (requires) {
		requires = requires.slice(0);
		requires.unshift(className);
	} else {
		requires = [ className ];
	}

// TODO - we need to rework this to allow the override to not require the target class
//  and rather 'wait' for it in such a way that if the target class is not in the build,
//  neither are any of its overrides.
//
//  Also, this should process the overrides for a class ASAP (ideally before any derived
//  classes) if the target class 'requires' the overrides. Without some special handling, the
//  overrides so required will be processed before the class and have to be bufferred even
//  in a build.
//
// TODO - we should probably support the "config" processor on an override (to config new
//  functionaliy like Aria) and maybe inheritableStatics (although static is now supported
//  by callSuper). If inheritableStatics causes those statics to be included on derived class
//  constructors, that probably means "no" to this since an override can come after other
//  classes extend the target.
	return Manager.create(overrideName, {
			requires: requires,
			uses: uses,
			isPartial: true,
			constructor: function () {
				//<debug error>
				throw new Error("Cannot create override '" + overrideName + "'");
				//</debug>
			}
		}, function () {
			var cls = Manager.get(className);
			if (cls.override) { // if (normal class)
				cls.override(data);
			} else { // else (singleton)
				cls.self.override(data);
			}

			if (createdFn) {
				// called once the override is applied and with the context of the
				// overridden class (the override itself is a meaningless, name-only
				// thing).
				createdFn.call(cls);
			}
		});
}
*/

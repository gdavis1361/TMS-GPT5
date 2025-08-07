/*!
 * Extensible 1.5.0-beta1
 * Copyright(c) 2010-2011 Extensible, LLC
 * licensing@ext.ensible.com
 * http://ext.ensible.com
 */
/**
 * @class Extensible.calendar.form.field.CalendarCombo
 * @extends Ext.form.ComboBox
 * <p>A custom combo used for choosing from the list of available calendars to assign an event to. You must
 * pass a populated calendar store as the store config or the combo will not work.</p>
 * <p>This is pretty much a standard combo that is simply pre-configured for the options needed by the
 * calendar components. The default configs are as follows:<pre><code>
fieldLabel: 'Calendar',
triggerAction: 'all',
queryMode: 'local',
forceSelection: true,
width: 200
</code></pre>
 * @constructor
 * @param {Object} config The config object
 */
Ext.define('Extensible.calendar.form.field.CalendarCombo', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.extensible.calendarcombo',
    
    requires: ['Extensible.calendar.data.CalendarMappings'],
    
    fieldLabel: 'Calendar',
    triggerAction: 'all',
    queryMode: 'local',
    forceSelection: true,
    selectOnFocus: true,
    width: 200,
    
    // private
    defaultCls: 'x-cal-default',
    
    // private
    initComponent: function(){
        this.valueField = Extensible.calendar.data.CalendarMappings.CalendarId.name;
        this.displayField = Extensible.calendar.data.CalendarMappings.Title.name;
    
        this.listConfig = Ext.apply(this.listConfig || {}, {
            getInnerTpl: this.getListItemTpl
        });
        
        this.callParent(arguments);
    },
    
    getListItemTpl: function(displayField) {
        return '<div class="x-combo-list-item x-cal-{' + Extensible.calendar.data.CalendarMappings.ColorId.name +
                '}"><div class="ext-cal-picker-icon">&#160;</div>{' + displayField + '}</div>';
    },
    
    // private
    afterRender: function(){
        this.callParent(arguments);
        
        this.wrap = this.el.down('.x-form-item-body');
        this.wrap.addCls('ext-calendar-picker');
        
        this.icon = Ext.core.DomHelper.append(this.wrap, {
            tag: 'div', cls: 'ext-cal-picker-icon ext-cal-picker-mainicon'
        });
    },
    
    // private
    // Seems like this might be fixed now in Ext 4
//    assertValue  : function(){
//        var val = this.getRawValue(),
//            rec = this.findRecord(this.displayField, val);
//
//        if(!rec && this.forceSelection){
//            if(val.length > 0 && val != this.emptyText){
//                // Override this method simply to fix the original logic that was here.
//                // The orignal method simply reverts the displayed text but the store remains
//                // filtered with the invalid query, meaning it contains no records. This causes
//                // problems with redisplaying the field -- much better to clear the filter and
//                // reset the original value so everything works as expected.
//                this.store.clearFilter();
//                this.setValue(this.value);
//                this.applyEmptyText();
//            }else{
//                this.clearValue();
//            }
//        }else{
//            if(rec){
//                if (val == rec.get(this.displayField) && this.value == rec.get(this.valueField)){
//                    return;
//                }
//                val = rec.get(this.valueField || this.displayField);
//            }
//            this.setValue(val);
//        }
//    },
    
    /* @private
     * Value can be a data value or record, or an array of values or records.
     */
    getStyleClass: function(value){
        var val = value;
        
        if (!Ext.isEmpty(val)) {
            if (Ext.isArray(val)) {
                val = val[0];
            }
            if (!val.data) {
                // this is a calendar id, need to get the record first then use its color
                val = this.store.findRecord(Extensible.calendar.data.CalendarMappings.CalendarId.name, val);
            }
            return 'x-cal-' + (val.data ? val.data[Extensible.calendar.data.CalendarMappings.ColorId.name] : val); 
        }
        return '';
    },
    
    // inherited docs
    setValue: function(value) {
        if (!value && this.store.getCount() > 0) {
            // ensure that a valid value is always set if possible
            value = this.store.getAt(0).data[Extensible.calendar.data.CalendarMappings.CalendarId.name];
        }
        
        if (this.wrap && value) {
            var currentClass = this.getStyleClass(this.getValue()),
                newClass = this.getStyleClass(value);
            
            this.wrap.replaceCls(currentClass, newClass);
        }
        
        this.callParent(arguments);
    }
});
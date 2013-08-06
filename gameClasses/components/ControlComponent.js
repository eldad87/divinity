/**
 * Determine if the client can control or interact with this entity and how
 * @type {IgeClass}
 */
var ControlComponent = IgeClass.extend({
	classId: 'ControlComponent',
	componentId: 'Control',
	
	init: function (entity, options) {

		// Store the entity that this component has been added to
		this._entity = entity;

        // Default, everyone are enemies
		this._controlType = CommandComponent.prototype.typeEnemy;

		// Store any options that were passed to us
		this._options = options;

        if (!ige.isServer) {
            this.enableMouseHandler();
        }
	},

    enableMouseHandler: function(){
        var overFunc = function(event) {
                event.igeViewport.Command.entityOver(this);
            },
            outFunc = function(event) {
                event.igeViewport.Command.entityOver(false);
            };

        this._entity
            .mouseOver(overFunc, true)
            .mouseOut(outFunc);

        return this._entity;
    },

    controlType: function(val) {
        if (val !== undefined) {
            this._controlType = val;

            return this._entity;
        }

        return this._controlType;
    }
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = ControlComponent; }
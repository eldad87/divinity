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
            this.renderHP();

            this.enableMouseHandler();
        }
	},

    renderHP: function() {
        // Define the player fuel bar
        var hpSettings = this._entity.getUnitSetting('healthPoints');
        new IgeUiProgressBar()
            .id('player_fuelBar')
            .bindData(hpSettings, 'current')
            .max(hpSettings['max'])
            .min(0)
            .top(-1 * this._entity.size3d().y)
            .drawBounds(false)
            .drawBoundsData(false)
            .highlight(false)
            .width(this._entity.size3d().x * 2)
            .height(3)
            //.barBackColor('#00b343')
            .barColor('#00b343')
            //.barBorderColor(false)
            .mount(this._entity);
    },

    enableMouseHandler: function(){

        var overFunc = function(event) {
                event.igeViewport.Command.entityOver(this);
            },
            outFunc = function(event) {
                event.igeViewport.Command.entityOver(false);
            };

        this._entity
            .mouseOver(overFunc)
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
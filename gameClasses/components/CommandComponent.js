/**
 * When added to a viewport, automatically adds mouse controlling
 * capabilities. I.e select units, move units etc.
 */
var CommandComponent = IgeEventingClass.extend({
	classId: 'CommandComponent',
	componentId: 'Command',

    //Type of control
    typeOwn: 1,
    typeAlly: 2,
    typeEnemy: 3,

    /**
	 * @constructor
	 * @param {IgeObject} entity The object that the component is added to.
	 * @param {Object=} options The options object that was passed to the component during
	 * the call to addComponent.
	 */
	init: function (entity, options) {
		this._entity = entity;
		this._options = options;

		// Set the zoom component to inactive to start with
		this._enabled = false;


        this._mouseStart = [];
        this._mouseEnd = [];

        this._overEntity  = false;
        this._selectedEntities = [];
	},

	/**
	 * Sets / gets the enabled flag. If set to true, zoom
	 * operations will be processed. If false, no zooming will
	 * occur.
	 * @param {Boolean=} val
	 * @return {*}
	 */
	enabled: function (val) {
		var self = this;

		if (val !== undefined) {
			this._enabled = val;

            if (!ige.isServer) {
                if (this._enabled) {
                    // Listen for the mouse events we need to operate a mouse pan
                    this._entity.mouseDown(function (event) { self._mouseDown(event); });
                    this._entity.mouseUp(function (event) { self._mouseUp(event); });
                    this.drawUI();
                } else {
                    // Remove the zoom start data
                    delete this._mouseStart;
                }
			}

			return this._entity;
		}

		return this._enabled;
	},

    drawUI: function() {
        // Create the UI scene
        this._options.client.uiScene = new IgeScene2d()
            .id('uiScene')
            .depth(2)
            .drawBounds(false)
            .ignoreCamera(true)
            .mount(this._options.client.mainScene);

        //Background
        this._options.client.uiCommandBottom = {}
        this._options.client.uiCommandBottom.background = new IgeUiEntity()
            .id('uiCommandBottomBG')
            .depth(10)
            .width(1600)
            .mouseDown(function(event) {
                if(ige.client.data('cursorMode')) {
                    return true; //Someone else is using the mouse
                }
                ige.client.data('cursorMode', 'UICommand');
                ige.log('UICommand down');
            })
            .mouseOut(function(event) {
                if(ige.client.data('cursorMode')!='UICommand') {
                    return true; //Someone else is using the mouse
                }
                ige.client.data('cursorMode', null);
                ige.log('UICommand out');
            })
            .mouseUp(function(event) {
                if(ige.client.data('cursorMode')!='UICommand') {
                    return true; //Someone else is using the mouse
                }
                ige.client.data('cursorMode', null);
                ige.log('UICommand up');
            })
            .height(338)
            .center(0)
            .bottom(0)
            .drawBounds(false)
            .backgroundImage(this._options.client.gameTexture.uiCommandBottom, 'no-repeat')
            .mount(this._options.client.uiScene);


        this._rebuildActionButtons();

        //Hero items gird
        this._options.client.uiCommandBottom.heroItemsGrid = new IgeUiGridPanel(73, 73)
            .id('uiCommandBottomHeroItems')
            .depth(11)
            .width(146)
            .height(219)
            .right(424)
            .bottom(4)
            .drawBounds(false)
            .mount(this._options.client.uiCommandBottom.background);

        //Hero items buttons
        this._options.client.uiCommandBottom.actionGridItems = {};
        for(var i=1; i<=2; i++) {
            for(var u=1; u<=3; u++) {
                this._options.client.uiCommandBottom.actionGridItems[(i*u-1)] = new IgeUiRadioButton()
                    .id('uiCommandBottomHeroItem' + i + 'x' + u)
                    .radioGroup('uiCommandBottomHeroItems')
                    .drawBounds(false)
                    .drawBoundsData(false)
                    .texture(this._options.client.gameTexture.uiButtonMove )
                    .mount( this._options.client.uiCommandBottom.heroItemsGrid  );
            }
        }
    },


    /**
     * Iterate over entities and get all shared actions.
     *  place the shared actions into the User command UI
     * @private
     */
    _rebuildActionButtons: function() {
        //Action grid
        if(!this._options.client.uiCommandBottom.actionGrid) {
            this._options.client.uiCommandBottom.actionGrid = new IgeUiGridPanel(86, 86)
                .id('uiCommandBottomActionGrid')
                .depth(11)
                .width(344)
                .height(258)
                .right(22)
                .bottom(10)
                .drawBounds(false)
                .mount(this._options.client.uiCommandBottom.background);

            this._options.client.uiCommandBottom.actionGridButtons = {};
        } else {
            //Destroy current buttons
            var button;
            if(this._options.client.uiCommandBottom.actionGridButtons) {
                for(var i=1; i<=3; i++) {
                    for(var u=1; u<=4; u++) {
                        if(button = ige.$('uiCommandBottomActionGridButton' + i + 'x' + u)) {
                            button.destroy();
                        }
                    }
                }
            }
        }


        // Get shared actions for selected entities
        var selectedEntities = this.selectedEntities();
        if(!selectedEntities) {
            return true;
        }
        var sharedActions = [];
        for(var i in selectedEntities) {
            var actions = selectedEntities[i].getUnitSetting('actions')
            for(var action in actions) {
                if(sharedActions.indexOf(action)!=-1) {
                    continue;
                }

                sharedActions.push(action);
            }
        }


        //Action grid buttons
        for(var i=1; i<=3; i++) {
            for(var u=1; u<=4; u++) {

                var actionNum = ((i-1)*4)+u-1;
                if(sharedActions[actionNum]==undefined) {
                    continue;
                }

                var actionName = sharedActions[actionNum].charAt(0).toUpperCase() + sharedActions[actionNum].slice(1); //moveStop -> MoveStop

                this._options.client.uiCommandBottom.actionGridButtons[actionNum] = new IgeUiRadioButton()
                    .id('uiCommandBottomActionGridButton' + i + 'x' + u)
                    .radioGroup('uiCommandBottomActionGridButtons')
                    .drawBounds(false)
                    .drawBoundsData(false)
                    .texture(this._options.client.gameTexture['uiButton' + actionName] )
                    .mount( this._options.client.uiCommandBottom.actionGrid );
            }
        }
    },

    /**
     * Mouse ove an entity
     * @param val
     * @returns {*}
     */
    entityOver: function(val) {
        if (val !== undefined) {
            this._overEntity = val;

            ige.log('Entity over ' + val);
            return this._entity;
        }

        return this._overEntity;
    },

    /**
     * Select entities
     * @param val
     * @returns {Array}
     */
    selectedEntities: function(val) {
        if (val !== undefined) {
            this._selectedEntities = val;
            this._rebuildActionButtons();

            ige.log('Selected entities: ' + this._selectedEntities.length );

            return this._selectedEntities;
        }

        return this._selectedEntities;
    },

	/**
	 * Handles the mouseDown event. Records the mouse starting position.
	 * @param event
	 * @private
	 */
	_mouseDown: function (event) {
        if(ige.client.data('cursorMode')) {
            return true; //Someone else is using the mouse
        }
        ige.client.data('cursorMode', 'objectLayerCommand');
        ige.log('objectLayerCommand down');

		if (this._enabled && event.igeViewport.id() === this._entity.id()) {
			// Record the mouse down position - select starting
			this._mouseStart = this._options.client.objectLayer.mousePos().clone();

            this._mouseMoved = false;
		}
	},

	/**
	 * Handles the mouse up event. Finishes the mouse selecting and
	 * removes the starting mouse position.
	 * @param event
	 * @private
	 */
	_mouseUp: function (event) {
		if (this._enabled) {
			// End the select
			if (this._mouseStart) {
                if(ige.client.data('cursorMode')!='objectLayerCommand') {
                    return true; //Someone else is using the mouse
                }
                ige.client.data('cursorMode', null);
                ige.log('objectLayerCommand up');

                //this._options.client.objectLayer.pointToTile(ige._mousePos );
				this._mouseEnd = this._options.client.objectLayer.mousePos().clone();

                //Check if mouse moved
                if(this._mouseStart.x != this._mouseEnd.x || this._mouseStart.y !=  this._mouseEnd.y) {
                    this._handleSelection( [this.typeOwn] );
                } else {
                    this._handleClick();
                }

				// Remove the start/end daya
				delete this._mouseStart;
				delete this._mouseEnd;
			}
		}
    },


    /**
     * Handle click
     * @private
     */
    _handleClick: function() {

        var overEntity = this.entityOver(),
            selectedEntities = this.selectedEntities();

        if(overEntity==false) {
            if(!selectedEntities.length) {
                return true; //Nothing to do
            }

            //Move to tile
            var endTile = this._options.client.objectLayer.pointToTile(this._mouseEnd);
            for(var i in selectedEntities) {
                selectedEntities[i].action('move', [endTile])
            }

        } else {
            switch(overEntity.Control.controlType()) {
                case this.typeOwn:
                    this.selectedEntities([overEntity]);
                    break;

                case this.typeAlly:
                    this.selectedEntities([]);
                    break;

                case this.typeEnemy:
                    if(!selectedEntities.length) {
                        return true; //Nothing to do
                    }

                    for(var i in selectedEntities) {
                        selectedEntities[i].action('attack', [overEntity])
                    }

                    break;
            }
        }
    },



    /**
     * Select entities
     * @param allowedControlTypes
     * @private
     */
    _handleSelection: function( allowedControlTypes ) {
        var startTile = this._mouseStart,
            endTile = this._mouseEnd;
        /*if(this._options.client.objectLayer.isometricMounts()) {
            startTile.toIso();
            endTile.toIso();
        }*/
        startTile = this._options.client.objectLayer.pointToTile(startTile);
        endTile = this._options.client.objectLayer.pointToTile(endTile);
        

        var topLeft = {
                x: startTile.x > endTile.x ? endTile.x : startTile.x,
                y: startTile.y > endTile.y ? endTile.y : startTile.y
            },
            bottomRight = {
                x: startTile.x < endTile.x ? endTile.x : startTile.x,
                y: startTile.y < endTile.y ? endTile.y : startTile.y
            },
            width = (topLeft.x > bottomRight.x ? topLeft.x - bottomRight.x : bottomRight.x - topLeft.x),
            height = (topLeft.y > bottomRight.y ? topLeft.y - bottomRight.y : bottomRight.y - topLeft.y);


        //Get entities in selection.
        var selectedEntities = this._getEntitiesInRect(this._options.client.objectLayer, topLeft.x, topLeft.y, width, height);

        //Go over selected entities and remove unrelated
        var filteredEntities = [];
        if(selectedEntities && allowedControlTypes) {
            for(var i in selectedEntities) {
                if(allowedControlTypes.indexOf( selectedEntities[i].Control.controlType() ) == -1) {
                    //Skip entity
                    continue;
                }

                filteredEntities.push(selectedEntities[i]);
            }
        }

        //Set selected entities
        this.selectedEntities(filteredEntities);
    },

    /**
     * Return all entities in objectLayer that located inside the given rect
     *
     * @param objectLayer
     * @param x
     * @param y
     * @param width
     * @param height
     * @returns {Array}
     * @private
     */
    _getEntitiesInRect: function (objectLayer, x, y, width, height) {
        var xi, yi, res = [];

        if (width === undefined) { width = 1; }
        if (height === undefined) { height = 1; }

        if (x !== undefined && y !== undefined) {
            for (yi = 0; yi <= height; yi++) {
                for (xi = 0; xi <= width; xi++) {
                    var data = objectLayer.map.tileData(x + xi, y + yi);
                    if(!data) {
                        continue;
                    }

                    if( data.indexOf == undefined) {
                        res.push(data);
                    } else {
                        res.concat(data);
                    }
                }
            }
        }

        return res;
    }


});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = CommandComponent; }
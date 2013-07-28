var BaseEntity = IgeEntityBox2d.extend({
    classId: 'BaseEntity',

    /**
     *
     * @param actions - main actions, will be displayed when unit is selected
     * @param subActions - actions that will appear on navigation (I.e build)
     * @param armor
     * @param hp
     * @param mana
     * @param custom
     */
    init: function (actions, subActions, armor, hp, mana, custom) {
        if(custom==undefined) {
            custom = {};
        }
        //this.implement(BaseEntity);

        IgeEntityBox2d.prototype.init.call(this);

        this._currentAction = false;

        this.unitSettings(actions, subActions, armor, hp, mana, custom);

        this.addComponent(ControlComponent);
        this.streamSections(['transform', 'unit']);
    },



    tick: function (ctx) {
        if(this.repeaterAction && this.currentAction()==this.repeaterAction) {
            this.action(this.repeaterAction, this.repeaterTarget, this.repeaterArgs);
        }

        IgeEntityBox2d.prototype.tick.call(this, ctx);
    },

    actionRepeater: function(actionName, target, args) {
        this.repeaterAction = actionName;
        this.repeaterTarget = target;
        this.repeaterArgs = args;
    },


    addHP: function(val) {
        var hp = this.getUnitSetting('healthPoints', 'current');
        hp += val;

        if(hp<=0) {
            /* CEXCLUDE */
            if(ige.isServer) {
                //Only the server can kill a unit
                this.destroy();
            }
            /* CEXCLUDE */

            if(!ige.isServer) {
                hp = 1;
            }
        }

        this.setUnitSetting('healthPoints', 'current', hp);
        return this;
    },

    addMana: function(val) {
        var mana = this.getUnitSetting('manaPoints', 'current');
        mana += val;

        this.setUnitSetting('manaPoints', 'current', mana);
        return this;
    },

    streamSectionData: function (sectionId, data) {
        // Check if the section is one that we are handling
        if (sectionId === 'unit') {
            // Check if the server sent us data, if not we are supposed
            // to return the data instead of set it
            if (!ige.isServer) {
                if (data) {
                    // We have been given new data!
                    data = JSON.parse(data);
                    this.unitSettings(data.actions, data.subActions, data.armor, data.healthPoints, data.manaPoints, data.custom);
                }
            }
            /* CEXCLUDE */
            if (ige.isServer) {
                // Return current data
                return JSON.stringify(this.unitSettings());
            }
            /* CEXCLUDE */
        } else {
            // The section was not one that we handle here, so pass this
            // to the super-class streamSectionData() method - it handles
            // the "transform" section by itself
            return IgeEntityBox2d.prototype.streamSectionData.call(this, sectionId, data);
        }
    },

    renderHP: function() {
        var self = this;

        // Define the player fuel bar
        new EntityUiProgressBar()
            .id( self.id() + '_hp')
            .max(self.getUnitSetting('healthPoints').max)
            .min(0)
            .bindMethod(self, self.getUnitSetting ,['healthPoints', 'current'])
            //.bindData(self, 'currentHP')
            .top(-1 * self.size3d().y)
            .drawBounds(false)
            .drawBoundsData(false)
            .highlight(false)
            .width(self.size3d().x * 2)
            .height(5)
            .barColor('#00b343')
            .mount(this);
    },

    currentAction: function(val) {
        if (val !== undefined) {
            this._currentAction = val;
            return this;
        }

        return this._currentAction;
    },

    action: function(actionName, target, args) {
        if(!this.alive()) {
            return false;
        }

        var actionSettings = this.getUnitSetting('actions', actionName) ||
                        this.getUnitSetting('subActions', actionName);

        if(actionSettings==undefined) {
            throw new EventException('Invalid entity action is used');
        }

        if(ige.isServer && target.push!=undefined) {
            //Convert array back into Position
            target = new IgePoint(target[0], target[1], target[2], target[3]);
        }

        this.currentAction(actionName);
        //if(ige.isServer) {
            if(actionSettings.isRepeatable) {
                //TODO: exception, cant have NO args.
                this._repeatableAction(actionName, target, args);
            } else {
                args = args || [];
                this[actionName + 'Action'].call(this, target, args);
            }
        //}

        if(!ige.isServer) {
            //Convert Position into array
            if(target.x!=undefined) {
                target = [target.x, target.y, target.z, target._floor];
            }

            //Send action to server
            ige.network.send('action', [this.id(), actionName, target, args]);
        }
    },

    _repeatableAction: function(actionName, target, args) {
        if(this.currentAction()!=actionName) {
            return true;
        }


        //Check if EntityId or Position is given
        var targetPosition = target; //By default, treat target is position
        if(target.x==undefined) {
            //EntityId is given
            var targetEntity = ige.$(target);

            //Check if target is alive
            if(!targetEntity || targetEntity.alive()===false) {
                this.currentAction(false);
                return true;
            }

            targetPosition = targetEntity._translate;
            if (this._parent.isometricMounts()) {
                targetPosition = this._parent.pointToTile(targetPosition.toIso());
            } else {
                targetPosition = this._parent.pointToTile(targetPosition);
            }
        }


        var currentPosition = this._translate;
        if (this._parent.isometricMounts()) {
            currentPosition = this._parent.pointToTile(currentPosition.toIso());
        } else {
            currentPosition = this._parent.pointToTile(currentPosition);
        }


        //Check the distance between the unit and target
        var distance = Math.distance(currentPosition.x, currentPosition.y, targetPosition.x, targetPosition.y);

        //Get range
        var actionSetting   = this.getUnitSetting('actions', actionName) || this.getUnitSetting('subActions', actionName),
            isSubAction     = this.getUnitSetting('actions', actionName) ? false : true,
            actionRange     = actionSetting.range+ 1,
            isTargetInRange = actionRange>=distance,
            moveableUnit    = (this.getUnitSetting('actions', 'move') || this.getUnitSetting('subActions', 'move'))  ? true : false,
            movementEndPoint;


        if(!isTargetInRange && !moveableUnit) {
            //Target is out of
            // range, and unit cannot move
            return false;
        }

        if(!isTargetInRange) {
            movementEndPoint = this.path.endPoint();

            //Before moving, check if we already on the move
            if(movementEndPoint==null) {
                //Unit ISN'T MOVING, get closer to the target
                this.moveAction(targetPosition);

                //Set repeater
                this.actionRepeater(actionName, target, args);

                return true;
            } else {
                //Units IS MOVING, check the distance between the final-destination and the target
                distance = Math.distance(movementEndPoint.x, movementEndPoint.y, targetPosition.x, targetPosition.y);
                if(actionRange<distance) {

                    //Destination is wrong, re-calc it
                    this.moveAction(targetPosition);
                }

                //Set repeater
                this.actionRepeater(actionName, target, args);
                return true;
            }
        }


        //Target in IN RANGE
        if(moveableUnit) {
            //Stop moving
            this.moveStopAction();
        }


        /**
         * Check cooldown
         */
        var currentTime = new Date().getTime();
        if(actionSetting.cooldown!=undefined) {
            if(currentTime <= (actionSetting['lastUsageTime'] + actionSetting.cooldown*1000)) {
                //Cool down still active

                //Set repeater
                this.actionRepeater(actionName, target, args);

                return false;
            }
        }

        //Set last used time, mainly for cooldown
        this.setUnitSetting( (isSubAction ? 'subActions' : 'actions'), actionName, 'lastUsageTime', currentTime);


        /**
         * ACTION!!!
         */
        if(!this[actionName + 'Action'].call(this, target, args)) {
            this.currentAction(false);
            return false;
        }


        //Set repeater
        this.actionRepeater(actionName, target, args);

        return this;
    },

    attackAction: function(targetEntityId) {
        var targetEntity = ige.$(targetEntityId),
            actionSetting   = this.getUnitSetting('actions', 'attack') || this.getUnitSetting('subActions', 'attack'),
            dmg = this._caldFinalDmg(actionSetting, targetEntity.getUnitSetting('armor'));

        //Reduce Target's HP
        targetEntity.addHP( -1*dmg );

        return true;
    },

    getUnitSetting: function(settingName, attr, attr2) {
        /*if(this._unitSettings==undefined) {
            return undefined;
        }*/

        try {
            if(settingName!=undefined &&
                attr!=undefined &&
                attr2!=undefined) {

                if(this._unitSettings[settingName][attr][attr2]==undefined) {
                    return undefined;
                }

                return this._unitSettings[settingName][attr][attr2];
            } else if(settingName!=undefined &&
                attr!=undefined) {

                if(this._unitSettings[settingName][attr]==undefined) {
                    return undefined;
                }

                return this._unitSettings[settingName][attr];
            } else if(settingName!=undefined) {

                if(this._unitSettings[settingName]==undefined) {
                    return undefined;
                }

                return this._unitSettings[settingName];
            }
        } catch(e) {
            return undefined;
        }

        return this._unitSettings;
    },

    setUnitSetting: function(settingName, attr, attr2, attr3) {
        if(settingName!=undefined) {
            if(attr!=undefined) {
                if(this._unitSettings[settingName]==undefined) {
                    this._unitSettings[settingName] = {};
                }

                if(attr2!=undefined) {
                    if(this._unitSettings[settingName][attr]==undefined) {
                        this._unitSettings[settingName][attr] = {};
                    }

                    if(attr3!=undefined) {
                        if(this._unitSettings[settingName][attr][attr2]==undefined) {
                            this._unitSettings[settingName][attr][attr2] = {};
                        }

                        return this._unitSettings[settingName][attr][attr2] = attr3;
                    }
                    return this._unitSettings[settingName][attr] = attr2;
                }
                return this._unitSettings[settingName] = attr;
            }
            return this._unitSettings = settingName;
        }

        return this;
    },

    unitSettings: function(actions, subActions, armor, hp, mana, custom) {
        if (    actions !== undefined   && subActions   !== undefined   &&
                armor   !== undefined   && hp           !== undefined  &&
                mana    !== undefined   && custom       !== undefined)
        {
            this._unitSettings = {};
            this._unitSettings.actions      = actions;
            this._unitSettings.subActions   = subActions;
            this._unitSettings.armor        = armor;
            this._unitSettings.healthPoints = hp;
            this._unitSettings.manaPoints   = mana;
            this._unitSettings.custom       = custom;

            return this;
        }

        return this._unitSettings;
    },

    getCommand: function() {
        return ige.$('vp1').Command;
    },

    /**
     * Buttons
     */
    cancelButton: function(pos, selectedEntities, target) {
        if(pos==0) {
            this.getCommand().currentButtonAction(false);
            this.getCommand().rebuildActionButtonsBasedOnSelectedEntities();
        }

        switch(this.currentAction()) {
            case 'attack':
                this.action('attackStop');
                break;
            case 'move':
                this.action('moveStop');
                break;
            default:
                if(pos==0) {
                    this.getCommand().cursorItem(false);
                }
                break;
        }
    },

    attackButton: function(pos, selectedEntities, target) {
        if(!target) {
            //an attack button clicked, set the sub actions:
            this.getCommand().buildEntitiesActionsGrid([this], []);
            return true; //Stop stoppropagation
        }

        if(target.x!=undefined) {
            //No units selected (position provided), cannot attack
            return true; //Stop stoppropagation
        }

        this.action('attack', target);
    },

    moveButton: function(pos, selectedEntities, target) {
        if(!target) {
            //a move button clicked, set the sub actions:
            this.getCommand().buildEntitiesActionsGrid([this], []);
            return true; //Stop stoppropagation
        }

        if(target.x==undefined) {
            //Selected entity provided, get it's position
            target = target._translate;
        }

        this.action('move', target);
    },
    _getEntityIdToTile: function(entity) {
        var targetEntity = ige.$(target),
            targetEntityPosition = targetEntity._translate;
        if (this._parent.isometricMounts()) {
            return this._parent.pointToTile(targetEntityPosition.toIso());
        }
        return this._parent.pointToTile(targetEntityPosition);
    },

    /**
     * Actions
     */

    attackStopAction: function(targetEntityId) {
        this.currentAction(false);
    },

    _caldFinalDmg: function(attack, armor) {

        var dmgReduction = 0,
            dmg = attack.amount;

        //Calc dmg reduction
        if(armor.amount>0) { //Positive armor, reduce dmg
            dmgReduction = ((armor.amount)*0.06)/(1+0.06*(armor.amount));
            dmgReduction *= attack.amount;

        } else if(armor.amount<0) { //Negative armor, increase dmg
            dmgReduction = 2-0.94^(-armor.amount);
            dmgReduction = (dmgReduction*attack.amount) - attack.amount;
            dmgReduction *= -1;
        }
        dmg -= dmgReduction;

        //Calc attack/armor type I.e piercing attack vs fortified armor
        dmg *= ArmorAttackChart[attack.type][armor.type];

        return dmg;
    },

    /**
     * Move entity
     * @param endTile
     * @returns {boolean}
     */
    moveAction: function (endTile/*, onEvent, onEventCallback*/) {
        // Get the tile co-ordinates that the mouse is currently over
        var currentPosition = this._translate,
            startTile,
            newPath,
            self = this,
            moveSetting = this.getUnitSetting('actions' ,'move'),

            tileChecker = function (tileData, tileX, tileY) {
                // If the map tile data is set, don't path along it
                return !tileData;
            };

        // Calculate which tile our character is currently "over"
        if (this._parent.isometricMounts()) {
            startTile = this._parent.pointToTile(currentPosition.toIso());
        } else {
            startTile = this._parent.pointToTile(currentPosition);
        }


        if(endTile==startTile) {
            return true; //Nothin to do
        }

        if (!ige.isServer) {
            // Create a path from the current position to the target tile
            newPath = ige.client.pathFinder.aStar(ige.$('DirtLayer'), startTile, endTile, tileChecker, true, true);
        }

        /* CEXCLUDE */
        if (ige.isServer) {
            // Create a path from the current position to the target tile
            newPath = ige.server.pathFinder.aStar(ige.$('DirtLayer'), startTile, endTile, tileChecker, true, true);
        }
        /* CEXCLUDE */

        // Tell the entity to start pathing along the new path
        this
            .path.clear()
            .path.add(newPath)
            .path.speed(moveSetting['speed']);

        //Check that this is a move request, and not a part of other requests, I.e attack
        if(this.currentAction()==='move') {
            this
                .path.on('traversalComplete', function() {
                    self.currentAction(false);
                });
            this
                .path.on('stop', function() {
                    self.currentAction(false);
                });
        }

       /* if(onEvent && onEventCallback) {
            this
                .path.on(onEvent, onEventCallback, this);
        }*/

        this
            .path.start()
    },

    moveStopAction: function() {
        this.path.clear();
        this.path.stop();
    }
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = BaseEntity; }
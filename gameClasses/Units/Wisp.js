var Wisp = Unit.extend({
    classId: 'Wisp',
    init: function () {
        Unit.prototype.init.call(
            this,
            {move:{speed:0.1}, build:{}},
            {buildGeneric:{range:0, isRepeatable: true, cooldown: 1, lastUsageTime:0, progress:40}, moveStop:{}, buildTreeOfLife:{}},
            {type: armor.medium, amount: 1},
            {max: 70.0, current: 70.0},
            {max: 0.0, current: 0.0},
            4
        );
    },


    /**
     * Buttons
     */
    buildButton: function(pos, selectedEntities, target) {
       this.getCommand().buildEntitiesActionsGrid([this], ['buildTreeOfLife', 'buildAncientOfWar']);
       return true; //Stop stoppropagation
    },

    buildTreeOfLifeButton: function(pos, selectedEntities, target) {
        return this._buildButtonHelper(TreeOfLife, target);
    },

    /**
     * Actions
     */
    buildGenericAction: function(target, args) {
        if (!ige.isServer) {
            //Remove wisp-entity from Command selected
            this.getCommand().removeEntityFromSelected(this.id());
        }

        var targetBuildingId = this.getUnitSetting('custom', 'buildGeneric', 'entityId');

        /* CEXCLUDE */
        if (ige.isServer) {
            //Check if item already exists
            if(targetBuildingId==undefined) {
                //Add building
                var building = new igeClassStore[args[0]](this.parent(), target.x, target.y);
                    building
                        .data('tileX', target.x)
                        .data('tileY', target.y)
                        .translateToTile(target.x + 0.5, target.y + 0.5, 0)

                targetBuildingId = building.id();
                this.setUnitSetting('custom', 'buildGeneric', 'entityId', targetBuildingId);

//TODO: unmount wisp

                ige.log('building NEW entity...');
            }
        }
        /* CEXCLUDE */


        if (!ige.isServer) {
            //Check if client received the new building
            if(targetBuildingId==undefined) {
                return true; //Not yet
            }
        }

        var targetBuildingEntity = ige.$(targetBuildingId),
            currentBuildingProgress = targetBuildingEntity.getUnitSetting('custom', 'buildingProgress');


        //Get building setting
        var actionSetting  = this.getUnitSetting('actions', 'buildGeneric') || this.getUnitSetting('subActions', 'buildGeneric');

        //Add progress
        targetBuildingEntity.addBuildingProgress(actionSetting.progress);
        targetBuildingEntity.addHP(actionSetting.progress); //Add HP as per progress


        //Draw the progress bar if we just received the entity
        if (!ige.isServer) {
            if(currentBuildingProgress==actionSetting.progress) {
                //first time, just received from the server - set hp/progress bars
                targetBuildingEntity.renderHP();
                targetBuildingEntity.renderBuildingProgress();

                //Building opacity
                targetBuildingEntity.opacity(0.8);

                //Hide builder
                this.hide();
            }
        }

        ige.log('building ADDING progress...');



        //Check if done
        if(currentBuildingProgress>=targetBuildingEntity.getUnitSetting('healthPoints', 'max')) {
            ige.log('building DONE...')

            /* CEXCLUDE */
            if (ige.isServer) {
//TODO: mount wisp - closest to the building
            }
            /* CEXCLUDE */

            if (!ige.isServer) {
                //Building opacity
                targetBuildingEntity.opacity(1);

                //Show builder
                this.show();

                //Remove progress bar
                ige.$(targetBuildingId + '_building_progress').destroy()
            }
            return false
        }

        return true;
    },

    _buildButtonHelper: function(buildingClass, target) {
        if(!target) { //Click on button (NOT on the map)
            //set cursor with building
            var tempItem = new buildingClass( this.parent(), -1000, -1000);
            tempItem.mount(this.parent());

            this.getCommand().cursorItem(tempItem);

            //Reset actions-buttons grid
            this.getCommand().buildEntitiesActionsGrid([this], []);

            return true; //Stop stoppropagation
        }

        var cursorItem = this.getCommand().cursorItem();
        if(!cursorItem) {
            return false;
        }
        //Click on map, check if can build
        if(cursorItem.isOnDirt() || cursorItem.isOnEntity()) {
            return false;
        }

        //Reset cursor
        this.getCommand().cursorItem(false);


        //Build
        if(target.x==undefined) {
            //Selected entity provided, get it's position
            //target = this._getEntityTile(target);
            target = target._translate;
        }
        this.action('buildGeneric', target, [cursorItem.classId()]);
        return true; //Stop stoppropagation
    }

});
if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = Wisp; }
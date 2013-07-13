var TreeOfLife = Building.extend({
    classId: 'TreeOfLife',
    init: function (parent, tileX, tileY) {
        Building.prototype.init.call(
            this,
            {},
            {},
            {type: armor.fortified, amount: 1},
            {max: 420.0, current: 420.0},
            {max: 0.0, current: 0.0}
        );


        // Setup the 3d bounds container (this), width:2, height:2
        this.isometric(true)
            .mount(parent)
            .size3d(2 * parent._tileWidth, 2 * parent._tileHeight, parent._tileHeight * 1.25)
            .translateToTile((tileX) + 0.5, (tileY) + 0.5, 0)
            .drawBounds(false)
            .drawBoundsData(false)
            .occupyTile(tileX, tileY, 2, 2);

        // Create the "image" entity
        this.imageEntity = new IgeEntity()
            .texture(ige.client.gameTexture.treeOfLife)
            .dimensionsFromCell()
            .scaleTo(0.3, 0.3, 1)
            .drawBounds(false)
            .drawBoundsData(false)
            .mount(this);
    }
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = TreeOfLife; }
var TreeOfLife = Building.extend({
    classId: 'TreeOfLife',

    init: function (parent) {

        var tileWidth = 2,
            tileHeight = 2;
        this.data('tileWidth', tileWidth);
        this.data('tileHeight', tileHeight);

        Building.prototype.init.call(
            this,
            {},
            {},
            {type: armor.fortified, amount: 1},
            {max: 420.0, current: 1.0},
            {max: 0.0, current: 0.0}
        );

        this.isometric(true)
            .drawBounds(false)
            .drawBoundsData(false);

        /* CEXCLUDE */
        if (ige.isServer) {
            this.mount(parent);
            //TODO setup 3D bounds
            // Setup the 3d bounds container (this)
            this.size3d(tileWidth * parent._tileWidth, tileHeight * parent._tileHeight, parent._tileHeight * 1.25)
        }
        /* CEXCLUDE */

        if (!ige.isServer) {
            // Create the "image" entity
            this.imageEntity = new IgeEntity()
                .texture(ige.client.gameTexture.treeOfLife)
                .dimensionsFromCell()
                .scaleTo(0.3, 0.3, 1)
                .drawBounds(false)
                .drawBoundsData(false)
                .mount(this);
        }
    }
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = TreeOfLife; }
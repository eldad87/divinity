var EntityUiProgressBar = IgeUiProgressBar.extend({
    classId: 'EntityUiProgressBar',

    bindMethod: function(obj, method, args) {

        this.obj = obj;
        this.method = method;
        this.args = args;

        this.bindData();

        return this;
    },

    render: function (ctx) {
        if(this.obj && this.method && this.args) {
            var val = this.method.apply ( this.obj, this.args );
            this.progress(val);
        }

        return IgeUiProgressBar.prototype.render.call(this, ctx);
    }
});
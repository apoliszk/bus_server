function init(mongoose) {
    var lineSchema = mongoose.Schema({
        _id: String,
        name: String,
        description: String,
        stations: [String]
    });
    lineSchema.methods.refreshValues = function (obj) {
        this.name = obj.name;
        this.description = obj.description;
        if (obj.stations) {
            this.stations = obj.stations.concat();
        }
    };
    var Line = mongoose.model('Line', lineSchema);
    global.models = {};
    global.models.Line = Line;
}

exports.init = init;
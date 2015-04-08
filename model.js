function init(mongoose) {
    var lineSchema = mongoose.Schema({
        _id: String,
        name: String,
        description: String,
        stations: [String]
    });
    var Line = mongoose.model('Line', lineSchema);
    global.models = {};
    global.models.Line = Line;
}

exports.init = init;
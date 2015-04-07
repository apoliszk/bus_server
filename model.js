function initModels(mongoose) {
    var lineSchema = mongoose.Schema({
        lineId: String,
        line: String,
        info: String
    });
    var Line = mongoose.model('Line', lineSchema);
    global.models = {};
    global.models.Line = Line;
}

exports.initModels = initModels;
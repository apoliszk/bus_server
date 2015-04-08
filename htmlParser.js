function getNodeText(n) {
    if (n.children && n.children.length > 0) {
        return getNodeText(n.children[0]);
    }
    return n.data;
}

var lineIdReg = /[^?]+\?lineguid=([^&]+).+/i;
function getLineId(n) {
    if (n.name == 'a') {
        var href = n.attribs.href;
        var result = lineIdReg.exec(href);
        if (result.length == 2) {
            return result[1];
        } else {
            return undefined;
        }
    } else if (n.children && n.children.length > 0) {
        return getLineId(n.children[0]);
    }
    return undefined;
}

exports.getNodeText = getNodeText;
exports.getLineId = getLineId;
function getPointValue(point) {
    return typeof point === "object" ? point.value : point;
}

function getPointLabel(point) {
    return typeof point === "number" ? point.toString() : point.label;
}

function padLine(padding, line) {
    return ' '.repeat(padding) + line + ' '.repeat(padding);
}

module.exports = { getPointValue, getPointLabel, padLine }
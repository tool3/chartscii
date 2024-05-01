function getPointValue(point) {
    return typeof point === "object" ? point.value : point;
}

module.exports = { getPointValue }
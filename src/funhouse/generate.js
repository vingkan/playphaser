const fs = require("node:fs")

function getWorldConfigFileData(world) {
    const maps = []
    const offsetX = (world.tilesX - 1) * world.pixelsPerTile
    const offsetY = (world.tilesY - 1) * world.pixelsPerTile
    for (let x = 0; x < world.width; x++) {
        for (let y = 0; y < world.height; y++) {
            const map = {
                fileName: `${world.path}/${x}-${y}.json`,
                width: world.tilesX * world.pixelsPerTile,
                height: world.tilesY * world.pixelsPerTile,
                x: x * offsetX,
                y: y * offsetY,
            }
            maps.push(map)
        }
    }
    return {
        maps,
        onlyShowAdjacentMaps: false,
        type: "world",
    }
}

function main() {
    const world = {
        path: "../assets/funhouse/map",
        tilesX: 22,
        tilesY: 22,
        width: 4,
        height: 4,
        pixelsPerTile: 16,
    }
    const parts = world.path.split("/")
    const game = parts.slice(-2, -1)
    world.path = parts.slice(-1)
    const worldConfig = getWorldConfigFileData(world)
    const content = JSON.stringify(worldConfig, null, 4)
    fs.writeFileSync(`assets/${game}/world.world`, content)
}

main()

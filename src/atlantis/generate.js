const fs = require("node:fs")

function getWorldConfigFileData(world) {
    const maps = []
    const offsetX = world.tilesX * world.pixelsPerTile
    const offsetY = world.tilesY * world.pixelsPerTile
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
        path: "../assets/sea/map",
        tilesX: 20,
        tilesY: 20,
        width: 6,
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

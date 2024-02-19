import { Direction, } from "grid-engine"
import { getRectCells } from "./utils"

export const INTERACTABLES: Interactable[] = [
    // Atlantis Capitol
    // Towers in Atlantis Square.
    {
        cells: [
            { wx: 3, wy: 2, cx: 5, cy: 11 },
            { wx: 3, wy: 2, cx: 6, cy: 11 },
            { wx: 3, wy: 2, cx: 13, cy: 11 },
            { wx: 3, wy: 2, cx: 14, cy: 11 },
        ],
        action: (s) => s.showText(
            `The ${s.switchText("Bold", "Sordid")} towers of Atlantis.`,
            2000
        )
    },
    // Western Province
    // Tunnel from Northern island tower to central relic tower.
    {
        cells: getRectCells(1, 1, 18, 8, 2, 2),
        action: (s) => s.teleportTo(1, 2, 5, 15, Direction.DOWN)
    },
    // Tunnel from central relic tower to Northern island tower.
    {
        cells: getRectCells(1, 2, 5, 13, 2, 2),
        action: (s) => s.teleportTo(1, 1, 18, 9, Direction.DOWN)
    },
    // Tunnel from top of upper shark tooth row to cave bottom entrance.
    {
        cells: getRectCells(0, 3, 16, 4, 2, 2),
        action: (s) => s.teleportTo(0, 3, 16, 10, Direction.DOWN)
    },
    // Tunnel from cave bottom entrance to top of upper shark tooth row.
    {
        cells: getRectCells(0, 3, 15, 9, 4, 1),
        action: (s) => s.teleportTo(0, 3, 18, 4, Direction.RIGHT)
    },
    // Tunnel from top side of lower shark tooth row to bottom side.
    {
        cells: getRectCells(1, 3, 17, 11, 2, 2),
        action: (s) => s.teleportTo(1, 3, 16, 13, Direction.LEFT)
    },
    // Tunnel from bottom side of lower shark tooth row to top side.
    {
        cells: getRectCells(1, 3, 17, 13, 2, 2),
        action: (s) => s.teleportTo(1, 3, 17, 11, Direction.LEFT)
    },
]
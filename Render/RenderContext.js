/**
 * @typedef {Object} ContextSettings
 * @property {"legalmap"|"hypixelmap"|"teniosmap"} mapStyle - Style of the map rendering
 * @property {Number} posX - X Position of the map on screen
 * @property {Number} posY - y Position of the map on screen
 * @property {Number} size - Width/height of the map when rendered
 * @property {Number} headScale - Width/height of heads (scales with size, will be same if size is 100)
 * @property {Number} iconScale - Width/height of icons (scales with size, will be same if size is 100)
 * @property {"hypixel"|"default"|"secrets"} tickStyle - Style of the ticks
 * @property {"none"|"text"|"icon"} puzzleNames - Render style of puzzle names
 * @property {Boolean} headBorder - Wether to put a black border around heads on the map
 * @property {Boolean} playerNames - Wether to show player names when holding spirit leaps
 * @property {"none"|"left"|"right"} currentRoomInfo - Render current room hover info on side of map
 * @property {"none"|"legalmap"|"simplified"} scoreInfoUnderMap - Render current room hover info on side of map
 * @property {Boolean} forcePaul - Wether to force enable the +10 score for paul (eg if jerry mayor)
 * @property {Boolean} devInfo - Wether to show def info in various places in the map
 */

class RenderContext {

    constructor(settings) {

        /**@type {ContextSettings} */
        this.settings = {}
        this.setSettings(settings)

        this.image = null;
        this.imageLastUpdate = 0;

        this.paddingTop = 0;
        this.paddingLeft = 0;

        this.borderWidth = 2;

        this.onDestroys = []
    }

    getImageSize(floor) {
        return this.paddingLeft * 2 + this.blockSize * 6 + this.roomGap
    }

    get posX() {
        return this.settings.posX
    }

    get posY() {
        return this.settings.posY
    }

    get size() {
        return this.settings.size
    }
    get headScale() {
        return this.settings.headScale
    }
    get iconScale() {
        return this.settings.iconScale
    }
    get tickStyle() {
        return this.settings.tickStyle
    }
    get puzzleNames() {
        return this.settings.puzzleNames
    }
    get headBorder() {
        return this.settings.headBorder
    }
    get playerNames() {
        return this.settings.playerNames
    }

    get mapStyle() {
        return this.settings.mapStyle
    }

    get currentRoomInfo() {
        return this.settings.currentRoomInfo
    }

    get scoreInfoUnderMap() {
        return this.settings.scoreInfoUnderMap
    }

    get forcePaul() {
        return this.settings.forcePaul
    }

    get devInfo() {
        return this.settings.devInfo
    }

    get colorMap() {
        switch (this.mapStyle) {
            case "legalmap":
                return LegalMapColorMap
            case "hypixelmap":
                return HypixelColorMap
            case "teniosmap":
                return HypixelColorMap //TODO: this color map
        }
    }

    get roomGap() {
        switch (this.mapStyle) {
            case "legalmap":
                return 8 // 1/3 roomSize
            case "hypixelmap":
                return 6
            case "teniosmap":
                return 6 //TODO: this value
        }
    }

    get roomSize() {
        switch (this.mapStyle) {
            case "legalmap":
                return 24
            case "hypixelmap":
                return 24
            case "teniosmap":
                return 24 //TODO: this value
        }
    }

    get blockSize() {
        return this.roomSize + this.roomGap
    }

    get doorWidth() {
        switch (this.mapStyle) {
            case "legalmap":
                return 8
            case "hypixelmap":
                return 10
            case "teniosmap":
                return 15 //TODO: this value (atm i just set it high to show of changes)
        }
    }

    /**
     * Gets the images to render ontop of the map, eg checkmarks
     * @param {String} type 
     * @returns {Image} The image to render
     */
    getImage(type) {
        switch (this.tickStyle) {
            case "default":
                return LegalMapTicks.get(type)
            case "hypixel":
                return HypixelTicksOld.get(type)
        }
    }

    /**
     * Gets the width and height of different icons
     * @param {String} type 
     * @returns {[Number, Number]}
     */
    getIconSize(type) {
        switch (this.tickStyle) {
            case "default":
                switch (type) {
                    case "questionMark":
                        return [16 * this.iconScale / 8, 16 * this.iconScale / 8]
                    case "whiteCheck":
                    case "greenCheck":
                        return [16 * this.iconScale / 8, 16 * this.iconScale / 8]
                    case "failedRoom":
                        return [16 * this.iconScale / 8, 16 * this.iconScale / 8]
                }
            case "hypixel":
                switch (type) {
                    case "questionMark":
                        return [10 * this.iconScale / 8, 16 * this.iconScale / 8]
                    case "whiteCheck":
                    case "greenCheck":
                        return [10 * this.iconScale / 8, 10 * this.iconScale / 8]
                    case "failedRoom":
                        return [14 * this.iconScale / 8, 14 * this.iconScale / 8]
                }
        }
    }

    setSettings(settings) {
        this.settings = RenderContext.addMissing(settings)
    }

    static addMissing({
        mapStyle = "legalmap",
        posX = 0,
        posY = 0,
        size = 100,
        headScale = 8,
        iconScale = 8,
        tickStyle = "default",
        puzzleNames = "none",
        headBorder = false,
        playerNames = true,
        currentRoomInfo = "none",
        scoreInfoUnderMap = "simplified",
        forcePaul = false,
        devInfo = false
    }) {
        return {
            mapStyle,
            posX,
            posY,
            size,
            headScale,
            iconScale,
            tickStyle,
            puzzleNames,
            headBorder,
            playerNames,
            currentRoomInfo,
            scoreInfoUnderMap,
            forcePaul,
            devInfo
        }
    }

    /**
     * Mark this image as needing a re-render
     * Will be re-rendered on the next game frame
     */
    markReRender() {
        this.imageLastUpdate = 0
    }

    onDestroy(callback) {
        this.onDestroys.push(callback)
    }

    /**
     * Prepairs this render context for garbage collection, eg clearing cached map image from memory
     */
    destroy() {
        this.image?.getTexture()?.[m.deleteGlTexture]()
        this.image = undefined

        this.onDestroys.forEach(fun => fun())
    }

    /**
     * A shortcut for getting the context's settings commonly used for rendering
     * @returns {{x:Number, y:Number, size:Number, headScale:Number}}
     */
    getMapDimensions() {
        return {
            x: this.posX,
            y: this.posY,
            size: this.size,
            headScale: this.headScale
        }
    }
}

export default RenderContext

let roomHash = {
    SPAWN: 0,
    NORMAL: 1,
    PUZZLE: 2,
    MINIBOSS: 3,
    FAIRY: 4,
    BLOOD: 5,
    UNKNOWN: 6,
    TRAP: 7,
    BLACK: 8, //for rendering wither doors
    NORMAL_CONNECTION: 9 //for rendering connections between normal rooms
}

const Color = Java.type("java.awt.Color")

const HypixelColorMap = new Map()
HypixelColorMap.set(roomHash.SPAWN, new Color(Renderer.color(0, 124, 0, 255)))
HypixelColorMap.set(roomHash.NORMAL, new Color(Renderer.color(114, 67, 27, 255)))
HypixelColorMap.set(roomHash.NORMAL_CONNECTION, new Color(Renderer.color(114, 67, 27, 255)))
HypixelColorMap.set(roomHash.PUZZLE, new Color(Renderer.color(178, 76, 216, 255)))
HypixelColorMap.set(roomHash.MINIBOSS, new Color(Renderer.color(229, 229, 51, 255)))
HypixelColorMap.set(roomHash.FAIRY, new Color(Renderer.color(242, 127, 165, 255)))
HypixelColorMap.set(roomHash.BLOOD, new Color(Renderer.color(255, 0, 0, 255)))
HypixelColorMap.set(roomHash.TRAP, new Color(Renderer.color(216, 127, 51, 255)))
HypixelColorMap.set(roomHash.UNKNOWN, new Color(Renderer.color(65, 65, 65, 255)))
HypixelColorMap.set(roomHash.BLACK, new Color(Renderer.color(0, 0, 0, 255)))


const LegalMapColorMap = new Map()
LegalMapColorMap.set(roomHash.SPAWN, new Color(Renderer.color(20, 133, 0, 255)))
LegalMapColorMap.set(roomHash.NORMAL, new Color(Renderer.color(107, 58, 17, 255)))
LegalMapColorMap.set(roomHash.NORMAL_CONNECTION, new Color(Renderer.color(92, 52, 14, 255)))
LegalMapColorMap.set(roomHash.PUZZLE, new Color(Renderer.color(117, 0, 133, 255)))
LegalMapColorMap.set(roomHash.MINIBOSS, new Color(Renderer.color(254, 223, 0, 255)))
LegalMapColorMap.set(roomHash.FAIRY, new Color(Renderer.color(224, 0, 255, 255)))
LegalMapColorMap.set(roomHash.BLOOD, new Color(Renderer.color(255, 0, 0, 255)))
LegalMapColorMap.set(roomHash.TRAP, new Color(Renderer.color(216, 127, 51, 255)))
LegalMapColorMap.set(roomHash.UNKNOWN, new Color(Renderer.color(65, 65, 65, 255)))
LegalMapColorMap.set(roomHash.BLACK, new Color(Renderer.color(0, 0, 0, 255)))

const HypixelTicksOld = new Map()
HypixelTicksOld.set("greenCheck", new Image("greenCheckVanilla.png", "https://i.imgur.com/h2WM1LO.png").image)
HypixelTicksOld.set("whiteCheck", new Image("whiteCheckVanilla.png", "https://i.imgur.com/hwEAcnI.png").image)
HypixelTicksOld.set("failedRoom", new Image("failedRoomVanilla.png", "https://i.imgur.com/WqW69z3.png").image)
HypixelTicksOld.set("questionMark", new Image("questionMarkVanilla.png", "https://i.imgur.com/1jyxH9I.png").image)

const LegalMapTicks = new Map()
LegalMapTicks.set("greenCheck", new Image("BloomMapGreenCheck.png", "https://i.imgur.com/GQfTfmp.png").image)
LegalMapTicks.set("whiteCheck", new Image("BloomMapWhiteCheck.png", "https://i.imgur.com/9cZ28bJ.png").image)
LegalMapTicks.set("failedRoom", new Image("BloomMapFailedRoom.png", "https://i.imgur.com/qAb4O9H.png").image)
LegalMapTicks.set("questionMark", new Image("BloomMapQuestionMark.png", "https://i.imgur.com/kp92Inw.png").image)

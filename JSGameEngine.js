/**
 *
 * @author Robin Hefter
 *
 *
 *
 * */

/**
 * @description Taglist for collision layering. important! add new Tags in this object and only use this taglist to set an object tag
 * */
const TagList = {

    default: 'default',
    collider: 'collider',
    object: 'object',
    physics: 'physics',
    player: 'player',
    enemy: 'enemy'

};

/**
 * @class Game
 * @classdesc use to create empty game flow and add objects
 * */
class Game {

    /**
     * @constructor
     * @param {string} timeout - sets the timeout of the interval
     * @param {CanvasRenderingContext2D} ctx - sets the context to draw on a html canvas
     * */
    constructor(timeout, ctx) {
        this.interval = null;
        this.timeout = timeout;
        this.objHandler = new ObjectHandler(this, ctx);
    }

    /**
     * @function start
     * @description Starts the interval
     * */
    start() {
        this.init();
        this.interval = setInterval(this.baseUpdt.bind(this), this.timeout);
    }

    /**
     * @function stop
     * @description Stops the interval
     * */
    stop() {
        clearInterval(this.interval);
    }

    /**
     * @function init
     * @description Initializes before the first interval. Override if you need to initialize anything
     * */
    init() {}

    /**
     * @function baseUpdt
     * @description Base update function
     * */
    baseUpdt() {
        this.update();
        this.render();
    }

    update() {
        this.objHandler.Update();
    }

    render() {
        this.objHandler.Render();
    }

}

/**
 *
 * @class ObjectHandler
 * @classdesc handler for every game object runs updates and renders
 *
 * */
class ObjectHandler {

    /**
     * @constructor
     * @param {Game} game - the base game
     * @param {CanvasRenderingContext2D} canvasRenderingContext - canvas context to draw
     *
     * */
    constructor(game, canvasRenderingContext) {
        this.game = game;

        this.ctx = canvasRenderingContext;

        this.objectList = [];
        this.removeList = [];

        this.deltaTime = 0;
        this.now = performance.now();
        this.last = this.now;
    }

    /**
     * @function addObject
     * @param {ColliderObject} object
     * @description add object to handler
     * */
    addObject(object) {
        if(object instanceof ColliderObject) {
            this.objectList.push(object);
        }
    }

    /**
     * @function removeObject
     * @param {ColliderObject} object
     * @description remove object from handler. important! always use this function, never delete objects manually
     * */
    removeObject(object) {
        this.removeList[this.removeList.length] = this.objectList.indexOf(object);
    }

    /**
     * @function Update
     * @description updates every object, checks collisions and checks the remove list
     * */
    Update() {
        this.deltaTime = (this.now - this.last) / 1000;
        this.last = this.now;
        this.now = performance.now();

        for(let i = 0; i < this.objectList.length; i++) {
            this.objectList[i].update(this.deltaTime);
        }

        for(let i = 0; i < this.objectList.length; i++) {
            for(let j = 0; j < this.objectList.length; j++) {
                if (this.objectList[i] !== this.objectList[j] &&
                    this.objectList[i].collisionTagList[this.objectList[j].tag] &&
                    this.objectList[i].checkCollision(this.objectList[j])) {
                    this.objectList[i].onCollision(this.objectList[j]);
                }
            }
        }

        for(let i = 0; i < this.removeList.length; i++) {
            this.objectList.splice(this.removeList[i], 1);
        }
        this.removeList = [];
    }

    /**
     * @function Render
     * @description renders every object in the handler
     * */
    Render() {
        this.ctx.clearRect(0,0, this.ctx.canvas.width, this.ctx.canvas.height);
        for(let i = 0; i < this.objectList.length; i++) {
            this.objectList[i].render(this.ctx);
        }
    }

}

/**
 * @class Object
 * @classdesc Base Object, dont override this class, this is only a base definition
 * */
class Object {

    static count = 0;

    constructor(x = 0, y = 0, name = 'obj' + Object.count, tag = TagList.default) {
        this.x = x;
        this.y = y;

        this.name = name;
        this.tag = tag;

        Object.count++;
    }

    update(deltaTime) {}

    render(ctx) {}

}

/**
 * @class ColliderObject
 * @classdesc Base collider object. only checks for collision layering and box collision. doesnt serve collision response. Can be extended for more functionality.
 * */
class ColliderObject extends Object {

    constructor(x, y, width = 10, height = 10, name, tag = TagList.collider) {
        super(x, y, name, tag);

        this.width = Math.abs(width);
        this.height = Math.abs(height);

        this.collisionTagList = [];
        this.setAllCollisionTags(false);

    }

    setCollisionTag(tag, collision) {
        if(this.collisionTagList[tag] != null) {
            this.collisionTagList[tag] = collision;
        }
    }

    setAllCollisionTags(collision) {
        for(let x in TagList) {
            this.collisionTagList[x] = collision;
        }
    }

    checkCollision(collider) {}

    onCollision(collider) {}

    render(ctx) {
        ctx.beginPath();
        ctx.rect(this.x, this.y, this.width, this.height);
        ctx.stroke();
        ctx.closePath();
    }

}

/**
 * @class SpriteObject
 * @classdesc Base sprite object. can draw an image.
 * */
class SpriteObject extends ColliderObject{

    constructor(x, y, width, height, name, tag, src = '') {
        super(x, y, width, height, name, tag);

        this.originX = 0;
        this.originY = 0;
        this.offsetX = 0;
        this.offsetY = 0;
        this.imgWidth = this.width;
        this.imgHeight = this.height;

        this.rotation = 0;

        this.img = new Image();
        this.img.src = src;
    }

    render(ctx) {
        super.render(ctx);

        ctx.translate(this.x + this.originX + this.offsetX, this.y + this.originY + this.offsetY);
        ctx.rotate(this.rotation);
        ctx.drawImage(this.img, -this.originX, -this.originY, this.imgWidth, this.imgHeight);
        ctx.resetTransform();
    }

}

/**
 * @class PhysicsObject
 * @classdesc Base physics object. Has collision response. can move by velocity.
 * */
class PhysicsObject extends SpriteObject {

    constructor(x, y, width, height, name, tag = TagList.physics, src) {
        super(x, y, width, height, name, tag, src);

        this.velX = 0;
        this.velY = 0;

        this.oldX = this.x;
        this.oldY = this.y;
    }

    checkCollision(collider) {
        return this.x < collider.x + collider.width && this.x + this.width > collider.x &&
                this.y < collider.y + collider.height && this.y + this.height > collider.y;
    }

    onCollision(collider) {
        if(this.oldY < collider.y + collider.height && this.oldY + this.height > collider.y) {
            const diff = (collider.x + collider.width * 0.5) - (this.oldX + this.width * 0.5);
            if(diff >= 0) {
                this.x = collider.x - this.width;
            } else if(diff < 0) {
                this.x = collider.x + collider.width;
            }
        } else if(this.oldX < collider.x + collider.width && this.oldX + this.width > collider.x) {
            const diff = (collider.y + collider.height * 0.5) - (this.oldY + this.height * 0.5);
            if (diff >= 0) {
                this.y = collider.y - this.height;
            } else if (diff < 0) {
                this.y = collider.y + collider.height;
            }
        }
    }

    update(deltaTime) {
        this.oldX = this.x;
        this.oldY = this.y;
        this.x += this.velX * deltaTime;
        this.y += this.velY * deltaTime;
    }

}

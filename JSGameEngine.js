
/**
 *
 * Base Object
 *
 * */
class Object {

    static count = 0;

    constructor(x, y, name, tag) {

        this.x = x;
        this.y = y;

        if(name !== null) {
            this.name = name;
        } else {
            this.name = 'object' + Object.count;
        }

        if(tag !== null) {
            this.tag = tag;
        } else {
            this.tag = 'default';
        }

        Object.count++;
    }

    update(deltaTime) {}

}

/**
 *
 * Collider Object
 *
 * */
class ColliderObject extends Object {

    constructor(x, y, width, height, name, tag) {
        super(x, y, name, tag);

        this.width = Math.abs(width);
        this.height = Math.abs(height);
    }

    checkCollision(collider) {}

    onCollision(collider) {}

}

/**
 *
 * Physics Object
 *
 * */
class PhysicsObject extends ColliderObject {

    constructor(x, y, width, height, name, tag) {
        super(x, y, width, height, name, tag);

        this.velX = 0;
        this.velY = 0;

        this.oldX = this.x;
        this.oldY = this.y;
    }

    checkCollision(collider) {
        return collider !== this && this.x < collider.x + collider.width && this.x + this.width > collider.x &&
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
        }
        if(this.oldX < collider.x + collider.width && this.oldX + this.width > collider.x) {
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
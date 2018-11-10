function Ray(a, b) {
    this.A = a;
    this.B = b;
}

Ray.prototype = {
    origin: function () {
        return this.A;
    },
    direction: function () {
        return this.B;
    },
    pointAtParameter: function (t) {
        return this.A.add(this.B.multiply(t));
    }
};


function Camera() {
    this.lowerLeftCorner = new Vector(-2.0, -1.0, -1.0);
    this.horizontal = new Vector(4.0, 0.0, 0.0);
    this.vertical = new Vector(0.0, 2.0, 0.0);
    this.origin = new Vector(0.0, 0.0, 0.0);
}

Camera.prototype = {
    getRay: function (u, v) {
        return new Ray(this.origin, this.lowerLeftCorner.add(this.horizontal.multiply(u)).add(this.vertical.multiply(v)).subtract(this.origin));
    }
};



function HitRecord() {
    this.t = 0.0;
    this.p = new Vector(0, 0, 0);
    this.normal = new Vector(0, 0, 0);
}

function HitableList() {
    this.list = [];
}

HitableList.prototype = {
    hit: function (ray, tMin, tMax, hitRec) {
        let tempRec = new HitRecord();
        let hitAnything = false;
        let closestSoFar = tMax;
        for (let i = 0; i < this.list.length; i++) {
            if (this.list[i].hit(ray, tMin, closestSoFar, tempRec)) {
                hitAnything = true;
                closestSoFar = tempRec.t;
                hitRec.t = tempRec.t;
                hitRec.p = tempRec.p;
                hitRec.normal = tempRec.normal;
            }
        }
        return hitAnything;
    }
};

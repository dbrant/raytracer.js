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
    },
    overwrite: function (r) {
        this.A = r.A;
        this.B = r.B;
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
    this.material = new Material();
}
HitRecord.prototype = {
    overwrite: function (rec) {
        this.t = rec.t;
        this.p = rec.p;
        this.normal = rec.normal;
        this.material = rec.material;
    }
};


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
                hitRec.overwrite(tempRec);
            }
        }
        return hitAnything;
    }
};


function Material() {
}
Material.prototype = {
    scatter: function (ray, tMin, tMax, hitRec) {
    }
};

function LambertianMaterial(a) {
    this.albedo = a;
}
LambertianMaterial.prototype = {
    scatter: function (rayIn, hitRec, attenuation, rayScattered) {
        let target = hitRec.p.add(hitRec.normal).add(randomInUnitSphere());
        rayScattered.overwrite(new Ray(hitRec.p, target.subtract(hitRec.p)));
        attenuation.overwrite(this.albedo);
        return true;
    }
};

function MetalMaterial(a) {
    this.albedo = a;
}
MetalMaterial.prototype = {
    reflect: function (v, n) {
        return v.subtract( n.multiply(2.0 * v.dot(n)) );
    },
    scatter: function (rayIn, hitRec, attenuation, rayScattered) {
        let reflected = this.reflect(rayIn.direction().unit(), hitRec.normal);
        rayScattered.overwrite(new Ray(hitRec.p, reflected));
        attenuation.overwrite(this.albedo);
        return rayScattered.direction().dot(hitRec.normal) > 0;
    }
};





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


function Camera(lookFrom, lookAt, vUp, vFov, aspect, aperture, focusDist) {
    this.lensRadius = aperture / 2;
    let theta = vFov * Math.PI / 180.0;
    let halfHeight = Math.tan(theta / 2);
    let halfWidth = aspect * halfHeight;

    this.origin = lookFrom;
    this.w = lookFrom.subtract(lookAt).unit();
    this.u = vUp.cross(this.w).unit();
    this.v = this.w.cross(this.u);

    this.lowerLeftCorner = this.origin.subtract( this.u.multiply(halfWidth * focusDist) ).subtract( this.v.multiply(halfHeight * focusDist) ).subtract(this.w.multiply(focusDist));
    this.horizontal = this.u.multiply(2 * halfWidth * focusDist);
    this.vertical = this.v.multiply(2 * halfHeight * focusDist);
}

Camera.prototype = {
    getRay: function (s, t) {
        let rd = randomInUnitDisk().multiply(this.lensRadius);
        let offset = this.u.multiply(rd.x).add(this.v.multiply(rd.y));
        return new Ray(this.origin.add(offset), this.lowerLeftCorner.add(this.horizontal.multiply(s)).add(this.vertical.multiply(t)).subtract(this.origin).subtract(offset));
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


function MetalMaterial(a, fuzz) {
    this.albedo = a;
    this.fuzz = fuzz > 1.0 ? 1.0 : fuzz;
}
MetalMaterial.prototype = {
    reflect: function (v, n) {
        return v.subtract( n.multiply(2.0 * v.dot(n)) );
    },
    scatter: function (rayIn, hitRec, attenuation, rayScattered) {
        let reflected = this.reflect(rayIn.direction().unit(), hitRec.normal);
        rayScattered.overwrite(new Ray(hitRec.p, reflected.add(randomInUnitSphere().multiply(this.fuzz))));
        attenuation.overwrite(this.albedo);
        return rayScattered.direction().dot(hitRec.normal) > 0;
    }
};

function DielectricMaterial(ri) {
    this.refractiveIndex = ri;
}
DielectricMaterial.prototype = {
    reflect: function (v, n) {
        return v.subtract( n.multiply(2.0 * v.dot(n)) );
    },
    refract: function (v, n, niOverNt, refracted) {
        let uv = v.unit();
        let dt = uv.dot(n);
        let discriminant = 1.0 - niOverNt*niOverNt*(1 - dt*dt);
        if (discriminant > 0) {
            refracted.overwrite( uv.subtract(n.multiply(dt)).multiply(niOverNt).subtract( n.multiply(Math.sqrt(discriminant)) ) );
            return true;
        } else {
            return false;
        }
    },
    schlick: function (cosine, refIndex) {
        let r0 = (1 - refIndex) / (1 + refIndex);
        r0 *= r0;
        return r0 + (1 - r0)*Math.pow(1-cosine, 5);
    },
    scatter: function (rayIn, hitRec, attenuation, rayScattered) {
        let outwardNormal = new Vector();
        let reflected = this.reflect(rayIn.direction(), hitRec.normal);
        let niOverNt = 0;
        attenuation.overwrite(new Vector(1.0, 1.0, 1.0));

        let refracted = new Vector();
        let reflectProb = 0;
        let cosine = 0;

        if (rayIn.direction().dot(hitRec.normal) > 0) {
            outwardNormal = hitRec.normal.negative();
            niOverNt = this.refractiveIndex;
            cosine = this.refractiveIndex * rayIn.direction().dot(hitRec.normal) / rayIn.direction().length();
        } else {
            outwardNormal.overwrite(hitRec.normal);
            niOverNt = 1.0 / this.refractiveIndex;
            cosine = -(rayIn.direction().dot(hitRec.normal)) / rayIn.direction().length();
        }

        if (this.refract(rayIn.direction(), outwardNormal, niOverNt, refracted)) {
            reflectProb = this.schlick(cosine, this.refractiveIndex);
        } else {
            rayScattered.overwrite( new Ray(hitRec.p, reflected) );
            reflectProb = 1.0;
        }

        if (Math.random() < reflectProb) {
            rayScattered.overwrite( new Ray(hitRec.p, reflected) );
        } else {
            rayScattered.overwrite( new Ray(hitRec.p, refracted) );
        }
        return true;
    }
};




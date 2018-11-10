function Sphere(cen, rad) {
    this.center = cen;
    this.radius = rad;
}

Sphere.prototype = {
    hit: function (ray, tMin, tMax, hitRec) {
        const oc = ray.origin().subtract(this.center);
        const a = ray.direction().dot(ray.direction());
        const b = oc.dot(ray.direction());
        const c = oc.dot(oc) - this.radius * this.radius;
        const discriminant = b*b - a*c;
        if (discriminant > 0) {
            let temp = (-b - Math.sqrt(b*b - a*c)) / a;
            if (temp < tMax && temp > tMin) {
                hitRec.t = temp;
                hitRec.p = ray.pointAtParameter(hitRec.t);
                hitRec.normal = (hitRec.p.subtract(this.center).divide(this.radius));
                return true;
            }
            temp = (-b + Math.sqrt(b*b - a*c)) / a;
            if (temp < tMax && temp > tMin) {
                hitRec.t = temp;
                hitRec.p = ray.pointAtParameter(hitRec.t);
                hitRec.normal = (hitRec.p.subtract(this.center).divide(this.radius));
                return true;
            }
        }
        return false;
    }
};

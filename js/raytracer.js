
let canvas;
let context;
let renderButton;

window.onload = function() {
    renderButton = document.getElementById( "#render_button" );
    canvas = document.getElementById( "#canvas" );
    context = canvas.getContext("2d");
};

function render() {
    const width = canvas.width;
    const height = canvas.height;
    let imageData = context.getImageData(0, 0, width, height);


    let world = new HitableList();
    world.list.push(new Sphere(new Vector(0, 0, -1), 0.5));
    world.list.push(new Sphere(new Vector(0, -100.5, -1), 100));

    let cam = new Camera();
    let ns = 50;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {

            let color = new Vector(0, 0, 0);
            for (let s = 0; s < ns; s++) {
                let u = (x + Math.random()) / width;
                let v = (y + Math.random()) / height;
                let r = cam.getRay(u, v);
                let p = r.pointAtParameter(2.0);
                color = color.add(getColor(r, world));
            }
            color = color.divide(ns);

            color.x = Math.sqrt(color.x);
            color.y = Math.sqrt(color.y);
            color.z = Math.sqrt(color.z);

            setPixel(imageData.data, width, x, height - y, 255 * color.x, 255 * color.y, 255 * color.z);
        }
    }

    context.putImageData(imageData, 0, 0);
}


function randomInUnitSphere() {
    let p;
    do {
        p = (new Vector(Math.random(), Math.random(), Math.random())).multiply(2.0).subtract(new Vector(1, 1, 1));
    } while (p.dot(p) >= 1.0);
    return p;
}

function getColor(ray, world) {
    let rec = new HitRecord();
    if (world.hit(ray, 0.001, Number.MAX_VALUE, rec)) {
        let target = rec.p.add(rec.normal).add(randomInUnitSphere());
        return getColor(new Ray(rec.p, target.subtract(rec.p)), world).multiply(0.5);
    } else {
        let unitDirection = ray.direction().unit();
        t = 0.5 * (unitDirection.y + 1.0);
        return (new Vector(1.0, 1.0, 1.0)).multiply(1.0 - t).add( (new Vector(0.5, 0.7, 1.0)).multiply(t) );
    }
}

function setPixel(data, width, x, y, r, g, b) {
    const p = (y * width + x) * 4;
    data[p] = r;
    data[p + 1] = g;
    data[p + 2] = b;
    data[p + 3] = 255;
}

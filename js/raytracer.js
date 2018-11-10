
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

    world.list.push(new Sphere(new Vector(0, -1000, -1), 1000, new LambertianMaterial(new Vector(0.5, 0.5, 0.5))));

    for (let a = -12; a < 12; a++) {
        for (let b = -12; b < 12; b++) {

            let materialChoice = Math.random();
            let material;
            if (materialChoice < 0.3) {
                material = new LambertianMaterial(new Vector(Math.random() * Math.random(), Math.random() * Math.random(), Math.random() * Math.random()));
            } else if (materialChoice < 0.9) {
                material = new MetalMaterial(new Vector(0.5 * (1 + Math.random()), 0.5 * (1 + Math.random()), 0.5 * (1 + Math.random())), 0.3 * Math.random());
            } else {
                material = new DielectricMaterial(1.5);
            }

            let radius = 0.1 + Math.random() * 0.3;
            world.list.push(new Sphere(new Vector(a + 0.9*Math.random(), radius, b + 0.9*Math.random()), radius, material));
        }
    }

    world.list.push(new Sphere(new Vector(0, 1, 0), 1.0, new DielectricMaterial(1.5) ));
    world.list.push(new Sphere(new Vector(-2, 1, 0), 1.0, new MetalMaterial(new Vector(1.0, 0.8, 0.8), 0.0) ));
    world.list.push(new Sphere(new Vector(-1, 1, Math.sqrt(3)), 1.0, new MetalMaterial(new Vector(0.8, 0.8, 0.8), 0.0) ));
    world.list.push(new Sphere(new Vector(-1, 2.3, 1 / Math.sqrt(3)), 0.8, new DielectricMaterial(1.5) ));


    let lookFrom = new Vector(-3, 3.5, 10);
    let lookAt = new Vector(-1, 1, 0);
    let distToFocus = lookFrom.subtract(lookAt).length();
    let cam = new Camera(lookFrom, lookAt, new Vector(0, 1, 0), 35, width / height, 0.1, distToFocus);

    let ns = 100;

    for (let y = 0; y < height; y++) {

        console.log("Rendering line " + y);

        for (let x = 0; x < width; x++) {

            let color = new Vector(0, 0, 0);
            for (let s = 0; s < ns; s++) {
                let u = (x + Math.random()) / width;
                let v = (y + Math.random()) / height;
                let r = cam.getRay(u, v);
                let p = r.pointAtParameter(2.0);
                color = color.add(getColor(r, world, 0));
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


function getColor(ray, world, depth) {
    let rec = new HitRecord();
    if (world.hit(ray, 0.001, Number.MAX_VALUE, rec)) {
        let scattered = new Ray(new Vector(), new Vector());
        let attenuation = new Vector();

        if (depth < 50 && rec.material.scatter(ray, rec, attenuation, scattered)) {
            return attenuation.multiply(getColor(scattered, world, depth + 1));
        } else {
            return new Vector(0, 0, 0);
        }

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

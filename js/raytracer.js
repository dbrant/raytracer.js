
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

    for (let a = -10; a < 10; a++) {
        for (let b = -10; b < 10; b++) {

            let materialChoice = Math.random();
            let material;
            if (materialChoice < 0.3) {
                material = new LambertianMaterial(new Vector(Math.random() * Math.random(), Math.random() * Math.random(), Math.random() * Math.random()));
            } else if (materialChoice < 0.9) {
                material = new MetalMaterial(new Vector(0.5 * (1 + Math.random()), 0.5 * (1 + Math.random()), 0.5 * (1 + Math.random())), 0.3 * Math.random());
            } else {
                material = new DielectricMaterial(1.5);
            }

            world.list.push(new Sphere(new Vector(a + 0.9*Math.random(), 0.2, b + 0.9*Math.random()), 0.2, material));
        }
    }

    world.list.push(new Sphere(new Vector(0, 1, 0), 1.0, new LambertianMaterial(new Vector(0.2, 0.4, 0.7))));
    world.list.push(new Sphere(new Vector(-2, 1, 0), 1.0, new MetalMaterial(new Vector(8.0, 0.8, 0.8), 0.0)));
    world.list.push(new Sphere(new Vector(2, 1, 0), 1.0, new DielectricMaterial(1.5)));


    let cam = new Camera(new Vector(-4, 2, 4), new Vector(0, 0, -1), new Vector(0, 1, 0), 50, width / height);

    let ns = 50;

    for (let y = 0; y < height; y++) {
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

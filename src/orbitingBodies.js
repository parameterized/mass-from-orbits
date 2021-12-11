
export class OrbitingBodies {
    constructor (centerBody) {
        this.centerBody = centerBody;
        switch (centerBody) {
            case 'Sun':
                this.bodies = [
                    new Body({
                        name: 'Mercury',
                        distance: 57.9, period: 88,
                        diameter: 4_879,
                        color: '#CBAB82'
                    }),
                    new Body({
                        name: 'Venus',
                        distance: 108.2, period: 224.7,
                        diameter: 12_104,
                        color: '#C99248'
                    }),
                    new Body({
                        name: 'Earth',
                        distance: 149.6, period: 365.2,
                        diameter: 12_756,
                        color: '#9CAFC5'
                    }),
                    new Body({
                        name: 'Mars',
                        distance: 227.9, period: 687,
                        diameter: 6_792,
                        color: '#BDA484'
                    }),
                    new Body({
                        name: 'Jupiter',
                        distance: 778.6, period: 4_331,
                        diameter: 142_984,
                        color: '#EE9E69'
                    }),
                    new Body({
                        name: 'Saturn',
                        distance: 1_433.5, period: 10_747,
                        diameter: 120_536,
                        color: '#F6E6AB'
                    }),
                    new Body({
                        name: 'Uranus',
                        distance: 2_872.5, period: 30_589,
                        diameter: 51_118,
                        color: '#8BACBC'
                    }),
                    new Body({
                        name: 'Neptune',
                        distance: 4_495.1, period: 59_800,
                        diameter: 49_529,
                        color: '#82AEEF'
                    })
                ];
                break;
            case 'Earth':
                this.bodies = [
                    new Body({
                        name: 'Moon',
                        distance: 0.384, period: 27.3,
                        diameter: 3_475,
                        color: '#CBCCCB'
                    })
                ];
                break;
            case 'Mars':
                this.bodies = [
                    new Body({
                        name: 'Phobos',
                        distance: 0.009377, period: 0.32768,
                        diameter: 22.533,
                        color: '#9A7F6C'
                    }),
                    new Body({
                        name: 'Deimos',
                        distance: 0.023436, period: 1.29715,
                        diameter: 12.4,
                        color: '#B3A489'
                    })
                ]
                break;
        }
    }
    

    update(simDt) {
        for (let b of this.bodies) {
            b.update(simDt);
        }
    }

    draw() {
        for (let b of this.bodies) {
            let scalar = 1 / 1_000_000; // for orbiting bodies
            switch (this.centerBody) {
                case 'Sun':
                    scalar *= 1_000;
                    break;
                case 'Earth':
                    scalar *= 10;
                    break;
                case 'Mars':
                    scalar *= 100;
                    break;
            }
            b.draw(scalar);
        }
    }
}

class Body {
    constructor(o) {
        this.name = o.name;
        this.distance = o.distance; // (10^6 km)
        this.period = o.period; // (Earth days)
        this.phase = random();
        this.diameter = o.diameter; // (km)
        this.color = o.color;
    }

    update(simDt) {
        this.phase += simDt / this.period;
    }

    draw(scalar) {
        let x = cos(this.phase * TWO_PI) * this.distance;
        let y = -sin(this.phase * TWO_PI) * this.distance;
        fill(this.color);
        circle(x, y, this.diameter * scalar);
    }
}
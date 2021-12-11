
import { targetWidth, targetHeight, viewport } from './index.js';
import { UI } from './ui.js';
import { utils } from './utils.js';
import { OrbitingBodies } from './orbitingBodies.js';

let auDist = 149.6; // (10^6 km)
let daysInYear = 365.2;

export class Game {
    constructor() {
        this.ui = new UI();

        this.objectiveText = this.ui.addText({
            text:
'Calculate the Sun\'s mass by\n\
measuring the period and\n\
distance of any planet',
            horizAlign: LEFT,
            x: 80, y: 150
        });

        this.setPeriodBtn = this.ui.addButton({
            text: 'Set Period', box: [80, 260, 200, 60],
            action: () => {
                this.currentPeriod = this.timer.val;
            }
        });
        this.periodText = this.ui.addText({
            getText: () => this.currentPeriod == 0 ? ''
                : (this.currentPeriod.toFixed(4) + ' years'),
            x: 400, y: 290
        });

        this.setDistanceBtn = this.ui.addButton({
            text: 'Set Distance', box: [80, 350, 230, 60],
            action: () => {
                this.currentDistance = this.getMeasurementVal();
            }
        });
        this.distanceText = this.ui.addText({
            getText: () => this.currentDistance == 0 ? ''
                : (this.currentDistance.toFixed(4) + ' AU'),
            x: 410, y: 380
        });

        this.calculateBtn = this.ui.addButton({
            text: 'Calculate', box: [80, 440, 180, 60],
            action: () => {
                if (this.currentPeriod == 0 || this.currentDistance == 0) {
                    return;
                }
                let P = this.currentPeriod * 3.156e+7;
                let a = this.currentDistance * 1.468e+11;
                let G = 6.67e-11;
                let calcMass = 4 * PI**2 * a**3 / (G * P**2);
                let calcError = abs(calcMass - this.massCenterBody) / this.massCenterBody;
                
                this.calculateText.text =
`P = ${this.currentPeriod.toFixed(4)} * 3.156 x 10^7 seconds\n\
a = ${this.currentDistance.toFixed(4)} * 1.469 x 10^11 meters\n\
G = 6.67 x 10^(-11) Newton m^2 / kg^2\n\
M_${this.centerBody} ≈ 4 * π^2 * a^3 / (G * P^2) kg\n\
M_${this.centerBody} ≈ ${calcMass.toExponential(2).replace('e+', ' x 10^')} kg\n\
Actual M_${this.centerBody} = ${this.massCenterBody.toExponential(2).replace('e+', ' x 10^')} kg\n\
Percent Error: ${(calcError * 100).toFixed(2)}%`;

                this.nextBtn1.hidden = false;
                this.nextBtn2.hidden = false;
            }
        });
        this.calculateText = this.ui.addText({
            text: ' ', textSize: 26, horizAlign: LEFT,
            x: 80, y: 660
        });

        this.nextBtn1 = this.ui.addButton({
            text: 'Go to Earth', box: [80, 800, 240, 60],
            action: () => {
                this.resetGameVals();
                this.nextBtn1.text = 'Go to the Sun';
            },
            hidden: true
        });
        this.nextBtn2 = this.ui.addButton({
            text: 'Go to Mars', box: [360, 800, 240, 60],
            action: () => {
                this.resetGameVals();
            },
            hidden: true
        });

        this.distHelpText = this.ui.addText({
            text: 'Click and drag to measure distance',
            x: 1250, y: 60
        });

        this.timescaleText = this.ui.addText({
            getText: () => `Timescale: ${
                this.timescale < 1 ? this.timescale.toFixed(4) : this.timescale
            } years / sec`,
            x: 1180, y: 140
        });
        this.timescalePlusBtn = this.ui.addButton({
            text: '+', box: [1430, 110, 60, 60],
            action: () => {
                this.timescale = min(this.timescale * 2, 32);
            }
        });
        this.timescaleMinusBtn = this.ui.addButton({
            text: '-', box: [1500, 110, 60, 60],
            action: () => {
                this.timescale = max(this.timescale / 2, 1 / 2048);
            }
        });

        this.pauseBtn = this.ui.addButton({
            getText: () => this.paused ? 'Resume': 'Pause',
            box: [1400, 210, 160, 60],
            action: () => {
                this.paused = !this.paused;
            }
        });
        this.timerBtn = this.ui.addButton({
            getText: () => this.timer.active ? 'Stop Timer' : 'Start Timer',
            box: [1330, 320, 230, 60],
            action: () => {
                this.timer.active = !this.timer.active;
                if (this.timer.active) {
                    this.timer.val = 0;
                }
            }
        });
        this.timerText = this.ui.addText({
            getText: () => this.timer.val.toFixed(4) + ' years',
            x: 1460, y: 420
        });

        this.zoomText = this.ui.addText({
            getText: () => `Zoom: ${
                this.zoom < 0 ? this.zoom.toFixed(4) : this.zoom
            }x`,
            x: 1330, y: 520
        });
        this.zoomPlusBtn = this.ui.addButton({
            text: '+', box: [1430, 480, 60, 60],
            action: () => {
                if (this.zoom < 16) {
                    this.zoom *= 2;
                    let m = this.measurement;
                    if (m.visible) {
                        let cx = targetWidth / 2;
                        let cy = targetHeight / 2;
                        m.x1 = cx + (m.x1 - cx) * 2;
                        m.y1 = cy + (m.y1 - cy) * 2;
                        m.x2 = cx + (m.x2 - cx) * 2;
                        m.y2 = cy + (m.y2 - cy) * 2;
                    }
                }
            }
        });
        this.zoomMinusBtn = this.ui.addButton({
            text: '-', box: [1500, 480, 60, 60],
            action: () => {
                if (this.zoom > 1 / 2) {
                    this.zoom /= 2;
                    let m = this.measurement;
                    if (m.visible) {
                        let cx = targetWidth / 2;
                        let cy = targetHeight / 2;
                        m.x1 = cx + (m.x1 - cx) / 2;
                        m.y1 = cy + (m.y1 - cy) / 2;
                        m.x2 = cx + (m.x2 - cx) / 2;
                        m.y2 = cy + (m.y2 - cy) / 2;
                    }
                }
            }
        });

        this.resetGameVals();
        this.setSun();

        // stars bg
        this.stars = createGraphics(targetWidth, targetHeight);
        let g = this.stars;
        g.noStroke();
        g.fill(255);
        for (let i = 0; i < 200; i++) {
            g.circle(random() * targetWidth,
                random() * targetWidth, 2 + random() * 3);
        }
    }

    resetGameVals() {
        this.paused = false;

        this.measurement = {
            held: false, visible: false,
            x1: 0, y1: 0, x2: 0, y2: 0
        };
        this.timer = {
            active: false, val: 0
        }

        this.timescale = 1;
        this.zoom = 2;

        this.currentPeriod = 0;
        this.currentDistance = 0;

        this.calculateText.text = ' ';
    }

    setSun() {
        this.resetGameVals();
        this.centerBody = 'Sun';
        this.centerColor = '#EDCD54';
        this.centerDiameter = 1_392_700; // (km)
        this.centerDiameter *= 50 / 1_000_000;
        this.massCenterBody = 1.989e+30; // (kg)
        
        this.pixelScale = 6;

        this.orbitingBodies = new OrbitingBodies(this.centerBody);

        this.nextBtn1.text = 'Go to Earth';
        this.nextBtn1.action = () => this.setEarth();
        this.nextBtn1.hidden = true;
        this.nextBtn2.text = 'Go to Mars';
        this.nextBtn2.action = () => this.setMars();
        this.nextBtn2.hidden = true;
        this.objectiveText.text =
'Calculate the Sun\'s mass by\n\
measuring the period and\n\
distance of any planet';
    }

    setEarth() {
        this.resetGameVals();
        this.timescale = 1 / 64;

        this.centerBody = 'Earth';
        this.centerColor = '#9CAFC5';
        this.centerDiameter = 12_756;
        this.centerDiameter *= 10 / 1_000_000;
        this.massCenterBody = 5.97e+24;

        this.pixelScale = 1 / 400;
        
        this.orbitingBodies = new OrbitingBodies(this.centerBody);

        this.nextBtn1.text = 'Go to the Sun';
        this.nextBtn1.action = () => this.setSun();
        this.nextBtn1.hidden = true;
        this.nextBtn2.text = 'Go to Mars';
        this.nextBtn2.action = () => this.setMars();
        this.nextBtn2.hidden = true;
        this.objectiveText.text =
'Calculate the mass of Earth by\n\
measuring the period and\n\
distance of the Moon';
    }

    setMars() {
        this.resetGameVals();
        this.timescale = 1 / 512;

        this.centerBody = 'Mars';
        this.centerColor = '#BDA484';
        this.centerDiameter = 6_792;
        this.centerDiameter *= 1.5 / 1_000_000;
        this.massCenterBody = 6.42e+23;
        
        this.pixelScale = 1 / 40_00;

        this.orbitingBodies = new OrbitingBodies(this.centerBody);

        this.nextBtn1.text = 'Go to the Sun';
        this.nextBtn1.action = () => this.setSun();
        this.nextBtn1.hidden = true;
        this.nextBtn2.text = 'Go to Earth';
        this.nextBtn2.action = () => this.setEarth();
        this.nextBtn2.hidden = true;
        this.objectiveText.text =
'Calculate the mass of Mars by\n\
measuring the period and\n\
distance of either moon';
    }

    getMeasurementVal() {
        let m = this.measurement;
        return dist(m.x1, m.y1, m.x2, m.y2) /
            (auDist * this.zoom / this.pixelScale);
    }

    mousePressed() {
        this.ui.mousePressed();
        if (!this.ui.held) {
            let m = this.measurement;
            m.held = true;
            m.x1 = viewport.mouseX;
            m.y1 = viewport.mouseY;
        }
    }

    mouseReleased() {
        this.ui.mouseReleased();

        let m = this.measurement;
        m.held = false;
        if (dist(m.x1, m.y1, m.x2, m.y2) < 10) {
            m.visible = false;
        }
    }

    keyPressed() {
        switch (keyCode) {
            case 32: // Space
                this.pauseBtn.action();
                break;
        }
    }

    update(dt) {
        if (!this.paused) {
            let simDt = dt * this.timescale;
            if (this.timer.active) {
                this.timer.val += simDt;
            }
            this.orbitingBodies.update(simDt * daysInYear);
        }

        let m = this.measurement;
        if (m.held) {
            m.visible = true;
            m.x2 = viewport.mouseX;
            m.y2 = viewport.mouseY;
        }
    }

    draw() {
        //stars
        image(this.stars, 0, 0);
        fill('#EDCD54');

        // bodies
        let cx = targetWidth / 2;
        let cy = targetHeight / 2;
        push();
        translate(cx, cy);
        scale(this.zoom / this.pixelScale);

        // - orbited
        fill(this.centerColor);
        circle(0, 0, this.centerDiameter);

        // - orbiting
        this.orbitingBodies.draw();
        pop();

        // measurement
        let m = this.measurement;
        if (m.visible) {
            push();

            stroke('#F47A9E');
            fill('#F47A9E');
            strokeWeight(4);
            line(m.x1, m.y1, m.x2, m.y2);
            circle(m.x1, m.y1, 5);
            circle(m.x2, m.y2, 5);
            noStroke();

            let mcx = (m.x1 + m.x2) / 2;
            let mcy = (m.y1 + m.y2) / 2;
            let ma = atan2(m.y2 - m.y1, m.x2 - m.x1);
            if (abs(utils.deltaAngle(ma, PI)) < HALF_PI) {
                ma += PI;
            }
            translate(mcx, mcy);
            rotate(ma);
            textAlign(CENTER, CENTER);
            textSize(24);
            text(this.getMeasurementVal().toFixed(4) + ' AU', 0, 20);
            
            pop()
        }
        
        //bg for calculation text
        if (this.calculateText.text != ' ') {
            fill(0, 150);
            rect(60, 540, 490, 240);
        }

        this.ui.draw();
    }
}

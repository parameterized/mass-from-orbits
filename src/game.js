
import { targetWidth, targetHeight, viewport } from './index.js';
import { UI } from './ui.js';
import { utils } from './utils.js';

export class Game {
    paused = false;
    earthT = 0;

    measurement = {
        held: false, visible: false,
        x1: 0, y1: 0, x2: 0, y2: 0
    };

    timer = {
        active: false, val: 0
    };

    constructor() {
        this.ui = new UI();
        this.distText = this.ui.addText({
            text: 'Click and drag to measure distance',
            x: 1250, y: 60
        });
        this.pauseBtn = this.ui.addButton({
            text: 'Pause', box: [1300, 200, 160, 60],
            action: () => {
                this.paused = !this.paused;
                this.pauseBtn.text = this.paused ? 'Resume' : 'Pause';
            }
        });
        this.timerBtn = this.ui.addButton({
            text: 'Start Timer', box: [1230, 320, 230, 60],
            action: () => {
                this.timer.active = !this.timer.active;
                if (this.timer.active) {
                    this.timer.val = 0;
                    this.timerBtn.text = 'Stop Timer';
                } else {
                    this.timerBtn.text = 'Start Timer';
                }
            }
        });
        this.timerText = this.ui.addText({
            getText: () => this.timer.val.toFixed(2),
            x: 1400, y: 420
        });
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
            this.earthT += dt;
            if (this.timer.active) {
                this.timer.val += dt / TWO_PI;
            }
        }

        let m = this.measurement;
        if (m.held) {
            m.visible = true;
            m.x2 = viewport.mouseX;
            m.y2 = viewport.mouseY;
        }
    }

    draw() {
        let cx = targetWidth / 2;
        let cy = targetHeight / 2;
        fill('#EDCD54');
        circle(cx, cy, 50);
        
        let ed = 300;
        let ex = cx + ed * cos(this.earthT);
        let ey = cy - ed * sin(this.earthT); 
        fill('#4494CF');
        circle(ex, ey, 30);

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
            let d = dist(m.x1, m.y1, m.x2, m.y2) / ed;
            translate(mcx, mcy);
            rotate(ma);
            textAlign(CENTER, CENTER);
            textSize(24);
            text(d.toFixed(2), 0, 20);
            
            pop()
        }
        
        this.ui.draw();
    }
}

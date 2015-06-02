var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var physJS;
(function (physJS) {
    var vector2d = (function () {
        function vector2d(x, y) {
            this.x = x;
            this.y = y;
        }
        vector2d.sum = function (a, b) { return new vector2d(a.x + b.x, a.y + b.y); };
        vector2d.times = function (m, v) { return new vector2d(v.x * m, v.y * m); };
        vector2d.div = function (v, d) { return new vector2d(v.x / d, v.y / d); };
        vector2d.mag = function (v) { return Math.sqrt(v.x * v.x + v.y * v.y); };
        vector2d.norm = function (v) {
            var mag = vector2d.mag(v);
            var div = (mag === 0) ? Infinity : 1.0 / mag;
            return vector2d.times(div, v);
        };
        return vector2d;
    })();
    physJS.vector2d = vector2d;
    var coords2d = (function (_super) {
        __extends(coords2d, _super);
        function coords2d() {
            _super.apply(this, arguments);
        }
        coords2d.difference = function (a, b) {
            return new vector2d(b.x - a.x, b.y - a.y);
        };
        return coords2d;
    })(vector2d);
    physJS.coords2d = coords2d;
    var SVGDrawer = (function () {
        function SVGDrawer(target) {
            this.target = target;
        }
        SVGDrawer.prototype.clear = function () {
            while (this.target.firstChild)
                this.target.removeChild(this.target.firstChild);
        };
        SVGDrawer.prototype.circle = function (center, radius, colour) {
            var elm = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            elm.setAttributeNS(null, 'cx', center.x.toString());
            elm.setAttributeNS(null, 'cy', center.y.toString());
            elm.setAttributeNS(null, 'r', radius.toString());
            elm.setAttributeNS(null, 'stroke-width', '0');
            elm.setAttributeNS(null, 'fill', colour);
            this.target.appendChild(elm);
        };
        SVGDrawer.prototype.line = function (endpoints, weight, colour) {
            var elm = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            elm.setAttributeNS(null, 'x1', endpoints[0].x.toString());
            elm.setAttributeNS(null, 'y1', endpoints[0].y.toString());
            elm.setAttributeNS(null, 'x2', endpoints[1].x.toString());
            elm.setAttributeNS(null, 'y2', endpoints[1].y.toString());
            elm.setAttributeNS(null, 'stroke-width', weight.toString());
            elm.setAttributeNS(null, 'stroke', colour);
            this.target.appendChild(elm);
        };
        return SVGDrawer;
    })();
    physJS.SVGDrawer = SVGDrawer;
    var pointObj = (function () {
        function pointObj() {
        }
        pointObj.prototype.getLoc = function () {
            return new coords2d(0, 0);
        };
        pointObj.prototype.draw = function (out) {
            out.circle(this.getLoc(), 5, 'black');
        };
        pointObj.prototype.accelerate = function (force, time) { };
        pointObj.prototype.getVelocity = function () { return new vector2d(0, 0); };
        pointObj.prototype.getMass = function () { return 0; };
        pointObj.prototype.getRadius = function () { return 5; };
        ;
        return pointObj;
    })();
    physJS.pointObj = pointObj;
    var simplePoint = (function (_super) {
        __extends(simplePoint, _super);
        function simplePoint(loc) {
            _super.call(this);
            this.loc = loc;
        }
        simplePoint.prototype.getLoc = function () {
            return this.loc;
        };
        simplePoint.prototype.move = function (loc) {
            this.loc = loc;
        };
        return simplePoint;
    })(pointObj);
    physJS.simplePoint = simplePoint;
    var movingPoint = (function (_super) {
        __extends(movingPoint, _super);
        function movingPoint(loc, velocity) {
            _super.call(this);
            this.loc = loc;
            this.velocity = velocity;
        }
        movingPoint.prototype.step = function (time) {
            this.loc = vector2d.sum(this.loc, vector2d.times(time, this.velocity));
        };
        movingPoint.prototype.getLoc = function () {
            return this.loc;
        };
        movingPoint.prototype.getVelocity = function () { return this.velocity; };
        return movingPoint;
    })(pointObj);
    physJS.movingPoint = movingPoint;
    var weightedPoint = (function (_super) {
        __extends(weightedPoint, _super);
        function weightedPoint(loc, velocity, mass) {
            _super.call(this, loc, velocity);
            this.mass = mass;
        }
        weightedPoint.prototype.accelerate = function (force, time) {
            this.velocity = vector2d.sum(this.velocity, physJS.vector2d.div(force, this.mass));
        };
        weightedPoint.prototype.getMass = function () {
            return this.mass;
        };
        return weightedPoint;
    })(movingPoint);
    physJS.weightedPoint = weightedPoint;
    var controller = (function () {
        function controller() {
            this.steppers = [];
            this.drawers = [];
        }
        controller.prototype.step = function (time) {
            for (var i = 0; i < this.steppers.length; i++)
                this.steppers[i].step(time);
        };
        controller.prototype.draw = function (out) {
            for (var i = 0; i < this.drawers.length; i++)
                this.drawers[i].draw(out);
        };
        controller.prototype.addStepper = function (s) { this.steppers.push(s); };
        controller.prototype.addDrawer = function (d) { this.drawers.push(d); };
        controller.prototype.addStepperList = function (s) { for (var i = 0; i < s.length; i++)
            this.steppers.push(s[i]); };
        controller.prototype.addDrawerList = function (d) { for (var i = 0; i < d.length; i++)
            this.drawers.push(d[i]); };
        return controller;
    })();
    physJS.controller = controller;
    var lineObj = (function () {
        function lineObj() {
        }
        lineObj.prototype.getEndpoints = function () {
            return [new coords2d(0, 0), new coords2d(0, 0)];
        };
        lineObj.prototype.getLength = function () {
            return 0;
        };
        lineObj.prototype.draw = function (out) {
            drawer.line(this.getEndpoints(), 2, 'black');
        };
        return lineObj;
    })();
    physJS.lineObj = lineObj;
    var pointToPointLine = (function (_super) {
        __extends(pointToPointLine, _super);
        function pointToPointLine(parents) {
            _super.call(this);
            this.parents = parents;
        }
        pointToPointLine.prototype.getLength = function () {
            return vector2d.mag(coords2d.difference(this.parents[0].getLoc(), this.parents[1].getLoc()));
        };
        pointToPointLine.prototype.getEndpoints = function () {
            return [this.parents[0].getLoc(), this.parents[1].getLoc()];
        };
        return pointToPointLine;
    })(lineObj);
    physJS.pointToPointLine = pointToPointLine;
    var hookeanLinkage = (function (_super) {
        __extends(hookeanLinkage, _super);
        function hookeanLinkage(parents, hookeanConstant, restingLength) {
            _super.call(this, parents);
            this.hookeanConstant = hookeanConstant;
            this.restingLength = restingLength;
        }
        hookeanLinkage.prototype.getRestingLength = function () {
            return this.restingLength;
        };
        hookeanLinkage.prototype.force = function (time) {
            return (this.getLength() - this.getRestingLength()) * this.hookeanConstant;
        };
        hookeanLinkage.prototype.step = function (time) {
            for (var i = 0; i < 2; i++) {
                this.parents[i].accelerate(vector2d.times(this.force(time), vector2d.norm(coords2d.difference(this.parents[i].getLoc(), this.parents[1 - i].getLoc()))), time);
            }
        };
        return hookeanLinkage;
    })(pointToPointLine);
    physJS.hookeanLinkage = hookeanLinkage;
    var dampenedHookeanLinkage = (function (_super) {
        __extends(dampenedHookeanLinkage, _super);
        function dampenedHookeanLinkage(parents, hookeanConstant, restingLength, dampingConstant) {
            _super.call(this, parents, hookeanConstant, restingLength);
            this.dampingConstant = dampingConstant;
        }
        dampenedHookeanLinkage.prototype.step = function (time) {
            _super.prototype.step.call(this, time);
        };
        dampenedHookeanLinkage.prototype.force = function (time) {
            var n1 = vector2d.sum(this.parents[0].getLoc(), vector2d.times(time, this.parents[0].getVelocity()));
            var n2 = vector2d.sum(this.parents[1].getLoc(), vector2d.times(time, this.parents[1].getVelocity()));
            var v = vector2d.mag(coords2d.difference(n1, n2)) - this.getLength();
            var force = (this.getLength() - this.getRestingLength()) * this.hookeanConstant;
            var dampingForce = this.dampingConstant * v;
            return dampingForce + force;
        };
        return dampenedHookeanLinkage;
    })(hookeanLinkage);
    physJS.dampenedHookeanLinkage = dampenedHookeanLinkage;
    var idealizedPlanarGravity = (function () {
        function idealizedPlanarGravity(direction, gravitationalConstant) {
            this.direction = direction;
            this.gravitationalConstant = gravitationalConstant;
            this.children = [];
        }
        idealizedPlanarGravity.prototype.addChild = function (s) { this.children.push(s); };
        idealizedPlanarGravity.prototype.addChildList = function (s) { for (var i = 0; i < s.length; i++)
            this.children.push(s[i]); };
        idealizedPlanarGravity.prototype.step = function (time) {
            for (var i = 0; i < this.children.length; i++)
                this.children[i].accelerate(vector2d.times(this.children[i].getMass() * this.gravitationalConstant, this.direction), time);
        };
        return idealizedPlanarGravity;
    })();
    physJS.idealizedPlanarGravity = idealizedPlanarGravity;
    var bouncyPlane = (function () {
        function bouncyPlane(parents) {
            this.parents = parents;
        }
        bouncyPlane.prototype.draw = function (out) {
            drawer.line([this.parents[0].getLoc(), this.parents[1].getLoc()], 2, 'black');
        };
        return bouncyPlane;
    })();
    physJS.bouncyPlane = bouncyPlane;
})(physJS || (physJS = {}));
var drawer = new physJS.SVGDrawer(document.getElementById('target'));
var a = new physJS.simplePoint(new physJS.coords2d(100, 100));
var b = new physJS.simplePoint(new physJS.coords2d(500, 500));
var c = new physJS.weightedPoint(new physJS.coords2d(450, 100), new physJS.vector2d(100, 0), 1);
var l1 = new physJS.dampenedHookeanLinkage([a, c], 0.5, 10, 1);
var l2 = new physJS.dampenedHookeanLinkage([b, c], 0.5, 10, 1);
var g = new physJS.idealizedPlanarGravity(physJS.vector2d.norm(new physJS.vector2d(0, 10)), 10);
g.addChildList([c]);
var p = new physJS.bouncyPlane([
    new physJS.simplePoint(new physJS.coords2d(10, 400)),
    new physJS.simplePoint(new physJS.coords2d(500, 600))
]);
var cont = new physJS.controller();
cont.addStepperList([c, g, l1, l2]);
cont.addDrawerList([a, b, c, l1, l2]);
/*cont.addStepperList([b,c,l2]);
cont.addDrawerList([b,c,l2]);*/
var superstep = function () {
    drawer.clear();
    cont.step(1 / 50);
    cont.draw(drawer);
    window.setTimeout(function () { window.requestAnimationFrame(superstep); }, 1000 / 50);
};
document.getElementById('target').addEventListener('mousemove', function (e) {
    a.move(new physJS.coords2d(e.offsetX, e.offsetY));
});
superstep();

module physJS {
    interface drawer {
        circle(center:coords2d,radius:number,colour:string):void;
        line(endpoints:coords2d[],weight:number,colour:string);
        clear():void;
    }

    interface drawable {
        draw(out:drawer):void;
    }

    interface steppable {
        step(time:number):void;
    }

    interface physObj {
        accelerate(force:vector2d,time:number):void;
        getLoc():coords2d;
        getVelocity():vector2d;
        getMass():number;
    }

    export class vector2d {
        constructor(public x:number,public y:number) {}
        public static sum(a:vector2d,b:vector2d):vector2d {return new vector2d(a.x+b.x,a.y+b.y);}
        public static times(m:number,v:vector2d):vector2d {return new vector2d(v.x*m,v.y*m);}
        public static div(v:vector2d,d:number):vector2d {return new vector2d(v.x/d,v.y/d);}
        public static mag(v:vector2d) { return Math.sqrt(v.x * v.x + v.y * v.y); }
        public static norm(v:vector2d) {
            var mag = vector2d.mag(v);
            var div = (mag === 0) ? Infinity : 1.0 / mag;
            return vector2d.times(div, v);
        }
    }

    export class coords2d extends vector2d {
        public static difference(a:coords2d,b:coords2d):vector2d {
            return new vector2d(b.x-a.x,b.y-a.y);
        }
    }

    export class SVGDrawer implements drawer {
        constructor(private target:HTMLElement) {}

        clear() {
            while(this.target.firstChild) this.target.removeChild(this.target.firstChild);
        }

        circle(center:coords2d,radius:number,colour:string):void {
            var elm = document.createElementNS('http://www.w3.org/2000/svg','circle');
            elm.setAttributeNS(null, 'cx', center.x.toString());
            elm.setAttributeNS(null, 'cy', center.y.toString());
            elm.setAttributeNS(null, 'r', radius.toString());
            elm.setAttributeNS(null, 'stroke-width', '0');
            elm.setAttributeNS(null, 'fill', colour);
            this.target.appendChild(elm);
        }

        line(endpoints:coords2d[],weight:number,colour:string):void {
            var elm = document.createElementNS('http://www.w3.org/2000/svg','line');
            elm.setAttributeNS(null, 'x1', endpoints[0].x.toString());
            elm.setAttributeNS(null, 'y1', endpoints[0].y.toString());
            elm.setAttributeNS(null, 'x2', endpoints[1].x.toString());
            elm.setAttributeNS(null, 'y2', endpoints[1].y.toString());
            elm.setAttributeNS(null, 'stroke-width', weight.toString());
            elm.setAttributeNS(null, 'stroke', colour);
            this.target.appendChild(elm);
        }
    }

    export class pointObj implements drawable,physObj {
        getLoc():coords2d {
            return new coords2d(0,0);
        }

        draw(out:drawer):void {
            out.circle(this.getLoc(),5,'black');
        }

        accelerate(force:vector2d,time:number) {}
        getVelocity():vector2d {return new vector2d(0,0);}
        getMass() {return 0;}
        getRadius() {return 5;};
    }

    export class simplePoint extends pointObj {
        constructor(private loc:coords2d) {
            super();
        }

        getLoc() {
            return this.loc;
        }

        move(loc:coords2d) {
            this.loc = loc;
        }
    }

    export class movingPoint extends pointObj implements steppable {
        constructor(private loc:coords2d,public velocity:vector2d) {
            super();
        }

        step(time:number) {
            this.loc = vector2d.sum(this.loc,vector2d.times(time,this.velocity));
        }

        getLoc():coords2d {
            return this.loc;
        }

        getVelocity():vector2d {return this.velocity;}
    }

    export class weightedPoint extends movingPoint implements physObj {
        constructor(loc:coords2d,velocity:vector2d,private mass:number) {
            super(loc,velocity);
        }

        accelerate(force:vector2d,time:number) {
            this.velocity = vector2d.sum(this.velocity,physJS.vector2d.div(force,this.mass));
        }

        getMass() {
            return this.mass;
        }
    }

    export class controller implements steppable,drawable {
        private steppers:steppable[] = [];
        private drawers:drawable[] = [];

        step(time:number) {
            for(var i = 0;i < this.steppers.length;i++) this.steppers[i].step(time);
        }

        draw(out:drawer) {
            for(var i = 0;i < this.drawers.length;i++) this.drawers[i].draw(out);
        }

        addStepper(s:steppable) {this.steppers.push(s);}
        addDrawer(d:drawable)   {this.drawers.push(d);}

        addStepperList(s:steppable[]) {for(var i = 0;i < s.length;i++) this.steppers.push(s[i]);}
        addDrawerList(d:drawable[])   {for(var i = 0;i < d.length;i++) this.drawers.push(d[i]);}
    }

    export class lineObj implements drawable {
        getEndpoints():coords2d[] {
            return [new coords2d(0,0),new coords2d(0,0)];
        }

        getLength():number {
            return 0;
        }

        draw(out:drawer) {
            out.line(this.getEndpoints(),2,'black');
        }
    }

    export class pointToPointLine extends lineObj {
        constructor(public parents:physObj[]) {
            super();
        }

        getLength():number {
            return vector2d.mag(coords2d.difference(this.parents[0].getLoc(),this.parents[1].getLoc()));
        }

        getEndpoints():coords2d[] {
            return [this.parents[0].getLoc(),this.parents[1].getLoc()];
        }
    }

    export class hookeanLinkage extends pointToPointLine implements steppable {
        constructor(parents:physObj[],public hookeanConstant:number,private restingLength:number) {
            super(parents);
        }

        getRestingLength() {
            return this.restingLength;
        }

        force(time:number) {
            return (this.getLength()-this.getRestingLength())*this.hookeanConstant;
        }

        step(time:number) {
            for(var i = 0;i < 2;i++) {
                this.parents[i].accelerate(vector2d.times(this.force(time),vector2d.norm(coords2d.difference(this.parents[i].getLoc(),this.parents[1-i].getLoc()))),time);
            }
        }
    }

    export class dampenedHookeanLinkage extends hookeanLinkage {
        constructor(parents:physObj[],hookeanConstant:number,restingLength:number,private dampingConstant:number) {
            super(parents,hookeanConstant,restingLength);
        }

        step(time:number) {
            super.step(time);
        }

        force(time:number) {
            var n1 = vector2d.sum(this.parents[0].getLoc(),vector2d.times(time,this.parents[0].getVelocity()));
            var n2 = vector2d.sum(this.parents[1].getLoc(),vector2d.times(time,this.parents[1].getVelocity()));
            var v = vector2d.mag(coords2d.difference(n1,n2))-this.getLength();
            var force = (this.getLength()-this.getRestingLength())*this.hookeanConstant;
            var dampingForce = this.dampingConstant*v;
            return dampingForce+force;
        }
    }

    export class idealizedPlanarGravity implements steppable {
        private children:physObj[] = [];

        constructor(public direction:vector2d,public gravitationalConstant:number) {}

        addChild(s:physObj) {this.children.push(s);}

        addChildList(s:physObj[]) {for(var i = 0;i < s.length;i++) this.children.push(s[i]);}

        step(time:number) {
            for(var i = 0;i < this.children.length;i++) this.children[i].accelerate(vector2d.times(this.children[i].getMass()*this.gravitationalConstant,this.direction),time);
        }
    }

    export class bouncyPlane implements drawable {
        constructor(private parents:pointObj[]) {}

        draw(out:drawer) {
            out.line([this.parents[0].getLoc(),this.parents[1].getLoc()],2,'black');
        }
    }
}

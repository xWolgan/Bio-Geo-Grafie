var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
var __accessCheck = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var __privateGet = (obj, member, getter) => {
  __accessCheck(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var __privateAdd = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var __privateMethod = (obj, member, method) => {
  __accessCheck(obj, member, "access private method");
  return method;
};

// node_modules/earcut/src/earcut.js
var require_earcut = __commonJS({
  "node_modules/earcut/src/earcut.js"(exports, module) {
    "use strict";
    module.exports = earcut2;
    module.exports.default = earcut2;
    function earcut2(data, holeIndices, dim) {
      dim = dim || 2;
      var hasHoles = holeIndices && holeIndices.length, outerLen = hasHoles ? holeIndices[0] * dim : data.length, outerNode = linkedList(data, 0, outerLen, dim, true), triangles = [];
      if (!outerNode || outerNode.next === outerNode.prev)
        return triangles;
      var minX, minY, maxX, maxY, x, y, invSize;
      if (hasHoles)
        outerNode = eliminateHoles(data, holeIndices, outerNode, dim);
      if (data.length > 80 * dim) {
        minX = maxX = data[0];
        minY = maxY = data[1];
        for (var i = dim; i < outerLen; i += dim) {
          x = data[i];
          y = data[i + 1];
          if (x < minX)
            minX = x;
          if (y < minY)
            minY = y;
          if (x > maxX)
            maxX = x;
          if (y > maxY)
            maxY = y;
        }
        invSize = Math.max(maxX - minX, maxY - minY);
        invSize = invSize !== 0 ? 32767 / invSize : 0;
      }
      earcutLinked(outerNode, triangles, dim, minX, minY, invSize, 0);
      return triangles;
    }
    function linkedList(data, start, end, dim, clockwise) {
      var i, last;
      if (clockwise === signedArea(data, start, end, dim) > 0) {
        for (i = start; i < end; i += dim)
          last = insertNode(i, data[i], data[i + 1], last);
      } else {
        for (i = end - dim; i >= start; i -= dim)
          last = insertNode(i, data[i], data[i + 1], last);
      }
      if (last && equals5(last, last.next)) {
        removeNode(last);
        last = last.next;
      }
      return last;
    }
    function filterPoints(start, end) {
      if (!start)
        return start;
      if (!end)
        end = start;
      var p = start, again;
      do {
        again = false;
        if (!p.steiner && (equals5(p, p.next) || area(p.prev, p, p.next) === 0)) {
          removeNode(p);
          p = end = p.prev;
          if (p === p.next)
            break;
          again = true;
        } else {
          p = p.next;
        }
      } while (again || p !== end);
      return end;
    }
    function earcutLinked(ear, triangles, dim, minX, minY, invSize, pass) {
      if (!ear)
        return;
      if (!pass && invSize)
        indexCurve(ear, minX, minY, invSize);
      var stop = ear, prev, next;
      while (ear.prev !== ear.next) {
        prev = ear.prev;
        next = ear.next;
        if (invSize ? isEarHashed(ear, minX, minY, invSize) : isEar(ear)) {
          triangles.push(prev.i / dim | 0);
          triangles.push(ear.i / dim | 0);
          triangles.push(next.i / dim | 0);
          removeNode(ear);
          ear = next.next;
          stop = next.next;
          continue;
        }
        ear = next;
        if (ear === stop) {
          if (!pass) {
            earcutLinked(filterPoints(ear), triangles, dim, minX, minY, invSize, 1);
          } else if (pass === 1) {
            ear = cureLocalIntersections(filterPoints(ear), triangles, dim);
            earcutLinked(ear, triangles, dim, minX, minY, invSize, 2);
          } else if (pass === 2) {
            splitEarcut(ear, triangles, dim, minX, minY, invSize);
          }
          break;
        }
      }
    }
    function isEar(ear) {
      var a = ear.prev, b = ear, c = ear.next;
      if (area(a, b, c) >= 0)
        return false;
      var ax = a.x, bx = b.x, cx = c.x, ay = a.y, by = b.y, cy = c.y;
      var x0 = ax < bx ? ax < cx ? ax : cx : bx < cx ? bx : cx, y0 = ay < by ? ay < cy ? ay : cy : by < cy ? by : cy, x1 = ax > bx ? ax > cx ? ax : cx : bx > cx ? bx : cx, y1 = ay > by ? ay > cy ? ay : cy : by > cy ? by : cy;
      var p = c.next;
      while (p !== a) {
        if (p.x >= x0 && p.x <= x1 && p.y >= y0 && p.y <= y1 && pointInTriangle(ax, ay, bx, by, cx, cy, p.x, p.y) && area(p.prev, p, p.next) >= 0)
          return false;
        p = p.next;
      }
      return true;
    }
    function isEarHashed(ear, minX, minY, invSize) {
      var a = ear.prev, b = ear, c = ear.next;
      if (area(a, b, c) >= 0)
        return false;
      var ax = a.x, bx = b.x, cx = c.x, ay = a.y, by = b.y, cy = c.y;
      var x0 = ax < bx ? ax < cx ? ax : cx : bx < cx ? bx : cx, y0 = ay < by ? ay < cy ? ay : cy : by < cy ? by : cy, x1 = ax > bx ? ax > cx ? ax : cx : bx > cx ? bx : cx, y1 = ay > by ? ay > cy ? ay : cy : by > cy ? by : cy;
      var minZ = zOrder(x0, y0, minX, minY, invSize), maxZ = zOrder(x1, y1, minX, minY, invSize);
      var p = ear.prevZ, n = ear.nextZ;
      while (p && p.z >= minZ && n && n.z <= maxZ) {
        if (p.x >= x0 && p.x <= x1 && p.y >= y0 && p.y <= y1 && p !== a && p !== c && pointInTriangle(ax, ay, bx, by, cx, cy, p.x, p.y) && area(p.prev, p, p.next) >= 0)
          return false;
        p = p.prevZ;
        if (n.x >= x0 && n.x <= x1 && n.y >= y0 && n.y <= y1 && n !== a && n !== c && pointInTriangle(ax, ay, bx, by, cx, cy, n.x, n.y) && area(n.prev, n, n.next) >= 0)
          return false;
        n = n.nextZ;
      }
      while (p && p.z >= minZ) {
        if (p.x >= x0 && p.x <= x1 && p.y >= y0 && p.y <= y1 && p !== a && p !== c && pointInTriangle(ax, ay, bx, by, cx, cy, p.x, p.y) && area(p.prev, p, p.next) >= 0)
          return false;
        p = p.prevZ;
      }
      while (n && n.z <= maxZ) {
        if (n.x >= x0 && n.x <= x1 && n.y >= y0 && n.y <= y1 && n !== a && n !== c && pointInTriangle(ax, ay, bx, by, cx, cy, n.x, n.y) && area(n.prev, n, n.next) >= 0)
          return false;
        n = n.nextZ;
      }
      return true;
    }
    function cureLocalIntersections(start, triangles, dim) {
      var p = start;
      do {
        var a = p.prev, b = p.next.next;
        if (!equals5(a, b) && intersects(a, p, p.next, b) && locallyInside(a, b) && locallyInside(b, a)) {
          triangles.push(a.i / dim | 0);
          triangles.push(p.i / dim | 0);
          triangles.push(b.i / dim | 0);
          removeNode(p);
          removeNode(p.next);
          p = start = b;
        }
        p = p.next;
      } while (p !== start);
      return filterPoints(p);
    }
    function splitEarcut(start, triangles, dim, minX, minY, invSize) {
      var a = start;
      do {
        var b = a.next.next;
        while (b !== a.prev) {
          if (a.i !== b.i && isValidDiagonal(a, b)) {
            var c = splitPolygon(a, b);
            a = filterPoints(a, a.next);
            c = filterPoints(c, c.next);
            earcutLinked(a, triangles, dim, minX, minY, invSize, 0);
            earcutLinked(c, triangles, dim, minX, minY, invSize, 0);
            return;
          }
          b = b.next;
        }
        a = a.next;
      } while (a !== start);
    }
    function eliminateHoles(data, holeIndices, outerNode, dim) {
      var queue = [], i, len4, start, end, list;
      for (i = 0, len4 = holeIndices.length; i < len4; i++) {
        start = holeIndices[i] * dim;
        end = i < len4 - 1 ? holeIndices[i + 1] * dim : data.length;
        list = linkedList(data, start, end, dim, false);
        if (list === list.next)
          list.steiner = true;
        queue.push(getLeftmost(list));
      }
      queue.sort(compareX);
      for (i = 0; i < queue.length; i++) {
        outerNode = eliminateHole(queue[i], outerNode);
      }
      return outerNode;
    }
    function compareX(a, b) {
      return a.x - b.x;
    }
    function eliminateHole(hole, outerNode) {
      var bridge = findHoleBridge(hole, outerNode);
      if (!bridge) {
        return outerNode;
      }
      var bridgeReverse = splitPolygon(bridge, hole);
      filterPoints(bridgeReverse, bridgeReverse.next);
      return filterPoints(bridge, bridge.next);
    }
    function findHoleBridge(hole, outerNode) {
      var p = outerNode, hx = hole.x, hy = hole.y, qx = -Infinity, m;
      do {
        if (hy <= p.y && hy >= p.next.y && p.next.y !== p.y) {
          var x = p.x + (hy - p.y) * (p.next.x - p.x) / (p.next.y - p.y);
          if (x <= hx && x > qx) {
            qx = x;
            m = p.x < p.next.x ? p : p.next;
            if (x === hx)
              return m;
          }
        }
        p = p.next;
      } while (p !== outerNode);
      if (!m)
        return null;
      var stop = m, mx = m.x, my = m.y, tanMin = Infinity, tan;
      p = m;
      do {
        if (hx >= p.x && p.x >= mx && hx !== p.x && pointInTriangle(hy < my ? hx : qx, hy, mx, my, hy < my ? qx : hx, hy, p.x, p.y)) {
          tan = Math.abs(hy - p.y) / (hx - p.x);
          if (locallyInside(p, hole) && (tan < tanMin || tan === tanMin && (p.x > m.x || p.x === m.x && sectorContainsSector(m, p)))) {
            m = p;
            tanMin = tan;
          }
        }
        p = p.next;
      } while (p !== stop);
      return m;
    }
    function sectorContainsSector(m, p) {
      return area(m.prev, m, p.prev) < 0 && area(p.next, m, m.next) < 0;
    }
    function indexCurve(start, minX, minY, invSize) {
      var p = start;
      do {
        if (p.z === 0)
          p.z = zOrder(p.x, p.y, minX, minY, invSize);
        p.prevZ = p.prev;
        p.nextZ = p.next;
        p = p.next;
      } while (p !== start);
      p.prevZ.nextZ = null;
      p.prevZ = null;
      sortLinked(p);
    }
    function sortLinked(list) {
      var i, p, q, e, tail, numMerges, pSize, qSize, inSize = 1;
      do {
        p = list;
        list = null;
        tail = null;
        numMerges = 0;
        while (p) {
          numMerges++;
          q = p;
          pSize = 0;
          for (i = 0; i < inSize; i++) {
            pSize++;
            q = q.nextZ;
            if (!q)
              break;
          }
          qSize = inSize;
          while (pSize > 0 || qSize > 0 && q) {
            if (pSize !== 0 && (qSize === 0 || !q || p.z <= q.z)) {
              e = p;
              p = p.nextZ;
              pSize--;
            } else {
              e = q;
              q = q.nextZ;
              qSize--;
            }
            if (tail)
              tail.nextZ = e;
            else
              list = e;
            e.prevZ = tail;
            tail = e;
          }
          p = q;
        }
        tail.nextZ = null;
        inSize *= 2;
      } while (numMerges > 1);
      return list;
    }
    function zOrder(x, y, minX, minY, invSize) {
      x = (x - minX) * invSize | 0;
      y = (y - minY) * invSize | 0;
      x = (x | x << 8) & 16711935;
      x = (x | x << 4) & 252645135;
      x = (x | x << 2) & 858993459;
      x = (x | x << 1) & 1431655765;
      y = (y | y << 8) & 16711935;
      y = (y | y << 4) & 252645135;
      y = (y | y << 2) & 858993459;
      y = (y | y << 1) & 1431655765;
      return x | y << 1;
    }
    function getLeftmost(start) {
      var p = start, leftmost = start;
      do {
        if (p.x < leftmost.x || p.x === leftmost.x && p.y < leftmost.y)
          leftmost = p;
        p = p.next;
      } while (p !== start);
      return leftmost;
    }
    function pointInTriangle(ax, ay, bx, by, cx, cy, px, py) {
      return (cx - px) * (ay - py) >= (ax - px) * (cy - py) && (ax - px) * (by - py) >= (bx - px) * (ay - py) && (bx - px) * (cy - py) >= (cx - px) * (by - py);
    }
    function isValidDiagonal(a, b) {
      return a.next.i !== b.i && a.prev.i !== b.i && !intersectsPolygon(a, b) && // dones't intersect other edges
      (locallyInside(a, b) && locallyInside(b, a) && middleInside(a, b) && // locally visible
      (area(a.prev, a, b.prev) || area(a, b.prev, b)) || // does not create opposite-facing sectors
      equals5(a, b) && area(a.prev, a, a.next) > 0 && area(b.prev, b, b.next) > 0);
    }
    function area(p, q, r) {
      return (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
    }
    function equals5(p1, p2) {
      return p1.x === p2.x && p1.y === p2.y;
    }
    function intersects(p1, q1, p2, q2) {
      var o1 = sign(area(p1, q1, p2));
      var o2 = sign(area(p1, q1, q2));
      var o3 = sign(area(p2, q2, p1));
      var o4 = sign(area(p2, q2, q1));
      if (o1 !== o2 && o3 !== o4)
        return true;
      if (o1 === 0 && onSegment(p1, p2, q1))
        return true;
      if (o2 === 0 && onSegment(p1, q2, q1))
        return true;
      if (o3 === 0 && onSegment(p2, p1, q2))
        return true;
      if (o4 === 0 && onSegment(p2, q1, q2))
        return true;
      return false;
    }
    function onSegment(p, q, r) {
      return q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) && q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y);
    }
    function sign(num) {
      return num > 0 ? 1 : num < 0 ? -1 : 0;
    }
    function intersectsPolygon(a, b) {
      var p = a;
      do {
        if (p.i !== a.i && p.next.i !== a.i && p.i !== b.i && p.next.i !== b.i && intersects(p, p.next, a, b))
          return true;
        p = p.next;
      } while (p !== a);
      return false;
    }
    function locallyInside(a, b) {
      return area(a.prev, a, a.next) < 0 ? area(a, b, a.next) >= 0 && area(a, a.prev, b) >= 0 : area(a, b, a.prev) < 0 || area(a, a.next, b) < 0;
    }
    function middleInside(a, b) {
      var p = a, inside = false, px = (a.x + b.x) / 2, py = (a.y + b.y) / 2;
      do {
        if (p.y > py !== p.next.y > py && p.next.y !== p.y && px < (p.next.x - p.x) * (py - p.y) / (p.next.y - p.y) + p.x)
          inside = !inside;
        p = p.next;
      } while (p !== a);
      return inside;
    }
    function splitPolygon(a, b) {
      var a2 = new Node(a.i, a.x, a.y), b2 = new Node(b.i, b.x, b.y), an = a.next, bp = b.prev;
      a.next = b;
      b.prev = a;
      a2.next = an;
      an.prev = a2;
      b2.next = a2;
      a2.prev = b2;
      bp.next = b2;
      b2.prev = bp;
      return b2;
    }
    function insertNode(i, x, y, last) {
      var p = new Node(i, x, y);
      if (!last) {
        p.prev = p;
        p.next = p;
      } else {
        p.next = last.next;
        p.prev = last;
        last.next.prev = p;
        last.next = p;
      }
      return p;
    }
    function removeNode(p) {
      p.next.prev = p.prev;
      p.prev.next = p.next;
      if (p.prevZ)
        p.prevZ.nextZ = p.nextZ;
      if (p.nextZ)
        p.nextZ.prevZ = p.prevZ;
    }
    function Node(i, x, y) {
      this.i = i;
      this.x = x;
      this.y = y;
      this.prev = null;
      this.next = null;
      this.z = 0;
      this.prevZ = null;
      this.nextZ = null;
      this.steiner = false;
    }
    earcut2.deviation = function(data, holeIndices, dim, triangles) {
      var hasHoles = holeIndices && holeIndices.length;
      var outerLen = hasHoles ? holeIndices[0] * dim : data.length;
      var polygonArea = Math.abs(signedArea(data, 0, outerLen, dim));
      if (hasHoles) {
        for (var i = 0, len4 = holeIndices.length; i < len4; i++) {
          var start = holeIndices[i] * dim;
          var end = i < len4 - 1 ? holeIndices[i + 1] * dim : data.length;
          polygonArea -= Math.abs(signedArea(data, start, end, dim));
        }
      }
      var trianglesArea = 0;
      for (i = 0; i < triangles.length; i += 3) {
        var a = triangles[i] * dim;
        var b = triangles[i + 1] * dim;
        var c = triangles[i + 2] * dim;
        trianglesArea += Math.abs(
          (data[a] - data[c]) * (data[b + 1] - data[a + 1]) - (data[a] - data[b]) * (data[c + 1] - data[a + 1])
        );
      }
      return polygonArea === 0 && trianglesArea === 0 ? 0 : Math.abs((trianglesArea - polygonArea) / polygonArea);
    };
    function signedArea(data, start, end, dim) {
      var sum = 0;
      for (var i = start, j = end - dim; i < end; i += dim) {
        sum += (data[j] - data[i]) * (data[i + 1] + data[j + 1]);
        j = i;
      }
      return sum;
    }
    earcut2.flatten = function(data) {
      var dim = data[0][0].length, result = { vertices: [], holes: [], dimensions: dim }, holeIndex = 0;
      for (var i = 0; i < data.length; i++) {
        for (var j = 0; j < data[i].length; j++) {
          for (var d = 0; d < dim; d++)
            result.vertices.push(data[i][j][d]);
        }
        if (i > 0) {
          holeIndex += data[i - 1].length;
          result.holes.push(holeIndex);
        }
      }
      return result;
    };
  }
});

// node_modules/@wonderlandengine/components/dist/8thwall-camera.js
import { Component } from "@wonderlandengine/api";
import { property } from "@wonderlandengine/api/decorators.js";
var __decorate = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
    r = Reflect.decorate(decorators, target, key, desc);
  else
    for (var i = decorators.length - 1; i >= 0; i--)
      if (d = decorators[i])
        r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ARCamera8thwall = class extends Component {
  deprecated;
};
__publicField(ARCamera8thwall, "TypeName", "8thwall-camera");
__decorate([
  property.bool(true)
], ARCamera8thwall.prototype, "deprecated", void 0);

// node_modules/@wonderlandengine/components/dist/anchor.js
import { Component as Component2, Emitter } from "@wonderlandengine/api";
import { property as property2 } from "@wonderlandengine/api/decorators.js";

// node_modules/@wonderlandengine/components/dist/utils/webxr.js
var tempVec = new Float32Array(3);
var tempQuat = new Float32Array(4);
function setXRRigidTransformLocal(o, transform) {
  const r = transform.orientation;
  tempQuat[0] = r.x;
  tempQuat[1] = r.y;
  tempQuat[2] = r.z;
  tempQuat[3] = r.w;
  const t = transform.position;
  tempVec[0] = t.x;
  tempVec[1] = t.y;
  tempVec[2] = t.z;
  o.resetPositionRotation();
  o.setRotationLocal(tempQuat);
  o.translateLocal(tempVec);
}

// node_modules/@wonderlandengine/components/dist/anchor.js
var __decorate2 = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
    r = Reflect.decorate(decorators, target, key, desc);
  else
    for (var i = decorators.length - 1; i >= 0; i--)
      if (d = decorators[i])
        r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var tempVec3 = new Float32Array(3);
var tempQuat2 = new Float32Array(4);
var _anchors, _addAnchor, addAnchor_fn, _removeAnchor, removeAnchor_fn, _getFrame, getFrame_fn, _createAnchor, createAnchor_fn, _onAddAnchor, onAddAnchor_fn, _onRestoreAnchor, onRestoreAnchor_fn, _onCreate, onCreate_fn;
var _Anchor = class extends Component2 {
  constructor() {
    super(...arguments);
    __privateAdd(this, _getFrame);
    __privateAdd(this, _createAnchor);
    __privateAdd(this, _onAddAnchor);
    __privateAdd(this, _onRestoreAnchor);
    __privateAdd(this, _onCreate);
    __publicField(this, "persist", false);
    /** Unique identifier to load a persistent anchor from, or empty/null if unknown */
    __publicField(this, "uuid", null);
    /** The xrAnchor, if created */
    __publicField(this, "xrAnchor", null);
    /** Emits events when the anchor is created either by being restored or newly created */
    __publicField(this, "onCreate", new Emitter());
    /** Whether the anchor is currently being tracked */
    __publicField(this, "visible", false);
    /** Emits an event when this anchor starts tracking */
    __publicField(this, "onTrackingFound", new Emitter());
    /** Emits an event when this anchor stops tracking */
    __publicField(this, "onTrackingLost", new Emitter());
    /** XRFrame to use for creating the anchor */
    __publicField(this, "xrFrame", null);
    /** XRHitTestResult to use for creating the anchor */
    __publicField(this, "xrHitResult", null);
  }
  /** Retrieve all anchors of the current scene */
  static getAllAnchors() {
    return __privateGet(_Anchor, _anchors);
  }
  /**
   * Create a new anchor
   *
   * @param o Object to attach the component to
   * @param params Parameters for the anchor component
   * @param frame XRFrame to use for anchor cration, if null, will use the current frame if available
   * @param hitResult Optional hit-test result to create the anchor with
   * @returns Promise for the newly created anchor component
   */
  static create(o, params, frame, hitResult) {
    const a = o.addComponent(_Anchor, { ...params, active: false });
    if (a === null)
      return null;
    a.xrHitResult = hitResult ?? null;
    a.xrFrame = frame ?? null;
    a.onCreate.once(() => (a.xrFrame = null, a.xrHitResult = null));
    a.active = true;
    return a.onCreate.promise();
  }
  start() {
    if (this.uuid && this.engine.xr) {
      this.persist = true;
      if (this.engine.xr.session.restorePersistentAnchor === void 0) {
        console.warn("anchor: Persistent anchors are not supported by your client. Ignoring persist property.");
      }
      this.engine.xr.session.restorePersistentAnchor(this.uuid).then(__privateMethod(this, _onRestoreAnchor, onRestoreAnchor_fn).bind(this));
    } else if (__privateMethod(this, _getFrame, getFrame_fn).call(this)) {
      __privateMethod(this, _createAnchor, createAnchor_fn).call(this).then(__privateMethod(this, _onAddAnchor, onAddAnchor_fn).bind(this));
    } else {
      throw new Error("Anchors can only be created during the XR frame in an active XR session");
    }
  }
  update() {
    if (!this.xrAnchor || !this.engine.xr)
      return;
    const pose = this.engine.xr.frame.getPose(this.xrAnchor.anchorSpace, this.engine.xr.currentReferenceSpace);
    const visible = !!pose;
    if (visible != this.visible) {
      this.visible = visible;
      (visible ? this.onTrackingFound : this.onTrackingLost).notify(this);
    }
    if (pose) {
      setXRRigidTransformLocal(this.object, pose.transform);
    }
  }
  onDestroy() {
    var _a;
    __privateMethod(_a = _Anchor, _removeAnchor, removeAnchor_fn).call(_a, this);
  }
};
var Anchor = _Anchor;
_anchors = new WeakMap();
_addAnchor = new WeakSet();
addAnchor_fn = function(anchor) {
  __privateGet(_Anchor, _anchors).push(anchor);
};
_removeAnchor = new WeakSet();
removeAnchor_fn = function(anchor) {
  const index = __privateGet(_Anchor, _anchors).indexOf(anchor);
  if (index < 0)
    return;
  __privateGet(_Anchor, _anchors).splice(index, 1);
};
_getFrame = new WeakSet();
getFrame_fn = function() {
  return this.xrFrame || this.engine.xr.frame;
};
_createAnchor = new WeakSet();
createAnchor_fn = async function() {
  if (!__privateMethod(this, _getFrame, getFrame_fn).call(this).createAnchor) {
    throw new Error("Cannot create anchor - anchors not supported, did you enable the 'anchors' WebXR feature?");
  }
  if (this.xrHitResult) {
    if (this.xrHitResult.createAnchor === void 0) {
      throw new Error("Requested anchor on XRHitTestResult, but WebXR hit-test feature is not available.");
    }
    return this.xrHitResult.createAnchor();
  } else {
    this.object.getTranslationWorld(tempVec3);
    tempQuat2.set(this.object.rotationWorld);
    const rotation = tempQuat2;
    const anchorPose = new XRRigidTransform({ x: tempVec3[0], y: tempVec3[1], z: tempVec3[2] }, { x: rotation[0], y: rotation[1], z: rotation[2], w: rotation[3] });
    return __privateMethod(this, _getFrame, getFrame_fn).call(this)?.createAnchor(anchorPose, this.engine.xr.currentReferenceSpace);
  }
};
_onAddAnchor = new WeakSet();
onAddAnchor_fn = function(anchor) {
  if (!anchor)
    return;
  if (this.persist) {
    if (anchor.requestPersistentHandle !== void 0) {
      anchor.requestPersistentHandle().then((uuid) => {
        var _a;
        this.uuid = uuid;
        __privateMethod(this, _onCreate, onCreate_fn).call(this, anchor);
        __privateMethod(_a = _Anchor, _addAnchor, addAnchor_fn).call(_a, this);
      });
      return;
    } else {
      console.warn("anchor: Persistent anchors are not supported by your client. Ignoring persist property.");
    }
  }
  __privateMethod(this, _onCreate, onCreate_fn).call(this, anchor);
};
_onRestoreAnchor = new WeakSet();
onRestoreAnchor_fn = function(anchor) {
  __privateMethod(this, _onCreate, onCreate_fn).call(this, anchor);
};
_onCreate = new WeakSet();
onCreate_fn = function(anchor) {
  this.xrAnchor = anchor;
  this.onCreate.notify(this);
};
__privateAdd(Anchor, _addAnchor);
__privateAdd(Anchor, _removeAnchor);
__publicField(Anchor, "TypeName", "anchor");
/* Static management of all anchors */
__privateAdd(Anchor, _anchors, []);
__decorate2([
  property2.bool(false)
], Anchor.prototype, "persist", void 0);
__decorate2([
  property2.string()
], Anchor.prototype, "uuid", void 0);

// node_modules/@wonderlandengine/components/dist/cursor-target.js
import { Component as Component3, Emitter as Emitter2 } from "@wonderlandengine/api";
var CursorTarget = class extends Component3 {
  /** Emitter for events when the target is hovered */
  onHover = new Emitter2();
  /** Emitter for events when the target is unhovered */
  onUnhover = new Emitter2();
  /** Emitter for events when the target is clicked */
  onClick = new Emitter2();
  /** Emitter for events when the cursor moves on the target */
  onMove = new Emitter2();
  /** Emitter for events when the user pressed the select button on the target */
  onDown = new Emitter2();
  /** Emitter for events when the user unpressed the select button on the target */
  onUp = new Emitter2();
  /**
   * @deprecated Use the emitter instead.
   *
   * @example
   *    this.onHover.add(f);
   */
  addHoverFunction(f) {
    this.onHover.add(f);
  }
  /**
   * @deprecated Use the emitter instead.
   *
   * @example
   *    this.onHover.remove(f);
   */
  removeHoverFunction(f) {
    this.onHover.remove(f);
  }
  /**
   * @deprecated Use the emitter instead.
   *
   * @example
   *    this.onUnhover.add(f);
   */
  addUnHoverFunction(f) {
    this.onUnhover.add(f);
  }
  /**
   * @deprecated Use the emitter instead.
   *
   * @example
   *    this.onUnhover.remove(f);
   */
  removeUnHoverFunction(f) {
    this.onUnhover.remove(f);
  }
  /**
   * @deprecated Use the emitter instead.
   *
   * @example
   *    this.onClick.add(f);
   */
  addClickFunction(f) {
    this.onClick.add(f);
  }
  /**
   * @deprecated Use the emitter instead.
   *
   * @example
   *    component.onClick.remove(f);
   */
  removeClickFunction(f) {
    this.onClick.remove(f);
  }
  /**
   * @deprecated Use the emitter instead.
   *
   * @example
   *    component.onMove.add(f);
   */
  addMoveFunction(f) {
    this.onMove.add(f);
  }
  /**
   * @deprecated Use the emitter instead.
   *
   * @example
   *    component.onMove.remove(f);
   */
  removeMoveFunction(f) {
    this.onMove.remove(f);
  }
  /**
   * @deprecated Use the emitter instead.
   *
   * @example
   *    component.onDown.add(f);
   */
  addDownFunction(f) {
    this.onDown.add(f);
  }
  /**
   * @deprecated Use the emitter instead.
   *
   * @example
   *    component.onDown.remove(f);
   */
  removeDownFunction(f) {
    this.onDown.remove(f);
  }
  /**
   * @deprecated Use the emitter instead.
   *
   * @example
   *    component.onUp.add(f);
   */
  addUpFunction(f) {
    this.onUp.add(f);
  }
  /**
   * @deprecated Use the emitter instead.
   *
   * @example
   *    component.onUp.remove(f);
   */
  removeUpFunction(f) {
    this.onUp.remove(f);
  }
};
__publicField(CursorTarget, "TypeName", "cursor-target");
__publicField(CursorTarget, "Properties", {});

// node_modules/@wonderlandengine/components/dist/cursor.js
import { Component as Component5, InputComponent, ViewComponent, Emitter as Emitter4 } from "@wonderlandengine/api";
import { property as property4 } from "@wonderlandengine/api/decorators.js";

// node_modules/gl-matrix/esm/common.js
var EPSILON = 1e-6;
var ARRAY_TYPE = typeof Float32Array !== "undefined" ? Float32Array : Array;
var RANDOM = Math.random;
var ANGLE_ORDER = "zyx";
function round(a) {
  if (a >= 0)
    return Math.round(a);
  return a % 0.5 === 0 ? Math.floor(a) : Math.round(a);
}
var degree = Math.PI / 180;
var radian = 180 / Math.PI;

// node_modules/gl-matrix/esm/mat3.js
function create() {
  var out = new ARRAY_TYPE(9);
  if (ARRAY_TYPE != Float32Array) {
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[5] = 0;
    out[6] = 0;
    out[7] = 0;
  }
  out[0] = 1;
  out[4] = 1;
  out[8] = 1;
  return out;
}

// node_modules/gl-matrix/esm/mat4.js
var mat4_exports = {};
__export(mat4_exports, {
  add: () => add,
  adjoint: () => adjoint,
  clone: () => clone,
  copy: () => copy,
  create: () => create2,
  decompose: () => decompose,
  determinant: () => determinant,
  equals: () => equals,
  exactEquals: () => exactEquals,
  frob: () => frob,
  fromQuat: () => fromQuat,
  fromQuat2: () => fromQuat2,
  fromRotation: () => fromRotation,
  fromRotationTranslation: () => fromRotationTranslation,
  fromRotationTranslationScale: () => fromRotationTranslationScale,
  fromRotationTranslationScaleOrigin: () => fromRotationTranslationScaleOrigin,
  fromScaling: () => fromScaling,
  fromTranslation: () => fromTranslation,
  fromValues: () => fromValues,
  fromXRotation: () => fromXRotation,
  fromYRotation: () => fromYRotation,
  fromZRotation: () => fromZRotation,
  frustum: () => frustum,
  getRotation: () => getRotation,
  getScaling: () => getScaling,
  getTranslation: () => getTranslation,
  identity: () => identity,
  invert: () => invert,
  lookAt: () => lookAt,
  mul: () => mul,
  multiply: () => multiply,
  multiplyScalar: () => multiplyScalar,
  multiplyScalarAndAdd: () => multiplyScalarAndAdd,
  ortho: () => ortho,
  orthoNO: () => orthoNO,
  orthoZO: () => orthoZO,
  perspective: () => perspective,
  perspectiveFromFieldOfView: () => perspectiveFromFieldOfView,
  perspectiveNO: () => perspectiveNO,
  perspectiveZO: () => perspectiveZO,
  rotate: () => rotate,
  rotateX: () => rotateX,
  rotateY: () => rotateY,
  rotateZ: () => rotateZ,
  scale: () => scale,
  set: () => set,
  str: () => str,
  sub: () => sub,
  subtract: () => subtract,
  targetTo: () => targetTo,
  translate: () => translate,
  transpose: () => transpose
});
function create2() {
  var out = new ARRAY_TYPE(16);
  if (ARRAY_TYPE != Float32Array) {
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
  }
  out[0] = 1;
  out[5] = 1;
  out[10] = 1;
  out[15] = 1;
  return out;
}
function clone(a) {
  var out = new ARRAY_TYPE(16);
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  out[4] = a[4];
  out[5] = a[5];
  out[6] = a[6];
  out[7] = a[7];
  out[8] = a[8];
  out[9] = a[9];
  out[10] = a[10];
  out[11] = a[11];
  out[12] = a[12];
  out[13] = a[13];
  out[14] = a[14];
  out[15] = a[15];
  return out;
}
function copy(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  out[4] = a[4];
  out[5] = a[5];
  out[6] = a[6];
  out[7] = a[7];
  out[8] = a[8];
  out[9] = a[9];
  out[10] = a[10];
  out[11] = a[11];
  out[12] = a[12];
  out[13] = a[13];
  out[14] = a[14];
  out[15] = a[15];
  return out;
}
function fromValues(m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33) {
  var out = new ARRAY_TYPE(16);
  out[0] = m00;
  out[1] = m01;
  out[2] = m02;
  out[3] = m03;
  out[4] = m10;
  out[5] = m11;
  out[6] = m12;
  out[7] = m13;
  out[8] = m20;
  out[9] = m21;
  out[10] = m22;
  out[11] = m23;
  out[12] = m30;
  out[13] = m31;
  out[14] = m32;
  out[15] = m33;
  return out;
}
function set(out, m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33) {
  out[0] = m00;
  out[1] = m01;
  out[2] = m02;
  out[3] = m03;
  out[4] = m10;
  out[5] = m11;
  out[6] = m12;
  out[7] = m13;
  out[8] = m20;
  out[9] = m21;
  out[10] = m22;
  out[11] = m23;
  out[12] = m30;
  out[13] = m31;
  out[14] = m32;
  out[15] = m33;
  return out;
}
function identity(out) {
  out[0] = 1;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = 1;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = 1;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}
function transpose(out, a) {
  if (out === a) {
    var a01 = a[1], a02 = a[2], a03 = a[3];
    var a12 = a[6], a13 = a[7];
    var a23 = a[11];
    out[1] = a[4];
    out[2] = a[8];
    out[3] = a[12];
    out[4] = a01;
    out[6] = a[9];
    out[7] = a[13];
    out[8] = a02;
    out[9] = a12;
    out[11] = a[14];
    out[12] = a03;
    out[13] = a13;
    out[14] = a23;
  } else {
    out[0] = a[0];
    out[1] = a[4];
    out[2] = a[8];
    out[3] = a[12];
    out[4] = a[1];
    out[5] = a[5];
    out[6] = a[9];
    out[7] = a[13];
    out[8] = a[2];
    out[9] = a[6];
    out[10] = a[10];
    out[11] = a[14];
    out[12] = a[3];
    out[13] = a[7];
    out[14] = a[11];
    out[15] = a[15];
  }
  return out;
}
function invert(out, a) {
  var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
  var a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
  var a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
  var a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
  var b00 = a00 * a11 - a01 * a10;
  var b01 = a00 * a12 - a02 * a10;
  var b02 = a00 * a13 - a03 * a10;
  var b03 = a01 * a12 - a02 * a11;
  var b04 = a01 * a13 - a03 * a11;
  var b05 = a02 * a13 - a03 * a12;
  var b06 = a20 * a31 - a21 * a30;
  var b07 = a20 * a32 - a22 * a30;
  var b08 = a20 * a33 - a23 * a30;
  var b09 = a21 * a32 - a22 * a31;
  var b10 = a21 * a33 - a23 * a31;
  var b11 = a22 * a33 - a23 * a32;
  var det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
  if (!det) {
    return null;
  }
  det = 1 / det;
  out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
  out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
  out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
  out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
  out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
  out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
  out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
  out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
  out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
  out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
  out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
  out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
  out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
  out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
  out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
  out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;
  return out;
}
function adjoint(out, a) {
  var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
  var a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
  var a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
  var a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
  var b00 = a00 * a11 - a01 * a10;
  var b01 = a00 * a12 - a02 * a10;
  var b02 = a00 * a13 - a03 * a10;
  var b03 = a01 * a12 - a02 * a11;
  var b04 = a01 * a13 - a03 * a11;
  var b05 = a02 * a13 - a03 * a12;
  var b06 = a20 * a31 - a21 * a30;
  var b07 = a20 * a32 - a22 * a30;
  var b08 = a20 * a33 - a23 * a30;
  var b09 = a21 * a32 - a22 * a31;
  var b10 = a21 * a33 - a23 * a31;
  var b11 = a22 * a33 - a23 * a32;
  out[0] = a11 * b11 - a12 * b10 + a13 * b09;
  out[1] = a02 * b10 - a01 * b11 - a03 * b09;
  out[2] = a31 * b05 - a32 * b04 + a33 * b03;
  out[3] = a22 * b04 - a21 * b05 - a23 * b03;
  out[4] = a12 * b08 - a10 * b11 - a13 * b07;
  out[5] = a00 * b11 - a02 * b08 + a03 * b07;
  out[6] = a32 * b02 - a30 * b05 - a33 * b01;
  out[7] = a20 * b05 - a22 * b02 + a23 * b01;
  out[8] = a10 * b10 - a11 * b08 + a13 * b06;
  out[9] = a01 * b08 - a00 * b10 - a03 * b06;
  out[10] = a30 * b04 - a31 * b02 + a33 * b00;
  out[11] = a21 * b02 - a20 * b04 - a23 * b00;
  out[12] = a11 * b07 - a10 * b09 - a12 * b06;
  out[13] = a00 * b09 - a01 * b07 + a02 * b06;
  out[14] = a31 * b01 - a30 * b03 - a32 * b00;
  out[15] = a20 * b03 - a21 * b01 + a22 * b00;
  return out;
}
function determinant(a) {
  var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
  var a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
  var a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
  var a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
  var b0 = a00 * a11 - a01 * a10;
  var b1 = a00 * a12 - a02 * a10;
  var b2 = a01 * a12 - a02 * a11;
  var b3 = a20 * a31 - a21 * a30;
  var b4 = a20 * a32 - a22 * a30;
  var b5 = a21 * a32 - a22 * a31;
  var b6 = a00 * b5 - a01 * b4 + a02 * b3;
  var b7 = a10 * b5 - a11 * b4 + a12 * b3;
  var b8 = a20 * b2 - a21 * b1 + a22 * b0;
  var b9 = a30 * b2 - a31 * b1 + a32 * b0;
  return a13 * b6 - a03 * b7 + a33 * b8 - a23 * b9;
}
function multiply(out, a, b) {
  var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
  var a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
  var a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
  var a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
  var b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
  out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
  b0 = b[4];
  b1 = b[5];
  b2 = b[6];
  b3 = b[7];
  out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
  b0 = b[8];
  b1 = b[9];
  b2 = b[10];
  b3 = b[11];
  out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
  b0 = b[12];
  b1 = b[13];
  b2 = b[14];
  b3 = b[15];
  out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
  return out;
}
function translate(out, a, v) {
  var x = v[0], y = v[1], z = v[2];
  var a00, a01, a02, a03;
  var a10, a11, a12, a13;
  var a20, a21, a22, a23;
  if (a === out) {
    out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
    out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
    out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
    out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
  } else {
    a00 = a[0];
    a01 = a[1];
    a02 = a[2];
    a03 = a[3];
    a10 = a[4];
    a11 = a[5];
    a12 = a[6];
    a13 = a[7];
    a20 = a[8];
    a21 = a[9];
    a22 = a[10];
    a23 = a[11];
    out[0] = a00;
    out[1] = a01;
    out[2] = a02;
    out[3] = a03;
    out[4] = a10;
    out[5] = a11;
    out[6] = a12;
    out[7] = a13;
    out[8] = a20;
    out[9] = a21;
    out[10] = a22;
    out[11] = a23;
    out[12] = a00 * x + a10 * y + a20 * z + a[12];
    out[13] = a01 * x + a11 * y + a21 * z + a[13];
    out[14] = a02 * x + a12 * y + a22 * z + a[14];
    out[15] = a03 * x + a13 * y + a23 * z + a[15];
  }
  return out;
}
function scale(out, a, v) {
  var x = v[0], y = v[1], z = v[2];
  out[0] = a[0] * x;
  out[1] = a[1] * x;
  out[2] = a[2] * x;
  out[3] = a[3] * x;
  out[4] = a[4] * y;
  out[5] = a[5] * y;
  out[6] = a[6] * y;
  out[7] = a[7] * y;
  out[8] = a[8] * z;
  out[9] = a[9] * z;
  out[10] = a[10] * z;
  out[11] = a[11] * z;
  out[12] = a[12];
  out[13] = a[13];
  out[14] = a[14];
  out[15] = a[15];
  return out;
}
function rotate(out, a, rad, axis) {
  var x = axis[0], y = axis[1], z = axis[2];
  var len4 = Math.sqrt(x * x + y * y + z * z);
  var s, c, t;
  var a00, a01, a02, a03;
  var a10, a11, a12, a13;
  var a20, a21, a22, a23;
  var b00, b01, b02;
  var b10, b11, b12;
  var b20, b21, b22;
  if (len4 < EPSILON) {
    return null;
  }
  len4 = 1 / len4;
  x *= len4;
  y *= len4;
  z *= len4;
  s = Math.sin(rad);
  c = Math.cos(rad);
  t = 1 - c;
  a00 = a[0];
  a01 = a[1];
  a02 = a[2];
  a03 = a[3];
  a10 = a[4];
  a11 = a[5];
  a12 = a[6];
  a13 = a[7];
  a20 = a[8];
  a21 = a[9];
  a22 = a[10];
  a23 = a[11];
  b00 = x * x * t + c;
  b01 = y * x * t + z * s;
  b02 = z * x * t - y * s;
  b10 = x * y * t - z * s;
  b11 = y * y * t + c;
  b12 = z * y * t + x * s;
  b20 = x * z * t + y * s;
  b21 = y * z * t - x * s;
  b22 = z * z * t + c;
  out[0] = a00 * b00 + a10 * b01 + a20 * b02;
  out[1] = a01 * b00 + a11 * b01 + a21 * b02;
  out[2] = a02 * b00 + a12 * b01 + a22 * b02;
  out[3] = a03 * b00 + a13 * b01 + a23 * b02;
  out[4] = a00 * b10 + a10 * b11 + a20 * b12;
  out[5] = a01 * b10 + a11 * b11 + a21 * b12;
  out[6] = a02 * b10 + a12 * b11 + a22 * b12;
  out[7] = a03 * b10 + a13 * b11 + a23 * b12;
  out[8] = a00 * b20 + a10 * b21 + a20 * b22;
  out[9] = a01 * b20 + a11 * b21 + a21 * b22;
  out[10] = a02 * b20 + a12 * b21 + a22 * b22;
  out[11] = a03 * b20 + a13 * b21 + a23 * b22;
  if (a !== out) {
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
  }
  return out;
}
function rotateX(out, a, rad) {
  var s = Math.sin(rad);
  var c = Math.cos(rad);
  var a10 = a[4];
  var a11 = a[5];
  var a12 = a[6];
  var a13 = a[7];
  var a20 = a[8];
  var a21 = a[9];
  var a22 = a[10];
  var a23 = a[11];
  if (a !== out) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
  }
  out[4] = a10 * c + a20 * s;
  out[5] = a11 * c + a21 * s;
  out[6] = a12 * c + a22 * s;
  out[7] = a13 * c + a23 * s;
  out[8] = a20 * c - a10 * s;
  out[9] = a21 * c - a11 * s;
  out[10] = a22 * c - a12 * s;
  out[11] = a23 * c - a13 * s;
  return out;
}
function rotateY(out, a, rad) {
  var s = Math.sin(rad);
  var c = Math.cos(rad);
  var a00 = a[0];
  var a01 = a[1];
  var a02 = a[2];
  var a03 = a[3];
  var a20 = a[8];
  var a21 = a[9];
  var a22 = a[10];
  var a23 = a[11];
  if (a !== out) {
    out[4] = a[4];
    out[5] = a[5];
    out[6] = a[6];
    out[7] = a[7];
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
  }
  out[0] = a00 * c - a20 * s;
  out[1] = a01 * c - a21 * s;
  out[2] = a02 * c - a22 * s;
  out[3] = a03 * c - a23 * s;
  out[8] = a00 * s + a20 * c;
  out[9] = a01 * s + a21 * c;
  out[10] = a02 * s + a22 * c;
  out[11] = a03 * s + a23 * c;
  return out;
}
function rotateZ(out, a, rad) {
  var s = Math.sin(rad);
  var c = Math.cos(rad);
  var a00 = a[0];
  var a01 = a[1];
  var a02 = a[2];
  var a03 = a[3];
  var a10 = a[4];
  var a11 = a[5];
  var a12 = a[6];
  var a13 = a[7];
  if (a !== out) {
    out[8] = a[8];
    out[9] = a[9];
    out[10] = a[10];
    out[11] = a[11];
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
  }
  out[0] = a00 * c + a10 * s;
  out[1] = a01 * c + a11 * s;
  out[2] = a02 * c + a12 * s;
  out[3] = a03 * c + a13 * s;
  out[4] = a10 * c - a00 * s;
  out[5] = a11 * c - a01 * s;
  out[6] = a12 * c - a02 * s;
  out[7] = a13 * c - a03 * s;
  return out;
}
function fromTranslation(out, v) {
  out[0] = 1;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = 1;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = 1;
  out[11] = 0;
  out[12] = v[0];
  out[13] = v[1];
  out[14] = v[2];
  out[15] = 1;
  return out;
}
function fromScaling(out, v) {
  out[0] = v[0];
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = v[1];
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = v[2];
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}
function fromRotation(out, rad, axis) {
  var x = axis[0], y = axis[1], z = axis[2];
  var len4 = Math.sqrt(x * x + y * y + z * z);
  var s, c, t;
  if (len4 < EPSILON) {
    return null;
  }
  len4 = 1 / len4;
  x *= len4;
  y *= len4;
  z *= len4;
  s = Math.sin(rad);
  c = Math.cos(rad);
  t = 1 - c;
  out[0] = x * x * t + c;
  out[1] = y * x * t + z * s;
  out[2] = z * x * t - y * s;
  out[3] = 0;
  out[4] = x * y * t - z * s;
  out[5] = y * y * t + c;
  out[6] = z * y * t + x * s;
  out[7] = 0;
  out[8] = x * z * t + y * s;
  out[9] = y * z * t - x * s;
  out[10] = z * z * t + c;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}
function fromXRotation(out, rad) {
  var s = Math.sin(rad);
  var c = Math.cos(rad);
  out[0] = 1;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = c;
  out[6] = s;
  out[7] = 0;
  out[8] = 0;
  out[9] = -s;
  out[10] = c;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}
function fromYRotation(out, rad) {
  var s = Math.sin(rad);
  var c = Math.cos(rad);
  out[0] = c;
  out[1] = 0;
  out[2] = -s;
  out[3] = 0;
  out[4] = 0;
  out[5] = 1;
  out[6] = 0;
  out[7] = 0;
  out[8] = s;
  out[9] = 0;
  out[10] = c;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}
function fromZRotation(out, rad) {
  var s = Math.sin(rad);
  var c = Math.cos(rad);
  out[0] = c;
  out[1] = s;
  out[2] = 0;
  out[3] = 0;
  out[4] = -s;
  out[5] = c;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = 1;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}
function fromRotationTranslation(out, q, v) {
  var x = q[0], y = q[1], z = q[2], w = q[3];
  var x2 = x + x;
  var y2 = y + y;
  var z2 = z + z;
  var xx = x * x2;
  var xy = x * y2;
  var xz = x * z2;
  var yy = y * y2;
  var yz = y * z2;
  var zz = z * z2;
  var wx = w * x2;
  var wy = w * y2;
  var wz = w * z2;
  out[0] = 1 - (yy + zz);
  out[1] = xy + wz;
  out[2] = xz - wy;
  out[3] = 0;
  out[4] = xy - wz;
  out[5] = 1 - (xx + zz);
  out[6] = yz + wx;
  out[7] = 0;
  out[8] = xz + wy;
  out[9] = yz - wx;
  out[10] = 1 - (xx + yy);
  out[11] = 0;
  out[12] = v[0];
  out[13] = v[1];
  out[14] = v[2];
  out[15] = 1;
  return out;
}
function fromQuat2(out, a) {
  var translation = new ARRAY_TYPE(3);
  var bx = -a[0], by = -a[1], bz = -a[2], bw = a[3], ax = a[4], ay = a[5], az = a[6], aw = a[7];
  var magnitude = bx * bx + by * by + bz * bz + bw * bw;
  if (magnitude > 0) {
    translation[0] = (ax * bw + aw * bx + ay * bz - az * by) * 2 / magnitude;
    translation[1] = (ay * bw + aw * by + az * bx - ax * bz) * 2 / magnitude;
    translation[2] = (az * bw + aw * bz + ax * by - ay * bx) * 2 / magnitude;
  } else {
    translation[0] = (ax * bw + aw * bx + ay * bz - az * by) * 2;
    translation[1] = (ay * bw + aw * by + az * bx - ax * bz) * 2;
    translation[2] = (az * bw + aw * bz + ax * by - ay * bx) * 2;
  }
  fromRotationTranslation(out, a, translation);
  return out;
}
function getTranslation(out, mat) {
  out[0] = mat[12];
  out[1] = mat[13];
  out[2] = mat[14];
  return out;
}
function getScaling(out, mat) {
  var m11 = mat[0];
  var m12 = mat[1];
  var m13 = mat[2];
  var m21 = mat[4];
  var m22 = mat[5];
  var m23 = mat[6];
  var m31 = mat[8];
  var m32 = mat[9];
  var m33 = mat[10];
  out[0] = Math.sqrt(m11 * m11 + m12 * m12 + m13 * m13);
  out[1] = Math.sqrt(m21 * m21 + m22 * m22 + m23 * m23);
  out[2] = Math.sqrt(m31 * m31 + m32 * m32 + m33 * m33);
  return out;
}
function getRotation(out, mat) {
  var scaling = new ARRAY_TYPE(3);
  getScaling(scaling, mat);
  var is1 = 1 / scaling[0];
  var is2 = 1 / scaling[1];
  var is3 = 1 / scaling[2];
  var sm11 = mat[0] * is1;
  var sm12 = mat[1] * is2;
  var sm13 = mat[2] * is3;
  var sm21 = mat[4] * is1;
  var sm22 = mat[5] * is2;
  var sm23 = mat[6] * is3;
  var sm31 = mat[8] * is1;
  var sm32 = mat[9] * is2;
  var sm33 = mat[10] * is3;
  var trace = sm11 + sm22 + sm33;
  var S = 0;
  if (trace > 0) {
    S = Math.sqrt(trace + 1) * 2;
    out[3] = 0.25 * S;
    out[0] = (sm23 - sm32) / S;
    out[1] = (sm31 - sm13) / S;
    out[2] = (sm12 - sm21) / S;
  } else if (sm11 > sm22 && sm11 > sm33) {
    S = Math.sqrt(1 + sm11 - sm22 - sm33) * 2;
    out[3] = (sm23 - sm32) / S;
    out[0] = 0.25 * S;
    out[1] = (sm12 + sm21) / S;
    out[2] = (sm31 + sm13) / S;
  } else if (sm22 > sm33) {
    S = Math.sqrt(1 + sm22 - sm11 - sm33) * 2;
    out[3] = (sm31 - sm13) / S;
    out[0] = (sm12 + sm21) / S;
    out[1] = 0.25 * S;
    out[2] = (sm23 + sm32) / S;
  } else {
    S = Math.sqrt(1 + sm33 - sm11 - sm22) * 2;
    out[3] = (sm12 - sm21) / S;
    out[0] = (sm31 + sm13) / S;
    out[1] = (sm23 + sm32) / S;
    out[2] = 0.25 * S;
  }
  return out;
}
function decompose(out_r, out_t, out_s, mat) {
  out_t[0] = mat[12];
  out_t[1] = mat[13];
  out_t[2] = mat[14];
  var m11 = mat[0];
  var m12 = mat[1];
  var m13 = mat[2];
  var m21 = mat[4];
  var m22 = mat[5];
  var m23 = mat[6];
  var m31 = mat[8];
  var m32 = mat[9];
  var m33 = mat[10];
  out_s[0] = Math.sqrt(m11 * m11 + m12 * m12 + m13 * m13);
  out_s[1] = Math.sqrt(m21 * m21 + m22 * m22 + m23 * m23);
  out_s[2] = Math.sqrt(m31 * m31 + m32 * m32 + m33 * m33);
  var is1 = 1 / out_s[0];
  var is2 = 1 / out_s[1];
  var is3 = 1 / out_s[2];
  var sm11 = m11 * is1;
  var sm12 = m12 * is2;
  var sm13 = m13 * is3;
  var sm21 = m21 * is1;
  var sm22 = m22 * is2;
  var sm23 = m23 * is3;
  var sm31 = m31 * is1;
  var sm32 = m32 * is2;
  var sm33 = m33 * is3;
  var trace = sm11 + sm22 + sm33;
  var S = 0;
  if (trace > 0) {
    S = Math.sqrt(trace + 1) * 2;
    out_r[3] = 0.25 * S;
    out_r[0] = (sm23 - sm32) / S;
    out_r[1] = (sm31 - sm13) / S;
    out_r[2] = (sm12 - sm21) / S;
  } else if (sm11 > sm22 && sm11 > sm33) {
    S = Math.sqrt(1 + sm11 - sm22 - sm33) * 2;
    out_r[3] = (sm23 - sm32) / S;
    out_r[0] = 0.25 * S;
    out_r[1] = (sm12 + sm21) / S;
    out_r[2] = (sm31 + sm13) / S;
  } else if (sm22 > sm33) {
    S = Math.sqrt(1 + sm22 - sm11 - sm33) * 2;
    out_r[3] = (sm31 - sm13) / S;
    out_r[0] = (sm12 + sm21) / S;
    out_r[1] = 0.25 * S;
    out_r[2] = (sm23 + sm32) / S;
  } else {
    S = Math.sqrt(1 + sm33 - sm11 - sm22) * 2;
    out_r[3] = (sm12 - sm21) / S;
    out_r[0] = (sm31 + sm13) / S;
    out_r[1] = (sm23 + sm32) / S;
    out_r[2] = 0.25 * S;
  }
  return out_r;
}
function fromRotationTranslationScale(out, q, v, s) {
  var x = q[0], y = q[1], z = q[2], w = q[3];
  var x2 = x + x;
  var y2 = y + y;
  var z2 = z + z;
  var xx = x * x2;
  var xy = x * y2;
  var xz = x * z2;
  var yy = y * y2;
  var yz = y * z2;
  var zz = z * z2;
  var wx = w * x2;
  var wy = w * y2;
  var wz = w * z2;
  var sx = s[0];
  var sy = s[1];
  var sz = s[2];
  out[0] = (1 - (yy + zz)) * sx;
  out[1] = (xy + wz) * sx;
  out[2] = (xz - wy) * sx;
  out[3] = 0;
  out[4] = (xy - wz) * sy;
  out[5] = (1 - (xx + zz)) * sy;
  out[6] = (yz + wx) * sy;
  out[7] = 0;
  out[8] = (xz + wy) * sz;
  out[9] = (yz - wx) * sz;
  out[10] = (1 - (xx + yy)) * sz;
  out[11] = 0;
  out[12] = v[0];
  out[13] = v[1];
  out[14] = v[2];
  out[15] = 1;
  return out;
}
function fromRotationTranslationScaleOrigin(out, q, v, s, o) {
  var x = q[0], y = q[1], z = q[2], w = q[3];
  var x2 = x + x;
  var y2 = y + y;
  var z2 = z + z;
  var xx = x * x2;
  var xy = x * y2;
  var xz = x * z2;
  var yy = y * y2;
  var yz = y * z2;
  var zz = z * z2;
  var wx = w * x2;
  var wy = w * y2;
  var wz = w * z2;
  var sx = s[0];
  var sy = s[1];
  var sz = s[2];
  var ox = o[0];
  var oy = o[1];
  var oz = o[2];
  var out0 = (1 - (yy + zz)) * sx;
  var out1 = (xy + wz) * sx;
  var out2 = (xz - wy) * sx;
  var out4 = (xy - wz) * sy;
  var out5 = (1 - (xx + zz)) * sy;
  var out6 = (yz + wx) * sy;
  var out8 = (xz + wy) * sz;
  var out9 = (yz - wx) * sz;
  var out10 = (1 - (xx + yy)) * sz;
  out[0] = out0;
  out[1] = out1;
  out[2] = out2;
  out[3] = 0;
  out[4] = out4;
  out[5] = out5;
  out[6] = out6;
  out[7] = 0;
  out[8] = out8;
  out[9] = out9;
  out[10] = out10;
  out[11] = 0;
  out[12] = v[0] + ox - (out0 * ox + out4 * oy + out8 * oz);
  out[13] = v[1] + oy - (out1 * ox + out5 * oy + out9 * oz);
  out[14] = v[2] + oz - (out2 * ox + out6 * oy + out10 * oz);
  out[15] = 1;
  return out;
}
function fromQuat(out, q) {
  var x = q[0], y = q[1], z = q[2], w = q[3];
  var x2 = x + x;
  var y2 = y + y;
  var z2 = z + z;
  var xx = x * x2;
  var yx = y * x2;
  var yy = y * y2;
  var zx = z * x2;
  var zy = z * y2;
  var zz = z * z2;
  var wx = w * x2;
  var wy = w * y2;
  var wz = w * z2;
  out[0] = 1 - yy - zz;
  out[1] = yx + wz;
  out[2] = zx - wy;
  out[3] = 0;
  out[4] = yx - wz;
  out[5] = 1 - xx - zz;
  out[6] = zy + wx;
  out[7] = 0;
  out[8] = zx + wy;
  out[9] = zy - wx;
  out[10] = 1 - xx - yy;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}
function frustum(out, left, right, bottom, top, near, far) {
  var rl = 1 / (right - left);
  var tb = 1 / (top - bottom);
  var nf = 1 / (near - far);
  out[0] = near * 2 * rl;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = near * 2 * tb;
  out[6] = 0;
  out[7] = 0;
  out[8] = (right + left) * rl;
  out[9] = (top + bottom) * tb;
  out[10] = (far + near) * nf;
  out[11] = -1;
  out[12] = 0;
  out[13] = 0;
  out[14] = far * near * 2 * nf;
  out[15] = 0;
  return out;
}
function perspectiveNO(out, fovy, aspect, near, far) {
  var f = 1 / Math.tan(fovy / 2);
  out[0] = f / aspect;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = f;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[11] = -1;
  out[12] = 0;
  out[13] = 0;
  out[15] = 0;
  if (far != null && far !== Infinity) {
    var nf = 1 / (near - far);
    out[10] = (far + near) * nf;
    out[14] = 2 * far * near * nf;
  } else {
    out[10] = -1;
    out[14] = -2 * near;
  }
  return out;
}
var perspective = perspectiveNO;
function perspectiveZO(out, fovy, aspect, near, far) {
  var f = 1 / Math.tan(fovy / 2);
  out[0] = f / aspect;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = f;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[11] = -1;
  out[12] = 0;
  out[13] = 0;
  out[15] = 0;
  if (far != null && far !== Infinity) {
    var nf = 1 / (near - far);
    out[10] = far * nf;
    out[14] = far * near * nf;
  } else {
    out[10] = -1;
    out[14] = -near;
  }
  return out;
}
function perspectiveFromFieldOfView(out, fov, near, far) {
  var upTan = Math.tan(fov.upDegrees * Math.PI / 180);
  var downTan = Math.tan(fov.downDegrees * Math.PI / 180);
  var leftTan = Math.tan(fov.leftDegrees * Math.PI / 180);
  var rightTan = Math.tan(fov.rightDegrees * Math.PI / 180);
  var xScale = 2 / (leftTan + rightTan);
  var yScale = 2 / (upTan + downTan);
  out[0] = xScale;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = yScale;
  out[6] = 0;
  out[7] = 0;
  out[8] = -((leftTan - rightTan) * xScale * 0.5);
  out[9] = (upTan - downTan) * yScale * 0.5;
  out[10] = far / (near - far);
  out[11] = -1;
  out[12] = 0;
  out[13] = 0;
  out[14] = far * near / (near - far);
  out[15] = 0;
  return out;
}
function orthoNO(out, left, right, bottom, top, near, far) {
  var lr = 1 / (left - right);
  var bt = 1 / (bottom - top);
  var nf = 1 / (near - far);
  out[0] = -2 * lr;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = -2 * bt;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = 2 * nf;
  out[11] = 0;
  out[12] = (left + right) * lr;
  out[13] = (top + bottom) * bt;
  out[14] = (far + near) * nf;
  out[15] = 1;
  return out;
}
var ortho = orthoNO;
function orthoZO(out, left, right, bottom, top, near, far) {
  var lr = 1 / (left - right);
  var bt = 1 / (bottom - top);
  var nf = 1 / (near - far);
  out[0] = -2 * lr;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = -2 * bt;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = nf;
  out[11] = 0;
  out[12] = (left + right) * lr;
  out[13] = (top + bottom) * bt;
  out[14] = near * nf;
  out[15] = 1;
  return out;
}
function lookAt(out, eye, center, up) {
  var x0, x1, x2, y0, y1, y2, z0, z1, z2, len4;
  var eyex = eye[0];
  var eyey = eye[1];
  var eyez = eye[2];
  var upx = up[0];
  var upy = up[1];
  var upz = up[2];
  var centerx = center[0];
  var centery = center[1];
  var centerz = center[2];
  if (Math.abs(eyex - centerx) < EPSILON && Math.abs(eyey - centery) < EPSILON && Math.abs(eyez - centerz) < EPSILON) {
    return identity(out);
  }
  z0 = eyex - centerx;
  z1 = eyey - centery;
  z2 = eyez - centerz;
  len4 = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
  z0 *= len4;
  z1 *= len4;
  z2 *= len4;
  x0 = upy * z2 - upz * z1;
  x1 = upz * z0 - upx * z2;
  x2 = upx * z1 - upy * z0;
  len4 = Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);
  if (!len4) {
    x0 = 0;
    x1 = 0;
    x2 = 0;
  } else {
    len4 = 1 / len4;
    x0 *= len4;
    x1 *= len4;
    x2 *= len4;
  }
  y0 = z1 * x2 - z2 * x1;
  y1 = z2 * x0 - z0 * x2;
  y2 = z0 * x1 - z1 * x0;
  len4 = Math.sqrt(y0 * y0 + y1 * y1 + y2 * y2);
  if (!len4) {
    y0 = 0;
    y1 = 0;
    y2 = 0;
  } else {
    len4 = 1 / len4;
    y0 *= len4;
    y1 *= len4;
    y2 *= len4;
  }
  out[0] = x0;
  out[1] = y0;
  out[2] = z0;
  out[3] = 0;
  out[4] = x1;
  out[5] = y1;
  out[6] = z1;
  out[7] = 0;
  out[8] = x2;
  out[9] = y2;
  out[10] = z2;
  out[11] = 0;
  out[12] = -(x0 * eyex + x1 * eyey + x2 * eyez);
  out[13] = -(y0 * eyex + y1 * eyey + y2 * eyez);
  out[14] = -(z0 * eyex + z1 * eyey + z2 * eyez);
  out[15] = 1;
  return out;
}
function targetTo(out, eye, target, up) {
  var eyex = eye[0], eyey = eye[1], eyez = eye[2], upx = up[0], upy = up[1], upz = up[2];
  var z0 = eyex - target[0], z1 = eyey - target[1], z2 = eyez - target[2];
  var len4 = z0 * z0 + z1 * z1 + z2 * z2;
  if (len4 > 0) {
    len4 = 1 / Math.sqrt(len4);
    z0 *= len4;
    z1 *= len4;
    z2 *= len4;
  }
  var x0 = upy * z2 - upz * z1, x1 = upz * z0 - upx * z2, x2 = upx * z1 - upy * z0;
  len4 = x0 * x0 + x1 * x1 + x2 * x2;
  if (len4 > 0) {
    len4 = 1 / Math.sqrt(len4);
    x0 *= len4;
    x1 *= len4;
    x2 *= len4;
  }
  out[0] = x0;
  out[1] = x1;
  out[2] = x2;
  out[3] = 0;
  out[4] = z1 * x2 - z2 * x1;
  out[5] = z2 * x0 - z0 * x2;
  out[6] = z0 * x1 - z1 * x0;
  out[7] = 0;
  out[8] = z0;
  out[9] = z1;
  out[10] = z2;
  out[11] = 0;
  out[12] = eyex;
  out[13] = eyey;
  out[14] = eyez;
  out[15] = 1;
  return out;
}
function str(a) {
  return "mat4(" + a[0] + ", " + a[1] + ", " + a[2] + ", " + a[3] + ", " + a[4] + ", " + a[5] + ", " + a[6] + ", " + a[7] + ", " + a[8] + ", " + a[9] + ", " + a[10] + ", " + a[11] + ", " + a[12] + ", " + a[13] + ", " + a[14] + ", " + a[15] + ")";
}
function frob(a) {
  return Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2] + a[3] * a[3] + a[4] * a[4] + a[5] * a[5] + a[6] * a[6] + a[7] * a[7] + a[8] * a[8] + a[9] * a[9] + a[10] * a[10] + a[11] * a[11] + a[12] * a[12] + a[13] * a[13] + a[14] * a[14] + a[15] * a[15]);
}
function add(out, a, b) {
  out[0] = a[0] + b[0];
  out[1] = a[1] + b[1];
  out[2] = a[2] + b[2];
  out[3] = a[3] + b[3];
  out[4] = a[4] + b[4];
  out[5] = a[5] + b[5];
  out[6] = a[6] + b[6];
  out[7] = a[7] + b[7];
  out[8] = a[8] + b[8];
  out[9] = a[9] + b[9];
  out[10] = a[10] + b[10];
  out[11] = a[11] + b[11];
  out[12] = a[12] + b[12];
  out[13] = a[13] + b[13];
  out[14] = a[14] + b[14];
  out[15] = a[15] + b[15];
  return out;
}
function subtract(out, a, b) {
  out[0] = a[0] - b[0];
  out[1] = a[1] - b[1];
  out[2] = a[2] - b[2];
  out[3] = a[3] - b[3];
  out[4] = a[4] - b[4];
  out[5] = a[5] - b[5];
  out[6] = a[6] - b[6];
  out[7] = a[7] - b[7];
  out[8] = a[8] - b[8];
  out[9] = a[9] - b[9];
  out[10] = a[10] - b[10];
  out[11] = a[11] - b[11];
  out[12] = a[12] - b[12];
  out[13] = a[13] - b[13];
  out[14] = a[14] - b[14];
  out[15] = a[15] - b[15];
  return out;
}
function multiplyScalar(out, a, b) {
  out[0] = a[0] * b;
  out[1] = a[1] * b;
  out[2] = a[2] * b;
  out[3] = a[3] * b;
  out[4] = a[4] * b;
  out[5] = a[5] * b;
  out[6] = a[6] * b;
  out[7] = a[7] * b;
  out[8] = a[8] * b;
  out[9] = a[9] * b;
  out[10] = a[10] * b;
  out[11] = a[11] * b;
  out[12] = a[12] * b;
  out[13] = a[13] * b;
  out[14] = a[14] * b;
  out[15] = a[15] * b;
  return out;
}
function multiplyScalarAndAdd(out, a, b, scale6) {
  out[0] = a[0] + b[0] * scale6;
  out[1] = a[1] + b[1] * scale6;
  out[2] = a[2] + b[2] * scale6;
  out[3] = a[3] + b[3] * scale6;
  out[4] = a[4] + b[4] * scale6;
  out[5] = a[5] + b[5] * scale6;
  out[6] = a[6] + b[6] * scale6;
  out[7] = a[7] + b[7] * scale6;
  out[8] = a[8] + b[8] * scale6;
  out[9] = a[9] + b[9] * scale6;
  out[10] = a[10] + b[10] * scale6;
  out[11] = a[11] + b[11] * scale6;
  out[12] = a[12] + b[12] * scale6;
  out[13] = a[13] + b[13] * scale6;
  out[14] = a[14] + b[14] * scale6;
  out[15] = a[15] + b[15] * scale6;
  return out;
}
function exactEquals(a, b) {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3] && a[4] === b[4] && a[5] === b[5] && a[6] === b[6] && a[7] === b[7] && a[8] === b[8] && a[9] === b[9] && a[10] === b[10] && a[11] === b[11] && a[12] === b[12] && a[13] === b[13] && a[14] === b[14] && a[15] === b[15];
}
function equals(a, b) {
  var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3];
  var a4 = a[4], a5 = a[5], a6 = a[6], a7 = a[7];
  var a8 = a[8], a9 = a[9], a10 = a[10], a11 = a[11];
  var a12 = a[12], a13 = a[13], a14 = a[14], a15 = a[15];
  var b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
  var b4 = b[4], b5 = b[5], b6 = b[6], b7 = b[7];
  var b8 = b[8], b9 = b[9], b10 = b[10], b11 = b[11];
  var b12 = b[12], b13 = b[13], b14 = b[14], b15 = b[15];
  return Math.abs(a0 - b0) <= EPSILON * Math.max(1, Math.abs(a0), Math.abs(b0)) && Math.abs(a1 - b1) <= EPSILON * Math.max(1, Math.abs(a1), Math.abs(b1)) && Math.abs(a2 - b2) <= EPSILON * Math.max(1, Math.abs(a2), Math.abs(b2)) && Math.abs(a3 - b3) <= EPSILON * Math.max(1, Math.abs(a3), Math.abs(b3)) && Math.abs(a4 - b4) <= EPSILON * Math.max(1, Math.abs(a4), Math.abs(b4)) && Math.abs(a5 - b5) <= EPSILON * Math.max(1, Math.abs(a5), Math.abs(b5)) && Math.abs(a6 - b6) <= EPSILON * Math.max(1, Math.abs(a6), Math.abs(b6)) && Math.abs(a7 - b7) <= EPSILON * Math.max(1, Math.abs(a7), Math.abs(b7)) && Math.abs(a8 - b8) <= EPSILON * Math.max(1, Math.abs(a8), Math.abs(b8)) && Math.abs(a9 - b9) <= EPSILON * Math.max(1, Math.abs(a9), Math.abs(b9)) && Math.abs(a10 - b10) <= EPSILON * Math.max(1, Math.abs(a10), Math.abs(b10)) && Math.abs(a11 - b11) <= EPSILON * Math.max(1, Math.abs(a11), Math.abs(b11)) && Math.abs(a12 - b12) <= EPSILON * Math.max(1, Math.abs(a12), Math.abs(b12)) && Math.abs(a13 - b13) <= EPSILON * Math.max(1, Math.abs(a13), Math.abs(b13)) && Math.abs(a14 - b14) <= EPSILON * Math.max(1, Math.abs(a14), Math.abs(b14)) && Math.abs(a15 - b15) <= EPSILON * Math.max(1, Math.abs(a15), Math.abs(b15));
}
var mul = multiply;
var sub = subtract;

// node_modules/gl-matrix/esm/quat.js
var quat_exports = {};
__export(quat_exports, {
  add: () => add4,
  calculateW: () => calculateW,
  clone: () => clone4,
  conjugate: () => conjugate,
  copy: () => copy4,
  create: () => create5,
  dot: () => dot3,
  equals: () => equals3,
  exactEquals: () => exactEquals4,
  exp: () => exp,
  fromEuler: () => fromEuler,
  fromMat3: () => fromMat3,
  fromValues: () => fromValues4,
  getAngle: () => getAngle,
  getAxisAngle: () => getAxisAngle,
  identity: () => identity2,
  invert: () => invert2,
  len: () => len2,
  length: () => length3,
  lerp: () => lerp3,
  ln: () => ln,
  mul: () => mul3,
  multiply: () => multiply3,
  normalize: () => normalize3,
  pow: () => pow,
  random: () => random2,
  rotateX: () => rotateX3,
  rotateY: () => rotateY3,
  rotateZ: () => rotateZ3,
  rotationTo: () => rotationTo,
  scale: () => scale4,
  set: () => set4,
  setAxes: () => setAxes,
  setAxisAngle: () => setAxisAngle,
  slerp: () => slerp2,
  sqlerp: () => sqlerp,
  sqrLen: () => sqrLen2,
  squaredLength: () => squaredLength3,
  str: () => str3
});

// node_modules/gl-matrix/esm/vec3.js
var vec3_exports = {};
__export(vec3_exports, {
  add: () => add2,
  angle: () => angle,
  bezier: () => bezier,
  ceil: () => ceil,
  clone: () => clone2,
  copy: () => copy2,
  create: () => create3,
  cross: () => cross,
  dist: () => dist,
  distance: () => distance,
  div: () => div,
  divide: () => divide,
  dot: () => dot,
  equals: () => equals2,
  exactEquals: () => exactEquals2,
  floor: () => floor,
  forEach: () => forEach,
  fromValues: () => fromValues2,
  hermite: () => hermite,
  inverse: () => inverse,
  len: () => len,
  length: () => length,
  lerp: () => lerp,
  max: () => max,
  min: () => min,
  mul: () => mul2,
  multiply: () => multiply2,
  negate: () => negate,
  normalize: () => normalize,
  random: () => random,
  rotateX: () => rotateX2,
  rotateY: () => rotateY2,
  rotateZ: () => rotateZ2,
  round: () => round2,
  scale: () => scale2,
  scaleAndAdd: () => scaleAndAdd,
  set: () => set2,
  slerp: () => slerp,
  sqrDist: () => sqrDist,
  sqrLen: () => sqrLen,
  squaredDistance: () => squaredDistance,
  squaredLength: () => squaredLength,
  str: () => str2,
  sub: () => sub2,
  subtract: () => subtract2,
  transformMat3: () => transformMat3,
  transformMat4: () => transformMat4,
  transformQuat: () => transformQuat,
  zero: () => zero
});
function create3() {
  var out = new ARRAY_TYPE(3);
  if (ARRAY_TYPE != Float32Array) {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
  }
  return out;
}
function clone2(a) {
  var out = new ARRAY_TYPE(3);
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  return out;
}
function length(a) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  return Math.sqrt(x * x + y * y + z * z);
}
function fromValues2(x, y, z) {
  var out = new ARRAY_TYPE(3);
  out[0] = x;
  out[1] = y;
  out[2] = z;
  return out;
}
function copy2(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  return out;
}
function set2(out, x, y, z) {
  out[0] = x;
  out[1] = y;
  out[2] = z;
  return out;
}
function add2(out, a, b) {
  out[0] = a[0] + b[0];
  out[1] = a[1] + b[1];
  out[2] = a[2] + b[2];
  return out;
}
function subtract2(out, a, b) {
  out[0] = a[0] - b[0];
  out[1] = a[1] - b[1];
  out[2] = a[2] - b[2];
  return out;
}
function multiply2(out, a, b) {
  out[0] = a[0] * b[0];
  out[1] = a[1] * b[1];
  out[2] = a[2] * b[2];
  return out;
}
function divide(out, a, b) {
  out[0] = a[0] / b[0];
  out[1] = a[1] / b[1];
  out[2] = a[2] / b[2];
  return out;
}
function ceil(out, a) {
  out[0] = Math.ceil(a[0]);
  out[1] = Math.ceil(a[1]);
  out[2] = Math.ceil(a[2]);
  return out;
}
function floor(out, a) {
  out[0] = Math.floor(a[0]);
  out[1] = Math.floor(a[1]);
  out[2] = Math.floor(a[2]);
  return out;
}
function min(out, a, b) {
  out[0] = Math.min(a[0], b[0]);
  out[1] = Math.min(a[1], b[1]);
  out[2] = Math.min(a[2], b[2]);
  return out;
}
function max(out, a, b) {
  out[0] = Math.max(a[0], b[0]);
  out[1] = Math.max(a[1], b[1]);
  out[2] = Math.max(a[2], b[2]);
  return out;
}
function round2(out, a) {
  out[0] = round(a[0]);
  out[1] = round(a[1]);
  out[2] = round(a[2]);
  return out;
}
function scale2(out, a, b) {
  out[0] = a[0] * b;
  out[1] = a[1] * b;
  out[2] = a[2] * b;
  return out;
}
function scaleAndAdd(out, a, b, scale6) {
  out[0] = a[0] + b[0] * scale6;
  out[1] = a[1] + b[1] * scale6;
  out[2] = a[2] + b[2] * scale6;
  return out;
}
function distance(a, b) {
  var x = b[0] - a[0];
  var y = b[1] - a[1];
  var z = b[2] - a[2];
  return Math.sqrt(x * x + y * y + z * z);
}
function squaredDistance(a, b) {
  var x = b[0] - a[0];
  var y = b[1] - a[1];
  var z = b[2] - a[2];
  return x * x + y * y + z * z;
}
function squaredLength(a) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  return x * x + y * y + z * z;
}
function negate(out, a) {
  out[0] = -a[0];
  out[1] = -a[1];
  out[2] = -a[2];
  return out;
}
function inverse(out, a) {
  out[0] = 1 / a[0];
  out[1] = 1 / a[1];
  out[2] = 1 / a[2];
  return out;
}
function normalize(out, a) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  var len4 = x * x + y * y + z * z;
  if (len4 > 0) {
    len4 = 1 / Math.sqrt(len4);
  }
  out[0] = a[0] * len4;
  out[1] = a[1] * len4;
  out[2] = a[2] * len4;
  return out;
}
function dot(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}
function cross(out, a, b) {
  var ax = a[0], ay = a[1], az = a[2];
  var bx = b[0], by = b[1], bz = b[2];
  out[0] = ay * bz - az * by;
  out[1] = az * bx - ax * bz;
  out[2] = ax * by - ay * bx;
  return out;
}
function lerp(out, a, b, t) {
  var ax = a[0];
  var ay = a[1];
  var az = a[2];
  out[0] = ax + t * (b[0] - ax);
  out[1] = ay + t * (b[1] - ay);
  out[2] = az + t * (b[2] - az);
  return out;
}
function slerp(out, a, b, t) {
  var angle2 = Math.acos(Math.min(Math.max(dot(a, b), -1), 1));
  var sinTotal = Math.sin(angle2);
  var ratioA = Math.sin((1 - t) * angle2) / sinTotal;
  var ratioB = Math.sin(t * angle2) / sinTotal;
  out[0] = ratioA * a[0] + ratioB * b[0];
  out[1] = ratioA * a[1] + ratioB * b[1];
  out[2] = ratioA * a[2] + ratioB * b[2];
  return out;
}
function hermite(out, a, b, c, d, t) {
  var factorTimes2 = t * t;
  var factor1 = factorTimes2 * (2 * t - 3) + 1;
  var factor2 = factorTimes2 * (t - 2) + t;
  var factor3 = factorTimes2 * (t - 1);
  var factor4 = factorTimes2 * (3 - 2 * t);
  out[0] = a[0] * factor1 + b[0] * factor2 + c[0] * factor3 + d[0] * factor4;
  out[1] = a[1] * factor1 + b[1] * factor2 + c[1] * factor3 + d[1] * factor4;
  out[2] = a[2] * factor1 + b[2] * factor2 + c[2] * factor3 + d[2] * factor4;
  return out;
}
function bezier(out, a, b, c, d, t) {
  var inverseFactor = 1 - t;
  var inverseFactorTimesTwo = inverseFactor * inverseFactor;
  var factorTimes2 = t * t;
  var factor1 = inverseFactorTimesTwo * inverseFactor;
  var factor2 = 3 * t * inverseFactorTimesTwo;
  var factor3 = 3 * factorTimes2 * inverseFactor;
  var factor4 = factorTimes2 * t;
  out[0] = a[0] * factor1 + b[0] * factor2 + c[0] * factor3 + d[0] * factor4;
  out[1] = a[1] * factor1 + b[1] * factor2 + c[1] * factor3 + d[1] * factor4;
  out[2] = a[2] * factor1 + b[2] * factor2 + c[2] * factor3 + d[2] * factor4;
  return out;
}
function random(out, scale6) {
  scale6 = scale6 === void 0 ? 1 : scale6;
  var r = RANDOM() * 2 * Math.PI;
  var z = RANDOM() * 2 - 1;
  var zScale = Math.sqrt(1 - z * z) * scale6;
  out[0] = Math.cos(r) * zScale;
  out[1] = Math.sin(r) * zScale;
  out[2] = z * scale6;
  return out;
}
function transformMat4(out, a, m) {
  var x = a[0], y = a[1], z = a[2];
  var w = m[3] * x + m[7] * y + m[11] * z + m[15];
  w = w || 1;
  out[0] = (m[0] * x + m[4] * y + m[8] * z + m[12]) / w;
  out[1] = (m[1] * x + m[5] * y + m[9] * z + m[13]) / w;
  out[2] = (m[2] * x + m[6] * y + m[10] * z + m[14]) / w;
  return out;
}
function transformMat3(out, a, m) {
  var x = a[0], y = a[1], z = a[2];
  out[0] = x * m[0] + y * m[3] + z * m[6];
  out[1] = x * m[1] + y * m[4] + z * m[7];
  out[2] = x * m[2] + y * m[5] + z * m[8];
  return out;
}
function transformQuat(out, a, q) {
  var qx = q[0], qy = q[1], qz = q[2], qw = q[3];
  var vx = a[0], vy = a[1], vz = a[2];
  var tx = qy * vz - qz * vy;
  var ty = qz * vx - qx * vz;
  var tz = qx * vy - qy * vx;
  tx = tx + tx;
  ty = ty + ty;
  tz = tz + tz;
  out[0] = vx + qw * tx + qy * tz - qz * ty;
  out[1] = vy + qw * ty + qz * tx - qx * tz;
  out[2] = vz + qw * tz + qx * ty - qy * tx;
  return out;
}
function rotateX2(out, a, b, rad) {
  var p = [], r = [];
  p[0] = a[0] - b[0];
  p[1] = a[1] - b[1];
  p[2] = a[2] - b[2];
  r[0] = p[0];
  r[1] = p[1] * Math.cos(rad) - p[2] * Math.sin(rad);
  r[2] = p[1] * Math.sin(rad) + p[2] * Math.cos(rad);
  out[0] = r[0] + b[0];
  out[1] = r[1] + b[1];
  out[2] = r[2] + b[2];
  return out;
}
function rotateY2(out, a, b, rad) {
  var p = [], r = [];
  p[0] = a[0] - b[0];
  p[1] = a[1] - b[1];
  p[2] = a[2] - b[2];
  r[0] = p[2] * Math.sin(rad) + p[0] * Math.cos(rad);
  r[1] = p[1];
  r[2] = p[2] * Math.cos(rad) - p[0] * Math.sin(rad);
  out[0] = r[0] + b[0];
  out[1] = r[1] + b[1];
  out[2] = r[2] + b[2];
  return out;
}
function rotateZ2(out, a, b, rad) {
  var p = [], r = [];
  p[0] = a[0] - b[0];
  p[1] = a[1] - b[1];
  p[2] = a[2] - b[2];
  r[0] = p[0] * Math.cos(rad) - p[1] * Math.sin(rad);
  r[1] = p[0] * Math.sin(rad) + p[1] * Math.cos(rad);
  r[2] = p[2];
  out[0] = r[0] + b[0];
  out[1] = r[1] + b[1];
  out[2] = r[2] + b[2];
  return out;
}
function angle(a, b) {
  var ax = a[0], ay = a[1], az = a[2], bx = b[0], by = b[1], bz = b[2], mag = Math.sqrt((ax * ax + ay * ay + az * az) * (bx * bx + by * by + bz * bz)), cosine = mag && dot(a, b) / mag;
  return Math.acos(Math.min(Math.max(cosine, -1), 1));
}
function zero(out) {
  out[0] = 0;
  out[1] = 0;
  out[2] = 0;
  return out;
}
function str2(a) {
  return "vec3(" + a[0] + ", " + a[1] + ", " + a[2] + ")";
}
function exactEquals2(a, b) {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
}
function equals2(a, b) {
  var a0 = a[0], a1 = a[1], a2 = a[2];
  var b0 = b[0], b1 = b[1], b2 = b[2];
  return Math.abs(a0 - b0) <= EPSILON * Math.max(1, Math.abs(a0), Math.abs(b0)) && Math.abs(a1 - b1) <= EPSILON * Math.max(1, Math.abs(a1), Math.abs(b1)) && Math.abs(a2 - b2) <= EPSILON * Math.max(1, Math.abs(a2), Math.abs(b2));
}
var sub2 = subtract2;
var mul2 = multiply2;
var div = divide;
var dist = distance;
var sqrDist = squaredDistance;
var len = length;
var sqrLen = squaredLength;
var forEach = function() {
  var vec = create3();
  return function(a, stride, offset2, count, fn, arg) {
    var i, l;
    if (!stride) {
      stride = 3;
    }
    if (!offset2) {
      offset2 = 0;
    }
    if (count) {
      l = Math.min(count * stride + offset2, a.length);
    } else {
      l = a.length;
    }
    for (i = offset2; i < l; i += stride) {
      vec[0] = a[i];
      vec[1] = a[i + 1];
      vec[2] = a[i + 2];
      fn(vec, vec, arg);
      a[i] = vec[0];
      a[i + 1] = vec[1];
      a[i + 2] = vec[2];
    }
    return a;
  };
}();

// node_modules/gl-matrix/esm/vec4.js
function create4() {
  var out = new ARRAY_TYPE(4);
  if (ARRAY_TYPE != Float32Array) {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
  }
  return out;
}
function clone3(a) {
  var out = new ARRAY_TYPE(4);
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  return out;
}
function fromValues3(x, y, z, w) {
  var out = new ARRAY_TYPE(4);
  out[0] = x;
  out[1] = y;
  out[2] = z;
  out[3] = w;
  return out;
}
function copy3(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  return out;
}
function set3(out, x, y, z, w) {
  out[0] = x;
  out[1] = y;
  out[2] = z;
  out[3] = w;
  return out;
}
function add3(out, a, b) {
  out[0] = a[0] + b[0];
  out[1] = a[1] + b[1];
  out[2] = a[2] + b[2];
  out[3] = a[3] + b[3];
  return out;
}
function scale3(out, a, b) {
  out[0] = a[0] * b;
  out[1] = a[1] * b;
  out[2] = a[2] * b;
  out[3] = a[3] * b;
  return out;
}
function length2(a) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  var w = a[3];
  return Math.sqrt(x * x + y * y + z * z + w * w);
}
function squaredLength2(a) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  var w = a[3];
  return x * x + y * y + z * z + w * w;
}
function normalize2(out, a) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  var w = a[3];
  var len4 = x * x + y * y + z * z + w * w;
  if (len4 > 0) {
    len4 = 1 / Math.sqrt(len4);
  }
  out[0] = x * len4;
  out[1] = y * len4;
  out[2] = z * len4;
  out[3] = w * len4;
  return out;
}
function dot2(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
}
function lerp2(out, a, b, t) {
  var ax = a[0];
  var ay = a[1];
  var az = a[2];
  var aw = a[3];
  out[0] = ax + t * (b[0] - ax);
  out[1] = ay + t * (b[1] - ay);
  out[2] = az + t * (b[2] - az);
  out[3] = aw + t * (b[3] - aw);
  return out;
}
function exactEquals3(a, b) {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
}
var forEach2 = function() {
  var vec = create4();
  return function(a, stride, offset2, count, fn, arg) {
    var i, l;
    if (!stride) {
      stride = 4;
    }
    if (!offset2) {
      offset2 = 0;
    }
    if (count) {
      l = Math.min(count * stride + offset2, a.length);
    } else {
      l = a.length;
    }
    for (i = offset2; i < l; i += stride) {
      vec[0] = a[i];
      vec[1] = a[i + 1];
      vec[2] = a[i + 2];
      vec[3] = a[i + 3];
      fn(vec, vec, arg);
      a[i] = vec[0];
      a[i + 1] = vec[1];
      a[i + 2] = vec[2];
      a[i + 3] = vec[3];
    }
    return a;
  };
}();

// node_modules/gl-matrix/esm/quat.js
function create5() {
  var out = new ARRAY_TYPE(4);
  if (ARRAY_TYPE != Float32Array) {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
  }
  out[3] = 1;
  return out;
}
function identity2(out) {
  out[0] = 0;
  out[1] = 0;
  out[2] = 0;
  out[3] = 1;
  return out;
}
function setAxisAngle(out, axis, rad) {
  rad = rad * 0.5;
  var s = Math.sin(rad);
  out[0] = s * axis[0];
  out[1] = s * axis[1];
  out[2] = s * axis[2];
  out[3] = Math.cos(rad);
  return out;
}
function getAxisAngle(out_axis, q) {
  var rad = Math.acos(q[3]) * 2;
  var s = Math.sin(rad / 2);
  if (s > EPSILON) {
    out_axis[0] = q[0] / s;
    out_axis[1] = q[1] / s;
    out_axis[2] = q[2] / s;
  } else {
    out_axis[0] = 1;
    out_axis[1] = 0;
    out_axis[2] = 0;
  }
  return rad;
}
function getAngle(a, b) {
  var dotproduct = dot3(a, b);
  return Math.acos(2 * dotproduct * dotproduct - 1);
}
function multiply3(out, a, b) {
  var ax = a[0], ay = a[1], az = a[2], aw = a[3];
  var bx = b[0], by = b[1], bz = b[2], bw = b[3];
  out[0] = ax * bw + aw * bx + ay * bz - az * by;
  out[1] = ay * bw + aw * by + az * bx - ax * bz;
  out[2] = az * bw + aw * bz + ax * by - ay * bx;
  out[3] = aw * bw - ax * bx - ay * by - az * bz;
  return out;
}
function rotateX3(out, a, rad) {
  rad *= 0.5;
  var ax = a[0], ay = a[1], az = a[2], aw = a[3];
  var bx = Math.sin(rad), bw = Math.cos(rad);
  out[0] = ax * bw + aw * bx;
  out[1] = ay * bw + az * bx;
  out[2] = az * bw - ay * bx;
  out[3] = aw * bw - ax * bx;
  return out;
}
function rotateY3(out, a, rad) {
  rad *= 0.5;
  var ax = a[0], ay = a[1], az = a[2], aw = a[3];
  var by = Math.sin(rad), bw = Math.cos(rad);
  out[0] = ax * bw - az * by;
  out[1] = ay * bw + aw * by;
  out[2] = az * bw + ax * by;
  out[3] = aw * bw - ay * by;
  return out;
}
function rotateZ3(out, a, rad) {
  rad *= 0.5;
  var ax = a[0], ay = a[1], az = a[2], aw = a[3];
  var bz = Math.sin(rad), bw = Math.cos(rad);
  out[0] = ax * bw + ay * bz;
  out[1] = ay * bw - ax * bz;
  out[2] = az * bw + aw * bz;
  out[3] = aw * bw - az * bz;
  return out;
}
function calculateW(out, a) {
  var x = a[0], y = a[1], z = a[2];
  out[0] = x;
  out[1] = y;
  out[2] = z;
  out[3] = Math.sqrt(Math.abs(1 - x * x - y * y - z * z));
  return out;
}
function exp(out, a) {
  var x = a[0], y = a[1], z = a[2], w = a[3];
  var r = Math.sqrt(x * x + y * y + z * z);
  var et = Math.exp(w);
  var s = r > 0 ? et * Math.sin(r) / r : 0;
  out[0] = x * s;
  out[1] = y * s;
  out[2] = z * s;
  out[3] = et * Math.cos(r);
  return out;
}
function ln(out, a) {
  var x = a[0], y = a[1], z = a[2], w = a[3];
  var r = Math.sqrt(x * x + y * y + z * z);
  var t = r > 0 ? Math.atan2(r, w) / r : 0;
  out[0] = x * t;
  out[1] = y * t;
  out[2] = z * t;
  out[3] = 0.5 * Math.log(x * x + y * y + z * z + w * w);
  return out;
}
function pow(out, a, b) {
  ln(out, a);
  scale4(out, out, b);
  exp(out, out);
  return out;
}
function slerp2(out, a, b, t) {
  var ax = a[0], ay = a[1], az = a[2], aw = a[3];
  var bx = b[0], by = b[1], bz = b[2], bw = b[3];
  var omega, cosom, sinom, scale0, scale1;
  cosom = ax * bx + ay * by + az * bz + aw * bw;
  if (cosom < 0) {
    cosom = -cosom;
    bx = -bx;
    by = -by;
    bz = -bz;
    bw = -bw;
  }
  if (1 - cosom > EPSILON) {
    omega = Math.acos(cosom);
    sinom = Math.sin(omega);
    scale0 = Math.sin((1 - t) * omega) / sinom;
    scale1 = Math.sin(t * omega) / sinom;
  } else {
    scale0 = 1 - t;
    scale1 = t;
  }
  out[0] = scale0 * ax + scale1 * bx;
  out[1] = scale0 * ay + scale1 * by;
  out[2] = scale0 * az + scale1 * bz;
  out[3] = scale0 * aw + scale1 * bw;
  return out;
}
function random2(out) {
  var u1 = RANDOM();
  var u2 = RANDOM();
  var u3 = RANDOM();
  var sqrt1MinusU1 = Math.sqrt(1 - u1);
  var sqrtU1 = Math.sqrt(u1);
  out[0] = sqrt1MinusU1 * Math.sin(2 * Math.PI * u2);
  out[1] = sqrt1MinusU1 * Math.cos(2 * Math.PI * u2);
  out[2] = sqrtU1 * Math.sin(2 * Math.PI * u3);
  out[3] = sqrtU1 * Math.cos(2 * Math.PI * u3);
  return out;
}
function invert2(out, a) {
  var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3];
  var dot5 = a0 * a0 + a1 * a1 + a2 * a2 + a3 * a3;
  var invDot = dot5 ? 1 / dot5 : 0;
  out[0] = -a0 * invDot;
  out[1] = -a1 * invDot;
  out[2] = -a2 * invDot;
  out[3] = a3 * invDot;
  return out;
}
function conjugate(out, a) {
  out[0] = -a[0];
  out[1] = -a[1];
  out[2] = -a[2];
  out[3] = a[3];
  return out;
}
function fromMat3(out, m) {
  var fTrace = m[0] + m[4] + m[8];
  var fRoot;
  if (fTrace > 0) {
    fRoot = Math.sqrt(fTrace + 1);
    out[3] = 0.5 * fRoot;
    fRoot = 0.5 / fRoot;
    out[0] = (m[5] - m[7]) * fRoot;
    out[1] = (m[6] - m[2]) * fRoot;
    out[2] = (m[1] - m[3]) * fRoot;
  } else {
    var i = 0;
    if (m[4] > m[0])
      i = 1;
    if (m[8] > m[i * 3 + i])
      i = 2;
    var j = (i + 1) % 3;
    var k = (i + 2) % 3;
    fRoot = Math.sqrt(m[i * 3 + i] - m[j * 3 + j] - m[k * 3 + k] + 1);
    out[i] = 0.5 * fRoot;
    fRoot = 0.5 / fRoot;
    out[3] = (m[j * 3 + k] - m[k * 3 + j]) * fRoot;
    out[j] = (m[j * 3 + i] + m[i * 3 + j]) * fRoot;
    out[k] = (m[k * 3 + i] + m[i * 3 + k]) * fRoot;
  }
  return out;
}
function fromEuler(out, x, y, z) {
  var order = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : ANGLE_ORDER;
  var halfToRad = Math.PI / 360;
  x *= halfToRad;
  z *= halfToRad;
  y *= halfToRad;
  var sx = Math.sin(x);
  var cx = Math.cos(x);
  var sy = Math.sin(y);
  var cy = Math.cos(y);
  var sz = Math.sin(z);
  var cz = Math.cos(z);
  switch (order) {
    case "xyz":
      out[0] = sx * cy * cz + cx * sy * sz;
      out[1] = cx * sy * cz - sx * cy * sz;
      out[2] = cx * cy * sz + sx * sy * cz;
      out[3] = cx * cy * cz - sx * sy * sz;
      break;
    case "xzy":
      out[0] = sx * cy * cz - cx * sy * sz;
      out[1] = cx * sy * cz - sx * cy * sz;
      out[2] = cx * cy * sz + sx * sy * cz;
      out[3] = cx * cy * cz + sx * sy * sz;
      break;
    case "yxz":
      out[0] = sx * cy * cz + cx * sy * sz;
      out[1] = cx * sy * cz - sx * cy * sz;
      out[2] = cx * cy * sz - sx * sy * cz;
      out[3] = cx * cy * cz + sx * sy * sz;
      break;
    case "yzx":
      out[0] = sx * cy * cz + cx * sy * sz;
      out[1] = cx * sy * cz + sx * cy * sz;
      out[2] = cx * cy * sz - sx * sy * cz;
      out[3] = cx * cy * cz - sx * sy * sz;
      break;
    case "zxy":
      out[0] = sx * cy * cz - cx * sy * sz;
      out[1] = cx * sy * cz + sx * cy * sz;
      out[2] = cx * cy * sz + sx * sy * cz;
      out[3] = cx * cy * cz - sx * sy * sz;
      break;
    case "zyx":
      out[0] = sx * cy * cz - cx * sy * sz;
      out[1] = cx * sy * cz + sx * cy * sz;
      out[2] = cx * cy * sz - sx * sy * cz;
      out[3] = cx * cy * cz + sx * sy * sz;
      break;
    default:
      throw new Error("Unknown angle order " + order);
  }
  return out;
}
function str3(a) {
  return "quat(" + a[0] + ", " + a[1] + ", " + a[2] + ", " + a[3] + ")";
}
var clone4 = clone3;
var fromValues4 = fromValues3;
var copy4 = copy3;
var set4 = set3;
var add4 = add3;
var mul3 = multiply3;
var scale4 = scale3;
var dot3 = dot2;
var lerp3 = lerp2;
var length3 = length2;
var len2 = length3;
var squaredLength3 = squaredLength2;
var sqrLen2 = squaredLength3;
var normalize3 = normalize2;
var exactEquals4 = exactEquals3;
function equals3(a, b) {
  return Math.abs(dot2(a, b)) >= 1 - EPSILON;
}
var rotationTo = function() {
  var tmpvec3 = create3();
  var xUnitVec3 = fromValues2(1, 0, 0);
  var yUnitVec3 = fromValues2(0, 1, 0);
  return function(out, a, b) {
    var dot5 = dot(a, b);
    if (dot5 < -0.999999) {
      cross(tmpvec3, xUnitVec3, a);
      if (len(tmpvec3) < 1e-6)
        cross(tmpvec3, yUnitVec3, a);
      normalize(tmpvec3, tmpvec3);
      setAxisAngle(out, tmpvec3, Math.PI);
      return out;
    } else if (dot5 > 0.999999) {
      out[0] = 0;
      out[1] = 0;
      out[2] = 0;
      out[3] = 1;
      return out;
    } else {
      cross(tmpvec3, a, b);
      out[0] = tmpvec3[0];
      out[1] = tmpvec3[1];
      out[2] = tmpvec3[2];
      out[3] = 1 + dot5;
      return normalize3(out, out);
    }
  };
}();
var sqlerp = function() {
  var temp1 = create5();
  var temp2 = create5();
  return function(out, a, b, c, d, t) {
    slerp2(temp1, a, d, t);
    slerp2(temp2, b, c, t);
    slerp2(out, temp1, temp2, 2 * t * (1 - t));
    return out;
  };
}();
var setAxes = function() {
  var matr = create();
  return function(out, view, right, up) {
    matr[0] = right[0];
    matr[3] = right[1];
    matr[6] = right[2];
    matr[1] = up[0];
    matr[4] = up[1];
    matr[7] = up[2];
    matr[2] = -view[0];
    matr[5] = -view[1];
    matr[8] = -view[2];
    return normalize3(out, fromMat3(out, matr));
  };
}();

// node_modules/gl-matrix/esm/quat2.js
var quat2_exports = {};
__export(quat2_exports, {
  add: () => add5,
  clone: () => clone5,
  conjugate: () => conjugate2,
  copy: () => copy5,
  create: () => create6,
  dot: () => dot4,
  equals: () => equals4,
  exactEquals: () => exactEquals5,
  fromMat4: () => fromMat4,
  fromRotation: () => fromRotation2,
  fromRotationTranslation: () => fromRotationTranslation2,
  fromRotationTranslationValues: () => fromRotationTranslationValues,
  fromTranslation: () => fromTranslation2,
  fromValues: () => fromValues5,
  getDual: () => getDual,
  getReal: () => getReal,
  getTranslation: () => getTranslation2,
  identity: () => identity3,
  invert: () => invert3,
  len: () => len3,
  length: () => length4,
  lerp: () => lerp4,
  mul: () => mul4,
  multiply: () => multiply4,
  normalize: () => normalize4,
  rotateAroundAxis: () => rotateAroundAxis,
  rotateByQuatAppend: () => rotateByQuatAppend,
  rotateByQuatPrepend: () => rotateByQuatPrepend,
  rotateX: () => rotateX4,
  rotateY: () => rotateY4,
  rotateZ: () => rotateZ4,
  scale: () => scale5,
  set: () => set5,
  setDual: () => setDual,
  setReal: () => setReal,
  sqrLen: () => sqrLen3,
  squaredLength: () => squaredLength4,
  str: () => str4,
  translate: () => translate2
});
function create6() {
  var dq = new ARRAY_TYPE(8);
  if (ARRAY_TYPE != Float32Array) {
    dq[0] = 0;
    dq[1] = 0;
    dq[2] = 0;
    dq[4] = 0;
    dq[5] = 0;
    dq[6] = 0;
    dq[7] = 0;
  }
  dq[3] = 1;
  return dq;
}
function clone5(a) {
  var dq = new ARRAY_TYPE(8);
  dq[0] = a[0];
  dq[1] = a[1];
  dq[2] = a[2];
  dq[3] = a[3];
  dq[4] = a[4];
  dq[5] = a[5];
  dq[6] = a[6];
  dq[7] = a[7];
  return dq;
}
function fromValues5(x1, y1, z1, w1, x2, y2, z2, w2) {
  var dq = new ARRAY_TYPE(8);
  dq[0] = x1;
  dq[1] = y1;
  dq[2] = z1;
  dq[3] = w1;
  dq[4] = x2;
  dq[5] = y2;
  dq[6] = z2;
  dq[7] = w2;
  return dq;
}
function fromRotationTranslationValues(x1, y1, z1, w1, x2, y2, z2) {
  var dq = new ARRAY_TYPE(8);
  dq[0] = x1;
  dq[1] = y1;
  dq[2] = z1;
  dq[3] = w1;
  var ax = x2 * 0.5, ay = y2 * 0.5, az = z2 * 0.5;
  dq[4] = ax * w1 + ay * z1 - az * y1;
  dq[5] = ay * w1 + az * x1 - ax * z1;
  dq[6] = az * w1 + ax * y1 - ay * x1;
  dq[7] = -ax * x1 - ay * y1 - az * z1;
  return dq;
}
function fromRotationTranslation2(out, q, t) {
  var ax = t[0] * 0.5, ay = t[1] * 0.5, az = t[2] * 0.5, bx = q[0], by = q[1], bz = q[2], bw = q[3];
  out[0] = bx;
  out[1] = by;
  out[2] = bz;
  out[3] = bw;
  out[4] = ax * bw + ay * bz - az * by;
  out[5] = ay * bw + az * bx - ax * bz;
  out[6] = az * bw + ax * by - ay * bx;
  out[7] = -ax * bx - ay * by - az * bz;
  return out;
}
function fromTranslation2(out, t) {
  out[0] = 0;
  out[1] = 0;
  out[2] = 0;
  out[3] = 1;
  out[4] = t[0] * 0.5;
  out[5] = t[1] * 0.5;
  out[6] = t[2] * 0.5;
  out[7] = 0;
  return out;
}
function fromRotation2(out, q) {
  out[0] = q[0];
  out[1] = q[1];
  out[2] = q[2];
  out[3] = q[3];
  out[4] = 0;
  out[5] = 0;
  out[6] = 0;
  out[7] = 0;
  return out;
}
function fromMat4(out, a) {
  var outer = create5();
  getRotation(outer, a);
  var t = new ARRAY_TYPE(3);
  getTranslation(t, a);
  fromRotationTranslation2(out, outer, t);
  return out;
}
function copy5(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  out[4] = a[4];
  out[5] = a[5];
  out[6] = a[6];
  out[7] = a[7];
  return out;
}
function identity3(out) {
  out[0] = 0;
  out[1] = 0;
  out[2] = 0;
  out[3] = 1;
  out[4] = 0;
  out[5] = 0;
  out[6] = 0;
  out[7] = 0;
  return out;
}
function set5(out, x1, y1, z1, w1, x2, y2, z2, w2) {
  out[0] = x1;
  out[1] = y1;
  out[2] = z1;
  out[3] = w1;
  out[4] = x2;
  out[5] = y2;
  out[6] = z2;
  out[7] = w2;
  return out;
}
var getReal = copy4;
function getDual(out, a) {
  out[0] = a[4];
  out[1] = a[5];
  out[2] = a[6];
  out[3] = a[7];
  return out;
}
var setReal = copy4;
function setDual(out, q) {
  out[4] = q[0];
  out[5] = q[1];
  out[6] = q[2];
  out[7] = q[3];
  return out;
}
function getTranslation2(out, a) {
  var ax = a[4], ay = a[5], az = a[6], aw = a[7], bx = -a[0], by = -a[1], bz = -a[2], bw = a[3];
  out[0] = (ax * bw + aw * bx + ay * bz - az * by) * 2;
  out[1] = (ay * bw + aw * by + az * bx - ax * bz) * 2;
  out[2] = (az * bw + aw * bz + ax * by - ay * bx) * 2;
  return out;
}
function translate2(out, a, v) {
  var ax1 = a[0], ay1 = a[1], az1 = a[2], aw1 = a[3], bx1 = v[0] * 0.5, by1 = v[1] * 0.5, bz1 = v[2] * 0.5, ax2 = a[4], ay2 = a[5], az2 = a[6], aw2 = a[7];
  out[0] = ax1;
  out[1] = ay1;
  out[2] = az1;
  out[3] = aw1;
  out[4] = aw1 * bx1 + ay1 * bz1 - az1 * by1 + ax2;
  out[5] = aw1 * by1 + az1 * bx1 - ax1 * bz1 + ay2;
  out[6] = aw1 * bz1 + ax1 * by1 - ay1 * bx1 + az2;
  out[7] = -ax1 * bx1 - ay1 * by1 - az1 * bz1 + aw2;
  return out;
}
function rotateX4(out, a, rad) {
  var bx = -a[0], by = -a[1], bz = -a[2], bw = a[3], ax = a[4], ay = a[5], az = a[6], aw = a[7], ax1 = ax * bw + aw * bx + ay * bz - az * by, ay1 = ay * bw + aw * by + az * bx - ax * bz, az1 = az * bw + aw * bz + ax * by - ay * bx, aw1 = aw * bw - ax * bx - ay * by - az * bz;
  rotateX3(out, a, rad);
  bx = out[0];
  by = out[1];
  bz = out[2];
  bw = out[3];
  out[4] = ax1 * bw + aw1 * bx + ay1 * bz - az1 * by;
  out[5] = ay1 * bw + aw1 * by + az1 * bx - ax1 * bz;
  out[6] = az1 * bw + aw1 * bz + ax1 * by - ay1 * bx;
  out[7] = aw1 * bw - ax1 * bx - ay1 * by - az1 * bz;
  return out;
}
function rotateY4(out, a, rad) {
  var bx = -a[0], by = -a[1], bz = -a[2], bw = a[3], ax = a[4], ay = a[5], az = a[6], aw = a[7], ax1 = ax * bw + aw * bx + ay * bz - az * by, ay1 = ay * bw + aw * by + az * bx - ax * bz, az1 = az * bw + aw * bz + ax * by - ay * bx, aw1 = aw * bw - ax * bx - ay * by - az * bz;
  rotateY3(out, a, rad);
  bx = out[0];
  by = out[1];
  bz = out[2];
  bw = out[3];
  out[4] = ax1 * bw + aw1 * bx + ay1 * bz - az1 * by;
  out[5] = ay1 * bw + aw1 * by + az1 * bx - ax1 * bz;
  out[6] = az1 * bw + aw1 * bz + ax1 * by - ay1 * bx;
  out[7] = aw1 * bw - ax1 * bx - ay1 * by - az1 * bz;
  return out;
}
function rotateZ4(out, a, rad) {
  var bx = -a[0], by = -a[1], bz = -a[2], bw = a[3], ax = a[4], ay = a[5], az = a[6], aw = a[7], ax1 = ax * bw + aw * bx + ay * bz - az * by, ay1 = ay * bw + aw * by + az * bx - ax * bz, az1 = az * bw + aw * bz + ax * by - ay * bx, aw1 = aw * bw - ax * bx - ay * by - az * bz;
  rotateZ3(out, a, rad);
  bx = out[0];
  by = out[1];
  bz = out[2];
  bw = out[3];
  out[4] = ax1 * bw + aw1 * bx + ay1 * bz - az1 * by;
  out[5] = ay1 * bw + aw1 * by + az1 * bx - ax1 * bz;
  out[6] = az1 * bw + aw1 * bz + ax1 * by - ay1 * bx;
  out[7] = aw1 * bw - ax1 * bx - ay1 * by - az1 * bz;
  return out;
}
function rotateByQuatAppend(out, a, q) {
  var qx = q[0], qy = q[1], qz = q[2], qw = q[3], ax = a[0], ay = a[1], az = a[2], aw = a[3];
  out[0] = ax * qw + aw * qx + ay * qz - az * qy;
  out[1] = ay * qw + aw * qy + az * qx - ax * qz;
  out[2] = az * qw + aw * qz + ax * qy - ay * qx;
  out[3] = aw * qw - ax * qx - ay * qy - az * qz;
  ax = a[4];
  ay = a[5];
  az = a[6];
  aw = a[7];
  out[4] = ax * qw + aw * qx + ay * qz - az * qy;
  out[5] = ay * qw + aw * qy + az * qx - ax * qz;
  out[6] = az * qw + aw * qz + ax * qy - ay * qx;
  out[7] = aw * qw - ax * qx - ay * qy - az * qz;
  return out;
}
function rotateByQuatPrepend(out, q, a) {
  var qx = q[0], qy = q[1], qz = q[2], qw = q[3], bx = a[0], by = a[1], bz = a[2], bw = a[3];
  out[0] = qx * bw + qw * bx + qy * bz - qz * by;
  out[1] = qy * bw + qw * by + qz * bx - qx * bz;
  out[2] = qz * bw + qw * bz + qx * by - qy * bx;
  out[3] = qw * bw - qx * bx - qy * by - qz * bz;
  bx = a[4];
  by = a[5];
  bz = a[6];
  bw = a[7];
  out[4] = qx * bw + qw * bx + qy * bz - qz * by;
  out[5] = qy * bw + qw * by + qz * bx - qx * bz;
  out[6] = qz * bw + qw * bz + qx * by - qy * bx;
  out[7] = qw * bw - qx * bx - qy * by - qz * bz;
  return out;
}
function rotateAroundAxis(out, a, axis, rad) {
  if (Math.abs(rad) < EPSILON) {
    return copy5(out, a);
  }
  var axisLength = Math.sqrt(axis[0] * axis[0] + axis[1] * axis[1] + axis[2] * axis[2]);
  rad = rad * 0.5;
  var s = Math.sin(rad);
  var bx = s * axis[0] / axisLength;
  var by = s * axis[1] / axisLength;
  var bz = s * axis[2] / axisLength;
  var bw = Math.cos(rad);
  var ax1 = a[0], ay1 = a[1], az1 = a[2], aw1 = a[3];
  out[0] = ax1 * bw + aw1 * bx + ay1 * bz - az1 * by;
  out[1] = ay1 * bw + aw1 * by + az1 * bx - ax1 * bz;
  out[2] = az1 * bw + aw1 * bz + ax1 * by - ay1 * bx;
  out[3] = aw1 * bw - ax1 * bx - ay1 * by - az1 * bz;
  var ax = a[4], ay = a[5], az = a[6], aw = a[7];
  out[4] = ax * bw + aw * bx + ay * bz - az * by;
  out[5] = ay * bw + aw * by + az * bx - ax * bz;
  out[6] = az * bw + aw * bz + ax * by - ay * bx;
  out[7] = aw * bw - ax * bx - ay * by - az * bz;
  return out;
}
function add5(out, a, b) {
  out[0] = a[0] + b[0];
  out[1] = a[1] + b[1];
  out[2] = a[2] + b[2];
  out[3] = a[3] + b[3];
  out[4] = a[4] + b[4];
  out[5] = a[5] + b[5];
  out[6] = a[6] + b[6];
  out[7] = a[7] + b[7];
  return out;
}
function multiply4(out, a, b) {
  var ax0 = a[0], ay0 = a[1], az0 = a[2], aw0 = a[3], bx1 = b[4], by1 = b[5], bz1 = b[6], bw1 = b[7], ax1 = a[4], ay1 = a[5], az1 = a[6], aw1 = a[7], bx0 = b[0], by0 = b[1], bz0 = b[2], bw0 = b[3];
  out[0] = ax0 * bw0 + aw0 * bx0 + ay0 * bz0 - az0 * by0;
  out[1] = ay0 * bw0 + aw0 * by0 + az0 * bx0 - ax0 * bz0;
  out[2] = az0 * bw0 + aw0 * bz0 + ax0 * by0 - ay0 * bx0;
  out[3] = aw0 * bw0 - ax0 * bx0 - ay0 * by0 - az0 * bz0;
  out[4] = ax0 * bw1 + aw0 * bx1 + ay0 * bz1 - az0 * by1 + ax1 * bw0 + aw1 * bx0 + ay1 * bz0 - az1 * by0;
  out[5] = ay0 * bw1 + aw0 * by1 + az0 * bx1 - ax0 * bz1 + ay1 * bw0 + aw1 * by0 + az1 * bx0 - ax1 * bz0;
  out[6] = az0 * bw1 + aw0 * bz1 + ax0 * by1 - ay0 * bx1 + az1 * bw0 + aw1 * bz0 + ax1 * by0 - ay1 * bx0;
  out[7] = aw0 * bw1 - ax0 * bx1 - ay0 * by1 - az0 * bz1 + aw1 * bw0 - ax1 * bx0 - ay1 * by0 - az1 * bz0;
  return out;
}
var mul4 = multiply4;
function scale5(out, a, b) {
  out[0] = a[0] * b;
  out[1] = a[1] * b;
  out[2] = a[2] * b;
  out[3] = a[3] * b;
  out[4] = a[4] * b;
  out[5] = a[5] * b;
  out[6] = a[6] * b;
  out[7] = a[7] * b;
  return out;
}
var dot4 = dot3;
function lerp4(out, a, b, t) {
  var mt = 1 - t;
  if (dot4(a, b) < 0)
    t = -t;
  out[0] = a[0] * mt + b[0] * t;
  out[1] = a[1] * mt + b[1] * t;
  out[2] = a[2] * mt + b[2] * t;
  out[3] = a[3] * mt + b[3] * t;
  out[4] = a[4] * mt + b[4] * t;
  out[5] = a[5] * mt + b[5] * t;
  out[6] = a[6] * mt + b[6] * t;
  out[7] = a[7] * mt + b[7] * t;
  return out;
}
function invert3(out, a) {
  var sqlen = squaredLength4(a);
  out[0] = -a[0] / sqlen;
  out[1] = -a[1] / sqlen;
  out[2] = -a[2] / sqlen;
  out[3] = a[3] / sqlen;
  out[4] = -a[4] / sqlen;
  out[5] = -a[5] / sqlen;
  out[6] = -a[6] / sqlen;
  out[7] = a[7] / sqlen;
  return out;
}
function conjugate2(out, a) {
  out[0] = -a[0];
  out[1] = -a[1];
  out[2] = -a[2];
  out[3] = a[3];
  out[4] = -a[4];
  out[5] = -a[5];
  out[6] = -a[6];
  out[7] = a[7];
  return out;
}
var length4 = length3;
var len3 = length4;
var squaredLength4 = squaredLength3;
var sqrLen3 = squaredLength4;
function normalize4(out, a) {
  var magnitude = squaredLength4(a);
  if (magnitude > 0) {
    magnitude = Math.sqrt(magnitude);
    var a0 = a[0] / magnitude;
    var a1 = a[1] / magnitude;
    var a2 = a[2] / magnitude;
    var a3 = a[3] / magnitude;
    var b0 = a[4];
    var b1 = a[5];
    var b2 = a[6];
    var b3 = a[7];
    var a_dot_b = a0 * b0 + a1 * b1 + a2 * b2 + a3 * b3;
    out[0] = a0;
    out[1] = a1;
    out[2] = a2;
    out[3] = a3;
    out[4] = (b0 - a0 * a_dot_b) / magnitude;
    out[5] = (b1 - a1 * a_dot_b) / magnitude;
    out[6] = (b2 - a2 * a_dot_b) / magnitude;
    out[7] = (b3 - a3 * a_dot_b) / magnitude;
  }
  return out;
}
function str4(a) {
  return "quat2(" + a[0] + ", " + a[1] + ", " + a[2] + ", " + a[3] + ", " + a[4] + ", " + a[5] + ", " + a[6] + ", " + a[7] + ")";
}
function exactEquals5(a, b) {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3] && a[4] === b[4] && a[5] === b[5] && a[6] === b[6] && a[7] === b[7];
}
function equals4(a, b) {
  var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3], a4 = a[4], a5 = a[5], a6 = a[6], a7 = a[7];
  var b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3], b4 = b[4], b5 = b[5], b6 = b[6], b7 = b[7];
  return Math.abs(a0 - b0) <= EPSILON * Math.max(1, Math.abs(a0), Math.abs(b0)) && Math.abs(a1 - b1) <= EPSILON * Math.max(1, Math.abs(a1), Math.abs(b1)) && Math.abs(a2 - b2) <= EPSILON * Math.max(1, Math.abs(a2), Math.abs(b2)) && Math.abs(a3 - b3) <= EPSILON * Math.max(1, Math.abs(a3), Math.abs(b3)) && Math.abs(a4 - b4) <= EPSILON * Math.max(1, Math.abs(a4), Math.abs(b4)) && Math.abs(a5 - b5) <= EPSILON * Math.max(1, Math.abs(a5), Math.abs(b5)) && Math.abs(a6 - b6) <= EPSILON * Math.max(1, Math.abs(a6), Math.abs(b6)) && Math.abs(a7 - b7) <= EPSILON * Math.max(1, Math.abs(a7), Math.abs(b7));
}

// node_modules/@wonderlandengine/components/dist/hit-test-location.js
import { Component as Component4, Emitter as Emitter3 } from "@wonderlandengine/api";
import { property as property3 } from "@wonderlandengine/api/decorators.js";
var __decorate3 = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
    r = Reflect.decorate(decorators, target, key, desc);
  else
    for (var i = decorators.length - 1; i >= 0; i--)
      if (d = decorators[i])
        r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var HitTestLocation = class extends Component4 {
  tempScaling = new Float32Array(3);
  visible = false;
  xrHitTestSource = null;
  /** Reference space for creating the hit test when the session starts */
  xrReferenceSpace = null;
  /**
   * For maintaining backwards compatibility: Whether to scale the object to 0 and back.
   * @deprecated Use onHitLost and onHitFound instead.
   */
  scaleObject = true;
  /** Emits an event when the hit test switches from visible to invisible */
  onHitLost = new Emitter3();
  /** Emits an event when the hit test switches from invisible to visible */
  onHitFound = new Emitter3();
  onSessionStartCallback = null;
  onSessionEndCallback = null;
  start() {
    this.onSessionStartCallback = this.onXRSessionStart.bind(this);
    this.onSessionEndCallback = this.onXRSessionEnd.bind(this);
    if (this.scaleObject) {
      this.tempScaling.set(this.object.scalingLocal);
      this.object.scale([0, 0, 0]);
      this.onHitLost.add(() => {
        this.tempScaling.set(this.object.scalingLocal);
        this.object.scale([0, 0, 0]);
      });
      this.onHitFound.add(() => {
        this.object.scalingLocal.set(this.tempScaling);
        this.object.setDirty();
      });
    }
  }
  onActivate() {
    this.engine.onXRSessionStart.add(this.onSessionStartCallback);
    this.engine.onXRSessionEnd.add(this.onSessionEndCallback);
  }
  onDeactivate() {
    this.engine.onXRSessionStart.remove(this.onSessionStartCallback);
    this.engine.onXRSessionEnd.remove(this.onSessionEndCallback);
  }
  update() {
    const wasVisible = this.visible;
    if (this.xrHitTestSource) {
      const frame = this.engine.xrFrame;
      if (!frame)
        return;
      let hitTestResults = frame.getHitTestResults(this.xrHitTestSource);
      if (hitTestResults.length > 0) {
        let pose = hitTestResults[0].getPose(this.engine.xr.currentReferenceSpace);
        this.visible = !!pose;
        if (pose) {
          setXRRigidTransformLocal(this.object, pose.transform);
        }
      } else {
        this.visible = false;
      }
    }
    if (this.visible != wasVisible) {
      (this.visible ? this.onHitFound : this.onHitLost).notify(this);
    }
  }
  getHitTestResults(frame = this.engine.xr?.frame ?? null) {
    if (!frame)
      return [];
    if (!this.xrHitTestSource)
      return [];
    return frame.getHitTestResults(this.xrHitTestSource);
  }
  onXRSessionStart(session) {
    if (session.requestHitTestSource === void 0) {
      console.error("hit-test-location: hit test feature not available. Deactivating component.");
      this.active = false;
      return;
    }
    session.requestHitTestSource({
      space: this.xrReferenceSpace ?? this.engine.xr.referenceSpaceForType("viewer")
    }).then((hitTestSource) => {
      this.xrHitTestSource = hitTestSource;
    }).catch(console.error);
  }
  onXRSessionEnd() {
    if (!this.xrHitTestSource)
      return;
    this.xrHitTestSource.cancel();
    this.xrHitTestSource = null;
  }
};
__publicField(HitTestLocation, "TypeName", "hit-test-location");
__decorate3([
  property3.bool(true)
], HitTestLocation.prototype, "scaleObject", void 0);

// node_modules/@wonderlandengine/components/dist/cursor.js
var __decorate4 = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
    r = Reflect.decorate(decorators, target, key, desc);
  else
    for (var i = decorators.length - 1; i >= 0; i--)
      if (d = decorators[i])
        r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var tempVec2 = new Float32Array(3);
var ZERO = [0, 0, 0];
var CursorTargetEmitters = class {
  /** Emitter for events when the target is hovered */
  onHover = new Emitter4();
  /** Emitter for events when the target is unhovered */
  onUnhover = new Emitter4();
  /** Emitter for events when the target is clicked */
  onClick = new Emitter4();
  /** Emitter for events when the cursor moves on the target */
  onMove = new Emitter4();
  /** Emitter for events when the user pressed the select button on the target */
  onDown = new Emitter4();
  /** Emitter for events when the user unpressed the select button on the target */
  onUp = new Emitter4();
};
var Cursor = class extends Component5 {
  static onRegister(engine) {
    engine.registerComponent(HitTestLocation);
  }
  _collisionMask = 0;
  _onDeactivateCallbacks = [];
  _input = null;
  _origin = new Float32Array(3);
  _cursorObjScale = new Float32Array(3);
  _direction = new Float32Array(3);
  _projectionMatrix = new Float32Array(16);
  _viewComponent = null;
  _isDown = false;
  _lastIsDown = false;
  _arTouchDown = false;
  _lastPointerPos = new Float32Array(2);
  _lastCursorPosOnTarget = new Float32Array(3);
  _hitTestLocation = null;
  _hitTestObject = null;
  _onSessionStartCallback = null;
  /**
   * Whether the cursor (and cursorObject) is visible, i.e. pointing at an object
   * that matches the collision group
   */
  visible = true;
  /** Currently hovered object */
  hoveringObject = null;
  /** CursorTarget component of the currently hovered object */
  hoveringObjectTarget = null;
  /** Whether the cursor is hovering reality via hit-test */
  hoveringReality = false;
  /**
   * Global target lets you receive global cursor events on any object.
   */
  globalTarget = new CursorTargetEmitters();
  /**
   * Hit test target lets you receive cursor events for "reality", if
   * `useWebXRHitTest` is set to `true`.
   *
   * @example
   * ```js
   * cursor.hitTestTarget.onClick.add((hit, cursor) => {
   *     // User clicked on reality
   * });
   * ```
   */
  hitTestTarget = new CursorTargetEmitters();
  /** World position of the cursor */
  cursorPos = new Float32Array(3);
  /** Collision group for the ray cast. Only objects in this group will be affected by this cursor. */
  collisionGroup = 1;
  /** (optional) Object that visualizes the cursor's ray. */
  cursorRayObject = null;
  /** Axis along which to scale the `cursorRayObject`. */
  cursorRayScalingAxis = 2;
  /** (optional) Object that visualizes the cursor's hit location. */
  cursorObject = null;
  /** Handedness for VR cursors to accept trigger events only from respective controller. */
  handedness = 0;
  /** Object that has an input component. */
  inputObject = null;
  /** Object that has a view component. */
  viewObject = null;
  /** Mode for raycasting, whether to use PhysX or simple collision components */
  rayCastMode = 0;
  /** Maximum distance for the cursor's ray cast. */
  maxDistance = 100;
  /** Whether to set the CSS style of the mouse cursor on desktop */
  styleCursor = true;
  /**
   * Use WebXR hit-test if available.
   *
   * Attaches a hit-test-location component to the cursorObject, which will be used
   * by the cursor to send events to the hitTestTarget with HitTestResult.
   */
  useWebXRHitTest = false;
  _onViewportResize = () => {
    if (!this._viewComponent)
      return;
    mat4_exports.invert(this._projectionMatrix, this._viewComponent.projectionMatrix);
  };
  start() {
    this._collisionMask = 1 << this.collisionGroup;
    if (this.handedness == 0) {
      const inputCompObj = this.inputObject || this.object;
      const inputComp = inputCompObj.getComponent(InputComponent);
      if (!inputComp) {
        console.warn("cursor component on object", this.object.name, 'was configured with handedness "input component", but object has no input component.');
      } else {
        this.handedness = inputComp.handedness || "none";
        this._input = inputComp;
      }
    } else {
      this.handedness = ["left", "right", "none"][this.handedness - 1];
    }
    const viewObject = this.viewObject || this.object;
    this._viewComponent = viewObject.getComponent(ViewComponent);
    if (this.useWebXRHitTest) {
      this._hitTestObject = this.engine.scene.addObject(this.object);
      this._hitTestLocation = this._hitTestObject.addComponent(HitTestLocation, {
        scaleObject: false
      }) ?? null;
    }
    this._onSessionStartCallback = this.setupVREvents.bind(this);
  }
  onActivate() {
    this.engine.onXRSessionStart.add(this._onSessionStartCallback);
    this.engine.onResize.add(this._onViewportResize);
    this._setCursorVisibility(true);
    if (this._viewComponent != null) {
      const canvas2 = this.engine.canvas;
      const onClick = this.onClick.bind(this);
      const onPointerMove = this.onPointerMove.bind(this);
      const onPointerDown = this.onPointerDown.bind(this);
      const onPointerUp = this.onPointerUp.bind(this);
      canvas2.addEventListener("click", onClick);
      canvas2.addEventListener("pointermove", onPointerMove);
      canvas2.addEventListener("pointerdown", onPointerDown);
      canvas2.addEventListener("pointerup", onPointerUp);
      this._onDeactivateCallbacks.push(() => {
        canvas2.removeEventListener("click", onClick);
        canvas2.removeEventListener("pointermove", onPointerMove);
        canvas2.removeEventListener("pointerdown", onPointerDown);
        canvas2.removeEventListener("pointerup", onPointerUp);
      });
    }
    this._onViewportResize();
  }
  _setCursorRayTransform(hitPosition) {
    if (!this.cursorRayObject)
      return;
    const dist2 = vec3_exports.dist(this._origin, hitPosition);
    this.cursorRayObject.setPositionLocal([0, 0, -dist2 / 2]);
    if (this.cursorRayScalingAxis != 4) {
      tempVec2.fill(1);
      tempVec2[this.cursorRayScalingAxis] = dist2 / 2;
      this.cursorRayObject.setScalingLocal(tempVec2);
    }
  }
  _setCursorVisibility(visible) {
    if (this.visible == visible)
      return;
    this.visible = visible;
    if (!this.cursorObject)
      return;
    if (visible) {
      this.cursorObject.setScalingWorld(this._cursorObjScale);
    } else {
      this.cursorObject.getScalingWorld(this._cursorObjScale);
      this.cursorObject.scaleLocal([0, 0, 0]);
    }
  }
  update() {
    if (this.engine.xr && this._arTouchDown && this._input && this.engine.xr.session.inputSources[0].handedness === "none" && this.engine.xr.session.inputSources[0].gamepad) {
      const p = this.engine.xr.session.inputSources[0].gamepad.axes;
      this._direction[0] = p[0];
      this._direction[1] = -p[1];
      this._direction[2] = -1;
      this.applyTransformAndProjectDirection();
    } else if (this.engine.xr && this._input && this._input.xrInputSource) {
      this._direction[0] = 0;
      this._direction[1] = 0;
      this._direction[2] = -1;
      this.applyTransformToDirection();
    } else if (this._viewComponent) {
      this.updateDirection();
    }
    this.rayCast(null, this.engine.xr?.frame);
    if (this.cursorObject) {
      if (this.hoveringObject && (this.cursorPos[0] != 0 || this.cursorPos[1] != 0 || this.cursorPos[2] != 0)) {
        this._setCursorVisibility(true);
        this.cursorObject.setPositionWorld(this.cursorPos);
        this._setCursorRayTransform(this.cursorPos);
      } else {
        this._setCursorVisibility(false);
      }
    }
  }
  /* Returns the hovered cursor target, if available */
  notify(event, originalEvent) {
    const target = this.hoveringObject;
    if (target) {
      const cursorTarget = this.hoveringObjectTarget;
      if (cursorTarget)
        cursorTarget[event].notify(target, this, originalEvent ?? void 0);
      this.globalTarget[event].notify(target, this, originalEvent ?? void 0);
    }
  }
  hoverBehaviour(rayHit, hitTestResult, doClick, originalEvent) {
    const hit = !this.hoveringReality && rayHit.hitCount > 0 ? rayHit.objects[0] : null;
    if (hit) {
      if (!this.hoveringObject || !this.hoveringObject.equals(hit)) {
        if (this.hoveringObject) {
          this.notify("onUnhover", originalEvent);
        }
        this.hoveringObject = hit;
        this.hoveringObjectTarget = this.hoveringObject.getComponent(CursorTarget);
        if (this.styleCursor)
          this.engine.canvas.style.cursor = "pointer";
        this.notify("onHover", originalEvent);
      }
    } else if (this.hoveringObject) {
      this.notify("onUnhover", originalEvent);
      this.hoveringObject = null;
      this.hoveringObjectTarget = null;
      if (this.styleCursor)
        this.engine.canvas.style.cursor = "default";
    }
    if (this.hoveringObject) {
      if (this._isDown !== this._lastIsDown) {
        this.notify(this._isDown ? "onDown" : "onUp", originalEvent);
      }
      if (doClick)
        this.notify("onClick", originalEvent);
    } else if (this.hoveringReality) {
      if (this._isDown !== this._lastIsDown) {
        (this._isDown ? this.hitTestTarget.onDown : this.hitTestTarget.onUp).notify(hitTestResult, this, originalEvent ?? void 0);
      }
      if (doClick)
        this.hitTestTarget.onClick.notify(hitTestResult, this, originalEvent ?? void 0);
    }
    if (hit) {
      if (this.hoveringObject) {
        this.hoveringObject.transformPointInverseWorld(tempVec2, this.cursorPos);
      } else {
        tempVec2.set(this.cursorPos);
      }
      if (!vec3_exports.equals(this._lastCursorPosOnTarget, tempVec2)) {
        this.notify("onMove", originalEvent);
        this._lastCursorPosOnTarget.set(tempVec2);
      }
    } else if (this.hoveringReality) {
      if (!vec3_exports.equals(this._lastCursorPosOnTarget, this.cursorPos)) {
        this.hitTestTarget.onMove.notify(hitTestResult, this, originalEvent ?? void 0);
        this._lastCursorPosOnTarget.set(this.cursorPos);
      }
    } else {
      this._lastCursorPosOnTarget.set(this.cursorPos);
    }
    this._lastIsDown = this._isDown;
  }
  /**
   * Setup event listeners on session object
   * @param s WebXR session
   *
   * Sets up 'select' and 'end' events.
   */
  setupVREvents(s) {
    if (!s)
      console.error("setupVREvents called without a valid session");
    if (!this.active)
      return;
    const onSelect = this.onSelect.bind(this);
    s.addEventListener("select", onSelect);
    const onSelectStart = this.onSelectStart.bind(this);
    s.addEventListener("selectstart", onSelectStart);
    const onSelectEnd = this.onSelectEnd.bind(this);
    s.addEventListener("selectend", onSelectEnd);
    this._onDeactivateCallbacks.push(() => {
      if (!this.engine.xr)
        return;
      s.removeEventListener("select", onSelect);
      s.removeEventListener("selectstart", onSelectStart);
      s.removeEventListener("selectend", onSelectEnd);
    });
    this._onViewportResize();
  }
  onDeactivate() {
    this.engine.onXRSessionStart.remove(this._onSessionStartCallback);
    this.engine.onResize.remove(this._onViewportResize);
    this._setCursorVisibility(false);
    if (this.hoveringObject)
      this.notify("onUnhover", null);
    if (this.cursorRayObject)
      this.cursorRayObject.setScalingLocal(ZERO);
    for (const f of this._onDeactivateCallbacks)
      f();
    this._onDeactivateCallbacks.length = 0;
  }
  onDestroy() {
    this._hitTestObject?.destroy();
  }
  /** 'select' event listener */
  onSelect(e) {
    if (e.inputSource.handedness != this.handedness)
      return;
    this.rayCast(e, e.frame, true);
  }
  /** 'selectstart' event listener */
  onSelectStart(e) {
    this._arTouchDown = true;
    if (e.inputSource.handedness == this.handedness) {
      this._isDown = true;
      this.rayCast(e, e.frame);
    }
  }
  /** 'selectend' event listener */
  onSelectEnd(e) {
    this._arTouchDown = false;
    if (e.inputSource.handedness == this.handedness) {
      this._isDown = false;
      this.rayCast(e, e.frame);
    }
  }
  /** 'pointermove' event listener */
  onPointerMove(e) {
    if (!e.isPrimary)
      return;
    this.updateMousePos(e);
    this.rayCast(e, null);
  }
  /** 'click' event listener */
  onClick(e) {
    this.updateMousePos(e);
    this.rayCast(e, null, true);
  }
  /** 'pointerdown' event listener */
  onPointerDown(e) {
    if (!e.isPrimary || e.button !== 0)
      return;
    this.updateMousePos(e);
    this._isDown = true;
    this.rayCast(e);
  }
  /** 'pointerup' event listener */
  onPointerUp(e) {
    if (!e.isPrimary || e.button !== 0)
      return;
    this.updateMousePos(e);
    this._isDown = false;
    this.rayCast(e);
  }
  /**
   * Update mouse position in non-VR mode and raycast for new position
   * @returns @ref RayHit for new position.
   */
  updateMousePos(e) {
    this._lastPointerPos[0] = e.clientX;
    this._lastPointerPos[1] = e.clientY;
    this.updateDirection();
  }
  updateDirection() {
    const bounds = this.engine.canvas.getBoundingClientRect();
    const left = this._lastPointerPos[0] / bounds.width;
    const top = this._lastPointerPos[1] / bounds.height;
    this._direction[0] = left * 2 - 1;
    this._direction[1] = -top * 2 + 1;
    this._direction[2] = -1;
    this.applyTransformAndProjectDirection();
  }
  applyTransformAndProjectDirection() {
    vec3_exports.transformMat4(this._direction, this._direction, this._projectionMatrix);
    vec3_exports.normalize(this._direction, this._direction);
    this.applyTransformToDirection();
  }
  applyTransformToDirection() {
    this.object.transformVectorWorld(this._direction, this._direction);
    this.object.getPositionWorld(this._origin);
  }
  rayCast(originalEvent, frame = null, doClick = false) {
    const rayHit = this.rayCastMode == 0 ? this.engine.scene.rayCast(this._origin, this._direction, this._collisionMask) : this.engine.physics.rayCast(this._origin, this._direction, this._collisionMask, this.maxDistance);
    let hitResultDistance = Infinity;
    let hitTestResult = null;
    if (this._hitTestLocation?.visible) {
      this._hitTestObject.getPositionWorld(this.cursorPos);
      hitResultDistance = vec3_exports.distance(this.object.getPositionWorld(tempVec2), this.cursorPos);
      hitTestResult = this._hitTestLocation?.getHitTestResults(frame)[0];
    }
    let hoveringReality = false;
    if (rayHit.hitCount > 0) {
      const d = rayHit.distances[0];
      if (hitResultDistance >= d) {
        this.cursorPos.set(rayHit.locations[0]);
      } else {
        hoveringReality = true;
      }
    } else if (hitResultDistance < Infinity) {
    } else {
      this.cursorPos.fill(0);
    }
    if (hoveringReality && !this.hoveringReality) {
      this.hitTestTarget.onHover.notify(hitTestResult, this);
    } else if (!hoveringReality && this.hoveringReality) {
      this.hitTestTarget.onUnhover.notify(hitTestResult, this);
    }
    this.hoveringReality = hoveringReality;
    this.hoverBehaviour(rayHit, hitTestResult, doClick, originalEvent);
    return rayHit;
  }
};
__publicField(Cursor, "TypeName", "cursor");
/* Dependencies is deprecated, but we keep it here for compatibility
 * with 1.0.0-rc2 until 1.0.0 is released */
__publicField(Cursor, "Dependencies", [HitTestLocation]);
__decorate4([
  property4.int(1)
], Cursor.prototype, "collisionGroup", void 0);
__decorate4([
  property4.object()
], Cursor.prototype, "cursorRayObject", void 0);
__decorate4([
  property4.enum(["x", "y", "z", "none"], "z")
], Cursor.prototype, "cursorRayScalingAxis", void 0);
__decorate4([
  property4.object()
], Cursor.prototype, "cursorObject", void 0);
__decorate4([
  property4.enum(["input component", "left", "right", "none"], "input component")
], Cursor.prototype, "handedness", void 0);
__decorate4([
  property4.object()
], Cursor.prototype, "inputObject", void 0);
__decorate4([
  property4.object()
], Cursor.prototype, "viewObject", void 0);
__decorate4([
  property4.enum(["collision", "physx"], "collision")
], Cursor.prototype, "rayCastMode", void 0);
__decorate4([
  property4.float(100)
], Cursor.prototype, "maxDistance", void 0);
__decorate4([
  property4.bool(true)
], Cursor.prototype, "styleCursor", void 0);
__decorate4([
  property4.bool(false)
], Cursor.prototype, "useWebXRHitTest", void 0);

// node_modules/@wonderlandengine/components/dist/debug-object.js
import { Component as Component6 } from "@wonderlandengine/api";
import { property as property5 } from "@wonderlandengine/api/decorators.js";
var __decorate5 = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
    r = Reflect.decorate(decorators, target, key, desc);
  else
    for (var i = decorators.length - 1; i >= 0; i--)
      if (d = decorators[i])
        r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var DebugObject = class extends Component6 {
  /** A second object to print the name of */
  obj = null;
  start() {
    let origin = new Float32Array(3);
    quat2_exports.getTranslation(origin, this.object.transformWorld);
    console.log("Debug object:", this.object.name);
    console.log("Other object:", this.obj?.name);
    console.log("	translation", origin);
    console.log("	transformWorld", this.object.transformWorld);
    console.log("	transformLocal", this.object.transformLocal);
  }
};
__publicField(DebugObject, "TypeName", "debug-object");
__decorate5([
  property5.object()
], DebugObject.prototype, "obj", void 0);

// node_modules/@wonderlandengine/components/dist/device-orientation-look.js
import { Component as Component7 } from "@wonderlandengine/api";

// node_modules/@wonderlandengine/components/dist/finger-cursor.js
import { CollisionComponent, Component as Component8 } from "@wonderlandengine/api";
var FingerCursor = class extends Component8 {
  lastTarget = null;
  tip;
  start() {
    const collisionComponent = this.object.getComponent(CollisionComponent);
    if (!collisionComponent) {
      throw new Error(`Finger-cursor component on object '${this.object.name}' requires a collision component to work properly.`);
    }
    this.tip = collisionComponent;
  }
  update() {
    const overlaps = this.tip.queryOverlaps();
    let overlapFound = null;
    for (let i = 0; i < overlaps.length; ++i) {
      const o = overlaps[i].object;
      const target = o.getComponent(CursorTarget);
      if (target) {
        if (!target.equals(this.lastTarget)) {
          target.onHover.notify(o, this);
          target.onClick.notify(o, this);
        }
        overlapFound = target;
        break;
      }
    }
    if (!overlapFound) {
      if (this.lastTarget)
        this.lastTarget.onUnhover.notify(this.lastTarget.object, this);
      this.lastTarget = null;
      return;
    } else {
      this.lastTarget = overlapFound;
    }
  }
};
__publicField(FingerCursor, "TypeName", "finger-cursor");

// node_modules/@wonderlandengine/components/dist/fixed-foveation.js
import { Component as Component9 } from "@wonderlandengine/api";
import { property as property6 } from "@wonderlandengine/api/decorators.js";
var __decorate6 = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
    r = Reflect.decorate(decorators, target, key, desc);
  else
    for (var i = decorators.length - 1; i >= 0; i--)
      if (d = decorators[i])
        r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var FixedFoveation = class extends Component9 {
  /** Amount to apply from 0 (none) to 1 (full) */
  fixedFoveation;
  onActivate() {
    this.engine.onXRSessionStart.add(this.setFixedFoveation);
  }
  onDeactivate() {
    this.engine.onXRSessionStart.remove(this.setFixedFoveation);
  }
  setFixedFoveation = () => {
    this.engine.xr.baseLayer.fixedFoveation = this.fixedFoveation;
  };
};
__publicField(FixedFoveation, "TypeName", "fixed-foveation");
__decorate6([
  property6.float(0.5)
], FixedFoveation.prototype, "fixedFoveation", void 0);

// node_modules/@wonderlandengine/components/dist/hand-tracking.js
import { Component as Component10, MeshComponent } from "@wonderlandengine/api";
import { property as property7 } from "@wonderlandengine/api/decorators.js";
var __decorate7 = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
    r = Reflect.decorate(decorators, target, key, desc);
  else
    for (var i = decorators.length - 1; i >= 0; i--)
      if (d = decorators[i])
        r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ORDERED_JOINTS = [
  "wrist",
  "thumb-metacarpal",
  "thumb-phalanx-proximal",
  "thumb-phalanx-distal",
  "thumb-tip",
  "index-finger-metacarpal",
  "index-finger-phalanx-proximal",
  "index-finger-phalanx-intermediate",
  "index-finger-phalanx-distal",
  "index-finger-tip",
  "middle-finger-metacarpal",
  "middle-finger-phalanx-proximal",
  "middle-finger-phalanx-intermediate",
  "middle-finger-phalanx-distal",
  "middle-finger-tip",
  "ring-finger-metacarpal",
  "ring-finger-phalanx-proximal",
  "ring-finger-phalanx-intermediate",
  "ring-finger-phalanx-distal",
  "ring-finger-tip",
  "pinky-finger-metacarpal",
  "pinky-finger-phalanx-proximal",
  "pinky-finger-phalanx-intermediate",
  "pinky-finger-phalanx-distal",
  "pinky-finger-tip"
];
var invTranslation = vec3_exports.create();
var invRotation = quat_exports.create();
var tempVec0 = vec3_exports.create();
var tempVec1 = vec3_exports.create();
var HandTracking = class extends Component10 {
  /** Handedness determining whether to receive tracking input from right or left hand */
  handedness = 0;
  /** (optional) Mesh to use to visualize joints */
  jointMesh = null;
  /** Material to use for display. Applied to either the spawned skinned mesh or the joint spheres. */
  jointMaterial = null;
  /** (optional) Skin to apply tracked joint poses to. If not present,
   * joint spheres will be used for display instead. */
  handSkin = null;
  /** Deactivate children if no pose was tracked */
  deactivateChildrenWithoutPose = true;
  /** Controller objects to activate including children if no pose is available */
  controllerToDeactivate = null;
  init() {
    this.handedness = ["left", "right"][this.handedness];
  }
  joints = {};
  session = null;
  /* Whether last update had a hand pose */
  hasPose = false;
  _childrenActive = true;
  start() {
    if (!("XRHand" in window)) {
      console.warn("WebXR Hand Tracking not supported by this browser.");
      this.active = false;
      return;
    }
    if (this.handSkin) {
      const skin = this.handSkin;
      const jointIds = skin.jointIds;
      this.joints[ORDERED_JOINTS[0]] = this.engine.wrapObject(jointIds[0]);
      for (let j = 0; j < jointIds.length; ++j) {
        const joint = this.engine.wrapObject(jointIds[j]);
        this.joints[joint.name] = joint;
      }
      return;
    }
    const jointObjects = this.engine.scene.addObjects(ORDERED_JOINTS.length, this.object, ORDERED_JOINTS.length);
    for (let j = 0; j < ORDERED_JOINTS.length; ++j) {
      const joint = jointObjects[j];
      joint.addComponent(MeshComponent, {
        mesh: this.jointMesh,
        material: this.jointMaterial
      });
      this.joints[ORDERED_JOINTS[j]] = joint;
      joint.name = ORDERED_JOINTS[j];
    }
  }
  update(dt) {
    if (!this.engine.xr)
      return;
    this.hasPose = false;
    if (this.engine.xr.session.inputSources) {
      for (let i = 0; i < this.engine.xr.session.inputSources.length; ++i) {
        const inputSource = this.engine.xr.session.inputSources[i];
        if (!inputSource?.hand || inputSource?.handedness != this.handedness)
          continue;
        const wristSpace = inputSource.hand.get("wrist");
        if (wristSpace) {
          const p = this.engine.xr.frame.getJointPose(wristSpace, this.engine.xr.currentReferenceSpace);
          if (p) {
            setXRRigidTransformLocal(this.object, p.transform);
          }
        }
        this.object.getRotationLocal(invRotation);
        quat_exports.conjugate(invRotation, invRotation);
        this.object.getPositionLocal(invTranslation);
        this.joints["wrist"].resetTransform();
        for (let j = 0; j < ORDERED_JOINTS.length; ++j) {
          const jointName = ORDERED_JOINTS[j];
          const joint = this.joints[jointName];
          if (!joint)
            continue;
          let jointPose = null;
          const jointSpace = inputSource.hand.get(jointName);
          if (jointSpace) {
            jointPose = this.engine.xr.frame.getJointPose(jointSpace, this.engine.xr.currentReferenceSpace);
          }
          if (jointPose) {
            this.hasPose = true;
            joint.resetPositionRotation();
            joint.translateLocal([
              jointPose.transform.position.x - invTranslation[0],
              jointPose.transform.position.y - invTranslation[1],
              jointPose.transform.position.z - invTranslation[2]
            ]);
            joint.rotateLocal(invRotation);
            joint.rotateObject([
              jointPose.transform.orientation.x,
              jointPose.transform.orientation.y,
              jointPose.transform.orientation.z,
              jointPose.transform.orientation.w
            ]);
            if (!this.handSkin) {
              const r = jointPose.radius || 7e-3;
              joint.setScalingLocal([r, r, r]);
            }
          }
        }
      }
    }
    if (!this.hasPose && this._childrenActive) {
      this._childrenActive = false;
      if (this.deactivateChildrenWithoutPose) {
        this.setChildrenActive(false);
      }
      if (this.controllerToDeactivate) {
        this.controllerToDeactivate.active = true;
        this.setChildrenActive(true, this.controllerToDeactivate);
      }
    } else if (this.hasPose && !this._childrenActive) {
      this._childrenActive = true;
      if (this.deactivateChildrenWithoutPose) {
        this.setChildrenActive(true);
      }
      if (this.controllerToDeactivate) {
        this.controllerToDeactivate.active = false;
        this.setChildrenActive(false, this.controllerToDeactivate);
      }
    }
  }
  setChildrenActive(active, object) {
    object = object || this.object;
    const children = object.children;
    for (const o of children) {
      o.active = active;
      this.setChildrenActive(active, o);
    }
  }
  isGrabbing() {
    this.joints["index-finger-tip"].getPositionLocal(tempVec0);
    this.joints["thumb-tip"].getPositionLocal(tempVec1);
    return vec3_exports.sqrDist(tempVec0, tempVec1) < 1e-3;
  }
};
__publicField(HandTracking, "TypeName", "hand-tracking");
__decorate7([
  property7.enum(["left", "right"])
], HandTracking.prototype, "handedness", void 0);
__decorate7([
  property7.mesh()
], HandTracking.prototype, "jointMesh", void 0);
__decorate7([
  property7.material()
], HandTracking.prototype, "jointMaterial", void 0);
__decorate7([
  property7.skin()
], HandTracking.prototype, "handSkin", void 0);
__decorate7([
  property7.bool(true)
], HandTracking.prototype, "deactivateChildrenWithoutPose", void 0);
__decorate7([
  property7.object()
], HandTracking.prototype, "controllerToDeactivate", void 0);

// node_modules/@wonderlandengine/components/dist/howler-audio-listener.js
import { Component as Component13, Type } from "@wonderlandengine/api";

// node_modules/@wonderlandengine/spatial-audio/dist/audio-source.js
import { Component as Component12, Emitter as Emitter6 } from "@wonderlandengine/api";
import { property as property8 } from "@wonderlandengine/api/decorators.js";

// node_modules/@wonderlandengine/spatial-audio/dist/audio-listener.js
import { Component as Component11 } from "@wonderlandengine/api";
var SAMPLE_RATE = 48e3;
var FADE_DURATION = 5 / 1e3;
var tempVec4 = new Float32Array(3);
var tempVec22 = new Float32Array(3);
var _audioContext = null;
if (window.AudioContext !== void 0) {
  _audioContext = new AudioContext({
    latencyHint: "interactive",
    sampleRate: SAMPLE_RATE
  });
}
async function _unlockAudioContext() {
  return new Promise((resolve) => {
    const unlockHandler = () => {
      _audioContext.resume().then(() => {
        window.removeEventListener("click", unlockHandler);
        window.removeEventListener("touch", unlockHandler);
        window.removeEventListener("keydown", unlockHandler);
        window.removeEventListener("mousedown", unlockHandler);
        resolve();
      });
    };
    window.addEventListener("click", unlockHandler);
    window.addEventListener("touch", unlockHandler);
    window.addEventListener("keydown", unlockHandler);
    window.addEventListener("mousedown", unlockHandler);
  });
}
var AudioListener = class extends Component11 {
  /**
   * The WebAudio listener instance associated with this component.
   */
  listener = _audioContext.listener;
  /**
   * The time in which the last position update will be done.
   */
  time = 0;
  start() {
    if ("positionX" in this.listener) {
      this.update = this._updateRecommended.bind(this);
    } else {
      this.update = this._updateDeprecated.bind(this);
    }
  }
  _updateDeprecated() {
    this.object.getPositionWorld(tempVec4);
    this.listener.setPosition(tempVec4[0], tempVec4[2], -tempVec4[1]);
    this.object.getForwardWorld(tempVec4);
    this.object.getUpWorld(tempVec22);
    this.listener.setOrientation(tempVec4[0], tempVec4[2], -tempVec4[1], tempVec22[0], tempVec22[2], -tempVec22[1]);
  }
  _updateRecommended() {
    this.time = _audioContext.currentTime + FADE_DURATION;
    this.object.getPositionWorld(tempVec4);
    this.listener.positionX.linearRampToValueAtTime(tempVec4[0], this.time);
    this.listener.positionY.linearRampToValueAtTime(tempVec4[2], this.time);
    this.listener.positionZ.linearRampToValueAtTime(-tempVec4[1], this.time);
    this.object.getForwardWorld(tempVec4);
    this.listener.forwardX.linearRampToValueAtTime(tempVec4[0], this.time);
    this.listener.forwardY.linearRampToValueAtTime(tempVec4[2], this.time);
    this.listener.forwardZ.linearRampToValueAtTime(-tempVec4[1], this.time);
    this.object.getUpWorld(tempVec4);
    this.listener.upX.linearRampToValueAtTime(tempVec4[0], this.time);
    this.listener.upY.linearRampToValueAtTime(tempVec4[2], this.time);
    this.listener.upZ.linearRampToValueAtTime(-tempVec4[1], this.time);
  }
};
__publicField(AudioListener, "TypeName", "audio-listener");
__publicField(AudioListener, "Properties", {});

// node_modules/@wonderlandengine/spatial-audio/dist/audio-manager.js
import { Emitter as Emitter5 } from "@wonderlandengine/api";

// node_modules/@wonderlandengine/spatial-audio/dist/audio-players.js
var MIN_RAMP_TIME = 5 / 1e3;
var MIN_VOLUME = 1e-3;
var DEF_VOL = 1;
var DEFAULT_PANNER_CONFIG = {
  coneInnerAngle: 360,
  coneOuterAngle: 0,
  coneOuterGain: 0,
  distanceModel: "exponential",
  maxDistance: 1e4,
  refDistance: 1,
  rolloffFactor: 1,
  panningModel: "HRTF",
  positionX: 0,
  positionY: 0,
  positionZ: 1,
  orientationX: 0,
  orientationY: 0,
  orientationZ: 1
};
var BufferPlayer = class {
  playId = -1;
  buffer = _audioContext.createBuffer(1, _audioContext.sampleRate, _audioContext.sampleRate);
  looping = false;
  position;
  priority = false;
  playOffset = 0;
  channel = AudioChannel.Sfx;
  volume = DEF_VOL;
  oneShot = false;
  _gainNode = new GainNode(_audioContext);
  _pannerNode = new PannerNode(_audioContext, DEFAULT_PANNER_CONFIG);
  _audioNode = new AudioBufferSourceNode(_audioContext);
  _pannerOptions = DEFAULT_PANNER_CONFIG;
  _playState = PlayState.Stopped;
  _timeStamp = 0;
  _audioManager;
  /**
   * Constructs a BufferPlayer.
   *
   * @warning This is for internal use only. BufferPlayer's should only be created and used inside the AudioManager.
   * @param audioManager Manager that manages this player.
   */
  constructor(audioManager) {
    this._audioManager = audioManager;
  }
  play() {
    if (this._playState === PlayState.Playing) {
      this.stop();
    }
    switch (this.channel) {
      case AudioChannel.Music:
        this._gainNode.connect(this._audioManager["_musicGain"]);
        break;
      case AudioChannel.Master:
        this._gainNode.connect(this._audioManager["_masterGain"]);
        break;
      default:
        this._gainNode.connect(this._audioManager["_sfxGain"]);
    }
    this._gainNode.gain.value = this.volume;
    this._audioNode.buffer = this.buffer;
    this._audioNode.loop = this.looping;
    if (this.position) {
      this._pannerOptions.positionX = this.position[0];
      this._pannerOptions.positionY = this.position[2];
      this._pannerOptions.positionZ = -this.position[1];
      this._pannerNode = new PannerNode(_audioContext, this._pannerOptions);
      this._audioNode.connect(this._pannerNode).connect(this._gainNode);
    } else {
      this._audioNode.connect(this._gainNode);
    }
    this._audioNode.start(0, this.playOffset);
    this._timeStamp = _audioContext.currentTime - this.playOffset;
    this._audioNode.onended = () => this.stop();
    this._playState = PlayState.Playing;
    this.emitState();
  }
  emitState() {
    this._audioManager.emitter.notify({ id: this.playId, state: this._playState });
  }
  /**
   * Stops current playback and sends notification on the audio managers emitter.
   */
  stop() {
    if (this._playState === PlayState.Stopped)
      return;
    this._resetWebAudioNodes();
    if (this.priority) {
      this._audioManager._returnPriorityPlayer(this);
    }
    this._playState = PlayState.Stopped;
    this.emitState();
  }
  pause() {
    if (this._playState !== PlayState.Playing)
      return;
    this.playOffset = (_audioContext.currentTime - this._timeStamp) % this.buffer.duration;
    this._resetWebAudioNodes();
    this._playState = PlayState.Paused;
    this.emitState();
  }
  resume() {
    if (this._playState !== PlayState.Paused)
      return;
    this.play();
  }
  _resetWebAudioNodes() {
    this._audioNode.onended = null;
    this._audioNode.stop();
    this._audioNode.disconnect();
    this._pannerNode.disconnect();
    this._gainNode.disconnect();
    this._audioNode = new AudioBufferSourceNode(_audioContext);
  }
};

// node_modules/@wonderlandengine/spatial-audio/dist/audio-manager.js
var AudioChannel;
(function(AudioChannel2) {
  AudioChannel2[AudioChannel2["Sfx"] = 0] = "Sfx";
  AudioChannel2[AudioChannel2["Music"] = 1] = "Music";
  AudioChannel2[AudioChannel2["Master"] = 2] = "Master";
})(AudioChannel || (AudioChannel = {}));
var PlayState;
(function(PlayState2) {
  PlayState2[PlayState2["Ready"] = 0] = "Ready";
  PlayState2[PlayState2["Playing"] = 1] = "Playing";
  PlayState2[PlayState2["Stopped"] = 2] = "Stopped";
  PlayState2[PlayState2["Paused"] = 3] = "Paused";
})(PlayState || (PlayState = {}));
var DEF_PLAYER_COUNT = 32;
var SHIFT_AMOUNT = 16;
var MAX_NUMBER_OF_INSTANCES = (1 << SHIFT_AMOUNT) - 1;
var AudioManager = class {
  /** The emitter will notify all listeners about the PlayState of a unique ID.
   *
   * @remarks
   * - READY will be emitted if all sources of a given source ID have loaded.
   * - PLAYING / STOPPED / PAUSED are only emitted for play IDs that are returned by the play() method.
   * - If you want to check the status for a source ID, convert the play ID of the message using the
   *   getSourceIdFromPlayId() method.
   *
   * @see getSourceIdFromPlayId
   * @example
   * ```js
   * const music = audioManager.play(Sounds.Music);
   * audioManager.emitter.add((msg) => {
   *    if (msg.id === music) {
   *          console.log(msg.state);
   *    }
   * });
   * ```
   */
  emitter = new Emitter5();
  /**
   * Sets the random function the manager will use for selecting buffers.
   *
   * @remarks Default random function is Math.random()
   * @param func Function that should be used for select the buffer.
   */
  randomBufferSelectFunction = Math.random;
  /* Cache for decoded audio buffers */
  _bufferCache = [];
  /* Simple, fast cache for players */
  _playerCache = [];
  _playerCacheIndex = 0;
  _amountOfFreePlayers = DEF_PLAYER_COUNT;
  /* Counts how many times a sourceId has played. Resets to 0 after {@link MAX_NUMBER_OF_INSTANCES }. */
  _instanceCounter = [];
  _masterGain;
  _musicGain;
  _sfxGain;
  _unlocked = false;
  _autoplayStorage = [];
  /**
   * Constructs a AudioManager.
   *
   * Uses the default amount of players.
   * @see DEF_PLAYER_COUNT
   * @example
   * ```js
   * // AudioManager can't be constructed in a non-browser environment!
   * export const am = window.AudioContext ? new AudioManager() : null!;
   * ```
   */
  constructor() {
    this._unlockAudioContext();
    this._sfxGain = new GainNode(_audioContext);
    this._masterGain = new GainNode(_audioContext);
    this._musicGain = new GainNode(_audioContext);
    this._sfxGain.connect(this._masterGain);
    this._musicGain.connect(this._masterGain);
    this._masterGain.connect(_audioContext.destination);
    for (let i = 0; i < DEF_PLAYER_COUNT; i++) {
      this._playerCache.push(new BufferPlayer(this));
    }
  }
  async load(path, id) {
    if (id < 0) {
      console.error("audio-manager: Negative IDs are not valid! Skipping ${path}.");
      return;
    }
    const paths = Array.isArray(path) ? path : [path];
    if (!this._bufferCache[id]) {
      this._bufferCache[id] = [];
    }
    this._instanceCounter[id] = -1;
    for (let i = 0; i < paths.length; i++) {
      const response = await fetch(paths[i]);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await _audioContext.decodeAudioData(arrayBuffer);
      this._bufferCache[id].push(audioBuffer);
    }
    this._instanceCounter[id] = 0;
    this.emitter.notify({ id, state: PlayState.Ready });
  }
  async loadBatch(...pair) {
    return Promise.all(pair.map((p) => this.load(p[0], p[1])));
  }
  play(id, config) {
    if (this._instanceCounter[id] == -1) {
      console.warn(`audio-manager: Tried to play audio that is still decoding: ${id}`);
      return -1;
    }
    const bufferList = this._bufferCache[id];
    if (!bufferList) {
      console.error(`audio-manager: No audio source is associated with identifier: ${id}`);
      return -1;
    }
    if (!this._unlocked) {
      return -1;
    }
    const player = this._getAvailablePlayer();
    if (!player) {
      console.warn(`audio-manager: All players are busy and no low priority player could be found to free up to play ${id}.`);
      return -1;
    }
    const unique_id = this._generateUniqueId(id);
    if (config?.priority) {
      this._amountOfFreePlayers--;
      let index = this._playerCache.indexOf(player);
      this._playerCache.splice(index, 1);
      this._playerCache.push(player);
      player.priority = true;
    } else {
      player.priority = false;
    }
    player.playId = unique_id;
    player.buffer = this._selectRandomBuffer(bufferList);
    player.looping = config?.loop ?? false;
    player.position = config?.position;
    player.playOffset = config?.playOffset ?? 0;
    player.channel = config?.channel ?? AudioChannel.Sfx;
    player.volume = config?.volume ?? DEF_VOL;
    player.play();
    return unique_id;
  }
  _playWithUniqueId(uniqueId, config) {
    const id = this.getSourceIdFromPlayId(uniqueId);
    const bufferList = this._bufferCache[id];
    if (!bufferList) {
      console.error(`audio-manager: No audio source is associated with identifier: ${id}`);
      return;
    }
    const player = this._getAvailablePlayer();
    if (!player) {
      console.warn(`audio-manager: All players are busy and no low priority player could be found to free up.`);
      return;
    }
    if (config?.priority) {
      this._amountOfFreePlayers--;
      let index = this._playerCache.indexOf(player);
      this._playerCache.splice(index, 1);
      this._playerCache.push(player);
      player.priority = true;
    } else {
      player.priority = false;
    }
    player.playId = uniqueId;
    player.buffer = this._selectRandomBuffer(bufferList);
    player.looping = config?.loop ?? false;
    player.oneShot = config?.oneShot ?? false;
    player.position = config?.position;
    player.playOffset = config?.playOffset ?? 0;
    player.channel = config?.channel ?? AudioChannel.Sfx;
    player.volume = config?.volume ?? DEF_VOL;
    player.play();
  }
  playOneShot(id, config) {
    if (!config)
      this.play(id, { oneShot: true });
    config.loop = false;
    config.priority = false;
    config.oneShot = true;
    this.play(id, config);
  }
  /**
   * Advances the _playerCacheIndex and stops the player on that position.
   *
   * @returns A BufferPlayer with PlayState.Stopped, or undefined if no player can be stopped.
   */
  _getAvailablePlayer() {
    if (this._amountOfFreePlayers < 1)
      return;
    this._playerCacheIndex = (this._playerCacheIndex + 1) % this._amountOfFreePlayers;
    const player = this._playerCache[this._playerCacheIndex];
    player.stop();
    return player;
  }
  autoplay(id, config) {
    if (this._unlocked) {
      return this.play(id, config);
    }
    const uniqueId = this._generateUniqueId(id);
    this._autoplayStorage.push([uniqueId, config]);
    return uniqueId;
  }
  stop(playId) {
    this._playerCache.forEach((player) => {
      if (player.playId === playId) {
        player.stop();
        return;
      }
    });
  }
  pause(playId) {
    this._playerCache.forEach((player) => {
      if (player.playId === playId) {
        player.pause();
        return;
      }
    });
  }
  resume(playId) {
    this._playerCache.forEach((player) => {
      if (player.playId === playId) {
        player.resume();
        return;
      }
    });
  }
  stopOneShots() {
    this._playerCache.forEach((player) => {
      if (player.oneShot) {
        player.stop();
        return;
      }
    });
  }
  resumeAll() {
    this._playerCache.forEach((player) => {
      player.resume();
    });
  }
  pauseAll() {
    this._playerCache.forEach((player) => {
      player.pause();
    });
  }
  stopAll() {
    this._playerCache.forEach((player) => {
      player.stop();
    });
  }
  setGlobalVolume(channel, volume, time = 0) {
    volume = Math.max(MIN_VOLUME, volume);
    time = _audioContext.currentTime + Math.max(MIN_RAMP_TIME, time);
    switch (channel) {
      case AudioChannel.Music:
        this._musicGain.gain.linearRampToValueAtTime(volume, time);
        break;
      case AudioChannel.Sfx:
        this._sfxGain.gain.linearRampToValueAtTime(volume, time);
        break;
      case AudioChannel.Master:
        this._masterGain.gain.linearRampToValueAtTime(volume, time);
        break;
      default:
        return;
    }
  }
  remove(id) {
    if (id < 0)
      return;
    this.stop(id);
    this._bufferCache[id] = void 0;
    this._instanceCounter[id] = -1;
  }
  removeAll() {
    this.stopAll();
    this._bufferCache.length = 0;
    this._instanceCounter.length = 0;
  }
  getSourceIdFromPlayId(playId) {
    return playId >> SHIFT_AMOUNT;
  }
  get amountOfFreePlayers() {
    return this._amountOfFreePlayers;
  }
  _selectRandomBuffer(bufferList) {
    return bufferList[Math.floor(this.randomBufferSelectFunction() * bufferList.length)];
  }
  _generateUniqueId(id) {
    let instanceCount = this._instanceCounter[id];
    if (!instanceCount)
      instanceCount = 0;
    else if (instanceCount === -1)
      return -1;
    const unique_id = (id << SHIFT_AMOUNT) + instanceCount;
    this._instanceCounter[id] = (instanceCount + 1) % MAX_NUMBER_OF_INSTANCES;
    return unique_id;
  }
  /**
   * @warning This function is for internal use only!
   */
  _returnPriorityPlayer(player) {
    if (!player.priority)
      return;
    for (let i = this._playerCache.length - 1; i >= 0; i--) {
      if (this._playerCache[i] === player) {
        this._playerCache.splice(i, 1);
        this._playerCache.unshift(player);
        this._amountOfFreePlayers++;
        return;
      }
    }
  }
  _unlockAudioContext() {
    const unlockHandler = () => {
      _audioContext.resume().then(() => {
        window.removeEventListener("click", unlockHandler);
        window.removeEventListener("touch", unlockHandler);
        window.removeEventListener("keydown", unlockHandler);
        window.removeEventListener("mousedown", unlockHandler);
        this._unlocked = true;
        for (const audio of this._autoplayStorage) {
          this._playWithUniqueId(audio[0], audio[1]);
        }
        this._autoplayStorage.length = 0;
      });
    };
    window.addEventListener("click", unlockHandler);
    window.addEventListener("touch", unlockHandler);
    window.addEventListener("keydown", unlockHandler);
    window.addEventListener("mousedown", unlockHandler);
  }
};
var EmptyAudioManager = class {
  async load(path, id) {
  }
  async loadBatch(...pair) {
  }
  play(id, config) {
    return -1;
  }
  playOneShot(id, config) {
  }
  autoplay(id, config) {
    return -1;
  }
  stop(playId) {
  }
  pause(playId) {
  }
  resume(playId) {
  }
  stopOneShots() {
  }
  resumeAll() {
  }
  pauseAll() {
  }
  stopAll() {
  }
  setGlobalVolume(channel, volume, time) {
  }
  remove(id) {
  }
  removeAll() {
  }
  getSourceIdFromPlayId(playId) {
    return -1;
  }
  get amountOfFreePlayers() {
    return -1;
  }
};
var globalAudioManager = window.AudioContext ? new AudioManager() : new EmptyAudioManager();

// node_modules/@wonderlandengine/spatial-audio/dist/audio-source.js
var __decorate8 = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
    r = Reflect.decorate(decorators, target, key, desc);
  else
    for (var i = decorators.length - 1; i >= 0; i--)
      if (d = decorators[i])
        r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var PanningType;
(function(PanningType2) {
  PanningType2[PanningType2["None"] = 0] = "None";
  PanningType2[PanningType2["Regular"] = 1] = "Regular";
  PanningType2[PanningType2["Hrtf"] = 2] = "Hrtf";
})(PanningType || (PanningType = {}));
var posVec = new Float32Array(3);
var oriVec = new Float32Array(3);
var distanceModels = ["linear", "exponential", "inverse"];
var bufferCache = /* @__PURE__ */ new Map();
async function loadAudio(source) {
  const response = await fetch(source);
  const arrayBuffer = await response.arrayBuffer();
  const buffer = await _audioContext.decodeAudioData(arrayBuffer);
  return buffer;
}
async function addBufferToCache(source) {
  let audio;
  if (bufferCache.has(source)) {
    audio = bufferCache.get(source);
    audio.referenceCount += 1;
  } else {
    audio = {
      referenceCount: 1,
      buffer: loadAudio(source)
      // Delay await until bufferCache is set, to avoid subsequent calls with same source to start decoding
    };
    bufferCache.set(source, audio);
  }
  return await audio.buffer;
}
function removeBufferFromCache(source) {
  if (!bufferCache.has(source)) {
    return;
  }
  const audioFile = bufferCache.get(source);
  if (audioFile.referenceCount > 1) {
    audioFile.referenceCount -= 1;
  } else {
    bufferCache.delete(source);
  }
}
var AudioSource = class extends Component12 {
  static onRegister(engine) {
    engine.registerComponent(AudioListener);
  }
  /** Path to the audio file that should be played. */
  src;
  /**
   * Volume of the audio source.
   *
   * @remarks This will only take effect audio that has not started playing yet. Is the audio already playing, use
   * setVolumeDuringPlayback()
   * @see setVolumeDuringPlayback
   */
  volume;
  /** Whether to loop the sound. */
  loop;
  /** Whether to autoplay the sound. */
  autoplay;
  /**
   * Select the panning method.
   *
   * @warning Enabling HRTF (Head-Related Transfer Function) is computationally more intensive than regular panning!
   */
  spatial;
  /**
   * Set this property if the object will never move.
   * Disabling position updates each frame saves CPU time.
   */
  isStationary;
  /** The distance model used for spatial audio. */
  distanceModel;
  /** The maximum distance for audio falloff. */
  maxDistance;
  /** The reference distance for audio falloff. */
  refDistance;
  /** The rolloff factor for audio falloff. */
  rolloffFactor;
  /** The inner angle of the audio cone. */
  coneInnerAngle;
  /** The outer angle of the audio cone. */
  coneOuterAngle;
  /** The outer gain of the audio cone. */
  coneOuterGain;
  /**
   * The emitter will notify all subscribers when a state change occurs.
   * @see PlayState
   */
  emitter = new Emitter6();
  _pannerOptions = {};
  _buffer;
  _pannerNode = new PannerNode(_audioContext);
  _audioNode = new AudioBufferSourceNode(_audioContext);
  _isPlaying = false;
  _time = 0;
  _gainNode = new GainNode(_audioContext);
  /**
   * Initializes the audio src component.
   * If `autoplay` is enabled, the audio will start playing as soon as the file is loaded.
   */
  async start() {
    this._gainNode.connect(_audioContext.destination);
    if (this.src !== "") {
      this._buffer = await addBufferToCache(this.src);
      this.emitter.notify(PlayState.Ready);
      if (this.autoplay) {
        this.play();
      }
    }
  }
  setAudioChannel(am, channel) {
    this.stop();
    switch (channel) {
      case AudioChannel.Music:
        this._gainNode.disconnect();
        this._gainNode.connect(am["_musicGain"]);
        break;
      case AudioChannel.Sfx:
        this._gainNode.disconnect();
        this._gainNode.connect(am["_sfxGain"]);
        break;
      case AudioChannel.Master:
        this._gainNode.disconnect();
        this._gainNode.connect(am["_masterGain"]);
        break;
      default:
        return;
    }
  }
  /**
   * Plays the audio associated with this audio src.
   *
   * @param buffer Optional parameter that will set the raw audio buffer that should be played. Defaults to internal audio buffer that is set with given audio path.
   * @remarks Is this audio-source currently playing, playback will be restarted.
   */
  async play(buffer = this._buffer) {
    if (this._isPlaying) {
      this.stop();
    } else if (_audioContext.state === "suspended") {
      await _unlockAudioContext();
    }
    this._gainNode.gain.value = this.volume;
    this._audioNode.buffer = buffer;
    this._audioNode.loop = this.loop;
    if (!this.spatial) {
      this._audioNode.connect(this._gainNode);
    } else {
      this._updateSettings();
      this._pannerNode = new PannerNode(_audioContext, this._pannerOptions);
      this._audioNode.connect(this._pannerNode).connect(this._gainNode);
    }
    this._audioNode.onended = () => this.stop();
    this._audioNode.start();
    this._isPlaying = true;
    if (!this.isStationary) {
      this.update = this._update.bind(this);
    }
    this.emitter.notify(PlayState.Playing);
  }
  /**
   * Stops the audio associated with this audio src.
   */
  stop() {
    if (!this._isPlaying)
      return;
    this._isPlaying = false;
    this._audioNode.onended = null;
    this._audioNode.stop();
    this.update = void 0;
    this._audioNode.disconnect();
    this._pannerNode.disconnect();
    this._audioNode = new AudioBufferSourceNode(_audioContext);
    this.emitter.notify(PlayState.Stopped);
  }
  /**
   * Checks if the audio src is currently playing.
   */
  get isPlaying() {
    return this._isPlaying;
  }
  /**
   * Changes the volume during playback.
   * @param v Volume that source should have.
   * @param t Optional parameter that specifies the time it takes for the volume to reach its specified value in
   * seconds (Default is 0).
   */
  setVolumeDuringPlayback(v, t = 0) {
    const volume = Math.max(MIN_VOLUME, v);
    const time = _audioContext.currentTime + Math.max(MIN_RAMP_TIME, t);
    this._gainNode.gain.linearRampToValueAtTime(volume, time);
  }
  /**
   * Change out the source.
   *
   * @param path Path to the audio file.
   */
  async changeAudioSource(path) {
    this._buffer = await addBufferToCache(path);
    removeBufferFromCache(this.src);
    this.src = path;
  }
  /**
   * Called when the component is deactivated.
   * Stops the audio playback.
   */
  onDeactivate() {
    this.stop();
  }
  /**
   * Called when the component is destroyed.
   * Stops the audio playback and removes the src from cache.
   */
  onDestroy() {
    this.stop();
    this._gainNode.disconnect();
    removeBufferFromCache(this.src);
  }
  _update(dt) {
    this.object.getPositionWorld(posVec);
    this.object.getForwardWorld(oriVec);
    this._time = _audioContext.currentTime + dt;
    this._pannerNode.positionX.linearRampToValueAtTime(posVec[0], this._time);
    this._pannerNode.positionY.linearRampToValueAtTime(posVec[2], this._time);
    this._pannerNode.positionZ.linearRampToValueAtTime(-posVec[1], this._time);
    this._pannerNode.orientationX.linearRampToValueAtTime(oriVec[0], this._time);
    this._pannerNode.orientationY.linearRampToValueAtTime(oriVec[2], this._time);
    this._pannerNode.orientationZ.linearRampToValueAtTime(-oriVec[1], this._time);
  }
  /**
   * @deprecated Use {@link #volume} instead
   */
  set maxVolume(v) {
    this.volume = v;
  }
  /**
   * @deprecated Use {@link #volume} instead
   */
  get maxVolume() {
    return this.volume;
  }
  _updateSettings() {
    this.object.getPositionWorld(posVec);
    this.object.getForwardWorld(oriVec);
    this._pannerOptions = {
      coneInnerAngle: this.coneInnerAngle,
      coneOuterAngle: this.coneOuterAngle,
      coneOuterGain: this.coneOuterGain,
      distanceModel: this._distanceModelSelector(),
      maxDistance: this.maxDistance,
      refDistance: this.refDistance,
      rolloffFactor: this.rolloffFactor,
      panningModel: this.spatial === PanningType.Hrtf ? "HRTF" : "equalpower",
      positionX: posVec[0],
      positionY: posVec[2],
      positionZ: -posVec[1],
      orientationX: oriVec[0],
      orientationY: oriVec[2],
      orientationZ: -oriVec[1]
    };
  }
  _distanceModelSelector() {
    if (distanceModels.includes(this.distanceModel)) {
      return this.distanceModel;
    }
    return "exponential";
  }
};
/**
 * The type name for this component.
 */
__publicField(AudioSource, "TypeName", "audio-source");
__decorate8([
  property8.string()
], AudioSource.prototype, "src", void 0);
__decorate8([
  property8.float(1)
], AudioSource.prototype, "volume", void 0);
__decorate8([
  property8.bool(false)
], AudioSource.prototype, "loop", void 0);
__decorate8([
  property8.bool(false)
], AudioSource.prototype, "autoplay", void 0);
__decorate8([
  property8.enum(["none", "panning", "hrtf"], PanningType.Regular)
], AudioSource.prototype, "spatial", void 0);
__decorate8([
  property8.bool(false)
], AudioSource.prototype, "isStationary", void 0);
__decorate8([
  property8.enum(["linear", "inverse", "exponential"], "exponential")
], AudioSource.prototype, "distanceModel", void 0);
__decorate8([
  property8.float(1e4)
], AudioSource.prototype, "maxDistance", void 0);
__decorate8([
  property8.float(1)
], AudioSource.prototype, "refDistance", void 0);
__decorate8([
  property8.float(1)
], AudioSource.prototype, "rolloffFactor", void 0);
__decorate8([
  property8.float(360)
], AudioSource.prototype, "coneInnerAngle", void 0);
__decorate8([
  property8.float(0)
], AudioSource.prototype, "coneOuterAngle", void 0);
__decorate8([
  property8.float(0)
], AudioSource.prototype, "coneOuterGain", void 0);

// node_modules/@wonderlandengine/components/dist/howler-audio-source.js
import { Component as Component14, Type as Type2 } from "@wonderlandengine/api";

// node_modules/@wonderlandengine/components/dist/image-texture.js
import { Component as Component15 } from "@wonderlandengine/api";

// node_modules/@wonderlandengine/components/dist/utils/utils.js
function setFirstMaterialTexture(mat, texture, customTextureProperty) {
  if (customTextureProperty !== "auto") {
    mat[customTextureProperty] = texture;
    return true;
  }
  const shader = mat.shader;
  if (shader === "Flat Opaque Textured") {
    mat.flatTexture = texture;
    return true;
  } else if (shader === "Phong Opaque Textured" || shader === "Foliage" || shader === "Phong Normalmapped" || shader === "Phong Lightmapped") {
    mat.diffuseTexture = texture;
    return true;
  } else if (shader === "Particle") {
    mat.mainTexture = texture;
    return true;
  } else if (shader === "DistanceFieldVector") {
    mat.vectorTexture = texture;
    return true;
  } else if (shader === "Background" || shader === "Sky") {
    mat.texture = texture;
    return true;
  } else if (shader === "Physical Opaque Textured") {
    mat.albedoTexture = texture;
    return true;
  }
  return false;
}
function deg2rad(value) {
  return value * Math.PI / 180;
}
function rad2deg(value) {
  return value * 180 / Math.PI;
}

// node_modules/@wonderlandengine/components/dist/image-texture.js
import { property as property9 } from "@wonderlandengine/api/decorators.js";
var __decorate9 = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
    r = Reflect.decorate(decorators, target, key, desc);
  else
    for (var i = decorators.length - 1; i >= 0; i--)
      if (d = decorators[i])
        r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ImageTexture = class extends Component15 {
  /** URL to download the image from */
  url;
  /** Material to apply the video texture to */
  material;
  /** Name of the texture property to set */
  textureProperty;
  texture;
  start() {
    this.engine.textures.load(this.url, "anonymous").then((texture) => {
      this.texture = texture;
      const mat = this.material;
      if (!setFirstMaterialTexture(mat, texture, this.textureProperty)) {
        console.error("Pipeline", mat.pipeline, "not supported by image-texture");
      }
    }).catch(console.error);
  }
  onDestroy() {
    this.texture?.destroy();
  }
};
__publicField(ImageTexture, "TypeName", "image-texture");
__decorate9([
  property9.string()
], ImageTexture.prototype, "url", void 0);
__decorate9([
  property9.material({ required: true })
], ImageTexture.prototype, "material", void 0);
__decorate9([
  property9.string("auto")
], ImageTexture.prototype, "textureProperty", void 0);

// node_modules/@wonderlandengine/components/dist/mouse-look.js
import { Component as Component16 } from "@wonderlandengine/api";
import { property as property10 } from "@wonderlandengine/api/decorators.js";
var __decorate10 = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
    r = Reflect.decorate(decorators, target, key, desc);
  else
    for (var i = decorators.length - 1; i >= 0; i--)
      if (d = decorators[i])
        r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var preventDefault = (e) => {
  e.preventDefault();
};
var TEMP_ROT = new Float32Array(4);
var ROT_MUL = 180 / Math.PI / 100;
var MouseLookComponent = class extends Component16 {
  /** Mouse look sensitivity */
  sensitity = 0.25;
  /** Require a mouse button to be pressed to control view.
   * Otherwise view will allways follow mouse movement */
  requireMouseDown = true;
  /** If "moveOnClick" is enabled, mouse button which should
   * be held down to control view */
  mouseButtonIndex = 0;
  /** Enables pointer lock on "mousedown" event on canvas */
  pointerLockOnClick = false;
  currentRotationY = 0;
  currentRotationX = 0;
  mouseDown = false;
  onActivate() {
    document.addEventListener("mousemove", this.onMouseMove);
    const canvas2 = this.engine.canvas;
    if (this.pointerLockOnClick) {
      canvas2.addEventListener("mousedown", this.requestPointerLock);
    }
    if (this.requireMouseDown) {
      if (this.mouseButtonIndex === 2) {
        canvas2.addEventListener("contextmenu", preventDefault, false);
      }
      canvas2.addEventListener("mousedown", this.onMouseDown);
      canvas2.addEventListener("mouseup", this.onMouseUp);
    }
  }
  onDeactivate() {
    document.removeEventListener("mousemove", this.onMouseMove);
    const canvas2 = this.engine.canvas;
    if (this.pointerLockOnClick) {
      canvas2.removeEventListener("mousedown", this.requestPointerLock);
    }
    if (this.requireMouseDown) {
      if (this.mouseButtonIndex === 2) {
        canvas2.removeEventListener("contextmenu", preventDefault, false);
      }
      canvas2.removeEventListener("mousedown", this.onMouseDown);
      canvas2.removeEventListener("mouseup", this.onMouseUp);
    }
  }
  requestPointerLock = () => {
    const canvas2 = this.engine.canvas;
    canvas2.requestPointerLock = canvas2.requestPointerLock || canvas2.mozRequestPointerLock || canvas2.webkitRequestPointerLock;
    canvas2.requestPointerLock();
  };
  onMouseDown = (e) => {
    if (e.button === this.mouseButtonIndex) {
      this.mouseDown = true;
      document.body.style.cursor = "grabbing";
      if (e.button === 1) {
        e.preventDefault();
        return false;
      }
    }
  };
  onMouseUp = (e) => {
    if (e.button === this.mouseButtonIndex) {
      this.mouseDown = false;
      document.body.style.cursor = "initial";
    }
  };
  onMouseMove = (e) => {
    if (this.active && (this.mouseDown || !this.requireMouseDown)) {
      this.currentRotationX += -this.sensitity * e.movementY * ROT_MUL;
      this.currentRotationY += -this.sensitity * e.movementX * ROT_MUL;
      this.currentRotationX = Math.max(-89, Math.min(89, this.currentRotationX));
      quat_exports.fromEuler(TEMP_ROT, this.currentRotationX, this.currentRotationY, 0);
      this.object.setRotationLocal(TEMP_ROT);
    }
  };
};
__publicField(MouseLookComponent, "TypeName", "mouse-look");
__decorate10([
  property10.float(0.25)
], MouseLookComponent.prototype, "sensitity", void 0);
__decorate10([
  property10.bool(true)
], MouseLookComponent.prototype, "requireMouseDown", void 0);
__decorate10([
  property10.int()
], MouseLookComponent.prototype, "mouseButtonIndex", void 0);
__decorate10([
  property10.bool(false)
], MouseLookComponent.prototype, "pointerLockOnClick", void 0);

// node_modules/@wonderlandengine/components/dist/player-height.js
import { Component as Component17 } from "@wonderlandengine/api";
import { property as property11 } from "@wonderlandengine/api/decorators.js";
var __decorate11 = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
    r = Reflect.decorate(decorators, target, key, desc);
  else
    for (var i = decorators.length - 1; i >= 0; i--)
      if (d = decorators[i])
        r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var PlayerHeight = class extends Component17 {
  height = 1.75;
  onSessionStartCallback;
  onSessionEndCallback;
  start() {
    this.object.resetPositionRotation();
    this.object.translateLocal([0, this.height, 0]);
    this.onSessionStartCallback = this.onXRSessionStart.bind(this);
    this.onSessionEndCallback = this.onXRSessionEnd.bind(this);
  }
  onActivate() {
    this.engine.onXRSessionStart.add(this.onSessionStartCallback);
    this.engine.onXRSessionEnd.add(this.onSessionEndCallback);
  }
  onDeactivate() {
    this.engine.onXRSessionStart.remove(this.onSessionStartCallback);
    this.engine.onXRSessionEnd.remove(this.onSessionEndCallback);
  }
  onXRSessionStart() {
    const type = this.engine.xr?.currentReferenceSpaceType;
    if (type !== "local" && type !== "viewer") {
      this.object.resetPositionRotation();
    }
  }
  onXRSessionEnd() {
    const type = this.engine.xr?.currentReferenceSpaceType;
    if (type !== "local" && type !== "viewer") {
      this.object.resetPositionRotation();
      this.object.translateLocal([0, this.height, 0]);
    }
  }
};
__publicField(PlayerHeight, "TypeName", "player-height");
__decorate11([
  property11.float(1.75)
], PlayerHeight.prototype, "height", void 0);

// node_modules/@wonderlandengine/components/dist/target-framerate.js
import { Component as Component18 } from "@wonderlandengine/api";
import { property as property12 } from "@wonderlandengine/api/decorators.js";
var __decorate12 = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
    r = Reflect.decorate(decorators, target, key, desc);
  else
    for (var i = decorators.length - 1; i >= 0; i--)
      if (d = decorators[i])
        r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var TargetFramerate = class extends Component18 {
  framerate;
  onActivate() {
    this.engine.onXRSessionStart.add(this.setTargetFramerate);
  }
  onDeactivate() {
    this.engine.onXRSessionStart.remove(this.setTargetFramerate);
  }
  setTargetFramerate = (s) => {
    if (s.supportedFrameRates) {
      const a = s.supportedFrameRates;
      a.sort((a2, b) => Math.abs(a2 - this.framerate) - Math.abs(b - this.framerate));
      s.updateTargetFrameRate(a[0]);
    }
  };
};
__publicField(TargetFramerate, "TypeName", "target-framerate");
__decorate12([
  property12.float(90)
], TargetFramerate.prototype, "framerate", void 0);

// node_modules/@wonderlandengine/components/dist/teleport.js
import { Component as Component19, Type as Type3 } from "@wonderlandengine/api";
var TeleportComponent = class extends Component19 {
  init() {
    this._prevThumbstickAxis = new Float32Array(2);
    this._tempVec = new Float32Array(3);
    this._tempVec0 = new Float32Array(3);
    this._currentIndicatorRotation = 0;
    this.input = this.object.getComponent("input");
    if (!this.input) {
      console.error(this.object.name, "generic-teleport-component.js: input component is required on the object");
      return;
    }
    if (!this.teleportIndicatorMeshObject) {
      console.error(this.object.name, "generic-teleport-component.js: Teleport indicator mesh is missing");
      return;
    }
    if (!this.camRoot) {
      console.error(this.object.name, "generic-teleport-component.js: camRoot not set");
      return;
    }
    this.isIndicating = false;
    this.indicatorHidden = true;
    this.hitSpot = new Float32Array(3);
    this._hasHit = false;
    this._extraRotation = 0;
    this._currentStickAxes = new Float32Array(2);
  }
  start() {
    if (this.handedness == 0) {
      const inputComp = this.object.getComponent("input");
      if (!inputComp) {
        console.warn("teleport component on object", this.object.name, 'was configured with handedness "input component", but object has no input component.');
      } else {
        this.handedness = inputComp.handedness;
        this.input = inputComp;
      }
    } else {
      this.handedness = ["left", "right"][this.handedness - 1];
    }
    this.onSessionStartCallback = this.setupVREvents.bind(this);
    this.teleportIndicatorMeshObject.active = false;
  }
  onActivate() {
    if (this.cam) {
      this.isMouseIndicating = false;
      canvas.addEventListener("mousedown", this.onMouseDown);
      canvas.addEventListener("mouseup", this.onMouseUp);
    }
    this.engine.onXRSessionStart.add(this.onSessionStartCallback);
  }
  onDeactivate() {
    canvas.addEventListener("mousedown", this.onMouseDown);
    canvas.addEventListener("mouseup", this.onMouseUp);
    this.engine.onXRSessionStart.remove(this.onSessionStartCallback);
  }
  /* Get current camera Y rotation */
  _getCamRotation() {
    this.eyeLeft.getForward(this._tempVec);
    this._tempVec[1] = 0;
    vec3_exports.normalize(this._tempVec, this._tempVec);
    return Math.atan2(this._tempVec[0], this._tempVec[2]);
  }
  update() {
    let inputLength = 0;
    if (this.gamepad && this.gamepad.axes) {
      this._currentStickAxes[0] = this.gamepad.axes[2];
      this._currentStickAxes[1] = this.gamepad.axes[3];
      inputLength = Math.abs(this._currentStickAxes[0]) + Math.abs(this._currentStickAxes[1]);
    }
    if (!this.isIndicating && this._prevThumbstickAxis[1] >= this.thumbstickActivationThreshhold && this._currentStickAxes[1] < this.thumbstickActivationThreshhold) {
      this.isIndicating = true;
    } else if (this.isIndicating && inputLength < this.thumbstickDeactivationThreshhold) {
      this.isIndicating = false;
      this.teleportIndicatorMeshObject.active = false;
      if (this._hasHit) {
        this._teleportPlayer(this.hitSpot, this._extraRotation);
      }
    }
    if (this.isIndicating && this.teleportIndicatorMeshObject && this.input) {
      const origin = this._tempVec0;
      this.object.getPositionWorld(origin);
      const direction2 = this.object.getForwardWorld(this._tempVec);
      let rayHit = this.rayHit = this.rayCastMode == 0 ? this.engine.scene.rayCast(origin, direction2, 1 << this.floorGroup) : this.engine.physics.rayCast(origin, direction2, 1 << this.floorGroup, this.maxDistance);
      if (rayHit.hitCount > 0) {
        this.indicatorHidden = false;
        this._extraRotation = Math.PI + Math.atan2(this._currentStickAxes[0], this._currentStickAxes[1]);
        this._currentIndicatorRotation = this._getCamRotation() + (this._extraRotation - Math.PI);
        this.teleportIndicatorMeshObject.resetPositionRotation();
        this.teleportIndicatorMeshObject.rotateAxisAngleRad([0, 1, 0], this._currentIndicatorRotation);
        this.teleportIndicatorMeshObject.translate(rayHit.locations[0]);
        this.teleportIndicatorMeshObject.translate([
          0,
          this.indicatorYOffset,
          0
        ]);
        this.teleportIndicatorMeshObject.active = true;
        this.hitSpot.set(rayHit.locations[0]);
        this._hasHit = true;
      } else {
        if (!this.indicatorHidden) {
          this.teleportIndicatorMeshObject.active = false;
          this.indicatorHidden = true;
        }
        this._hasHit = false;
      }
    } else if (this.teleportIndicatorMeshObject && this.isMouseIndicating) {
      this.onMousePressed();
    }
    this._prevThumbstickAxis.set(this._currentStickAxes);
  }
  setupVREvents(s) {
    this.session = s;
    s.addEventListener("end", function() {
      this.gamepad = null;
      this.session = null;
    }.bind(this));
    if (s.inputSources && s.inputSources.length) {
      for (let i = 0; i < s.inputSources.length; i++) {
        let inputSource = s.inputSources[i];
        if (inputSource.handedness == this.handedness) {
          this.gamepad = inputSource.gamepad;
        }
      }
    }
    s.addEventListener("inputsourceschange", function(e) {
      if (e.added && e.added.length) {
        for (let i = 0; i < e.added.length; i++) {
          let inputSource = e.added[i];
          if (inputSource.handedness == this.handedness) {
            this.gamepad = inputSource.gamepad;
          }
        }
      }
    }.bind(this));
  }
  onMouseDown = () => {
    this.isMouseIndicating = true;
  };
  onMouseUp = () => {
    this.isMouseIndicating = false;
    this.teleportIndicatorMeshObject.active = false;
    if (this._hasHit) {
      this._teleportPlayer(this.hitSpot, 0);
    }
  };
  onMousePressed() {
    let origin = [0, 0, 0];
    this.cam.getPositionWorld(origin);
    const direction2 = this.cam.getForward(this._tempVec);
    let rayHit = this.rayHit = this.rayCastMode == 0 ? this.engine.scene.rayCast(origin, direction2, 1 << this.floorGroup) : this.engine.physics.rayCast(origin, direction2, 1 << this.floorGroup, this.maxDistance);
    if (rayHit.hitCount > 0) {
      this.indicatorHidden = false;
      direction2[1] = 0;
      vec3_exports.normalize(direction2, direction2);
      this._currentIndicatorRotation = -Math.sign(direction2[2]) * Math.acos(direction2[0]) - Math.PI * 0.5;
      this.teleportIndicatorMeshObject.resetPositionRotation();
      this.teleportIndicatorMeshObject.rotateAxisAngleRad([0, 1, 0], this._currentIndicatorRotation);
      this.teleportIndicatorMeshObject.translate(rayHit.locations[0]);
      this.teleportIndicatorMeshObject.active = true;
      this.hitSpot = rayHit.locations[0];
      this._hasHit = true;
    } else {
      if (!this.indicatorHidden) {
        this.teleportIndicatorMeshObject.active = false;
        this.indicatorHidden = true;
      }
      this._hasHit = false;
    }
  }
  _teleportPlayer(newPosition, rotationToAdd) {
    this.camRoot.rotateAxisAngleRad([0, 1, 0], rotationToAdd);
    const p = this._tempVec;
    const p1 = this._tempVec0;
    if (this.session) {
      this.eyeLeft.getPositionWorld(p);
      this.eyeRight.getPositionWorld(p1);
      vec3_exports.add(p, p, p1);
      vec3_exports.scale(p, p, 0.5);
    } else {
      this.cam.getPositionWorld(p);
    }
    this.camRoot.getPositionWorld(p1);
    vec3_exports.sub(p, p1, p);
    p[0] += newPosition[0];
    p[1] = newPosition[1];
    p[2] += newPosition[2];
    this.camRoot.setPositionWorld(p);
  }
};
__publicField(TeleportComponent, "TypeName", "teleport");
__publicField(TeleportComponent, "Properties", {
  /** Object that will be placed as indiciation forwhere the player will teleport to. */
  teleportIndicatorMeshObject: { type: Type3.Object },
  /** Root of the player, the object that will be positioned on teleportation. */
  camRoot: { type: Type3.Object },
  /** Non-vr camera for use outside of VR */
  cam: { type: Type3.Object },
  /** Left eye for use in VR*/
  eyeLeft: { type: Type3.Object },
  /** Right eye for use in VR*/
  eyeRight: { type: Type3.Object },
  /** Handedness for VR cursors to accept trigger events only from respective controller. */
  handedness: {
    type: Type3.Enum,
    values: ["input component", "left", "right", "none"],
    default: "input component"
  },
  /** Collision group of valid "floor" objects that can be teleported on */
  floorGroup: { type: Type3.Int, default: 1 },
  /** How far the thumbstick needs to be pushed to have the teleport target indicator show up */
  thumbstickActivationThreshhold: { type: Type3.Float, default: -0.7 },
  /** How far the thumbstick needs to be released to execute the teleport */
  thumbstickDeactivationThreshhold: { type: Type3.Float, default: 0.3 },
  /** Offset to apply to the indicator object, e.g. to avoid it from Z-fighting with the floor */
  indicatorYOffset: { type: Type3.Float, default: 0.01 },
  /** Mode for raycasting, whether to use PhysX or simple collision components */
  rayCastMode: {
    type: Type3.Enum,
    values: ["collision", "physx"],
    default: "collision"
  },
  /** Max distance for PhysX raycast */
  maxDistance: { type: Type3.Float, default: 100 }
});

// node_modules/@wonderlandengine/components/dist/trail.js
import { Component as Component20, Mesh, MeshIndexType, MeshAttribute } from "@wonderlandengine/api";
import { property as property13 } from "@wonderlandengine/api/decorators.js";
var __decorate13 = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
    r = Reflect.decorate(decorators, target, key, desc);
  else
    for (var i = decorators.length - 1; i >= 0; i--)
      if (d = decorators[i])
        r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var direction = vec3_exports.create();
var offset = vec3_exports.create();
var normal = vec3_exports.create();
var UP = vec3_exports.fromValues(0, 1, 0);
var Trail = class extends Component20 {
  /** The material to apply to the trail mesh */
  material = null;
  /** The number of segments in the trail mesh */
  segments = 50;
  /** The time interval before recording a new point */
  interval = 0.1;
  /** The width of the trail (in world space) */
  width = 1;
  /** Whether or not the trail should taper off */
  taper = true;
  /**
   * The maximum delta time in seconds, above which the trail resets.
   * This prevents the trail from jumping around when updates happen
   * infrequently (e.g. when the tab doesn't have focus).
   */
  resetThreshold = 0.5;
  _currentPointIndex = 0;
  _timeTillNext = 0;
  _points = [];
  _trailContainer = null;
  _meshComp = null;
  _mesh = null;
  _indexData = null;
  start() {
    this._points = new Array(this.segments + 1);
    for (let i = 0; i < this._points.length; ++i) {
      this._points[i] = vec3_exports.create();
    }
    this._timeTillNext = this.interval;
    this._trailContainer = this.engine.scene.addObject();
    this._meshComp = this._trailContainer.addComponent("mesh");
    this._meshComp.material = this.material;
    const vertexCount = 2 * this._points.length;
    this._indexData = new Uint32Array(6 * this.segments);
    for (let i = 0, v = 0; i < vertexCount - 2; i += 2, v += 6) {
      this._indexData.subarray(v, v + 6).set([i + 1, i + 0, i + 2, i + 2, i + 3, i + 1]);
    }
    this._mesh = new Mesh(this.engine, {
      vertexCount,
      indexData: this._indexData,
      indexType: MeshIndexType.UnsignedInt
    });
    this._meshComp.mesh = this._mesh;
  }
  updateVertices() {
    if (!this._mesh)
      return;
    const positions = this._mesh.attribute(MeshAttribute.Position);
    const texCoords = this._mesh.attribute(MeshAttribute.TextureCoordinate);
    const normals = this._mesh.attribute(MeshAttribute.Normal);
    vec3_exports.set(direction, 0, 0, 0);
    for (let i = 0; i < this._points.length; ++i) {
      const curr = this._points[(this._currentPointIndex + i + 1) % this._points.length];
      const next = this._points[(this._currentPointIndex + i + 2) % this._points.length];
      if (i !== this._points.length - 1) {
        vec3_exports.sub(direction, next, curr);
      }
      vec3_exports.cross(offset, UP, direction);
      vec3_exports.normalize(offset, offset);
      const timeFraction = 1 - this._timeTillNext / this.interval;
      const fraction = (i - timeFraction) / this.segments;
      vec3_exports.scale(offset, offset, (this.taper ? fraction : 1) * this.width / 2);
      positions.set(i * 2, [
        curr[0] - offset[0],
        curr[1] - offset[1],
        curr[2] - offset[2]
      ]);
      positions.set(i * 2 + 1, [
        curr[0] + offset[0],
        curr[1] + offset[1],
        curr[2] + offset[2]
      ]);
      if (normals) {
        vec3_exports.cross(normal, direction, offset);
        vec3_exports.normalize(normal, normal);
        normals.set(i * 2, normal);
        normals.set(i * 2 + 1, normal);
      }
      if (texCoords) {
        texCoords.set(i * 2, [0, fraction]);
        texCoords.set(i * 2 + 1, [1, fraction]);
      }
    }
    this._mesh.update();
  }
  resetTrail() {
    this.object.getPositionWorld(this._points[0]);
    for (let i = 1; i < this._points.length; ++i) {
      vec3_exports.copy(this._points[i], this._points[0]);
    }
    this._currentPointIndex = 0;
    this._timeTillNext = this.interval;
  }
  update(dt) {
    this._timeTillNext -= dt;
    if (dt > this.resetThreshold) {
      this.resetTrail();
    }
    if (this._timeTillNext < 0) {
      this._currentPointIndex = (this._currentPointIndex + 1) % this._points.length;
      this._timeTillNext = this._timeTillNext % this.interval + this.interval;
    }
    this.object.getPositionWorld(this._points[this._currentPointIndex]);
    this.updateVertices();
  }
  onActivate() {
    this.resetTrail();
    if (this._meshComp)
      this._meshComp.active = true;
  }
  onDeactivate() {
    if (this._meshComp)
      this._meshComp.active = false;
  }
  onDestroy() {
    if (this._trailContainer)
      this._trailContainer.destroy();
    if (this._mesh)
      this._mesh.destroy();
  }
};
__publicField(Trail, "TypeName", "trail");
__decorate13([
  property13.material()
], Trail.prototype, "material", void 0);
__decorate13([
  property13.int(50)
], Trail.prototype, "segments", void 0);
__decorate13([
  property13.float(50)
], Trail.prototype, "interval", void 0);
__decorate13([
  property13.float(1)
], Trail.prototype, "width", void 0);
__decorate13([
  property13.bool(true)
], Trail.prototype, "taper", void 0);
__decorate13([
  property13.float(1)
], Trail.prototype, "resetThreshold", void 0);

// node_modules/@wonderlandengine/components/dist/two-joint-ik-solver.js
import { Component as Component21, Property } from "@wonderlandengine/api";
function clamp(v, a, b) {
  return Math.max(a, Math.min(v, b));
}
var rootScaling = new Float32Array(3);
var tempQuat3 = new Float32Array(4);
var twoJointIK = function() {
  const ta = new Float32Array(3);
  const ca = new Float32Array(3);
  const ba = new Float32Array(3);
  const ab = new Float32Array(3);
  const cb = new Float32Array(3);
  const axis0 = new Float32Array(3);
  const axis1 = new Float32Array(3);
  const temp = new Float32Array(3);
  return function(root, middle, b, c, targetPos, eps, helper) {
    ba.set(b);
    const lab = vec3_exports.length(ba);
    vec3_exports.sub(ta, b, c);
    const lcb = vec3_exports.length(ta);
    ta.set(targetPos);
    const lat = clamp(vec3_exports.length(ta), eps, lab + lcb - eps);
    ca.set(c);
    vec3_exports.scale(ab, b, -1);
    vec3_exports.sub(cb, c, b);
    vec3_exports.normalize(ca, ca);
    vec3_exports.normalize(ba, ba);
    vec3_exports.normalize(ab, ab);
    vec3_exports.normalize(cb, cb);
    vec3_exports.normalize(ta, ta);
    const ac_ab_0 = Math.acos(clamp(vec3_exports.dot(ca, ba), -1, 1));
    const ba_bc_0 = Math.acos(clamp(vec3_exports.dot(ab, cb), -1, 1));
    const ac_at_0 = Math.acos(clamp(vec3_exports.dot(ca, ta), -1, 1));
    const ac_ab_1 = Math.acos(clamp((lcb * lcb - lab * lab - lat * lat) / (-2 * lab * lat), -1, 1));
    const ba_bc_1 = Math.acos(clamp((lat * lat - lab * lab - lcb * lcb) / (-2 * lab * lcb), -1, 1));
    if (helper) {
      vec3_exports.sub(ba, helper, b);
      vec3_exports.normalize(ba, ba);
    }
    vec3_exports.cross(axis0, ca, ba);
    vec3_exports.normalize(axis0, axis0);
    vec3_exports.cross(axis1, c, targetPos);
    vec3_exports.normalize(axis1, axis1);
    middle.transformVectorInverseLocal(temp, axis0);
    root.rotateAxisAngleRadObject(axis1, ac_at_0);
    root.rotateAxisAngleRadObject(axis0, ac_ab_1 - ac_ab_0);
    middle.rotateAxisAngleRadObject(axis0, ba_bc_1 - ba_bc_0);
  };
}();
var TwoJointIkSolver = class extends Component21 {
  time = 0;
  middlePos = new Float32Array(3);
  endPos = new Float32Array(3);
  targetPos = new Float32Array(3);
  helperPos = new Float32Array(3);
  rootTransform = new Float32Array(8);
  middleTransform = new Float32Array(8);
  endTransform = new Float32Array(8);
  start() {
    this.root.getTransformLocal(this.rootTransform);
    this.middle.getTransformLocal(this.middleTransform);
    this.end.getTransformLocal(this.endTransform);
  }
  update(dt) {
    this.time += dt;
    this.root.setTransformLocal(this.rootTransform);
    this.middle.setTransformLocal(this.middleTransform);
    this.end.setTransformLocal(this.endTransform);
    this.root.getScalingWorld(rootScaling);
    this.middle.getPositionLocal(this.middlePos);
    this.end.getPositionLocal(this.endPos);
    this.middle.transformPointLocal(this.endPos, this.endPos);
    if (this.helper) {
      this.helper.getPositionWorld(this.helperPos);
      this.root.transformPointInverseWorld(this.helperPos, this.helperPos);
      vec3_exports.div(this.helperPos, this.helperPos, rootScaling);
    }
    this.target.getPositionWorld(this.targetPos);
    this.root.transformPointInverseWorld(this.targetPos, this.targetPos);
    vec3_exports.div(this.targetPos, this.targetPos, rootScaling);
    twoJointIK(this.root, this.middle, this.middlePos, this.endPos, this.targetPos, 0.01, this.helper ? this.helperPos : null, this.time);
    if (this.copyTargetRotation) {
      this.end.setRotationWorld(this.target.getRotationWorld(tempQuat3));
    }
  }
};
__publicField(TwoJointIkSolver, "TypeName", "two-joint-ik-solver");
__publicField(TwoJointIkSolver, "Properties", {
  /** Root bone, never moves */
  root: Property.object(),
  /** Bone attached to the root */
  middle: Property.object(),
  /** Bone attached to the middle */
  end: Property.object(),
  /** Target the joins should reach for */
  target: Property.object(),
  /** Flag for copying rotation from target to end */
  copyTargetRotation: Property.bool(true),
  /** Helper object to use to determine joint rotation axis */
  helper: Property.object()
});

// node_modules/@wonderlandengine/components/dist/video-texture.js
import { Component as Component22 } from "@wonderlandengine/api";
import { property as property14 } from "@wonderlandengine/api/decorators.js";
var __decorate14 = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
    r = Reflect.decorate(decorators, target, key, desc);
  else
    for (var i = decorators.length - 1; i >= 0; i--)
      if (d = decorators[i])
        r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var VideoTexture = class extends Component22 {
  /** URL to download video from */
  url;
  /** Material to apply the video texture to */
  material;
  /** Whether to loop the video */
  loop;
  /** Whether to automatically start playing the video */
  autoplay;
  /** Whether to mute sound */
  muted;
  /** Name of the texture property to set */
  textureProperty;
  loaded = false;
  frameUpdateRequested = true;
  video;
  texture;
  start() {
    this.video = document.createElement("video");
    this.video.src = this.url;
    this.video.crossOrigin = "anonymous";
    this.video.playsInline = true;
    this.video.loop = this.loop;
    this.video.muted = this.muted;
    this.video.addEventListener("playing", () => {
      this.loaded = true;
    });
    if (this.autoplay) {
      if (this.muted) {
        this.video?.play();
      } else {
        window.addEventListener("click", this.playAfterUserGesture);
        window.addEventListener("touchstart", this.playAfterUserGesture);
      }
    }
  }
  onDestroy() {
    this.video?.remove();
    this.texture?.destroy();
    if (this.autoplay && !this.muted) {
      window.removeEventListener("click", this.playAfterUserGesture);
      window.removeEventListener("touchstart", this.playAfterUserGesture);
    }
  }
  applyTexture() {
    const mat = this.material;
    const pipeline = mat.pipeline;
    const texture = this.texture = this.engine.textures.create(this.video);
    if (!setFirstMaterialTexture(mat, texture, this.textureProperty)) {
      console.error("Pipeline", pipeline, "not supported by video-texture");
    }
    if ("requestVideoFrameCallback" in this.video) {
      this.video.requestVideoFrameCallback(this.updateVideo.bind(this));
    } else {
      this.video.addEventListener("timeupdate", () => {
        this.frameUpdateRequested = true;
      });
    }
  }
  update(dt) {
    if (this.loaded && this.frameUpdateRequested) {
      if (this.texture) {
        this.texture.update();
      } else {
        this.applyTexture();
      }
      this.frameUpdateRequested = false;
    }
  }
  updateVideo() {
    this.frameUpdateRequested = true;
    this.video.requestVideoFrameCallback(this.updateVideo.bind(this));
  }
  playAfterUserGesture = () => {
    this.video?.play();
    window.removeEventListener("click", this.playAfterUserGesture);
    window.removeEventListener("touchstart", this.playAfterUserGesture);
  };
};
__publicField(VideoTexture, "TypeName", "video-texture");
__decorate14([
  property14.string()
], VideoTexture.prototype, "url", void 0);
__decorate14([
  property14.material({ required: true })
], VideoTexture.prototype, "material", void 0);
__decorate14([
  property14.bool(true)
], VideoTexture.prototype, "loop", void 0);
__decorate14([
  property14.bool(true)
], VideoTexture.prototype, "autoplay", void 0);
__decorate14([
  property14.bool(true)
], VideoTexture.prototype, "muted", void 0);
__decorate14([
  property14.string("auto")
], VideoTexture.prototype, "textureProperty", void 0);

// node_modules/@wonderlandengine/components/dist/vr-mode-active-switch.js
import { Component as Component23, Type as Type4 } from "@wonderlandengine/api";
var VrModeActiveSwitch = class extends Component23 {
  start() {
    this.components = [];
    this.getComponents(this.object);
    this.onXRSessionEnd();
    this.onSessionStartCallback = this.onXRSessionStart.bind(this);
    this.onSessionEndCallback = this.onXRSessionEnd.bind(this);
  }
  onActivate() {
    this.engine.onXRSessionStart.add(this.onSessionStartCallback);
    this.engine.onXRSessionEnd.add(this.onSessionEndCallback);
  }
  onDeactivate() {
    this.engine.onXRSessionStart.remove(this.onSessionStartCallback);
    this.engine.onXRSessionEnd.remove(this.onSessionEndCallback);
  }
  getComponents(obj) {
    const comps = obj.getComponents().filter((c) => c.type !== "vr-mode-active-switch");
    this.components = this.components.concat(comps);
    if (this.affectChildren) {
      let children = obj.children;
      for (let i = 0; i < children.length; ++i) {
        this.getComponents(children[i]);
      }
    }
  }
  setComponentsActive(active) {
    const comps = this.components;
    for (let i = 0; i < comps.length; ++i) {
      comps[i].active = active;
    }
  }
  onXRSessionStart() {
    this.setComponentsActive(this.activateComponents == 0);
  }
  onXRSessionEnd() {
    this.setComponentsActive(this.activateComponents != 0);
  }
};
__publicField(VrModeActiveSwitch, "TypeName", "vr-mode-active-switch");
__publicField(VrModeActiveSwitch, "Properties", {
  /** When components should be active: In VR or when not in VR */
  activateComponents: {
    type: Type4.Enum,
    values: ["in VR", "in non-VR"],
    default: "in VR"
  },
  /** Whether child object's components should be affected */
  affectChildren: { type: Type4.Bool, default: true }
});

// node_modules/@wonderlandengine/components/dist/plane-detection.js
import { Collider, CollisionComponent as CollisionComponent2, Component as Component24, Emitter as Emitter7, Mesh as Mesh2, MeshAttribute as MeshAttribute2, MeshComponent as MeshComponent2, MeshIndexType as MeshIndexType2 } from "@wonderlandengine/api";
import { property as property15 } from "@wonderlandengine/api/decorators.js";
var import_earcut = __toESM(require_earcut(), 1);
var __decorate15 = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
    r = Reflect.decorate(decorators, target, key, desc);
  else
    for (var i = decorators.length - 1; i >= 0; i--)
      if (d = decorators[i])
        r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var tempVec32 = new Float32Array(3);
function extentsFromContour(out, points) {
  if (points.length == 0)
    return out;
  let absMaxX = Math.abs(points[0].x);
  let absMaxZ = Math.abs(points[0].z);
  for (let i = 1; i < points.length; ++i) {
    absMaxX = Math.max(absMaxX, Math.abs(points[i].x));
    absMaxZ = Math.max(absMaxZ, Math.abs(points[i].z));
  }
  out[0] = absMaxX;
  out[1] = 0;
  out[2] = absMaxZ;
}
function planeMeshFromContour(engine, points, meshToUpdate = null) {
  const vertexCount = points.length;
  const vertices = new Float32Array(vertexCount * 2);
  for (let i = 0, d = 0; i < vertexCount; ++i, d += 2) {
    vertices[d] = points[i].x;
    vertices[d + 1] = points[i].z;
  }
  const triangles = (0, import_earcut.default)(vertices);
  const mesh = meshToUpdate || new Mesh2(engine, {
    vertexCount,
    /* Assumption here that we will never have more than 256 points
     * in the detected plane meshes! */
    indexType: MeshIndexType2.UnsignedByte,
    indexData: triangles
  });
  if (mesh.vertexCount !== vertexCount) {
    console.warn("vertexCount of meshToUpdate did not match required vertexCount");
    return mesh;
  }
  const positions = mesh.attribute(MeshAttribute2.Position);
  const textureCoords = mesh.attribute(MeshAttribute2.TextureCoordinate);
  const normals = mesh.attribute(MeshAttribute2.Normal);
  tempVec32[1] = 0;
  for (let i = 0, s = 0; i < vertexCount; ++i, s += 2) {
    tempVec32[0] = vertices[s];
    tempVec32[2] = vertices[s + 1];
    positions.set(i, tempVec32);
  }
  textureCoords?.set(0, vertices);
  if (normals) {
    tempVec32[0] = 0;
    tempVec32[1] = 1;
    tempVec32[2] = 0;
    for (let i = 0; i < vertexCount; ++i) {
      normals.set(i, tempVec32);
    }
  }
  if (meshToUpdate)
    mesh.update();
  return mesh;
}
var _planeLost, planeLost_fn, _planeFound, planeFound_fn, _planeUpdate, planeUpdate_fn, _planeUpdatePose, planeUpdatePose_fn;
var PlaneDetection = class extends Component24 {
  constructor() {
    super(...arguments);
    __privateAdd(this, _planeLost);
    __privateAdd(this, _planeFound);
    __privateAdd(this, _planeUpdate);
    __privateAdd(this, _planeUpdatePose);
    /**
     * Material to assign to created plane meshes or `null` if meshes should not be created.
     */
    __publicField(this, "planeMaterial", null);
    /**
     * Collision mask to assign to newly created collision components or a negative value if
     * collision components should not be created.
     */
    __publicField(this, "collisionMask", -1);
    /** Map of all planes and their last updated timestamps */
    __publicField(this, "planes", /* @__PURE__ */ new Map());
    /** Objects generated for each XRPlane */
    __publicField(this, "planeObjects", /* @__PURE__ */ new Map());
    /** Called when a plane starts tracking */
    __publicField(this, "onPlaneFound", new Emitter7());
    /** Called when a plane stops tracking */
    __publicField(this, "onPlaneLost", new Emitter7());
  }
  update() {
    if (!this.engine.xr?.frame)
      return;
    if (this.engine.xr.frame.detectedPlanes === void 0) {
      console.error("plane-detection: WebXR feature not available.");
      this.active = false;
      return;
    }
    const detectedPlanes = this.engine.xr.frame.detectedPlanes;
    for (const [plane, _] of this.planes) {
      if (!detectedPlanes.has(plane)) {
        __privateMethod(this, _planeLost, planeLost_fn).call(this, plane);
      }
    }
    detectedPlanes.forEach((plane) => {
      if (this.planes.has(plane)) {
        if (plane.lastChangedTime > this.planes.get(plane)) {
          __privateMethod(this, _planeUpdate, planeUpdate_fn).call(this, plane);
        }
      } else {
        __privateMethod(this, _planeFound, planeFound_fn).call(this, plane);
      }
      __privateMethod(this, _planeUpdatePose, planeUpdatePose_fn).call(this, plane);
    });
  }
};
_planeLost = new WeakSet();
planeLost_fn = function(plane) {
  this.planes.delete(plane);
  const o = this.planeObjects.get(plane);
  this.onPlaneLost.notify(plane, o);
  if (o.objectId > 0)
    o.destroy();
};
_planeFound = new WeakSet();
planeFound_fn = function(plane) {
  this.planes.set(plane, plane.lastChangedTime);
  const o = this.engine.scene.addObject(this.object);
  this.planeObjects.set(plane, o);
  if (this.planeMaterial) {
    o.addComponent(MeshComponent2, {
      mesh: planeMeshFromContour(this.engine, plane.polygon),
      material: this.planeMaterial
    });
  }
  if (this.collisionMask >= 0) {
    extentsFromContour(tempVec32, plane.polygon);
    tempVec32[1] = 0.025;
    o.addComponent(CollisionComponent2, {
      group: this.collisionMask,
      collider: Collider.Box,
      extents: tempVec32
    });
  }
  this.onPlaneFound.notify(plane, o);
};
_planeUpdate = new WeakSet();
planeUpdate_fn = function(plane) {
  this.planes.set(plane, plane.lastChangedTime);
  const planeMesh = this.planeObjects.get(plane).getComponent(MeshComponent2);
  if (!planeMesh)
    return;
  planeMeshFromContour(this.engine, plane.polygon, planeMesh.mesh);
};
_planeUpdatePose = new WeakSet();
planeUpdatePose_fn = function(plane) {
  const o = this.planeObjects.get(plane);
  const pose = this.engine.xr.frame.getPose(plane.planeSpace, this.engine.xr.currentReferenceSpace);
  if (!pose) {
    o.active = false;
    return;
  }
  setXRRigidTransformLocal(o, pose.transform);
};
__publicField(PlaneDetection, "TypeName", "plane-detection");
__decorate15([
  property15.material()
], PlaneDetection.prototype, "planeMaterial", void 0);
__decorate15([
  property15.int()
], PlaneDetection.prototype, "collisionMask", void 0);

// node_modules/@wonderlandengine/components/dist/vrm.js
import { Component as Component25 } from "@wonderlandengine/api";
import { property as property16 } from "@wonderlandengine/api/decorators.js";
var __decorate16 = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
    r = Reflect.decorate(decorators, target, key, desc);
  else
    for (var i = decorators.length - 1; i >= 0; i--)
      if (d = decorators[i])
        r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var VRM_ROLL_AXES = {
  X: [1, 0, 0],
  Y: [0, 1, 0],
  Z: [0, 0, 1]
};
var VRM_AIM_AXES = {
  PositiveX: [1, 0, 0],
  NegativeX: [-1, 0, 0],
  PositiveY: [0, 1, 0],
  NegativeY: [0, -1, 0],
  PositiveZ: [0, 0, 1],
  NegativeZ: [0, 0, -1]
};
var Rad2Deg = 180 / Math.PI;
var RightVector = vec3_exports.fromValues(1, 0, 0);
var UpVector = vec3_exports.fromValues(0, 1, 0);
var ForwardVector = vec3_exports.fromValues(0, 0, 1);
var Vrm = class extends Component25 {
  /** URL to a VRM file to load */
  src;
  /** Object the VRM is looking at */
  lookAtTarget;
  /** Meta information about the VRM model */
  meta = null;
  /** The humanoid bones of the VRM model */
  bones = {
    /* Torso */
    hips: null,
    spine: null,
    chest: null,
    upperChest: null,
    neck: null,
    /* Head */
    head: null,
    leftEye: null,
    rightEye: null,
    jaw: null,
    /* Legs */
    leftUpperLeg: null,
    leftLowerLeg: null,
    leftFoot: null,
    leftToes: null,
    rightUpperLeg: null,
    rightLowerLeg: null,
    rightFoot: null,
    rightToes: null,
    /* Arms */
    leftShoulder: null,
    leftUpperArm: null,
    leftLowerArm: null,
    leftHand: null,
    rightShoulder: null,
    rightUpperArm: null,
    rightLowerArm: null,
    rightHand: null,
    /* Fingers */
    leftThumbMetacarpal: null,
    leftThumbProximal: null,
    leftThumbDistal: null,
    leftIndexProximal: null,
    leftIndexIntermediate: null,
    leftIndexDistal: null,
    leftMiddleProximal: null,
    leftMiddleIntermediate: null,
    leftMiddleDistal: null,
    leftRingProximal: null,
    leftRingIntermediate: null,
    leftRingDistal: null,
    leftLittleProximal: null,
    leftLittleIntermediate: null,
    leftLittleDistal: null,
    rightThumbMetacarpal: null,
    rightThumbProximal: null,
    rightThumbDistal: null,
    rightIndexProximal: null,
    rightIndexIntermediate: null,
    rightIndexDistal: null,
    rightMiddleProximal: null,
    rightMiddleIntermediate: null,
    rightMiddleDistal: null,
    rightRingProximal: null,
    rightRingIntermediate: null,
    rightRingDistal: null,
    rightLittleProximal: null,
    rightLittleIntermediate: null,
    rightLittleDistal: null
  };
  /** Rotations of the bones in the rest pose (T-pose) */
  restPose = {};
  /* All node constraints, ordered to deal with dependencies */
  _nodeConstraints = [];
  /* VRMC_springBone chains */
  _springChains = [];
  /* Spherical colliders for spring bones */
  _sphereColliders = [];
  /* Capsule shaped colliders for spring bones */
  _capsuleColliders = [];
  /* Indicates which meshes are rendered in first/third person views */
  _firstPersonAnnotations = [];
  /* Contains details for (bone type) lookAt behaviour */
  _lookAt = null;
  /* Whether or not the VRM component has been initialized with `initializeVrm` */
  _initialized = false;
  _tempV3 = vec3_exports.create();
  _tempV3A = vec3_exports.create();
  _tempV3B = vec3_exports.create();
  _tempQuat = quat_exports.create();
  _tempQuatA = quat_exports.create();
  _tempQuatB = quat_exports.create();
  _tempQuat2 = quat2_exports.create();
  _tailToShape = vec3_exports.create();
  _headToTail = vec3_exports.create();
  _inertia = vec3_exports.create();
  _stiffness = vec3_exports.create();
  _external = vec3_exports.create();
  _identityQuat = quat_exports.identity(quat_exports.create());
  async start() {
    if (!this.src) {
      console.error("vrm: src property not set");
      return;
    }
    const prefab = await this.engine.loadGLTF({ url: this.src, extensions: true });
    const { root, extensions } = this.engine.scene.instantiate(prefab);
    root.children.forEach((child) => child.parent = this.object);
    this._initializeVrm(prefab.extensions, extensions?.idMapping);
    root.destroy();
  }
  /**
   * Parses the VRM glTF extensions and initializes the vrm component.
   * @param extensions The glTF extensions for the VRM model
   */
  _initializeVrm(extensions, idMapping) {
    if (this._initialized) {
      throw new Error("VRM component has already been initialized");
    }
    const VRMC_vrm = extensions.root["VRMC_vrm"];
    if (!VRMC_vrm) {
      throw new Error("Missing VRM extensions");
    }
    if (VRMC_vrm.specVersion !== "1.0") {
      throw new Error(`Unsupported VRM version, only 1.0 is supported, but encountered '${VRMC_vrm.specVersion}'`);
    }
    this.meta = VRMC_vrm.meta;
    this._parseHumanoid(VRMC_vrm.humanoid, idMapping);
    if (VRMC_vrm.firstPerson) {
      this._parseFirstPerson(VRMC_vrm.firstPerson, extensions);
    }
    if (VRMC_vrm.lookAt) {
      this._parseLookAt(VRMC_vrm.lookAt);
    }
    this._findAndParseNodeConstraints(extensions, idMapping);
    const springBone = extensions.root["VRMC_springBone"];
    if (springBone) {
      this._parseAndInitializeSpringBones(springBone, idMapping);
    }
    this._initialized = true;
  }
  _parseHumanoid(humanoid, idMapping) {
    for (const boneName in humanoid.humanBones) {
      if (!(boneName in this.bones)) {
        console.warn(`Unrecognized bone '${boneName}'`);
        continue;
      }
      const node = humanoid.humanBones[boneName].node;
      const objectId = idMapping[node];
      this.bones[boneName] = this.engine.scene.wrap(objectId);
      this.restPose[boneName] = this.bones[boneName].getRotationLocal(quat_exports.create());
    }
  }
  _parseFirstPerson(firstPerson, idMapping) {
    for (const meshAnnotation of firstPerson.meshAnnotations) {
      const annotation = {
        node: this.engine.scene.wrap(idMapping[meshAnnotation.node]),
        firstPerson: true,
        thirdPerson: true
      };
      switch (meshAnnotation.type) {
        case "firstPersonOnly":
          annotation.thirdPerson = false;
          break;
        case "thirdPersonOnly":
          annotation.firstPerson = false;
          break;
        case "both":
          break;
        case "auto":
          console.warn("First person mesh annotation type 'auto' is not supported, treating as 'both'!");
          break;
        default:
          console.error(`Invalid mesh annotation type '${meshAnnotation.type}'`);
          break;
      }
      this._firstPersonAnnotations.push(annotation);
    }
  }
  _parseLookAt(lookAt2) {
    if (lookAt2.type !== "bone") {
      console.warn(`Unsupported lookAt type '${lookAt2.type}', only 'bone' is supported`);
      return;
    }
    const parseRangeMap = (rangeMap) => {
      return {
        inputMaxValue: rangeMap.inputMaxValue,
        outputScale: rangeMap.outputScale
      };
    };
    this._lookAt = {
      offsetFromHeadBone: lookAt2.offsetFromHeadBone || [0, 0, 0],
      horizontalInner: parseRangeMap(lookAt2.rangeMapHorizontalInner),
      horizontalOuter: parseRangeMap(lookAt2.rangeMapHorizontalOuter),
      verticalDown: parseRangeMap(lookAt2.rangeMapVerticalDown),
      verticalUp: parseRangeMap(lookAt2.rangeMapVerticalUp)
    };
  }
  _findAndParseNodeConstraints(extensions, idMapping) {
    const traverse = (object) => {
      const nodeExtensions = extensions.node[object.objectId];
      if (nodeExtensions && "VRMC_node_constraint" in nodeExtensions) {
        const nodeConstraintExtension = nodeExtensions["VRMC_node_constraint"];
        const constraint = nodeConstraintExtension.constraint;
        let type, axis;
        if ("roll" in constraint) {
          type = "roll";
          axis = VRM_ROLL_AXES[constraint.roll.rollAxis];
        } else if ("aim" in constraint) {
          type = "aim";
          axis = VRM_AIM_AXES[constraint.aim.aimAxis];
        } else if ("rotation" in constraint) {
          type = "rotation";
        }
        if (type) {
          const source = this.engine.scene.wrap(idMapping[constraint[type].source]);
          this._nodeConstraints.push({
            type,
            source,
            destination: object,
            axis,
            weight: constraint[type].weight,
            /* Rest pose */
            destinationRestLocalRotation: object.getRotationLocal(quat_exports.create()),
            sourceRestLocalRotation: source.getRotationLocal(quat_exports.create()),
            sourceRestLocalRotationInv: quat_exports.invert(quat_exports.create(), source.getRotationLocal(this._tempQuat))
          });
        } else {
          console.warn("Unrecognized or invalid VRMC_node_constraint, ignoring it");
        }
      }
      for (const child of object.children) {
        traverse(child);
      }
    };
    traverse(this.object);
  }
  _parseAndInitializeSpringBones(springBone, idMapping) {
    const colliders = (springBone.colliders || []).map((collider, i) => {
      const shapeType = "capsule" in collider.shape ? "capsule" : "sphere";
      return {
        id: i,
        object: this.engine.scene.wrap(idMapping[collider.node]),
        shape: {
          isCapsule: shapeType === "capsule",
          radius: collider.shape[shapeType].radius,
          offset: collider.shape[shapeType].offset,
          tail: collider.shape[shapeType].tail
        },
        cache: {
          head: vec3_exports.create(),
          tail: vec3_exports.create()
        }
      };
    });
    this._sphereColliders = colliders.filter((c) => !c.shape.isCapsule);
    this._capsuleColliders = colliders.filter((c) => c.shape.isCapsule);
    const colliderGroups = (springBone.colliderGroups || []).map((group) => ({
      name: group.name,
      colliders: group.colliders.map((c) => colliders[c])
    }));
    for (const spring of springBone.springs) {
      const joints = [];
      for (const joint of spring.joints) {
        const springJoint = {
          hitRadius: 0,
          stiffness: 1,
          gravityPower: 0,
          gravityDir: [0, -1, 0],
          dragForce: 0.5,
          node: null,
          state: null
        };
        Object.assign(springJoint, joint);
        springJoint.node = this.engine.scene.wrap(idMapping[joint.node]);
        joints.push(springJoint);
      }
      const springChainColliders = (spring.colliderGroups || []).flatMap((cg) => colliderGroups[cg].colliders);
      this._springChains.push({
        name: spring.name,
        center: spring.center ? this.engine.scene.wrap(idMapping[spring.center]) : null,
        joints,
        sphereColliders: springChainColliders.filter((c) => !c.shape.isCapsule),
        capsuleColliders: springChainColliders.filter((c) => c.shape.isCapsule)
      });
    }
    for (const springChain of this._springChains) {
      for (let i = 0; i < springChain.joints.length - 1; ++i) {
        const springBoneJoint = springChain.joints[i];
        const childSpringBoneJoint = springChain.joints[i + 1];
        const springBonePosition = springBoneJoint.node.getPositionWorld(vec3_exports.create());
        const childSpringBonePosition = childSpringBoneJoint.node.getPositionWorld(vec3_exports.create());
        const boneDirection = vec3_exports.subtract(this._tempV3A, springBonePosition, childSpringBonePosition);
        const state = {
          prevTail: vec3_exports.copy(vec3_exports.create(), childSpringBonePosition),
          currentTail: vec3_exports.copy(vec3_exports.create(), childSpringBonePosition),
          initialLocalRotation: springBoneJoint.node.getRotationLocal(quat_exports.create()),
          initialLocalTransformInvert: quat2_exports.invert(quat2_exports.create(), springBoneJoint.node.getTransformLocal(this._tempQuat2)),
          boneAxis: vec3_exports.normalize(vec3_exports.create(), childSpringBoneJoint.node.getPositionLocal(this._tempV3)),
          /* Ensure bone length is at least 1cm to avoid jittery behaviour from zero-length bones */
          boneLength: Math.max(0.01, vec3_exports.length(boneDirection)),
          /* Tail positions in center space, if needed */
          prevTailCenter: null,
          currentTailCenter: null
        };
        if (springChain.center) {
          state.prevTailCenter = springChain.center.transformPointInverseWorld(vec3_exports.create(), childSpringBonePosition);
          state.currentTailCenter = vec3_exports.copy(vec3_exports.create(), childSpringBonePosition);
        }
        springBoneJoint.state = state;
      }
    }
  }
  update(dt) {
    if (!this._initialized) {
      return;
    }
    this._resolveLookAt();
    this._resolveConstraints();
    this._updateSpringBones(dt);
  }
  _rangeMap(rangeMap, input) {
    const maxValue = rangeMap.inputMaxValue;
    const outputScale = rangeMap.outputScale;
    return Math.min(input, maxValue) / maxValue * outputScale;
  }
  _resolveLookAt() {
    if (!this._lookAt || !this.lookAtTarget) {
      return;
    }
    const lookAtSource = this.bones.head.transformPointWorld(this._tempV3A, this._lookAt.offsetFromHeadBone);
    const lookAtTarget = this.lookAtTarget.getPositionWorld(this._tempV3B);
    const lookAtDirection = vec3_exports.sub(this._tempV3A, lookAtTarget, lookAtSource);
    vec3_exports.normalize(lookAtDirection, lookAtDirection);
    this.bones.head.parent.transformVectorInverseWorld(lookAtDirection);
    const z = vec3_exports.dot(lookAtDirection, ForwardVector);
    const x = vec3_exports.dot(lookAtDirection, RightVector);
    const yaw = Math.atan2(x, z) * Rad2Deg;
    const xz = Math.sqrt(x * x + z * z);
    const y = vec3_exports.dot(lookAtDirection, UpVector);
    let pitch = Math.atan2(-y, xz) * Rad2Deg;
    if (pitch > 0) {
      pitch = this._rangeMap(this._lookAt.verticalDown, pitch);
    } else {
      pitch = -this._rangeMap(this._lookAt.verticalUp, -pitch);
    }
    if (this.bones.leftEye) {
      let yawLeft = yaw;
      if (yawLeft > 0) {
        yawLeft = this._rangeMap(this._lookAt.horizontalInner, yawLeft);
      } else {
        yawLeft = -this._rangeMap(this._lookAt.horizontalOuter, -yawLeft);
      }
      const eyeRotation = quat_exports.fromEuler(this._tempQuatA, pitch, yawLeft, 0);
      this.bones.leftEye.setRotationLocal(quat_exports.multiply(eyeRotation, this.restPose.leftEye, eyeRotation));
    }
    if (this.bones.rightEye) {
      let yawRight = yaw;
      if (yawRight > 0) {
        yawRight = this._rangeMap(this._lookAt.horizontalOuter, yawRight);
      } else {
        yawRight = -this._rangeMap(this._lookAt.horizontalInner, -yawRight);
      }
      const eyeRotation = quat_exports.fromEuler(this._tempQuatA, pitch, yawRight, 0);
      this.bones.rightEye.setRotationLocal(quat_exports.multiply(eyeRotation, this.restPose.rightEye, eyeRotation));
    }
  }
  _resolveConstraints() {
    for (const nodeConstraint of this._nodeConstraints) {
      this._resolveConstraint(nodeConstraint);
    }
  }
  _resolveConstraint(nodeConstraint) {
    const dstRestQuat = nodeConstraint.destinationRestLocalRotation;
    const srcRestQuatInv = nodeConstraint.sourceRestLocalRotationInv;
    const targetQuat = quat_exports.identity(this._tempQuatA);
    switch (nodeConstraint.type) {
      case "roll":
        {
          const deltaSrcQuat = quat_exports.multiply(this._tempQuatA, srcRestQuatInv, nodeConstraint.source.rotationLocal);
          const deltaSrcQuatInParent = quat_exports.multiply(this._tempQuatA, nodeConstraint.sourceRestLocalRotation, deltaSrcQuat);
          quat_exports.mul(deltaSrcQuatInParent, deltaSrcQuatInParent, srcRestQuatInv);
          const dstRestQuatInv = quat_exports.invert(this._tempQuatB, dstRestQuat);
          const deltaSrcQuatInDst = quat_exports.multiply(this._tempQuatB, dstRestQuatInv, deltaSrcQuatInParent);
          quat_exports.multiply(deltaSrcQuatInDst, deltaSrcQuatInDst, dstRestQuat);
          const toVec = vec3_exports.transformQuat(this._tempV3A, nodeConstraint.axis, deltaSrcQuatInDst);
          const fromToQuat = quat_exports.rotationTo(this._tempQuatA, nodeConstraint.axis, toVec);
          quat_exports.mul(targetQuat, dstRestQuat, quat_exports.invert(this._tempQuat, fromToQuat));
          quat_exports.mul(targetQuat, targetQuat, deltaSrcQuatInDst);
        }
        break;
      case "aim":
        {
          const dstParentWorldQuat = nodeConstraint.destination.parent.rotationWorld;
          const fromVec = vec3_exports.transformQuat(this._tempV3A, nodeConstraint.axis, dstRestQuat);
          vec3_exports.transformQuat(fromVec, fromVec, dstParentWorldQuat);
          const toVec = nodeConstraint.source.getTranslationWorld(this._tempV3B);
          vec3_exports.sub(toVec, toVec, nodeConstraint.destination.getTranslationWorld(this._tempV3));
          vec3_exports.normalize(toVec, toVec);
          const fromToQuat = quat_exports.rotationTo(this._tempQuatA, fromVec, toVec);
          quat_exports.mul(targetQuat, quat_exports.invert(this._tempQuat, dstParentWorldQuat), fromToQuat);
          quat_exports.mul(targetQuat, targetQuat, dstParentWorldQuat);
          quat_exports.mul(targetQuat, targetQuat, dstRestQuat);
        }
        break;
      case "rotation":
        {
          const srcDeltaQuat = quat_exports.mul(targetQuat, srcRestQuatInv, nodeConstraint.source.rotationLocal);
          quat_exports.mul(targetQuat, dstRestQuat, srcDeltaQuat);
        }
        break;
    }
    quat_exports.slerp(targetQuat, dstRestQuat, targetQuat, nodeConstraint.weight);
    nodeConstraint.destination.rotationLocal = targetQuat;
  }
  _updateSpringBones(dt) {
    this._sphereColliders.forEach(({ object, shape, cache }) => {
      const offset2 = vec3_exports.copy(cache.head, shape.offset);
      object.transformVectorWorld(offset2);
      vec3_exports.add(cache.head, object.getPositionWorld(this._tempV3), offset2);
    });
    this._capsuleColliders.forEach(({ object, shape, cache }) => {
      const shapeCenter = object.getPositionWorld(this._tempV3A);
      const headOffset = vec3_exports.copy(cache.head, shape.offset);
      object.transformVectorWorld(headOffset);
      vec3_exports.add(cache.head, shapeCenter, headOffset);
      const tailOffset = vec3_exports.copy(cache.tail, shape.tail);
      object.transformVectorWorld(tailOffset);
      vec3_exports.add(cache.tail, shapeCenter, tailOffset);
    });
    this._springChains.forEach((springChain) => {
      for (let i = 0; i < springChain.joints.length - 1; ++i) {
        const joint = springChain.joints[i];
        if (!joint.state)
          continue;
        const parentWorldRotation = joint.node.parent ? joint.node.parent.getRotationWorld(this._tempQuat) : this._identityQuat;
        const inertia = this._inertia;
        if (springChain.center) {
          vec3_exports.sub(inertia, joint.state.currentTailCenter, joint.state.prevTailCenter);
          springChain.center.transformVectorWorld(inertia);
        } else {
          vec3_exports.sub(inertia, joint.state.currentTail, joint.state.prevTail);
        }
        vec3_exports.scale(inertia, inertia, 1 - joint.dragForce);
        const stiffness = vec3_exports.copy(this._stiffness, joint.state.boneAxis);
        vec3_exports.transformQuat(stiffness, stiffness, joint.state.initialLocalRotation);
        vec3_exports.transformQuat(stiffness, stiffness, parentWorldRotation);
        vec3_exports.scale(stiffness, stiffness, dt * joint.stiffness);
        const external = vec3_exports.scale(this._external, joint.gravityDir, dt * joint.gravityPower);
        const nextTail = vec3_exports.copy(this._tempV3A, joint.state.currentTail);
        vec3_exports.add(nextTail, nextTail, inertia);
        vec3_exports.add(nextTail, nextTail, stiffness);
        vec3_exports.add(nextTail, nextTail, external);
        const worldPosition = joint.node.getPositionWorld(this._tempV3B);
        vec3_exports.sub(nextTail, nextTail, worldPosition);
        vec3_exports.normalize(nextTail, nextTail);
        vec3_exports.scaleAndAdd(nextTail, worldPosition, nextTail, joint.state.boneLength);
        for (const { shape, cache } of springChain.sphereColliders) {
          let tailToShape = this._tailToShape;
          const sphereCenter = cache.head;
          tailToShape = vec3_exports.sub(tailToShape, nextTail, sphereCenter);
          const radius = shape.radius + joint.hitRadius;
          const dist2 = vec3_exports.length(tailToShape) - radius;
          if (dist2 < 0) {
            vec3_exports.normalize(tailToShape, tailToShape);
            vec3_exports.scaleAndAdd(nextTail, nextTail, tailToShape, -dist2);
            vec3_exports.sub(nextTail, nextTail, worldPosition);
            vec3_exports.normalize(nextTail, nextTail);
            vec3_exports.scaleAndAdd(nextTail, worldPosition, nextTail, joint.state.boneLength);
          }
        }
        for (const { shape, cache } of springChain.capsuleColliders) {
          let tailToShape = this._tailToShape;
          const head = cache.head;
          const tail = cache.tail;
          tailToShape = vec3_exports.sub(tailToShape, nextTail, head);
          const headToTail = vec3_exports.sub(this._headToTail, tail, head);
          const dot5 = vec3_exports.dot(headToTail, tailToShape);
          if (vec3_exports.squaredLength(headToTail) <= dot5) {
            vec3_exports.sub(tailToShape, nextTail, tail);
          } else if (dot5 > 0) {
            vec3_exports.scale(headToTail, headToTail, dot5 / vec3_exports.squaredLength(headToTail));
            vec3_exports.sub(tailToShape, tailToShape, headToTail);
          }
          const radius = shape.radius + joint.hitRadius;
          const dist2 = vec3_exports.length(tailToShape) - radius;
          if (dist2 < 0) {
            vec3_exports.normalize(tailToShape, tailToShape);
            vec3_exports.scaleAndAdd(nextTail, nextTail, tailToShape, -dist2);
            vec3_exports.sub(nextTail, nextTail, worldPosition);
            vec3_exports.normalize(nextTail, nextTail);
            vec3_exports.scaleAndAdd(nextTail, worldPosition, nextTail, joint.state.boneLength);
          }
        }
        vec3_exports.copy(joint.state.prevTail, joint.state.currentTail);
        vec3_exports.copy(joint.state.currentTail, nextTail);
        if (springChain.center) {
          vec3_exports.copy(joint.state.prevTailCenter, joint.state.currentTailCenter);
          vec3_exports.copy(joint.state.currentTailCenter, nextTail);
          springChain.center.transformPointInverseWorld(joint.state.currentTailCenter);
        }
        joint.node.parent.transformPointInverseWorld(nextTail);
        const nextTailDualQuat = quat2_exports.fromTranslation(this._tempQuat2, nextTail);
        quat2_exports.multiply(nextTailDualQuat, joint.state.initialLocalTransformInvert, nextTailDualQuat);
        quat2_exports.getTranslation(nextTail, nextTailDualQuat);
        vec3_exports.normalize(nextTail, nextTail);
        const jointRotation = quat_exports.rotationTo(this._tempQuatA, joint.state.boneAxis, nextTail);
        joint.node.setRotationLocal(quat_exports.mul(this._tempQuatA, joint.state.initialLocalRotation, jointRotation));
      }
    });
  }
  /**
   * @param firstPerson Whether the model should render for first person or third person views
   */
  set firstPerson(firstPerson) {
    this._firstPersonAnnotations.forEach((annotation) => {
      const visible = firstPerson == annotation.firstPerson || firstPerson != annotation.thirdPerson;
      annotation.node.getComponents("mesh").forEach((mesh) => {
        mesh.active = visible;
      });
    });
  }
};
__publicField(Vrm, "TypeName", "vrm");
__decorate16([
  property16.string()
], Vrm.prototype, "src", void 0);
__decorate16([
  property16.object()
], Vrm.prototype, "lookAtTarget", void 0);

// node_modules/@wonderlandengine/components/dist/wasd-controls.js
import { Component as Component26 } from "@wonderlandengine/api";
import { property as property17 } from "@wonderlandengine/api/decorators.js";
var __decorate17 = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
    r = Reflect.decorate(decorators, target, key, desc);
  else
    for (var i = decorators.length - 1; i >= 0; i--)
      if (d = decorators[i])
        r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var _direction = new Float32Array(3);
var _tempDualQuat = new Float32Array(8);
var WasdControlsComponent = class extends Component26 {
  /** Movement speed in m/s. */
  speed;
  /** Flag for only moving the object on the global x & z planes */
  lockY;
  /** Object of which the orientation is used to determine forward direction */
  headObject;
  right = false;
  down = false;
  left = false;
  up = false;
  start() {
    this.headObject = this.headObject || this.object;
  }
  onActivate() {
    window.addEventListener("keydown", this.press);
    window.addEventListener("keyup", this.release);
  }
  onDeactivate() {
    window.removeEventListener("keydown", this.press);
    window.removeEventListener("keyup", this.release);
  }
  update() {
    vec3_exports.zero(_direction);
    if (this.up)
      _direction[2] -= 1;
    if (this.down)
      _direction[2] += 1;
    if (this.left)
      _direction[0] -= 1;
    if (this.right)
      _direction[0] += 1;
    vec3_exports.normalize(_direction, _direction);
    _direction[0] *= this.speed;
    _direction[2] *= this.speed;
    vec3_exports.transformQuat(_direction, _direction, this.headObject.getTransformWorld(_tempDualQuat));
    if (this.lockY) {
      _direction[1] = 0;
      vec3_exports.normalize(_direction, _direction);
      vec3_exports.scale(_direction, _direction, this.speed);
    }
    this.object.translateLocal(_direction);
  }
  press = (e) => {
    this.handleKey(e, true);
  };
  release = (e) => {
    this.handleKey(e, false);
  };
  handleKey(e, b) {
    if (e.code === "ArrowUp" || e.code === "KeyW" || e.code === "KeyZ") {
      this.up = b;
    } else if (e.code === "ArrowRight" || e.code === "KeyD") {
      this.right = b;
    } else if (e.code === "ArrowDown" || e.code === "KeyS") {
      this.down = b;
    } else if (e.code === "ArrowLeft" || e.code === "KeyA" || e.code === "KeyQ") {
      this.left = b;
    }
  }
};
__publicField(WasdControlsComponent, "TypeName", "wasd-controls");
__decorate17([
  property17.float(0.1)
], WasdControlsComponent.prototype, "speed", void 0);
__decorate17([
  property17.bool(false)
], WasdControlsComponent.prototype, "lockY", void 0);
__decorate17([
  property17.object()
], WasdControlsComponent.prototype, "headObject", void 0);

// node_modules/@wonderlandengine/components/dist/input-profile.js
import { Component as Component27, Emitter as Emitter8 } from "@wonderlandengine/api";
import { property as property18 } from "@wonderlandengine/api/decorators.js";
var __decorate18 = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
    r = Reflect.decorate(decorators, target, key, desc);
  else
    for (var i = decorators.length - 1; i >= 0; i--)
      if (d = decorators[i])
        r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var _tempVec = vec3_exports.create();
var _tempQuat = quat_exports.create();
var _tempRotation1 = new Float32Array(4);
var _tempRotation2 = new Float32Array(4);
var minTemp = new Float32Array(3);
var maxTemp = new Float32Array(3);
var hands = ["left", "right"];
var _InputProfile = class extends Component27 {
  _gamepadObjects = {};
  _controllerModel = null;
  _defaultControllerComponents;
  _handedness;
  _profileJSON = null;
  _buttons = [];
  _axes = [];
  /**
   * The XR gamepad associated with the current input source.
   */
  gamepad;
  /**
   * A reference to the emitter which triggered on model lodaed event.
   */
  onModelLoaded = new Emitter8();
  /**
   * Returns url of input profile json file
   */
  url;
  /**
   * A set of components to filter during component retrieval.
   */
  toFilter = /* @__PURE__ */ new Set(["vr-mode-active-mode-switch"]);
  /**
   * The index representing the handedness of the controller (0 for left, 1 for right).
   */
  handedness = 0;
  /**
   * The base path where XR input profiles are stored.
   */
  defaultBasePath;
  /**
   * An optional folder path for loading custom XR input profiles.
   */
  customBasePath;
  /**
   * The default 3D controller model used when a custom model fails to load.
   */
  defaultController;
  /**
   * The object which has HandTracking component added to it.
   */
  trackedHand;
  /**
   * If true, the input profile will be mapped to the default controller, and no dynamic 3D model of controller will be loaded.
   */
  mapToDefaultController;
  /**
   * If true, adds a VR mode switch component to the loaded controller model.
   */
  addVrModeSwitch;
  onActivate() {
    this._handedness = hands[this.handedness];
    const defaultHandName = "Hand" + this._handedness.charAt(0).toUpperCase() + this._handedness.slice(1);
    this.trackedHand = this.trackedHand ?? this.object.parent?.findByNameRecursive(defaultHandName)[0];
    this.defaultController = this.defaultController || this.object.children[0];
    this._defaultControllerComponents = this._getComponents(this.defaultController);
    this.engine.onXRSessionStart.add(() => {
      this.engine.xr?.session.addEventListener("inputsourceschange", this._onInputSourcesChange.bind(this));
    });
  }
  onDeactivate() {
    this.engine.xr?.session?.removeEventListener("inputsourceschange", this._onInputSourcesChange.bind(this));
  }
  /**
   * Sets newly loaded controllers for the HandTracking component to proper switching.
   * @param controllerObject The controller object.
   * @hidden
   */
  _setHandTrackingControllers(controllerObject) {
    const handtrackingComponent = this.trackedHand.getComponent(HandTracking);
    if (!handtrackingComponent)
      return;
    handtrackingComponent.controllerToDeactivate = controllerObject;
  }
  /**
   * Retrieves all components from the specified object and its children.
   * @param obj The object to retrieve components from.
   * @return An array of components.
   * @hidden
   */
  _getComponents(obj) {
    const components = [];
    if (obj == null)
      return components;
    const stack = [obj];
    while (stack.length > 0) {
      const currentObj = stack.pop();
      const comps = currentObj.getComponents().filter((c) => !this.toFilter.has(c.type));
      components.push(...comps);
      const children = currentObj.children;
      for (let i = children.length - 1; i >= 0; --i) {
        stack.push(children[i]);
      }
    }
    return components;
  }
  /**
   * Activates or deactivates components based on the specified boolean value.
   * @param active If true, components are set to active; otherwise, they are set to inactive.
   * @hidden
   */
  _setComponentsActive(active) {
    const comps = this._defaultControllerComponents;
    if (comps == void 0)
      return;
    for (let i = 0; i < comps.length; ++i) {
      comps[i].active = active;
    }
  }
  /**
   * Event handler triggered when XR input sources change.
   * Detects new XR input sources and initiates the loading of input profiles.
   * @param event The XR input source change event.
   * @hidden
   */
  _onInputSourcesChange(event) {
    if (this._isModelLoaded() && !this.mapToDefaultController) {
      this._setComponentsActive(false);
    }
    event.added.forEach((xrInputSource) => {
      if (xrInputSource.hand != null)
        return;
      if (this._handedness != xrInputSource.handedness)
        return;
      this.gamepad = xrInputSource.gamepad;
      const profile = this.customBasePath !== "" ? this.customBasePath : this.defaultBasePath + xrInputSource.profiles[0];
      this.url = profile + "/profile.json";
      this._profileJSON = _InputProfile.Cache.get(this.url) ?? null;
      if (this._profileJSON != null)
        return;
      fetch(this.url).then((res) => res.json()).then((out) => {
        this._profileJSON = out;
        _InputProfile.Cache.set(this.url, this._profileJSON);
        if (!this._isModelLoaded())
          this._loadAndMapGamepad(profile);
      }).catch((e) => {
        console.error(`Failed to load profile from ${this.url}. Reason:`, e);
      });
    });
  }
  /**
   * Checks if the 3D controller model is loaded.
   * @return True if the model is loaded; otherwise, false.
   * @hidden
   */
  _isModelLoaded() {
    return this._controllerModel !== null;
  }
  /**
   * Loads the 3D controller model and caches the mapping to the gamepad.
   * @param profile The path to the input profile.
   * @hidden
   */
  async _loadAndMapGamepad(profile) {
    const assetPath = profile + "/" + this._handedness + ".glb";
    this._controllerModel = this.defaultController;
    if (!this.mapToDefaultController) {
      try {
        this._controllerModel = await this.engine.scene.append(assetPath);
      } catch (e) {
        console.error(`Failed to load i-p controller model. Reason:`, e, `Continuing with ${this._handedness} default controller.`);
        this._setComponentsActive(true);
      }
      this._controllerModel.parent = this.object;
      this._controllerModel.setPositionLocal([0, 0, 0]);
      this._setComponentsActive(false);
      if (this.addVrModeSwitch)
        this._controllerModel.addComponent(VrModeActiveSwitch);
      this.onModelLoaded.notify();
    }
    this._cacheGamepadObjectsFromProfile(this._profileJSON, this._controllerModel);
    this._setHandTrackingControllers(this._controllerModel);
    this.update = () => this._mapGamepadInput();
  }
  /**
   * Caches gamepad objects (buttons, axes) from the loaded input profile.
   * @hidden
   */
  _cacheGamepadObjectsFromProfile(profile, obj) {
    const components = profile.layouts[this._handedness].components;
    if (!components)
      return;
    this._buttons = [];
    this._axes = [];
    for (const i in components) {
      const visualResponses = components[i].visualResponses;
      if (components[i].rootNodeName === "menu")
        continue;
      for (const j in visualResponses) {
        const visualResponse = visualResponses[j];
        const valueNode = visualResponse.valueNodeName;
        const minNode = visualResponse.minNodeName;
        const maxNode = visualResponse.maxNodeName;
        this._gamepadObjects[valueNode] = obj.findByNameRecursive(valueNode)[0];
        this._gamepadObjects[minNode] = obj.findByNameRecursive(minNode)[0];
        this._gamepadObjects[maxNode] = obj.findByNameRecursive(maxNode)[0];
        const prop = visualResponses[j].componentProperty;
        const response = {
          target: this._gamepadObjects[valueNode],
          min: this._gamepadObjects[minNode],
          max: this._gamepadObjects[maxNode],
          id: components[i].gamepadIndices[prop]
          // Assign a unique ID
        };
        switch (prop) {
          case "button":
            this._buttons.push(response);
            break;
          case "xAxis":
          case "yAxis":
            this._axes.push(response);
            break;
        }
      }
    }
  }
  /**
   * Assigns a transformed position and rotation to the target based on minimum and maximum values and a normalized input value.
   * @param target The target object to be transformed.
   * @param min The minimum object providing transformation limits.
   * @param max The maximum object providing transformation limits.
   * @param value The normalized input value.
   * @hidden
   */
  _assignTransform(target, min2, max2, value) {
    vec3_exports.lerp(_tempVec, min2.getPositionWorld(minTemp), max2.getPositionWorld(maxTemp), value);
    target.setPositionWorld(_tempVec);
    quat_exports.lerp(_tempQuat, min2.getRotationWorld(_tempRotation1), max2.getRotationWorld(_tempRotation2), value);
    quat_exports.normalize(_tempQuat, _tempQuat);
    target.setRotationWorld(_tempQuat);
  }
  /**
   * Maps input values (buttons, axes) to the 3D controller model.
   * @hidden
   */
  _mapGamepadInput() {
    for (const button of this._buttons) {
      const buttonValue = this.gamepad.buttons[button.id].value;
      this._assignTransform(button.target, button.min, button.max, buttonValue);
    }
    for (const axis of this._axes) {
      const axisValue = this.gamepad.axes[axis.id];
      const normalizedAxisValue = (axisValue + 1) / 2;
      this._assignTransform(axis.target, axis.min, axis.max, normalizedAxisValue);
    }
  }
};
var InputProfile = _InputProfile;
__publicField(InputProfile, "TypeName", "input-profile");
/**
 * A cache to store loaded profiles for reuse.
 */
__publicField(InputProfile, "Cache", /* @__PURE__ */ new Map());
__decorate18([
  property18.enum(hands, 0)
], InputProfile.prototype, "handedness", void 0);
__decorate18([
  property18.string("https://cdn.jsdelivr.net/npm/@webxr-input-profiles/assets@latest/dist/profiles/")
], InputProfile.prototype, "defaultBasePath", void 0);
__decorate18([
  property18.string()
], InputProfile.prototype, "customBasePath", void 0);
__decorate18([
  property18.object()
], InputProfile.prototype, "defaultController", void 0);
__decorate18([
  property18.object()
], InputProfile.prototype, "trackedHand", void 0);
__decorate18([
  property18.bool(false)
], InputProfile.prototype, "mapToDefaultController", void 0);
__decorate18([
  property18.bool(true)
], InputProfile.prototype, "addVrModeSwitch", void 0);

// node_modules/@wonderlandengine/components/dist/orbital-camera.js
import { Component as Component28 } from "@wonderlandengine/api";
import { property as property19 } from "@wonderlandengine/api/decorators.js";
var __decorate19 = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
    r = Reflect.decorate(decorators, target, key, desc);
  else
    for (var i = decorators.length - 1; i >= 0; i--)
      if (d = decorators[i])
        r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var preventDefault2 = (e) => {
  e.preventDefault();
};
var tempVec5 = [0, 0, 0];
var tempquat = quat_exports.create();
var tempquat2 = quat_exports.create();
var tempVec33 = vec3_exports.create();
var OrbitalCamera = class extends Component28 {
  mouseButtonIndex = 0;
  radial = 5;
  minElevation = 0;
  maxElevation = 89.99;
  minZoom = 0.01;
  maxZoom = 10;
  xSensitivity = 0.5;
  ySensitivity = 0.5;
  zoomSensitivity = 0.02;
  damping = 0.9;
  _mouseDown = false;
  _origin = [0, 0, 0];
  _azimuth = 0;
  _polar = 45;
  _initialPinchDistance = 0;
  _touchStartX = 0;
  _touchStartY = 0;
  _azimuthSpeed = 0;
  _polarSpeed = 0;
  init() {
    this.object.getPositionWorld(this._origin);
  }
  start() {
    this._polar = Math.min(this.maxElevation, Math.max(this.minElevation, this._polar));
    this._updateCamera();
  }
  onActivate() {
    const canvas2 = this.engine.canvas;
    if (this.mouseButtonIndex === 2) {
      canvas2.addEventListener("contextmenu", preventDefault2, { passive: false });
    }
    canvas2.addEventListener("mousedown", this._onMouseDown);
    canvas2.addEventListener("wheel", this._onMouseScroll, { passive: false });
    canvas2.addEventListener("touchstart", this._onTouchStart, { passive: false });
    canvas2.addEventListener("touchmove", this._onTouchMove, { passive: false });
    canvas2.addEventListener("touchend", this._onTouchEnd);
  }
  onDeactivate() {
    const canvas2 = this.engine.canvas;
    if (this.mouseButtonIndex === 2) {
      canvas2.removeEventListener("contextmenu", preventDefault2);
    }
    canvas2.removeEventListener("mousemove", this._onMouseMove);
    canvas2.removeEventListener("mousedown", this._onMouseDown);
    canvas2.removeEventListener("wheel", this._onMouseScroll);
    canvas2.removeEventListener("touchstart", this._onTouchStart);
    canvas2.removeEventListener("touchmove", this._onTouchMove);
    canvas2.removeEventListener("touchend", this._onTouchEnd);
    this._mouseDown = false;
    this._initialPinchDistance = 0;
    this._touchStartX = 0;
    this._touchStartY = 0;
    this._azimuthSpeed = 0;
    this._polarSpeed = 0;
  }
  update() {
    this._azimuthSpeed *= this.damping;
    this._polarSpeed *= this.damping;
    if (Math.abs(this._azimuthSpeed) < 0.01)
      this._azimuthSpeed = 0;
    if (Math.abs(this._polarSpeed) < 0.01)
      this._polarSpeed = 0;
    this._azimuth += this._azimuthSpeed;
    this._polar += this._polarSpeed;
    this._polar = Math.min(this.maxElevation, Math.max(this.minElevation, this._polar));
    if (this._azimuthSpeed !== 0 || this._polarSpeed !== 0) {
      this._updateCamera();
    }
  }
  /**
   * Get the closest position to the given position on the orbit sphere of the camera.
   * This can be used to get a position and rotation to transition to.
   *
   * You pass this a position object. The method calculates the closest positition and updates the position parameter.
   * It also sets the rotation parameter to reflect the rotate the camera will have when it is on the orbit sphere,
   * pointing towards the center.
   * @param position the position to get the closest position to
   * @param rotation the rotation to get the closest position to
   */
  getClosestPosition(position, rotation) {
    this.object.getRotationWorld(tempquat);
    this.object.lookAt(this._origin);
    this.object.getRotationWorld(tempquat2);
    if (quat_exports.dot(tempquat, tempquat2) < 0) {
      quat_exports.scale(tempquat2, tempquat2, -1);
    }
    this.object.setRotationWorld(tempquat);
    const directionToCamera = vec3_exports.create();
    vec3_exports.subtract(directionToCamera, position, this._origin);
    vec3_exports.normalize(directionToCamera, directionToCamera);
    const nearestPointOnSphere = vec3_exports.create();
    vec3_exports.scale(nearestPointOnSphere, directionToCamera, this.radial);
    vec3_exports.add(nearestPointOnSphere, nearestPointOnSphere, this._origin);
    vec3_exports.copy(position, nearestPointOnSphere);
    quat_exports.copy(rotation, tempquat2);
  }
  /**
   * Set the camera position based on the given position and calculate the rotation.
   * @param cameraPosition the position to set the camera to
   */
  setPosition(cameraPosition) {
    const centerOfOrbit = this._origin;
    vec3_exports.subtract(tempVec33, cameraPosition, centerOfOrbit);
    vec3_exports.normalize(tempVec33, tempVec33);
    const azimuth = Math.atan2(tempVec33[0], tempVec33[2]);
    const polar = Math.acos(tempVec33[1]);
    const azimuthDeg = rad2deg(azimuth);
    const polarDeg = 90 - rad2deg(polar);
    this._azimuth = azimuthDeg;
    this._polar = polarDeg;
  }
  /**
   * Update the camera position based on the current azimuth,
   * polar and radial values
   */
  _updateCamera() {
    const azimuthInRadians = deg2rad(this._azimuth);
    const polarInRadians = deg2rad(this._polar);
    tempVec5[0] = this.radial * Math.sin(azimuthInRadians) * Math.cos(polarInRadians);
    tempVec5[1] = this.radial * Math.sin(polarInRadians);
    tempVec5[2] = this.radial * Math.cos(azimuthInRadians) * Math.cos(polarInRadians);
    this.object.setPositionWorld(tempVec5);
    this.object.translateWorld(this._origin);
    this.object.lookAt(this._origin);
  }
  /* Mouse Event Handlers */
  _onMouseDown = (e) => {
    window.addEventListener("mouseup", this._onMouseUp);
    window.addEventListener("mousemove", this._onMouseMove);
    if (e.button === this.mouseButtonIndex) {
      this._mouseDown = true;
      document.body.style.cursor = "grabbing";
      if (e.button === 1) {
        e.preventDefault();
        return false;
      }
    }
  };
  _onMouseUp = (e) => {
    window.removeEventListener("mouseup", this._onMouseUp);
    window.removeEventListener("mousemove", this._onMouseMove);
    if (e.button === this.mouseButtonIndex) {
      this._mouseDown = false;
      document.body.style.cursor = "initial";
    }
  };
  _onMouseMove = (e) => {
    if (this.active && this._mouseDown) {
      if (this.active && this._mouseDown) {
        this._azimuthSpeed = -(e.movementX * this.xSensitivity);
        this._polarSpeed = e.movementY * this.ySensitivity;
      }
    }
  };
  _onMouseScroll = (e) => {
    e.preventDefault();
    this.radial *= 1 - e.deltaY * this.zoomSensitivity * -1e-3;
    this.radial = Math.min(this.maxZoom, Math.max(this.minZoom, this.radial));
    this._updateCamera();
  };
  /* Touch event handlers */
  _onTouchStart = (e) => {
    if (e.touches.length === 1) {
      e.preventDefault();
      this._touchStartX = e.touches[0].clientX;
      this._touchStartY = e.touches[0].clientY;
      this._mouseDown = true;
    } else if (e.touches.length === 2) {
      this._initialPinchDistance = this._getDistanceBetweenTouches(e.touches);
      e.preventDefault();
    }
  };
  _onTouchMove = (e) => {
    if (!this.active || !this._mouseDown) {
      return;
    }
    e.preventDefault();
    if (e.touches.length === 1) {
      const deltaX = e.touches[0].clientX - this._touchStartX;
      const deltaY = e.touches[0].clientY - this._touchStartY;
      this._azimuthSpeed = -(deltaX * this.xSensitivity);
      this._polarSpeed = deltaY * this.ySensitivity;
      this._touchStartX = e.touches[0].clientX;
      this._touchStartY = e.touches[0].clientY;
    } else if (e.touches.length === 2) {
      const currentPinchDistance = this._getDistanceBetweenTouches(e.touches);
      const pinchScale = this._initialPinchDistance / currentPinchDistance;
      this.radial *= pinchScale;
      this.radial = Math.min(this.maxZoom, Math.max(this.minZoom, this.radial));
      this._updateCamera();
      this._initialPinchDistance = currentPinchDistance;
    }
  };
  _onTouchEnd = (e) => {
    if (e.touches.length < 2) {
      this._mouseDown = false;
    }
    if (e.touches.length === 1) {
      this._touchStartX = e.touches[0].clientX;
      this._touchStartY = e.touches[0].clientY;
    }
  };
  /**
   * Helper function to calculate the distance between two touch points
   * @param touches list of touch points
   * @returns distance between the two touch points
   */
  _getDistanceBetweenTouches(touches) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }
};
__publicField(OrbitalCamera, "TypeName", "orbital-camera");
__decorate19([
  property19.int()
], OrbitalCamera.prototype, "mouseButtonIndex", void 0);
__decorate19([
  property19.float(5)
], OrbitalCamera.prototype, "radial", void 0);
__decorate19([
  property19.float()
], OrbitalCamera.prototype, "minElevation", void 0);
__decorate19([
  property19.float(89.99)
], OrbitalCamera.prototype, "maxElevation", void 0);
__decorate19([
  property19.float()
], OrbitalCamera.prototype, "minZoom", void 0);
__decorate19([
  property19.float(10)
], OrbitalCamera.prototype, "maxZoom", void 0);
__decorate19([
  property19.float(0.5)
], OrbitalCamera.prototype, "xSensitivity", void 0);
__decorate19([
  property19.float(0.5)
], OrbitalCamera.prototype, "ySensitivity", void 0);
__decorate19([
  property19.float(0.02)
], OrbitalCamera.prototype, "zoomSensitivity", void 0);
__decorate19([
  property19.float(0.9)
], OrbitalCamera.prototype, "damping", void 0);

// js/ambient-audio.js
import { Component as Component29, Property as Property2 } from "@wonderlandengine/api";
var AmbientAudio = class extends AudioSource {
  init() {
    this.isFading = false;
    this.fadeStartVolume = this.volume;
    this.fadeTargetVolume = this.volume;
    this.fadeStartTime = 0;
    this.fadeDuration = 0;
    this.fadeInterval = null;
    this.fadeCallback = null;
    this.previousVolume = this.volume;
    window.ambientAudio = this;
    console.log("[AmbientAudio] Initialized and registered at window.ambientAudio");
    console.log("[AmbientAudio] Instance:", this);
  }
  // Easing function for smooth fade perception
  easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }
  async start() {
    this.spatial = 0;
    await super.start();
    if (this.debugMode) {
      console.log("[AmbientAudio] Started with settings:", {
        src: this.src,
        volume: this.volume,
        loop: this.loop,
        autoplay: this.autoplay,
        fadeInDuration: this.fadeInDuration,
        fadeOutDuration: this.fadeOutDuration
      });
      console.log("[AmbientAudio] fadeOut method available:", typeof this.fadeOut === "function");
      console.log("[AmbientAudio] fadeIn method available:", typeof this.fadeIn === "function");
      this.setupDebugControls();
    }
  }
  /**
   * Fade out the audio smoothly
   * @param duration Optional custom fade duration (uses fadeOutDuration by default)
   * @param onComplete Optional callback when fade completes
   */
  fadeOut(duration = null, onComplete = null) {
    const fadeDuration = duration !== null ? duration : this.fadeOutDuration;
    if (this.debugMode) {
      console.log(`[AmbientAudio] Starting manual fade out over ${fadeDuration}s`);
      console.log("[AmbientAudio] Current volume before fade:", this.volume);
    }
    this.previousVolume = this.volume;
    this.fadeStartVolume = this.volume;
    this.fadeTargetVolume = 0;
    if (this.fadeInterval) {
      clearInterval(this.fadeInterval);
    }
    this.isFading = true;
    this.fadeStartTime = Date.now();
    this.fadeDuration = fadeDuration * 1e3;
    this.fadeCallback = onComplete;
    const steps = 30;
    const stepDuration = 1e3 / steps;
    const totalSteps = Math.floor(fadeDuration * steps);
    let currentStep = 0;
    this.fadeInterval = setInterval(() => {
      currentStep++;
      const progress = currentStep / totalSteps;
      const easedProgress = this.easeInOutQuad(progress);
      const currentVolume = this.fadeStartVolume * (1 - easedProgress);
      this.setVolumeDuringPlayback(currentVolume, 0);
      if (this.debugMode && currentStep % steps === 0) {
        console.log(`[AmbientAudio] Fade progress: ${Math.round(progress * 100)}%, volume: ${currentVolume.toFixed(3)}`);
      }
      if (currentStep >= totalSteps) {
        clearInterval(this.fadeInterval);
        this.fadeInterval = null;
        this.isFading = false;
        this.setVolumeDuringPlayback(0, 0);
        if (this.debugMode) {
          console.log("[AmbientAudio] Fade out complete");
        }
        if (this.fadeCallback) {
          this.fadeCallback();
          this.fadeCallback = null;
        }
      }
    }, stepDuration);
  }
  /**
   * Fade in the audio smoothly
   * @param duration Optional custom fade duration (uses fadeInDuration by default)
   * @param onComplete Optional callback when fade completes
   */
  fadeIn(duration = null, onComplete = null) {
    const fadeDuration = duration !== null ? duration : this.fadeInDuration;
    const targetVolume = this.previousVolume || this.volume;
    if (this.debugMode) {
      console.log(`[AmbientAudio] Starting manual fade in to ${targetVolume} over ${fadeDuration}s`);
    }
    this.fadeStartVolume = 0;
    this.fadeTargetVolume = targetVolume;
    if (this.fadeInterval) {
      clearInterval(this.fadeInterval);
    }
    this.setVolumeDuringPlayback(0, 0);
    this.isFading = true;
    this.fadeStartTime = Date.now();
    this.fadeDuration = fadeDuration * 1e3;
    this.fadeCallback = onComplete;
    const steps = 30;
    const stepDuration = 1e3 / steps;
    const totalSteps = Math.floor(fadeDuration * steps);
    let currentStep = 0;
    this.fadeInterval = setInterval(() => {
      currentStep++;
      const progress = currentStep / totalSteps;
      const easedProgress = this.easeInOutQuad(progress);
      const currentVolume = targetVolume * easedProgress;
      this.setVolumeDuringPlayback(currentVolume, 0);
      if (this.debugMode && currentStep % steps === 0) {
        console.log(`[AmbientAudio] Fade progress: ${Math.round(progress * 100)}%, volume: ${currentVolume.toFixed(3)}`);
      }
      if (currentStep >= totalSteps) {
        clearInterval(this.fadeInterval);
        this.fadeInterval = null;
        this.isFading = false;
        this.setVolumeDuringPlayback(targetVolume, 0);
        if (this.debugMode) {
          console.log("[AmbientAudio] Fade in complete");
        }
        if (this.fadeCallback) {
          this.fadeCallback();
          this.fadeCallback = null;
        }
      }
    }, stepDuration);
  }
  /**
   * Fade to a specific volume
   * @param targetVolume Target volume (0-1)
   * @param duration Fade duration in seconds
   */
  fadeTo(targetVolume, duration) {
    targetVolume = Math.max(0, Math.min(1, targetVolume));
    if (this.debugMode) {
      console.log(`[AmbientAudio] Fading to ${targetVolume} over ${duration}s`);
    }
    this.setVolumeDuringPlayback(targetVolume, duration);
    this.isFading = true;
    this.fadeStartTime = Date.now();
    this.fadeDuration = duration * 1e3;
    setTimeout(() => {
      this.isFading = false;
    }, this.fadeDuration);
  }
  setupDebugControls() {
    console.log("[AmbientAudio] Debug controls:");
    console.log("  O - Fade out (use fadeOutDuration parameter)");
    console.log("  P - Fade in (use fadeInDuration parameter)");
    console.log("  L - Toggle loop");
    console.log("  K - Play/Stop");
    console.log(`  Current fade durations: In=${this.fadeInDuration}s, Out=${this.fadeOutDuration}s`);
    this.onKeyDown = (event) => {
      if (event.code === "KeyO" && !this.isFading) {
        this.fadeOut();
      } else if (event.code === "KeyP" && !this.isFading) {
        this.fadeIn();
      } else if (event.code === "KeyL") {
        this.loop = !this.loop;
        console.log(`[AmbientAudio] Loop toggled to: ${this.loop}`);
        if (this._audioNode) {
          this._audioNode.loop = this.loop;
          console.log("[AmbientAudio] Updated audio node loop property");
        }
      } else if (event.code === "KeyK") {
        if (this.isPlaying) {
          this.stop();
          console.log("[AmbientAudio] Stopped");
        } else {
          this.play();
          console.log("[AmbientAudio] Playing");
        }
      }
    };
    window.addEventListener("keydown", this.onKeyDown);
  }
  onDestroy() {
    super.onDestroy();
    if (this.fadeInterval) {
      clearInterval(this.fadeInterval);
      this.fadeInterval = null;
    }
    if (this.onKeyDown) {
      window.removeEventListener("keydown", this.onKeyDown);
    }
    if (window.ambientAudio === this) {
      window.ambientAudio = null;
    }
  }
};
__publicField(AmbientAudio, "TypeName", "ambient-audio");
__publicField(AmbientAudio, "Properties", {
  ...AudioSource.Properties,
  fadeInDuration: Property2.float(2),
  fadeOutDuration: Property2.float(1),
  debugMode: Property2.bool(true)
});

// js/extended-wasd-controls.js
import { Component as Component30, Property as Property3 } from "@wonderlandengine/api";
var ExtendedWasdControls = class extends Component30 {
  init() {
    this.forward = false;
    this.backward = false;
    this.left = false;
    this.right = false;
    this.up = false;
    this.down = false;
    this.direction = new Float32Array(3);
    this.tempTransform = new Float32Array(8);
  }
  start() {
    this.headObject = this.headObject || this.object;
    console.log("[ExtendedWasdControls] Started with vertical movement (Q/E for up/down)");
  }
  onActivate() {
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
  }
  onDeactivate() {
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
  }
  onKeyDown = (e) => {
    this.handleKey(e, true);
  };
  onKeyUp = (e) => {
    this.handleKey(e, false);
  };
  handleKey(e, pressed) {
    switch (e.code) {
      case "KeyW":
      case "ArrowUp":
        this.forward = pressed;
        break;
      case "KeyS":
      case "ArrowDown":
        this.backward = pressed;
        break;
      case "KeyA":
      case "ArrowLeft":
        this.left = pressed;
        break;
      case "KeyD":
      case "ArrowRight":
        this.right = pressed;
        break;
      case "KeyQ":
        this.up = pressed;
        break;
      case "KeyE":
        this.down = pressed;
        break;
    }
  }
  update(dt) {
    vec3_exports.zero(this.direction);
    if (this.forward)
      this.direction[2] -= 1;
    if (this.backward)
      this.direction[2] += 1;
    if (this.left)
      this.direction[0] -= 1;
    if (this.right)
      this.direction[0] += 1;
    if (this.direction[0] !== 0 || this.direction[2] !== 0) {
      vec3_exports.normalize(this.direction, this.direction);
      vec3_exports.scale(this.direction, this.direction, this.speed);
      vec3_exports.transformQuat(
        this.direction,
        this.direction,
        this.headObject.getTransformWorld(this.tempTransform)
      );
      if (this.lockY) {
        this.direction[1] = 0;
        vec3_exports.normalize(this.direction, this.direction);
        vec3_exports.scale(this.direction, this.direction, this.speed);
      }
      this.object.translateLocal(this.direction);
    }
    if (!this.lockY) {
      if (this.up) {
        this.object.translateLocal([0, this.verticalSpeed, 0]);
      }
      if (this.down) {
        this.object.translateLocal([0, -this.verticalSpeed, 0]);
      }
    }
  }
};
__publicField(ExtendedWasdControls, "TypeName", "extended-wasd-controls");
__publicField(ExtendedWasdControls, "Properties", {
  speed: Property3.float(0.1),
  verticalSpeed: Property3.float(0.1),
  headObject: Property3.object(),
  lockY: Property3.bool(false)
});

// js/interaction-manager.js
import { Component as Component31 } from "@wonderlandengine/api";
var InteractionManager = class extends Component31 {
  init() {
    window.interactionManager = this;
    this.currentInteraction = null;
    this.isInteractionActive = false;
    this.allInteractiveObjects = [];
    console.log("[InteractionManager] Initialized - managing global interactions");
  }
  /**
   * Register an interactive object with the manager
   */
  registerInteractiveObject(obj) {
    if (!this.allInteractiveObjects.includes(obj)) {
      this.allInteractiveObjects.push(obj);
      console.log("[InteractionManager] Registered interactive object:", obj.object.name);
    }
  }
  /**
   * Request to start an interaction
   * Disables all other objects when approved
   */
  requestInteraction(interactiveObject) {
    if (!this.isInteractionActive) {
      this.currentInteraction = interactiveObject;
      this.isInteractionActive = true;
      this.allInteractiveObjects.forEach((obj) => {
        if (obj !== interactiveObject) {
          obj.interactionEnabled = false;
          console.log("[InteractionManager] Disabled interactions for:", obj.object.name);
        }
      });
      console.log("[InteractionManager] Interaction started for:", interactiveObject.object.name);
      console.log("[InteractionManager] All other objects disabled");
      return true;
    } else {
      console.log("[InteractionManager] ERROR: Interaction already active");
      return false;
    }
  }
  /**
   * Mark an interaction as complete
   * Re-enables all other objects
   */
  endInteraction(interactiveObject) {
    if (this.currentInteraction === interactiveObject) {
      console.log("[InteractionManager] Interaction ended for:", interactiveObject.object.name);
      this.allInteractiveObjects.forEach((obj) => {
        if (obj !== interactiveObject) {
          obj.interactionEnabled = true;
          console.log("[InteractionManager] Re-enabled interactions for:", obj.object.name);
        }
      });
      this.currentInteraction = null;
      this.isInteractionActive = false;
      console.log("[InteractionManager] All objects re-enabled");
    }
  }
  /**
   * Emergency stop (if needed)
   */
  forceStopAll() {
    if (this.currentInteraction) {
      console.log("[InteractionManager] Emergency stop - re-enabling all objects");
      this.allInteractiveObjects.forEach((obj) => {
        obj.interactionEnabled = true;
      });
      this.currentInteraction = null;
      this.isInteractionActive = false;
    }
  }
  /**
   * Check if any interaction is currently active
   */
  isAnyInteractionActive() {
    return this.isInteractionActive;
  }
  /**
   * Get the currently active interaction object
   */
  getCurrentInteraction() {
    return this.currentInteraction;
  }
};
__publicField(InteractionManager, "TypeName", "interaction-manager");
__publicField(InteractionManager, "Properties", {});

// js/interactive-object.js
import { Component as Component32, Property as Property4 } from "@wonderlandengine/api";
var InteractiveObject = class extends Component32 {
  init() {
    this.isTriggered = false;
    this.isPlaying = false;
    this.hasBeenPlayed = false;
    this.videoEndTime = 0;
    this.disappearProgress = 0;
    this.interactionEnabled = true;
    this.originalScale = new Float32Array(3);
    this.originalPosition = new Float32Array(3);
    this.playerPos = new Float32Array(3);
    this.objectPos = new Float32Array(3);
    this.ambientAudioComponent = null;
    this.errorLogged = false;
    console.log("[InteractiveObject] Initialized");
  }
  start() {
    if (window.interactionManager) {
      window.interactionManager.registerInteractiveObject(this);
    } else {
      console.warn("[InteractiveObject] No InteractionManager found - add it to scene!");
    }
    if (!this.playerObject) {
      console.error("[InteractiveObject] Player object not assigned!");
      return;
    }
    this.object.getScalingLocal(this.originalScale);
    this.object.getPositionLocal(this.originalPosition);
    this.videoWallComponent = null;
    if (this.videoWallController) {
      this.videoWallComponent = this.videoWallController.getComponent("video-wall-tiled");
      if (!this.videoWallComponent) {
        console.warn("[InteractiveObject] Video wall controller object assigned but no VideoWallTiled component found");
      } else {
        console.log("[InteractiveObject] VideoWallTiled component found:", this.videoWallComponent);
        console.log("[InteractiveObject] Room assignment:", this.room);
      }
    } else {
      console.warn("[InteractiveObject] No video wall controller assigned - video playback will not work");
    }
    if (this.debugMode) {
      console.log("[InteractiveObject] Ready for interaction", {
        object: this.object.name,
        triggerDistance: this.triggerDistance,
        videoDuration: this.videoDuration
      });
    }
  }
  update(dt) {
    if (this.hasBeenPlayed) {
      if (this.disappearProgress < 1) {
        this.updateDisappearAnimation(dt);
      }
      return;
    }
    if (!this.playerObject) {
      if (!this.errorLogged) {
        console.error(
          "[InteractiveObject] Player object not set! In the editor:",
          "\n1. Select the object with this component",
          '\n2. Find "playerObject" property',
          '\n3. Click the target icon and select "Player" (the root player object, not EyeLeft/EyeRight/NonVrCamera)'
        );
        this.errorLogged = true;
      }
      return;
    }
    this.playerObject.getPositionWorld(this.playerPos);
    this.object.getPositionWorld(this.objectPos);
    const distance2 = this.calculateDistance(this.playerPos, this.objectPos);
    if (!this.isTriggered && this.interactionEnabled && distance2 <= this.triggerDistance) {
      console.log(`[InteractiveObject] Distance ${distance2.toFixed(2)}m <= trigger ${this.triggerDistance}m - Triggering!`);
      this.onPlayerApproach();
    }
    if (this.isPlaying && this.videoEndTime > 0) {
      if (Date.now() >= this.videoEndTime) {
        this.onVideoEnd();
      }
    }
  }
  calculateDistance(pos1, pos2) {
    const dx = pos1[0] - pos2[0];
    const dy = pos1[1] - pos2[1];
    const dz = pos1[2] - pos2[2];
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }
  onPlayerApproach() {
    if (this.isTriggered || this.hasBeenPlayed)
      return;
    if (window.interactionManager) {
      if (!window.interactionManager.requestInteraction(this)) {
        console.log("[InteractiveObject] Interaction blocked - another video is playing");
        return;
      }
    }
    this.isTriggered = true;
    this.isPlaying = true;
    console.log("[InteractiveObject] Player approached - triggering interaction");
    if (!this.ambientAudioComponent) {
      this.ambientAudioComponent = window.ambientAudio;
      if (!this.ambientAudioComponent) {
        console.log("[InteractiveObject] Searching for ambient-audio component in scene...");
        const allObjects = this.engine.scene.findByName("AmbientAudio");
        if (allObjects.length > 0) {
          this.ambientAudioComponent = allObjects[0].getComponent("ambient-audio");
          console.log("[InteractiveObject] Found AmbientAudio object:", this.ambientAudioComponent);
        }
        if (!this.ambientAudioComponent) {
          const root = this.engine.scene.root;
          this.ambientAudioComponent = root.getComponent("ambient-audio", 1);
        }
      }
    }
    console.log("[InteractiveObject] Starting parallel fades (audio and lights)");
    let audioFadeComplete = false;
    const audioFadeDuration = this.ambientAudioComponent ? this.ambientAudioComponent.fadeOutDuration || 2 : 0;
    if (this.ambientAudioComponent) {
      console.log("[InteractiveObject] Starting ambient audio fade out");
      this.ambientAudioComponent.fadeOut(null, () => {
        audioFadeComplete = true;
        console.log("[InteractiveObject] Audio fade complete");
        checkAllFadesComplete();
      });
    } else {
      audioFadeComplete = true;
    }
    let lightsFadeComplete = false;
    console.log("[InteractiveObject] Starting light fades");
    this.activateSpotlight(() => {
      lightsFadeComplete = true;
      console.log("[InteractiveObject] Light fades complete");
      checkAllFadesComplete();
    });
    const checkAllFadesComplete = () => {
      if (audioFadeComplete && lightsFadeComplete) {
        console.log("[InteractiveObject] All fades complete, starting video");
        this.startVideo();
      }
    };
    if (!this.ambientAudioComponent) {
      checkAllFadesComplete();
    }
    this.videoEndTime = Date.now() + this.videoDuration * 1e3;
  }
  onVideoEnd() {
    console.log("[InteractiveObject] Video ended");
    this.isPlaying = false;
    this.hasBeenPlayed = true;
    if (window.interactionManager) {
      window.interactionManager.endInteraction(this);
    }
    if (this.ambientAudioComponent) {
      console.log("[InteractiveObject] Fading ambient audio back in");
      this.ambientAudioComponent.fadeIn();
    }
    if (this.videoWallComponent) {
      if (this.videoWallComponent.stopVideo) {
        this.videoWallComponent.stopVideo();
        console.log("[InteractiveObject] Video stopped using stopVideo method");
      } else if (this.videoWallComponent.video) {
        this.videoWallComponent.video.pause();
        this.videoWallComponent.video.currentTime = 0;
        if (this.originalVideoUrl) {
          this.videoWallComponent.videoUrl = this.originalVideoUrl;
          this.videoWallComponent.video.src = this.originalVideoUrl;
          this.originalVideoUrl = null;
        }
        console.log("[InteractiveObject] Video stopped and reset (legacy)");
      }
    }
    this.deactivateSpotlight();
    this.disappearProgress = 0;
  }
  updateDisappearAnimation(dt) {
    this.disappearProgress += dt / this.disappearDuration;
    if (this.disappearProgress >= 1) {
      this.disappearProgress = 1;
      this.object.setScalingLocal([0, 0, 0]);
      console.log("[InteractiveObject] Object disappeared");
      this.notifyCompletion();
    } else {
      const scale6 = 1 - this.smoothstep(0, 1, this.disappearProgress);
      this.object.setScalingLocal([
        this.originalScale[0] * scale6,
        this.originalScale[1] * scale6,
        this.originalScale[2] * scale6
      ]);
      const yOffset = this.disappearProgress * -0.5;
      this.object.setPositionLocal([
        this.originalPosition[0],
        this.originalPosition[1] + yOffset,
        this.originalPosition[2]
      ]);
    }
  }
  activateSpotlight(onComplete) {
    console.log("[InteractiveObject] Activating spotlight and fading other lights");
    const lightControllers = window.lightControllers || [];
    if (lightControllers.length === 0) {
      console.warn("[InteractiveObject] No light controllers found in scene");
      if (onComplete)
        onComplete();
      return;
    }
    let fadesInProgress = 0;
    let fadesCompleted = 0;
    const checkFadesComplete = () => {
      fadesCompleted++;
      if (fadesCompleted >= fadesInProgress && onComplete) {
        onComplete();
      }
    };
    lightControllers.forEach((controller) => {
      if (controller.isSpotlightForObject(this)) {
        console.log("[InteractiveObject] Fading in spotlight");
        fadesInProgress++;
        controller.fadeIn(this.lightFadeInDuration, null, checkFadesComplete);
      } else if (controller.shouldFadeForObject(this)) {
        console.log("[InteractiveObject] Fading out fadeable light");
        fadesInProgress++;
        controller.fadeOut(this.lightFadeOutDuration, checkFadesComplete);
      }
    });
    if (fadesInProgress === 0 && onComplete) {
      onComplete();
    }
  }
  deactivateSpotlight() {
    console.log("[InteractiveObject] Deactivating spotlight and restoring lights");
    const lightControllers = window.lightControllers || [];
    if (lightControllers.length === 0) {
      return;
    }
    lightControllers.forEach((controller) => {
      if (controller.isSpotlightForObject(this)) {
        console.log("[InteractiveObject] Fading out spotlight");
        controller.fadeOut(this.lightFadeOutDuration);
      } else if (controller.shouldFadeForObject(this)) {
        console.log("[InteractiveObject] Restoring fadeable light");
        controller.fadeIn(this.lightFadeInDuration);
      }
    });
  }
  startVideo() {
    console.log("[InteractiveObject] Starting video playback");
    if (this.videoWallComponent) {
      const videoUrl = this.videoUrl || this.videoWallComponent.videoUrl;
      const roomValues = ["left", "right", "both"];
      const roomString = roomValues[this.room] || "left";
      if (this.videoWallComponent.playVideo) {
        console.log(`[InteractiveObject] Playing video in ${roomString} room: ${videoUrl}`);
        this.videoWallComponent.playVideo(videoUrl, roomString);
      } else {
        console.warn("[InteractiveObject] VideoWallTiled component missing playVideo method, using legacy approach");
        if (this.videoUrl && this.videoUrl.length > 0) {
          console.log(`[InteractiveObject] Overriding video URL to: ${this.videoUrl}`);
          this.originalVideoUrl = this.videoWallComponent.videoUrl;
          this.videoWallComponent.videoUrl = this.videoUrl;
          if (this.videoWallComponent.video) {
            this.videoWallComponent.video.src = this.videoUrl;
            this.videoWallComponent.video.load();
          }
        }
        if (this.videoWallComponent.video) {
          const playVideo = () => {
            if (this.videoWallComponent.video.currentTime > 0 && !this.videoWallComponent.video.paused) {
              console.log("[InteractiveObject] Stopping previous video before starting new one");
              this.videoWallComponent.video.pause();
            }
            this.videoWallComponent.video.currentTime = 0;
            this.videoWallComponent.video.play().then(() => {
              console.log(`[InteractiveObject] Video playing in ${this.room} room`);
              if (!this.videoWallComponent.updateLoopStarted) {
                this.videoWallComponent.startUpdateLoop();
              }
            }).catch((err) => {
              console.error("[InteractiveObject] Failed to start video:", err);
              if (window.interactionManager) {
                window.interactionManager.endInteraction(this);
              }
              this.isPlaying = false;
              this.isTriggered = false;
            });
          };
          if (this.videoWallComponent.video.readyState >= 2) {
            playVideo();
          } else {
            this.videoWallComponent.video.addEventListener("loadeddata", playVideo, { once: true });
          }
        } else {
          console.error("[InteractiveObject] VideoWallTiled component has no video element");
        }
      }
      console.log("[InteractiveObject] Video controller activated", {
        room: this.room,
        url: this.videoUrl || "default",
        duration: this.videoDuration
      });
    } else {
      console.warn("[InteractiveObject] No video wall component available - cannot play video");
    }
  }
  notifyCompletion() {
    if (window.interactiveObjectCompleted) {
      window.interactiveObjectCompleted(this.object.name);
    }
  }
  smoothstep(edge0, edge1, x) {
    const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
    return t * t * (3 - 2 * t);
  }
  // Public API
  isCompleted() {
    return this.hasBeenPlayed && this.disappearProgress >= 1;
  }
  reset() {
    this.isTriggered = false;
    this.isPlaying = false;
    this.hasBeenPlayed = false;
    this.disappearProgress = 0;
    this.videoEndTime = 0;
    this.object.setScalingLocal(this.originalScale);
    this.object.setPositionLocal(this.originalPosition);
  }
  // Called when this interaction is interrupted by another
  interrupt() {
    console.log("[InteractiveObject] Interaction interrupted:", this.object.name);
    this.isPlaying = false;
    this.isTriggered = false;
    this.videoEndTime = 0;
    if (this.videoWallComponent && this.videoWallComponent.video) {
      this.videoWallComponent.video.pause();
      this.videoWallComponent.video.currentTime = 0;
    }
    this.deactivateSpotlight();
  }
};
__publicField(InteractiveObject, "TypeName", "interactive-object");
__publicField(InteractiveObject, "Properties", {
  triggerDistance: Property4.float(1),
  playerObject: Property4.object(),
  videoWallController: Property4.object(),
  // Object with VideoWallTiled component
  room: Property4.enum(["left", "right", "both"], "left"),
  // Which room this object belongs to
  videoUrl: Property4.string(""),
  // Optional: override video URL in VideoWallTiled
  videoDuration: Property4.float(240),
  // 4 minutes default
  disappearDuration: Property4.float(1),
  spotlightObject: Property4.object(),
  // Object with light and light-fade-controller
  lightFadeOutDuration: Property4.float(2),
  lightFadeInDuration: Property4.float(2),
  debugMode: Property4.bool(true)
});

// js/light-fade-controller.js
import { Component as Component33, Property as Property5 } from "@wonderlandengine/api";
var LightFadeController = class extends Component33 {
  init() {
    this.lightComponent = null;
    this.isFading = false;
    this.currentIntensity = this.startFadedOut ? 0 : this.initialIntensity;
    this.targetIntensity = this.initialIntensity;
    this.fadeStartIntensity = this.currentIntensity;
    this.fadeInterval = null;
    this.fadeCallback = null;
    this.originalIntensity = this.initialIntensity;
    if (!window.lightControllers) {
      window.lightControllers = [];
    }
    window.lightControllers.push(this);
    console.log("[LightFadeController] Initialized");
  }
  start() {
    this.lightComponent = this.object.getComponent("light");
    if (!this.lightComponent) {
      console.error("[LightFadeController] No light component found on object!");
      return;
    }
    this.editorIntensity = this.lightComponent.intensity;
    if (this.lightType === 1) {
      this.originalIntensity = this.editorIntensity > 0 ? this.editorIntensity : this.initialIntensity;
    } else {
      this.originalIntensity = this.initialIntensity;
    }
    if (this.lightType === 1) {
      this.lightComponent.intensity = 0;
      this.currentIntensity = 0;
      console.log("[LightFadeController] Spotlight starting OFF, will fade to:", this.originalIntensity);
    } else if (this.lightType === 2) {
      this.lightComponent.intensity = this.originalIntensity;
      this.currentIntensity = this.originalIntensity;
      console.log("[LightFadeController] Static light always ON at:", this.originalIntensity);
    } else if (this.lightType === 0) {
      if (this.startFadedOut) {
        this.lightComponent.intensity = 0;
        this.currentIntensity = 0;
        setTimeout(() => {
          console.log("[LightFadeController] Starting initial fade-in for fadeable light");
          this.fadeIn();
        }, this.initialFadeInDelay * 1e3);
      } else {
        this.lightComponent.intensity = this.originalIntensity;
        this.currentIntensity = this.originalIntensity;
      }
    }
    if (this.debugMode) {
      console.log("[LightFadeController] Started:", {
        type: ["fadeable", "spotlight", "static"][this.lightType],
        editorIntensity: this.editorIntensity,
        targetIntensity: this.originalIntensity,
        currentIntensity: this.currentIntensity,
        startFadedOut: this.startFadedOut,
        object: this.object.name
      });
    }
  }
  /**
   * Fade out the light smoothly
   * @param duration Optional custom fade duration
   * @param onComplete Optional callback when fade completes
   */
  fadeOut(duration = null, onComplete = null) {
    if (this.lightType === 2)
      return;
    const fadeDuration = duration !== null ? duration : this.fadeOutDuration;
    if (this.debugMode) {
      console.log(`[LightFadeController] Fading out over ${fadeDuration}s`);
    }
    this.startFade(0, fadeDuration, onComplete);
  }
  /**
   * Fade in the light smoothly
   * @param duration Optional custom fade duration
   * @param targetIntensity Optional target intensity (uses original by default)
   * @param onComplete Optional callback when fade completes
   */
  fadeIn(duration = null, targetIntensity = null, onComplete = null) {
    const fadeDuration = duration !== null ? duration : this.fadeInDuration;
    const target = targetIntensity !== null ? targetIntensity : this.originalIntensity;
    if (this.debugMode) {
      console.log(`[LightFadeController] fadeIn called:`, {
        currentIntensity: this.currentIntensity,
        targetIntensity: target,
        originalIntensity: this.originalIntensity,
        editorIntensity: this.editorIntensity,
        duration: fadeDuration,
        lightType: ["fadeable", "spotlight", "static"][this.lightType],
        objectName: this.object.name
      });
    }
    this.startFade(target, fadeDuration, onComplete);
  }
  /**
   * Fade to a specific intensity
   * @param targetIntensity Target intensity
   * @param duration Fade duration in seconds
   * @param onComplete Optional callback when fade completes
   */
  fadeTo(targetIntensity, duration, onComplete = null) {
    if (this.debugMode) {
      console.log(`[LightFadeController] Fading to ${targetIntensity} over ${duration}s`);
    }
    this.startFade(targetIntensity, duration, onComplete);
  }
  startFade(targetIntensity, duration, onComplete) {
    if (this.fadeInterval) {
      clearInterval(this.fadeInterval);
    }
    this.fadeStartIntensity = this.currentIntensity;
    this.targetIntensity = targetIntensity;
    this.fadeCallback = onComplete;
    this.isFading = true;
    const steps = 30;
    const stepDuration = 1e3 / steps;
    const totalSteps = Math.floor(duration * steps);
    let currentStep = 0;
    this.fadeInterval = setInterval(() => {
      currentStep++;
      const progress = currentStep / totalSteps;
      const easedProgress = this.easeInOutQuad(progress);
      this.currentIntensity = this.fadeStartIntensity + (this.targetIntensity - this.fadeStartIntensity) * easedProgress;
      if (this.lightComponent) {
        this.lightComponent.intensity = this.currentIntensity;
      }
      if (this.debugMode && currentStep % steps === 0) {
        console.log(`[LightFadeController] Fade progress: ${Math.round(progress * 100)}%, intensity: ${this.currentIntensity.toFixed(3)}`);
      }
      if (currentStep >= totalSteps) {
        clearInterval(this.fadeInterval);
        this.fadeInterval = null;
        this.isFading = false;
        this.currentIntensity = this.targetIntensity;
        if (this.lightComponent) {
          this.lightComponent.intensity = this.targetIntensity;
        }
        if (this.debugMode) {
          console.log("[LightFadeController] Fade complete");
        }
        if (this.fadeCallback) {
          this.fadeCallback();
          this.fadeCallback = null;
        }
      }
    }, stepDuration);
  }
  /**
   * Stop any ongoing fade
   */
  stopFade() {
    if (this.fadeInterval) {
      clearInterval(this.fadeInterval);
      this.fadeInterval = null;
      this.isFading = false;
    }
  }
  /**
   * Set intensity immediately without fade
   * @param intensity New intensity value
   */
  setIntensityImmediate(intensity) {
    this.currentIntensity = intensity;
    this.targetIntensity = intensity;
    if (this.lightComponent) {
      this.lightComponent.intensity = intensity;
    }
    this.stopFade();
  }
  // Easing function for smooth perception
  easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }
  onDestroy() {
    if (this.fadeInterval) {
      clearInterval(this.fadeInterval);
    }
    if (window.lightControllers) {
      const index = window.lightControllers.indexOf(this);
      if (index > -1) {
        window.lightControllers.splice(index, 1);
      }
    }
  }
  // Public API for InteractiveObject coordination
  /**
   * Check if this light should fade for a given interactive object
   */
  shouldFadeForObject(interactiveObject) {
    if (this.lightType === 0)
      return true;
    if (this.lightType === 2)
      return false;
    return false;
  }
  /**
   * Check if this is a spotlight for a given interactive object
   */
  isSpotlightForObject(interactiveObject) {
    if (this.lightType !== 1) {
      return false;
    }
    const hasSpotlight = interactiveObject.spotlightObject !== null && interactiveObject.spotlightObject !== void 0;
    if (!hasSpotlight) {
      if (this.debugMode) {
        console.log("[LightFadeController] Interactive object has NO spotlight assigned");
      }
      return false;
    }
    const areEqual = interactiveObject.spotlightObject === this.object;
    if (this.debugMode) {
      console.log("[LightFadeController] Spotlight check:", {
        thisLightName: this.object.name,
        assignedSpotlightName: interactiveObject.spotlightObject.name,
        areTheSameObject: areEqual,
        thisObjectId: this.object.id,
        spotlightObjectId: interactiveObject.spotlightObject.id
      });
    }
    return areEqual;
  }
};
__publicField(LightFadeController, "TypeName", "light-fade-controller");
__publicField(LightFadeController, "Properties", {
  lightType: Property5.enum(["fadeable", "spotlight", "static"], "fadeable"),
  fadeInDuration: Property5.float(3),
  fadeOutDuration: Property5.float(2),
  initialIntensity: Property5.float(1),
  startFadedOut: Property5.bool(true),
  // Start with lights off
  initialFadeInDelay: Property5.float(1),
  // Delay before initial fade-in
  debugMode: Property5.bool(true)
});

// js/opacity-controller.js
import { Component as Component34, Property as Property6 } from "@wonderlandengine/api";
var OpacityController = class extends Component34 {
  init() {
    this.currentOpacity = this.initialOpacity;
    this.targetOpacity = this.initialOpacity;
    this.isTransitioning = false;
    this.transitionProgress = 0;
    this.transitionDuration = 0;
    this.meshComponent = null;
    this.material = null;
    this.originalMaterial = null;
    this.materialClone = null;
  }
  start() {
    this.meshComponent = this.object.getComponent("mesh");
    if (!this.meshComponent) {
      console.error("[OpacityController] No mesh component found on object!");
      return;
    }
    this.originalMaterial = this.meshComponent.material;
    if (!this.originalMaterial) {
      console.error("[OpacityController] No material found on mesh!");
      return;
    }
    this.materialClone = this.originalMaterial.clone();
    this.meshComponent.material = this.materialClone;
    this.setOpacity(this.initialOpacity);
    if (this.debugMode) {
      console.log("[OpacityController] Initialized with opacity:", this.initialOpacity);
      console.log("[OpacityController] Fade in duration:", this.fadeInDuration);
      console.log("[OpacityController] Fade out duration:", this.fadeOutDuration);
      this.setupDebugControls();
    }
    if (this.autoStart) {
      if (this.autoStartDirection === 0) {
        this.fadeIn();
      } else {
        this.fadeOut();
      }
    }
  }
  update(dt) {
    if (!this.isTransitioning)
      return;
    this.transitionProgress += dt / this.transitionDuration;
    if (this.transitionProgress >= 1) {
      this.currentOpacity = this.targetOpacity;
      this.setOpacity(this.currentOpacity);
      this.isTransitioning = false;
      this.transitionProgress = 1;
      if (this.debugMode) {
        console.log("[OpacityController] Transition complete. Opacity:", this.currentOpacity);
      }
      if (this.onComplete) {
        this.onComplete();
        this.onComplete = null;
      }
      return;
    }
    const t = this.smoothstep(0, 1, this.transitionProgress);
    const startOpacity = this.targetOpacity > this.currentOpacity ? this.currentOpacity : this.currentOpacity;
    const endOpacity = this.targetOpacity;
    const currentOpacity = startOpacity + (endOpacity - startOpacity) * t;
    this.setOpacity(currentOpacity);
    if (this.debugMode && Math.floor(t * 10) !== Math.floor((t - dt / this.transitionDuration) * 10)) {
      console.log(`[OpacityController] Progress: ${Math.round(t * 100)}%, Opacity: ${currentOpacity.toFixed(2)}`);
    }
  }
  setOpacity(opacity) {
    if (!this.materialClone)
      return;
    opacity = Math.max(0, Math.min(1, opacity));
    if (this.materialClone.getDiffuseColor) {
      const color = this.materialClone.getDiffuseColor();
      this.materialClone.setDiffuseColor([color[0], color[1], color[2], opacity]);
      if (this.materialClone.setEmissiveColor) {
        this.materialClone.setEmissiveColor([opacity, opacity, opacity, 1]);
      }
    } else if (this.materialClone.getFlatColor) {
      const color = this.materialClone.getFlatColor();
      this.materialClone.setFlatColor([color[0], color[1], color[2], opacity]);
    }
    this.currentOpacity = opacity;
  }
  // Easing function - using inverse square for perceptually linear fade
  // (Human perception of brightness is non-linear, this compensates)
  smoothstep(edge0, edge1, x) {
    const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
    return 1 - Math.pow(1 - t, 2);
  }
  // Public API
  /**
   * Fade in to full opacity
   * @param {Function} onComplete - Optional callback when complete
   */
  fadeIn(onComplete = null) {
    if (this.debugMode) {
      console.log("[OpacityController] Starting fade in");
    }
    this.startOpacity = this.currentOpacity;
    this.targetOpacity = 1;
    this.transitionDuration = this.fadeInDuration;
    this.transitionProgress = 0;
    this.isTransitioning = true;
    this.onComplete = onComplete;
  }
  /**
   * Fade out to zero opacity
   * @param {Function} onComplete - Optional callback when complete
   */
  fadeOut(onComplete = null) {
    if (this.debugMode) {
      console.log("[OpacityController] Starting fade out");
    }
    this.startOpacity = this.currentOpacity;
    this.targetOpacity = 0;
    this.transitionDuration = this.fadeOutDuration;
    this.transitionProgress = 0;
    this.isTransitioning = true;
    this.onComplete = onComplete;
  }
  /**
   * Fade to specific opacity
   * @param {number} targetOpacity - Target opacity (0-1)
   * @param {number} duration - Transition duration in seconds
   * @param {Function} onComplete - Optional callback when complete
   */
  fadeTo(targetOpacity, duration, onComplete = null) {
    if (this.debugMode) {
      console.log(`[OpacityController] Fading to ${targetOpacity} over ${duration}s`);
    }
    this.startOpacity = this.currentOpacity;
    this.targetOpacity = Math.max(0, Math.min(1, targetOpacity));
    this.transitionDuration = duration;
    this.transitionProgress = 0;
    this.isTransitioning = true;
    this.onComplete = onComplete;
  }
  /**
   * Stop current transition
   */
  stop() {
    this.isTransitioning = false;
    this.onComplete = null;
    if (this.debugMode) {
      console.log("[OpacityController] Transition stopped at opacity:", this.currentOpacity);
    }
  }
  /**
   * Set opacity immediately without transition
   * @param {number} opacity - Opacity value (0-1)
   */
  setOpacityImmediate(opacity) {
    this.currentOpacity = opacity;
    this.targetOpacity = opacity;
    this.isTransitioning = false;
    this.setOpacity(opacity);
    if (this.debugMode) {
      console.log("[OpacityController] Opacity set immediately to:", opacity);
    }
  }
  /**
   * Get current opacity
   * @returns {number} Current opacity (0-1)
   */
  getOpacity() {
    return this.currentOpacity;
  }
  /**
   * Check if currently transitioning
   * @returns {boolean}
   */
  isInTransition() {
    return this.isTransitioning;
  }
  /**
   * Setup debug keyboard controls (N = fade out, M = fade in)
   */
  setupDebugControls() {
    console.log("[OpacityController] Debug controls: N = fade out (night), M = fade in (day)");
    this.onKeyDown = (event) => {
      if (event.code === "KeyN" && !this.isTransitioning) {
        console.log("[OpacityController] Debug: Fading out (revealing night)");
        this.fadeOut();
      } else if (event.code === "KeyM" && !this.isTransitioning) {
        console.log("[OpacityController] Debug: Fading in (showing day)");
        this.fadeIn();
      }
    };
    window.addEventListener("keydown", this.onKeyDown);
  }
  onDestroy() {
    if (this.onKeyDown) {
      window.removeEventListener("keydown", this.onKeyDown);
    }
  }
};
__publicField(OpacityController, "TypeName", "opacity-controller");
__publicField(OpacityController, "Properties", {
  initialOpacity: Property6.float(1),
  fadeInDuration: Property6.float(2),
  fadeOutDuration: Property6.float(2),
  autoStart: Property6.bool(false),
  autoStartDirection: Property6.enum(["fade-in", "fade-out"], "fade-in"),
  debugMode: Property6.bool(false)
});

// js/video-wall-tiled.js
import { Component as Component35, Property as Property7, MeshComponent as MeshComponent3 } from "@wonderlandengine/api";
var VideoWallTiled = class extends Component35 {
  init() {
    this.video = null;
    this.tiles = [];
    this.updateCount = 0;
    this.materials = [];
    this.updateLoopStarted = false;
    this.currentRoom = "left";
    this.leftMaterials = [];
    this.rightMaterials = [];
    this.playAfterUserGesture = this.playAfterUserGesture.bind(this);
  }
  start() {
    console.log("[VideoWallTiled] Starting tiled video wall system");
    this.leftMaterials = [this.material1, this.material2, this.material3].filter((m) => m !== null);
    this.rightMaterials = [this.rightMaterial1, this.rightMaterial2, this.rightMaterial3].filter((m) => m !== null);
    console.log("[VideoWallTiled] Material configuration:", {
      leftRoom: {
        material1: this.material1 ? "assigned" : "missing",
        material2: this.material2 ? "assigned" : "missing",
        material3: this.material3 ? "assigned" : "missing",
        total: this.leftMaterials.length
      },
      rightRoom: {
        material1: this.rightMaterial1 ? "assigned" : "missing",
        material2: this.rightMaterial2 ? "assigned" : "missing",
        material3: this.rightMaterial3 ? "assigned" : "missing",
        total: this.rightMaterials.length
      }
    });
    this.materials = this.leftMaterials;
    this.tileCount = Math.ceil(this.videoWidth / this.tileWidth);
    console.log(`[VideoWallTiled] Will create ${this.tileCount} tiles of ${this.tileWidth}px each`);
    if (this.leftMaterials.length === 0 && this.rightMaterials.length === 0) {
      console.error("[VideoWallTiled] No materials assigned for either room");
      console.log("[VideoWallTiled] Please assign leftMaterial1-3 or rightMaterial1-3");
      return;
    }
    this.createVideoSource();
    this.createTiles();
  }
  createVideoSource() {
    console.log("[VideoWallTiled] Creating video source");
    this.video = document.createElement("video");
    this.video.src = this.videoUrl;
    this.video.crossOrigin = "anonymous";
    this.video.loop = this.loop;
    this.video.muted = this.muted;
    this.video.playsInline = true;
    this.video.style.display = "none";
    document.body.appendChild(this.video);
    this.video.addEventListener("loadedmetadata", () => {
      console.log(`[VideoWallTiled] Video loaded: ${this.video.videoWidth}x${this.video.videoHeight}`);
      if (this.video.videoWidth !== this.videoWidth || this.video.videoHeight !== this.videoHeight) {
        console.warn("[VideoWallTiled] Video dimensions differ from expected:");
        console.warn(`  Expected: ${this.videoWidth}x${this.videoHeight}`);
        console.warn(`  Actual: ${this.video.videoWidth}x${this.video.videoHeight}`);
        this.videoWidth = this.video.videoWidth;
        this.videoHeight = this.video.videoHeight;
        this.tileCount = Math.ceil(this.videoWidth / this.tileWidth);
      }
      this.onVideoReady();
    });
    this.video.addEventListener("error", (e) => {
      const error = this.video.error;
      console.error("[VideoWallTiled] Video error:", {
        code: error?.code,
        message: error?.message,
        mediaError: {
          MEDIA_ERR_ABORTED: error?.code === 1 ? "User aborted" : "",
          MEDIA_ERR_NETWORK: error?.code === 2 ? "Network error" : "",
          MEDIA_ERR_DECODE: error?.code === 3 ? "Decode error" : "",
          MEDIA_ERR_SRC_NOT_SUPPORTED: error?.code === 4 ? "Source not supported" : ""
        },
        url: this.videoUrl,
        readyState: this.video.readyState
      });
    });
    this.video.load();
  }
  createTiles() {
    console.log("[VideoWallTiled] Creating tile system");
    const tilesPerWall = 3;
    const actualTileCount = this.currentRoom === "both" ? 6 : 3;
    for (let i = 0; i < actualTileCount; i++) {
      const tileIndexForSource = this.currentRoom === "both" ? i % tilesPerWall : i;
      const canvas2 = document.createElement("canvas");
      canvas2.width = this.tileWidth;
      canvas2.height = this.videoHeight;
      canvas2.style.display = "none";
      document.body.appendChild(canvas2);
      const ctx = canvas2.getContext("2d", {
        alpha: false,
        desynchronized: true
      });
      const tile = {
        index: i,
        canvas: canvas2,
        ctx,
        texture: null,
        material: this.materials[i] || null,
        updateSuccessful: false
      };
      this.tiles.push(tile);
      const roomLabel = this.currentRoom === "both" ? i < 3 ? "left" : "right" : this.currentRoom;
      const tileLabel = `${roomLabel}_tile${tileIndexForSource}`;
      console.log(`[VideoWallTiled] Tile ${i} (${tileLabel}):`, {
        canvasSize: `${canvas2.width}x${canvas2.height}`,
        hasMaterial: !!tile.material,
        materialAssigned: tile.material ? "Yes" : "No - tile will not display"
      });
    }
  }
  onVideoReady() {
    console.log("[VideoWallTiled] Video ready, initializing textures");
    this.tiles.forEach((tile, index) => {
      if (!tile.material) {
        console.warn(`[VideoWallTiled] No material for tile ${index}, skipping`);
        return;
      }
      tile.ctx.fillStyle = "#000";
      tile.ctx.fillRect(0, 0, tile.canvas.width, tile.canvas.height);
      try {
        console.log(`[VideoWallTiled] Creating texture for tile ${index}`);
        const texture = this.engine.textures.create(tile.canvas);
        if (texture) {
          tile.texture = texture;
          const textureProps = [this.textureProperty, "diffuseTexture", "flatTexture", "texture"];
          let applied = false;
          for (const prop of textureProps) {
            try {
              if (tile.material[prop] !== void 0) {
                tile.material[prop] = texture;
                console.log(`[VideoWallTiled] Texture applied to tile ${index} material using '${prop}'`);
                applied = true;
                console.log(`[VideoWallTiled] Material ${index} info:`, {
                  hasDiffuseTexture: tile.material.diffuseTexture !== void 0,
                  hasFlatTexture: tile.material.flatTexture !== void 0,
                  hasTexture: tile.material.texture !== void 0,
                  pipeline: tile.material.pipeline?.name || "unknown"
                });
                break;
              }
            } catch (e) {
              console.warn(`[VideoWallTiled] Failed to set ${prop} on material ${index}:`, e);
            }
          }
          if (!applied) {
            console.error(`[VideoWallTiled] Could not apply texture to material ${index} - no suitable property found`);
            console.log(`[VideoWallTiled] Available material properties:`, Object.keys(tile.material));
          }
        } else {
          console.error(`[VideoWallTiled] Failed to create texture for tile ${index}`);
        }
      } catch (e) {
        console.error(`[VideoWallTiled] Error creating texture for tile ${index}:`, e);
      }
    });
    this.startPlayback();
  }
  startPlayback() {
    console.log("[VideoWallTiled] Starting video playback");
    console.log(`[VideoWallTiled] Audio settings: muted=${this.muted}, autoplay=${this.autoplay}`);
    if (this.autoplay) {
      if (this.muted) {
        this.video.play().then(() => {
          console.log("[VideoWallTiled] Muted video playing automatically");
          this.startUpdateLoop();
        }).catch((e) => {
          console.warn("[VideoWallTiled] Failed to autoplay muted video:", e);
          this.setupUserGestureHandlers();
        });
      } else {
        console.log("[VideoWallTiled] Video has audio - waiting for user interaction");
        this.setupUserGestureHandlers();
      }
    } else {
      console.log("[VideoWallTiled] Autoplay disabled - waiting for manual start");
    }
  }
  setupUserGestureHandlers() {
    console.log("[VideoWallTiled] Setting up user gesture handlers for audio playback");
    window.addEventListener("click", this.playAfterUserGesture);
    window.addEventListener("touchstart", this.playAfterUserGesture);
  }
  playAfterUserGesture() {
    console.log("[VideoWallTiled] User gesture detected - starting video with audio");
    this.video?.play().then(() => {
      console.log("[VideoWallTiled] Video started after user gesture");
      this.startUpdateLoop();
    }).catch((e) => {
      console.error("[VideoWallTiled] Failed to start video after user gesture:", e);
    });
    window.removeEventListener("click", this.playAfterUserGesture);
    window.removeEventListener("touchstart", this.playAfterUserGesture);
  }
  startUpdateLoop() {
    if (this.updateLoopStarted) {
      console.log("[VideoWallTiled] Update loop already running");
      return;
    }
    this.updateLoopStarted = true;
    console.log("[VideoWallTiled] Starting update loop");
    let lastUpdate = 0;
    let lastDebugLog = Date.now();
    const update = (timestamp) => {
      if (timestamp - lastUpdate < 33) {
        requestAnimationFrame(update);
        return;
      }
      lastUpdate = timestamp;
      if (this.video && !this.video.paused && !this.video.ended) {
        const wallWidth = 7200;
        const videoIsNarrow = this.video.videoWidth < wallWidth;
        let offsetX = 0;
        if (videoIsNarrow) {
          offsetX = (wallWidth - this.video.videoWidth) / 2;
          if (this.updateCount === 0) {
            console.log(`[VideoWallTiled] Centering narrow video: ${this.video.videoWidth}px centered in ${wallWidth}px (offset: ${offsetX}px)`);
          }
        }
        this.tiles.forEach((tile) => {
          if (!tile.texture)
            return;
          tile.ctx.fillStyle = "#000";
          tile.ctx.fillRect(0, 0, tile.canvas.width, tile.canvas.height);
          const effectiveTileIndex = this.currentRoom === "both" && tile.index >= 3 ? tile.index - 3 : tile.index;
          const tileStartX = effectiveTileIndex * this.tileWidth;
          const tileEndX = tileStartX + this.tileWidth;
          const videoStartX = tileStartX - offsetX;
          const videoEndX = tileEndX - offsetX;
          if (videoEndX > 0 && videoStartX < this.video.videoWidth) {
            const sourceX = Math.max(0, videoStartX);
            const sourceEndX = Math.min(this.video.videoWidth, videoEndX);
            const sourceWidth = sourceEndX - sourceX;
            const destX = videoStartX < 0 ? Math.abs(videoStartX) : 0;
            if (sourceWidth > 0) {
              try {
                tile.ctx.drawImage(
                  this.video,
                  sourceX,
                  0,
                  sourceWidth,
                  this.video.videoHeight,
                  // Source from video
                  destX,
                  0,
                  sourceWidth,
                  tile.canvas.height
                  // Destination on canvas
                );
                if (this.updateCount === 0) {
                  console.log(`[VideoWallTiled] Tile ${tile.index}: source(${sourceX}, ${sourceWidth}) -> dest(${destX}, ${sourceWidth})`);
                }
              } catch (e) {
                if (this.updateCount === 0) {
                  console.error(`[VideoWallTiled] Error drawing tile ${tile.index}:`, e);
                }
              }
            }
          }
          try {
            if (tile.texture && tile.texture.update) {
              tile.texture.update(tile.canvas);
              tile.updateSuccessful = true;
            } else if (tile.texture && tile.texture.upload) {
              tile.texture.upload(tile.canvas);
              tile.updateSuccessful = true;
            } else {
              this.updateTextureDirectly(tile);
              if (!tile.updateSuccessful && this.updateCount === 0) {
                console.warn(`[VideoWallTiled] Tile ${tile.index} has no update method, trying fallback`);
              }
            }
          } catch (e) {
            if (!tile.updateSuccessful && this.updateCount === 0) {
              console.error(`[VideoWallTiled] Update error for tile ${tile.index}:`, e);
            }
          }
        });
        this.updateCount++;
        if (this.debugMode) {
          const now = Date.now();
          if (now - lastDebugLog > 3e3) {
            const successfulTiles = this.tiles.filter((t) => t.updateSuccessful).length;
            console.log(`[VideoWallTiled] Updates: ${this.updateCount}, Time: ${this.video.currentTime.toFixed(1)}s, Active tiles: ${successfulTiles}/${this.tiles.length}`);
            lastDebugLog = now;
          }
        }
      }
      requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  }
  updateTextureDirectly(tile) {
    const canvas2 = document.querySelector("canvas");
    const gl = canvas2.getContext("webgl2") || canvas2.getContext("webgl");
    if (gl && tile.texture) {
      try {
        gl.bindTexture(gl.TEXTURE_2D, tile.texture);
        gl.texSubImage2D(
          gl.TEXTURE_2D,
          0,
          0,
          0,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          tile.canvas
        );
        tile.updateSuccessful = true;
      } catch (e) {
      }
    }
  }
  /**
   * Play video in specific room(s)
   * @param {string} videoUrl - URL of the video to play
   * @param {string} room - Which room to play in: 'left', 'right', or 'both'
   */
  playVideo(videoUrl, room = "left") {
    console.log(`[VideoWallTiled] Playing video in ${room} room(s): ${videoUrl}`);
    if (this.video && !this.video.paused) {
      this.video.pause();
      this.updateLoopStarted = false;
    }
    this.currentRoom = room;
    this.selectMaterialsForRoom(room);
    if (videoUrl && this.videoUrl !== videoUrl) {
      this.videoUrl = videoUrl;
      if (this.video) {
        this.video.src = videoUrl;
        this.video.load();
      }
    }
    if (this.video) {
      this.video.play().then(() => {
        console.log(`[VideoWallTiled] Video playing in ${room} room(s)`);
        if (!this.updateLoopStarted) {
          this.startUpdateLoop();
        }
      }).catch((e) => {
        console.error("[VideoWallTiled] Failed to play video:", e);
      });
    }
  }
  /**
   * Select materials based on room
   */
  selectMaterialsForRoom(room) {
    console.log(`[VideoWallTiled] Selecting materials for room: ${room}`);
    if (this.tiles.length > 0) {
      this.tiles.forEach((tile) => {
        if (tile.material && tile.material[this.textureProperty]) {
          tile.material[this.textureProperty] = null;
        }
      });
    }
    switch (room) {
      case "left":
        this.materials = this.leftMaterials;
        console.log(`[VideoWallTiled] Using LEFT materials:`, this.leftMaterials.length);
        break;
      case "right":
        this.materials = this.rightMaterials;
        console.log(`[VideoWallTiled] Using RIGHT materials:`, this.rightMaterials.length);
        break;
      case "both":
        this.materials = [...this.leftMaterials, ...this.rightMaterials];
        console.log(
          `[VideoWallTiled] Using BOTH materials:`,
          this.materials.length,
          "(left:",
          this.leftMaterials.length,
          "right:",
          this.rightMaterials.length,
          ")"
        );
        break;
      default:
        console.warn(`[VideoWallTiled] Unknown room: ${room}, using left`);
        this.materials = this.leftMaterials;
    }
    if (this.tiles.length > 0) {
      this.updateTileMaterials();
    }
    console.log(`[VideoWallTiled] Active materials: ${this.materials.length}`);
  }
  /**
   * Update tile materials after room change
   */
  updateTileMaterials() {
    console.log(`[VideoWallTiled] Updating tile materials for room: ${this.currentRoom}`);
    console.log(`[VideoWallTiled] Clearing existing tiles and recreating for ${this.currentRoom} room(s)`);
    this.tiles.forEach((tile) => {
      if (tile.canvas) {
        tile.canvas.remove();
      }
    });
    this.tiles = [];
    if (this.currentRoom === "both") {
      this.tileCount = 6;
    } else {
      this.tileCount = 3;
    }
    this.createTiles();
    if (this.video && this.video.readyState >= 2) {
      this.onVideoReady();
    }
  }
  /**
   * Stop video playback
   */
  stopVideo() {
    console.log("[VideoWallTiled] Stopping video");
    if (this.video) {
      this.video.pause();
      this.video.currentTime = 0;
      this.updateLoopStarted = false;
      this.tiles.forEach((tile) => {
        if (tile.ctx) {
          tile.ctx.fillStyle = "#000";
          tile.ctx.fillRect(0, 0, tile.canvas.width, tile.canvas.height);
          if (tile.texture && tile.texture.update) {
            tile.texture.update(tile.canvas);
          }
        }
      });
    }
  }
  onDestroy() {
    window.removeEventListener("click", this.playAfterUserGesture);
    window.removeEventListener("touchstart", this.playAfterUserGesture);
    if (this.video) {
      this.video.pause();
      this.video.remove();
    }
    this.tiles.forEach((tile) => {
      if (tile.canvas) {
        tile.canvas.remove();
      }
    });
  }
};
__publicField(VideoWallTiled, "TypeName", "video-wall-tiled");
__publicField(VideoWallTiled, "Properties", {
  videoUrl: Property7.string("/static/video-7200.mp4"),
  // Original material properties for backward compatibility
  material1: Property7.material(),
  // First tile
  material2: Property7.material(),
  // Second tile
  material3: Property7.material(),
  // Third tile
  // Additional materials for right room (optional)
  rightMaterial1: Property7.material(),
  rightMaterial2: Property7.material(),
  rightMaterial3: Property7.material(),
  tileWidth: Property7.int(2400),
  videoWidth: Property7.int(7200),
  videoHeight: Property7.int(720),
  textureProperty: Property7.string("diffuseTexture"),
  autoplay: Property7.bool(true),
  muted: Property7.bool(false),
  // Whether to mute sound (false = audio enabled)
  loop: Property7.bool(true),
  debugMode: Property7.bool(true)
});

// js/vr-teleport-wrapper.js
import { Component as Component36, Property as Property8 } from "@wonderlandengine/api";
var VrTeleportWrapper = class extends Component36 {
  init() {
    this.isVrMode = false;
    this.teleportComp = null;
  }
  start() {
    if (this.teleportComponent) {
      this.teleportComp = this.teleportComponent.getComponent("teleport");
      if (!this.teleportComp) {
        console.warn("[VrTeleportWrapper] No teleport component found on specified object");
        return;
      }
    } else {
      this.teleportComp = this.object.getComponent("teleport");
    }
    if (this.teleportComp) {
      this.teleportComp.active = false;
      console.log("[VrTeleportWrapper] Teleport component found and disabled for desktop mode");
    }
    this.onXRSessionStart = () => {
      console.log("[VrTeleportWrapper] VR session started - enabling teleport");
      this.isVrMode = true;
      if (this.teleportComp) {
        this.teleportComp.active = true;
      }
    };
    this.onXRSessionEnd = () => {
      console.log("[VrTeleportWrapper] VR session ended - disabling teleport");
      this.isVrMode = false;
      if (this.teleportComp) {
        this.teleportComp.active = false;
      }
    };
    if (this.engine.xr) {
      this.engine.onXRSessionStart.add(this.onXRSessionStart);
      this.engine.onXRSessionEnd.add(this.onXRSessionEnd);
    }
  }
  onDestroy() {
    if (this.engine.xr) {
      this.engine.onXRSessionStart.remove(this.onXRSessionStart);
      this.engine.onXRSessionEnd.remove(this.onXRSessionEnd);
    }
  }
};
__publicField(VrTeleportWrapper, "TypeName", "vr-teleport-wrapper");
__publicField(VrTeleportWrapper, "Properties", {
  teleportComponent: Property8.object()
});

// js/sky-sphere-controller-v2.js
import { Component as Component37, Property as Property9 } from "@wonderlandengine/api";
var SkySphereControllerV2 = class extends Component37 {
  init() {
    this.currentState = "day";
    this.targetState = "day";
    this.isTransitioning = false;
    this.transitionProgress = 0;
    this.meshComponent = null;
    this.dayMaterialClone = null;
    this.nightMaterialClone = null;
    console.log("[SkySphereV2] Initialized");
  }
  start() {
    if (!this.dayMaterial || !this.nightMaterial) {
      console.error("[SkySphereV2] Both day and night materials must be assigned!");
      return;
    }
    this.meshComponent = this.object.getComponent("mesh");
    if (!this.meshComponent) {
      console.error("[SkySphereV2] No mesh component found!");
      return;
    }
    this.dayMaterialClone = this.dayMaterial.clone();
    this.nightMaterialClone = this.nightMaterial.clone();
    this.dayMaterialClone2 = null;
    this.nightMaterialClone2 = null;
    if (this.secondarySphere && this.transitionType === 2) {
      this.dayMaterialClone2 = this.dayMaterial.clone();
      this.nightMaterialClone2 = this.nightMaterial.clone();
    }
    this.dayMaterialClone.setDiffuseColor([1, 1, 1, 1]);
    this.nightMaterialClone.setDiffuseColor([1, 1, 1, 1]);
    if (this.dayMaterialClone2) {
      this.dayMaterialClone2.setDiffuseColor([1, 1, 1, 1]);
      this.nightMaterialClone2.setDiffuseColor([1, 1, 1, 1]);
    }
    this.meshComponent.material = this.dayMaterialClone;
    this.setMaterialAlpha(this.dayMaterialClone, 1);
    console.log("[SkySphereV2] Configuration:", {
      transitionType: this.transitionType,
      transitionDuration: this.transitionDuration,
      hasSecondary: !!this.secondarySphere,
      debugMode: this.debugMode
    });
    this.secondaryMesh = null;
    if (this.secondarySphere && (this.transitionType === 2 || this.transitionType === 1)) {
      this.secondaryMesh = this.secondarySphere.getComponent("mesh");
      if (this.secondaryMesh) {
        const secondaryScale = new Float32Array(3);
        this.secondarySphere.getScalingLocal(secondaryScale);
        this.secondarySphere.setScalingLocal([
          secondaryScale[0] * 0.99,
          secondaryScale[1] * 0.99,
          secondaryScale[2] * 0.99
        ]);
        if (this.transitionType === 2 && this.dayMaterialClone2) {
          this.secondaryMesh.material = this.dayMaterialClone2;
          this.setMaterialAlpha(this.dayMaterialClone2, 1);
        } else {
          this.secondaryMesh.material = this.nightMaterialClone;
          this.setMaterialAlpha(this.nightMaterialClone, 0);
        }
        console.log("[SkySphereV2] Secondary sphere setup for transitions (scaled to 99%)");
      } else {
        console.warn("[SkySphereV2] Secondary sphere has no mesh component, falling back to instant");
        this.transitionType = 0;
      }
    }
    this.originalScale = new Float32Array(3);
    this.object.getScalingLocal(this.originalScale);
    console.log("[SkySphereV2] Using editor-set scale, transition type:", this.transitionType);
    if (this.debugMode) {
      this.setupDebugControls();
    }
    console.log("[SkySphereV2] Ready");
  }
  setupDebugControls() {
    console.log("[SkySphereV2] Debug Controls:");
    console.log("  N - Transition to night");
    console.log("  M - Transition to day");
    console.log("  + - Increase transition speed");
    console.log("  - - Decrease transition speed");
    console.log(`  Current duration: ${this.transitionDuration}s`);
    this.onKeyDown = (event) => {
      if (event.code === "KeyN" && this.currentState !== "night" && !this.isTransitioning) {
        this.startTransition("night");
      } else if (event.code === "KeyM" && this.currentState !== "day" && !this.isTransitioning) {
        this.startTransition("day");
      } else if (event.code === "Equal" || event.code === "NumpadAdd") {
        this.transitionDuration = Math.max(0.5, this.transitionDuration - 0.5);
        console.log(`[SkySphereV2] Transition duration: ${this.transitionDuration}s`);
      } else if (event.code === "Minus" || event.code === "NumpadSubtract") {
        this.transitionDuration = Math.min(10, this.transitionDuration + 0.5);
        console.log(`[SkySphereV2] Transition duration: ${this.transitionDuration}s`);
      }
    };
    window.addEventListener("keydown", this.onKeyDown);
  }
  startTransition(target) {
    if (this.isTransitioning || this.currentState === target)
      return;
    const transitionTypes = ["instant", "fade-black", "crossfade"];
    const transitionTypeString = transitionTypes[this.transitionType] || "instant";
    console.log(`[SkySphereV2] Starting ${transitionTypeString} transition to ${target} (enum value: ${this.transitionType})`);
    if (!this.meshComponent) {
      console.error("[SkySphereV2] ERROR: No mesh component!");
      return;
    }
    const targetMat = target === "night" ? this.nightMaterial : this.dayMaterial;
    if (!targetMat) {
      console.error(`[SkySphereV2] ERROR: ${target} material not assigned in editor!`);
      return;
    }
    this.targetState = target;
    this.transitionProgress = 0;
    switch (this.transitionType) {
      case 2:
        if (this.secondaryMesh && this.secondarySphere) {
          if (target === "night") {
            this.meshComponent.material = this.dayMaterialClone;
            this.secondaryMesh.material = this.nightMaterialClone2 || this.nightMaterialClone;
            this.setMaterialAlpha(this.dayMaterialClone, 1);
            this.setMaterialAlpha(this.nightMaterialClone2 || this.nightMaterialClone, 1);
          } else {
            this.meshComponent.material = this.nightMaterialClone;
            this.secondaryMesh.material = this.dayMaterialClone2 || this.dayMaterialClone;
            this.setMaterialAlpha(this.nightMaterialClone, 1);
            this.setMaterialAlpha(this.dayMaterialClone2 || this.dayMaterialClone, 1);
          }
          this.isTransitioning = true;
          this.transitionStartTime = performance.now();
          this.frameCount = 0;
          this.lastFrameTime = performance.now();
          console.log(`[SkySphereV2] Starting alpha crossfade transition to ${target}`);
          console.log(`[SkySphereV2] Primary: ${this.currentState}, Secondary: ${target}`);
        } else {
          const mat = target === "night" ? this.nightMaterialClone : this.dayMaterialClone;
          this.meshComponent.material = mat;
          this.setMaterialAlpha(mat, 1);
          this.currentState = target;
          this.isTransitioning = false;
        }
        break;
      case 1:
        this.isTransitioning = true;
        this.fadeDirection = "out";
        console.log("[SkySphereV2] Starting fade-through-black transition (alpha-based)");
        break;
      case 0:
      default:
        const instantMat = target === "night" ? this.nightMaterialClone : this.dayMaterialClone;
        this.meshComponent.material = instantMat;
        this.setMaterialAlpha(instantMat, 1);
        this.currentState = target;
        this.isTransitioning = false;
        this.transitionProgress = 1;
        console.log("[SkySphereV2] Instant transition complete");
        break;
    }
  }
  update(dt) {
    if (!this.isTransitioning || !this.meshComponent) {
      return;
    }
    if (this.transitionStartTime) {
      this.frameCount++;
      const now = performance.now();
      const frameDelta = now - this.lastFrameTime;
      this.lastFrameTime = now;
      if (frameDelta > 33) {
        console.warn(`[SkySphereV2] Frame took ${frameDelta.toFixed(1)}ms (target: 16.67ms)`);
      }
      if (this.debugMode && this.frameCount % 10 === 0) {
        const elapsed = (now - this.transitionStartTime) / 1e3;
        const avgFPS = this.frameCount / elapsed;
        console.log(`[SkySphereV2] Progress: ${Math.round(this.transitionProgress * 100)}%, FPS: ${avgFPS.toFixed(1)}, dt: ${dt.toFixed(3)}`);
      }
    }
    this.transitionProgress += dt / this.transitionDuration;
    if (this.transitionProgress >= 1) {
      this.completeTransition();
      return;
    }
    const t = this.smoothstep(0, 1, this.transitionProgress);
    switch (this.transitionType) {
      case 2:
        if (this.secondaryMesh && this.secondarySphere) {
          let primaryMat;
          if (this.targetState === "night") {
            primaryMat = this.dayMaterialClone;
          } else {
            primaryMat = this.nightMaterialClone;
          }
          this.setMaterialAlpha(primaryMat, 1 - t);
          if (this.debugMode && Math.floor(t * 10) !== Math.floor((t - dt / this.transitionDuration) * 10)) {
            console.log(`[SkySphereV2] Alpha crossfade: ${Math.round(t * 100)}%`);
          }
        }
        break;
      case 1:
        if (this.fadeDirection === "out") {
          const fadeOut = 1 - t * 2;
          const currentMat = this.currentState === "day" ? this.dayMaterialClone : this.nightMaterialClone;
          this.setMaterialAlpha(currentMat, fadeOut);
          if (t >= 0.5) {
            const targetMat = this.targetState === "night" ? this.nightMaterialClone : this.dayMaterialClone;
            this.meshComponent.material = targetMat;
            this.fadeDirection = "in";
            console.log(`[SkySphereV2] Switched to ${this.targetState} material`);
          }
        } else {
          const fadeIn = (t - 0.5) * 2;
          const targetMat = this.targetState === "night" ? this.nightMaterialClone : this.dayMaterialClone;
          this.setMaterialAlpha(targetMat, fadeIn);
        }
        if (this.debugMode && Math.floor(t * 10) !== Math.floor((t - dt / this.transitionDuration) * 10)) {
          console.log(`[SkySphereV2] Alpha fade-black: ${Math.round(t * 100)}%`);
        }
        break;
      default:
        break;
    }
  }
  completeTransition() {
    this.isTransitioning = false;
    this.currentState = this.targetState;
    this.transitionProgress = 1;
    const finalMaterial = this.getTargetMaterial();
    if (this.meshComponent.material !== finalMaterial) {
      this.meshComponent.material = finalMaterial;
    }
    this.currentMaterial = finalMaterial;
    switch (this.transitionType) {
      case 2:
        const targetMat = this.targetState === "night" ? this.nightMaterialClone : this.dayMaterialClone;
        const targetMat2 = this.targetState === "night" ? this.nightMaterialClone2 || this.nightMaterialClone : this.dayMaterialClone2 || this.dayMaterialClone;
        this.meshComponent.material = targetMat;
        this.setMaterialAlpha(targetMat, 1);
        if (this.secondaryMesh) {
          this.setMaterialAlpha(targetMat2, 1);
        }
        break;
      case 1:
        const finalMat = this.targetState === "night" ? this.nightMaterialClone : this.dayMaterialClone;
        this.meshComponent.material = finalMat;
        this.setMaterialAlpha(finalMat, 1);
        break;
    }
    console.log(`[SkySphereV2] Transition complete: ${this.currentState}`);
  }
  getTargetMaterial() {
    return this.targetState === "night" ? this.nightMaterial : this.dayMaterial;
  }
  smoothstep(edge0, edge1, x) {
    const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
    return t * t * (3 - 2 * t);
  }
  setMaterialAlpha(material, alpha) {
    if (material.getDiffuseColor) {
      const color = material.getDiffuseColor();
      material.setDiffuseColor([color[0], color[1], color[2], alpha]);
      if (material.setEmissiveColor) {
        material.setEmissiveColor([alpha, alpha, alpha, 1]);
      }
      if (this.debugMode && material.diffuseTexture) {
        const newColor = material.getDiffuseColor();
        const actualAlpha = newColor[3];
        if (Math.abs(actualAlpha - alpha) > 0.01) {
          console.warn(`[SkySphereV2] Alpha quantization detected! Requested: ${alpha.toFixed(4)}, Got: ${actualAlpha.toFixed(4)}`);
        }
        const thresholds = [0, 0.25, 0.5, 0.75, 1];
        for (let threshold of thresholds) {
          if (Math.abs(alpha - threshold) < 0.02) {
            console.log(`[SkySphereV2] Near threshold ${threshold}: alpha = ${alpha.toFixed(4)}`);
          }
        }
      }
    } else if (material.getFlatColor) {
      const color = material.getFlatColor();
      material.setFlatColor([color[0], color[1], color[2], alpha]);
    }
  }
  onDestroy() {
    if (this.onKeyDown) {
      window.removeEventListener("keydown", this.onKeyDown);
    }
  }
  // Public API
  transitionToNight() {
    console.log("[SkySphereV2] transitionToNight() called");
    this.startTransition("night");
  }
  transitionToDay() {
    console.log("[SkySphereV2] transitionToDay() called");
    this.startTransition("day");
  }
  getCurrentState() {
    return this.currentState;
  }
  isInTransition() {
    return this.isTransitioning;
  }
};
__publicField(SkySphereControllerV2, "TypeName", "sky-sphere-controller-v2");
__publicField(SkySphereControllerV2, "Properties", {
  dayMaterial: Property9.material(),
  nightMaterial: Property9.material(),
  secondarySphere: Property9.object(),
  // Optional: second sphere for smooth crossfade
  transitionDuration: Property9.float(2),
  transitionType: Property9.enum(["instant", "fade-black", "crossfade"], "fade-black"),
  debugMode: Property9.bool(false)
});

// js/index.js
function js_default(engine) {
  engine.registerComponent(AudioListener);
  engine.registerComponent(Cursor);
  engine.registerComponent(FingerCursor);
  engine.registerComponent(HandTracking);
  engine.registerComponent(MouseLookComponent);
  engine.registerComponent(PlayerHeight);
  engine.registerComponent(TeleportComponent);
  engine.registerComponent(VrModeActiveSwitch);
  engine.registerComponent(AmbientAudio);
  engine.registerComponent(ExtendedWasdControls);
  engine.registerComponent(InteractionManager);
  engine.registerComponent(InteractiveObject);
  engine.registerComponent(LightFadeController);
  engine.registerComponent(OpacityController);
  engine.registerComponent(VideoWallTiled);
  engine.registerComponent(VrTeleportWrapper);
  engine.registerComponent(SkySphereControllerV2);
  engine.registerComponent(AudioListener);
}
export {
  js_default as default
};
//# sourceMappingURL=MyWonderland-bundle.js.map

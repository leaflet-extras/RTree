// based on https://github.com/mourner/rbush/blob/master/viz/viz.js
var W = 700,
    canvas = document.getElementById('canvas'),
    ctx = canvas.getContext('2d');
var M = 30,
    R = 100;
function randClusterPoint(dist) {
    var x = dist + Math.random() * (W - dist * 2),
        y = dist + Math.random() * (W - dist * 2);
    return [x, y];
}

function randClusterBox(cluster, dist, size) {
    var x = cluster[0] - dist + 2 * dist * (Math.random() + Math.random() + Math.random()) / 3,
        y = cluster[1] - dist + 2 * dist * (Math.random() + Math.random() + Math.random()) / 3;

    return {
        "x" : x, "y" : y,
        "w" : size * Math.random(),
        "h" : size * Math.random()
    };
}
function randBox(size) {
    var x = Math.random() * (W - size),
        y = Math.random() * (W - size);
    return {
        "x" : x, "y" : y,
        "w" : size * Math.random(),
        "h" : size * Math.random()
    };
}
function genData2(N, M) {
    var data = [];
    for (var i = 0; i < M; i++) {
        var cluster = randClusterPoint(R);

        for (var j = 0; j < N / M; j++) {
            data.push(randClusterBox(cluster, R, 1));
        }
    }
    return data;
}
var colors = ['#f40', '#37f', '#0b0'],
    rects;

function drawTree(node, level) {
    if (!node) { return; }

    var rect = [];

    rect.push(level ? colors[(level - 1) % colors.length] : 'grey');
    rect.push(level ? 1 / level : 1);
    rect.push([
        Math.round(node.x) + 0.5,
        Math.round(node.y) + 0.5,
        Math.round(node.w),
        Math.round(node.h)
    ]);

    rects.push(rect);

    if ('leaf' in node) return;

    for (var i = 0; i < node.nodes.length; i++) {
        drawTree(node.nodes[i], level + 1);
    }
}

function draw() {
    rects = [];
    drawTree(tree.root, 0);

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, W + 1, W + 1);

    for (var i = rects.length - 1; i >= 0; i--) {
        ctx.strokeStyle = rects[i][0];
        ctx.globalAlpha = rects[i][1];
        ctx.strokeRect.apply(ctx, rects[i][2]);
    }
}

function search(e) {
    var d1 = (new Date()).valueOf();
    var i = 200;
    console.time('before');
    tree.search({
        x : e.clientX,
        y : e.clientY,
        w : e.clientX + 1,
        h : e.clientY + 1
      });
    console.timeEnd('before');
    while (i--) {
      tree.search({
        x : e.clientX,
        y : e.clientY,
        w : e.clientX + 1,
        h : e.clientY + 1
      });
    }
    console.time('after');
    tree.search({
        x : e.clientX,
        y : e.clientY,
        w : e.clientX + 1,
        h : e.clientY + 1
      });
    console.timeEnd('after');
    benchmark(0, ((new Date()).valueOf() - d1)/200);
}
function genData(N) {
    var data = [];
    for (var i = 0; i < N; i++) {
        data[i] = randBox(1);
    }
    return data;
}

var tree = RTree();

// be nice to use a bulk insert here
genInsertOneByOne(5000, M);
function benchmark(start, end, number) {
  if (number) {
    return document.getElementById('benchmark').innerHTML = 'inserted ' + number + ' points in ' + (end - start) + ' ms'
  }
  document.getElementById('search').innerHTML = '1 pixel search took ' + (end - start) + ' ms'
}
function genInsertOneByOne(K, M) {
  var data2 = genData2(K, M);

  var d1 = (new Date()).valueOf();
  for (var i = 0; i < K; i++) {
      tree.insert(data2[i]);
  }
  benchmark(d1, (new Date()).valueOf(), K);


  draw();
}
function clear () {
  tree = RTree();
  draw();
}
document.getElementById('canvas').onclick = search;
document.getElementById('removeAll').onclick = clear;
document.getElementById('add').onclick = function () {
  genInsertOneByOne(~~document.getElementById('numtoadd').value, 1);
};
// based on https://github.com/mourner/rbush/blob/master/viz/viz.js
var W = 700,
    canvas = document.getElementById('canvas'),
    ctx = canvas.getContext('2d');

function randBox(size) {
    var x = Math.random() * (W - size),
        y = Math.random() * (W - size);
    return {
        "x" : x, "y" : y,
        "w" : size * Math.random(),
        "h" : size * Math.random()
    };
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

    if (node.leaf) return;
    if (level === 6) { return; }

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
    console.time('1 pixel search');
    tree.search({"x" : e.clientX, "y" : e.clientY,
                 "w" : e.clientX + 1, "h" : e.clientY + 1});
    console.timeEnd('1 pixel search');
}

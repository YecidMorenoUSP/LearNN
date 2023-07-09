var _UI = {}
var _events = {}


_UI.latex_1 = document.querySelector("#latex_1")
_UI.latex_2 = document.querySelector("#latex_2")

_events.RUN = false

var delta_x = 200
var delta_y = 160

var ML_NN = [3,2,2,1]

var width = window.innerWidth;
var height = window.innerHeight;

function writeMessage(message) {
    text_log.text(message);
}

class layerNN{
    constructor(n,m,x_off,y_off){
        this._group = new Konva.Group();
        this._nets = []
        for(let i = 0 ; i < n ; i++){
            let _net_fig = new Konva.Circle({
                x: 0+x_off,
                y: y_off+(delta_y)*i,
                radius: 40,
                fill: 'red',
                stroke: 'black',
                strokeWidth: 4,
            });
            this._nets.push(_net_fig)
            this._group.add(_net_fig)
        }
    }

    applyStyle(i){
        const fill = [_style.color["NN_in"],
        _style.color["NN_hidden"],
        _style.color["NN_out"]]
        const strokeWidth = [ 1, 1, 1]
        this._nets.forEach(net=>{
            if(i>=0 && i<=2){
                net.setFill(fill[i])
                net.setStrokeWidth(strokeWidth[i])
            }
        })
    }
}

function createUI(){

    var stage = new Konva.Stage({
        container: 'container',
        width: 800,
        height: 600,
    });

    var layer = new Konva.Layer();

    var text_log = new Konva.Text({
        x: 10,
        y: stage.height()-24,
        fontFamily: 'Calibri',
        fontSize: 24,
        text: 'LOG',
        fill: 'black',
    });
    layer.add(text_log);

    _UI.btn_start = createButton(layer,"Start",[10,10])
    _UI.btn_back  = createButton(layer,"<")
    _UI.btn_play  = createButton(layer,"Play")
    _UI.btn_next  = createButton(layer,">")

    align_X([_UI.btn_start,_UI.btn_back,_UI.btn_play,_UI.btn_next],10)
    align_Top([_UI.btn_start,_UI.btn_back,_UI.btn_play,_UI.btn_next])

    _UI.btn_play.on('click', () => {
        _events.RUN = !_events.RUN
    })

    _UI.stage = stage
    _UI.layer = layer

}

createUI();

LayerList = []
max_nn = Math.max(...ML_NN)
for(let i = 0 ; i < ML_NN.length ; i++){
let _n = ML_NN[i];
cur_layer = new layerNN(_n,2,100+i*delta_x,100+delta_y*(max_nn-_n)/2  )
cur_layer.applyStyle(1)
LayerList.push(cur_layer)
_UI.layer.add(cur_layer._group)
}

LayerList.at(0).applyStyle(0)
LayerList.at(-1).applyStyle(2)

var lines = new Konva.Group();
for(let i = 1 ; i < ML_NN.length ; i++){
var l0 = LayerList[i-1]
var l1 = LayerList[i]

l0._nets.forEach(_n0=>{
    l1._nets.forEach(_n1=>{
        var ln_01 = new Konva.Line({
            points: [_n0.x(),_n0.y(),_n1.x(),_n1.y()],
            stroke: 'black',
            strokeWidth: 2
        });
        lines.add(ln_01)
    })
})
}

_UI.layer.add(lines)
lines.setZIndex(0)
_UI.lines = lines
_UI.stage.add(_UI.layer);

function ExecuteAll(step=0){
    if(!_events.RUN) return;
    if(step<_UI.lines.children.length){    
        _UI.lines.children[step].setStrokeWidth(_style.width.line_focus);

        setTimeout(function(){
            _UI.lines.children[step].setStrokeWidth(_style.width.line_unfocus);
            ExecuteAll(step+1);
        },100)

        

    }else{
        _events.RUN = false
    }
    
}

_events = new Proxy(_events, {
    set: function (target, key, value) {
        target[key] = value;

        if(key == "RUN"){
            if(_events.RUN){
                _UI.btn_play.children[1].setText("Stop")
                ExecuteAll(0);
            }else{
                _UI.btn_play.children[1].setText("Play")
            }
        }

        return true;
    }
  });


katex.render(`\\begin{bmatrix}
                1&2&3 \\\\
                1&2&3 \\\\
                1&2&3 
                \\end{bmatrix}`.format(10), _UI.latex_1, {
    throwOnError: false
});
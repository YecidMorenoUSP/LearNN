var _UI = {}
var _events = {}

_UI.latex_1 = document.querySelector("#latex_1")
_UI.latex_2 = document.querySelector("#latex_2")

_events.RUN = false
_events.STEP = 0

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
            
            let _net_fig = new Konva.Label({
                x: 0,
                y: 0,
                opacity: 0.99
            });
            
            _net_fig.add(new Konva.Circle({
                x: 0,
                y: 0,
                radius: 40,
                fill: 'red',
                stroke: 'black',
                strokeWidth: 4,
            }))
            
            var simpleText = new Konva.Text({
                x: 0,
                y: 0,
                text:"0",
                align: 'center',
                fontSize:25
            })
            simpleText.offsetX(simpleText.width() / 2);
            simpleText.offsetY(simpleText.height() / 2);

            _net_fig.add(simpleText)

            
            
            this._nets.push(_net_fig)
            this._group.add(_net_fig)
        }
    }

    applyStyle(i){
        // return
        const fill = [_style.color["NN_in"],
        _style.color["NN_hidden"],
        _style.color["NN_out"]]
        const strokeWidth = [ 1, 1, 1]
        this._nets.forEach(net=>{
            if(i>=0 && i<=2){
                net.children[0].setFill(fill[i])
                net.children[0].setStrokeWidth(strokeWidth[i])
            }
        })
    }
}

class nn_layer{
    constructor(n,m){
        this.n = m
        this.m = n
        this.W = math.zeros(n,m)
        this.W = math.matrix(math.random([n,m]))
        fixedMatrix(this.W,3)
        
        this.net_in  = math.zeros(1,n)
        this.net_out = math.zeros(1,m)
        this.W_line = math.zeros(n,m)
        this.y_1 = math.matrix(math.zeros(1,m))
        this.x_1 = math.matrix(math.zeros(1,n))
    }

    y(x){
        this.x_1 = x
        this.y_1 = math.multiply(x,this.W)
        return this.y_1
    }
}

class nn_graph{

    constructor(ML_NN){
        this.ML_NN = ML_NN
        this.Z = ML_NN.length
        this.N = ML_NN.at(0)
        this.M = ML_NN.at(-1)
        this.H = ML_NN.length - 2
        this.X = math.ones([1,this.N])
        this.layer = []
        this.steps = []
        this.step_data = []

        var step_template = {l:0,n0:0,n1:0,type:"ff",visited:false}

        for(let i = 0 ; i < ML_NN.length-1 ; i++){
            this.layer.push( new nn_layer(ML_NN[i],ML_NN[i+1]) )
        }


        this.steps.push([0,-1,-1])
        this.step_data.push({l:0,n0:-1,n1:-1,type:"ff",visited:false})

        for(let i = 0 ; i < ML_NN.length-1 ; i++){
            this.steps.push([i,-1,-1,"ff"])
            this.step_data.push({l:i,n0:-1,n1:-1,type:"ff",visited:false})
            for(let n0 = 0 ; n0 < ML_NN[i] ; n0++){
                for(let n1 = 0 ; n1 < ML_NN[i+1] ; n1++){
                    this.steps.push([i,n0,n1,"ff"])
                    this.step_data.push({l:i,n0:n0,n1:n1,type:"ff",visited:false})
                }
            }
        }

        this.steps.push([ML_NN.length-  1,-1,-1,"ff"])
        this.step_data.push({l:ML_NN.length-1,n0:-1,n1:-1,type:"ff",visited:false})

        this.step_data.push({l:ML_NN.length-1,n0:-1,n1:-1,type:"pp",visited:false})
        
        for(let i = (this.step_data.length-2) ; i > 0 ; i-- ){
            this.step_data.push(Object.assign({},this.step_data[i]))
            this.step_data.at(-1).type = "fb"
        }

        
    }

    predict(X){

        if(X._size == undefined || X._size.length == 1){
            X = math.reshape(X,[-1,X._size[0]])
        }

        this.X = X
        var x_in = X
        this.layer[0].x_1 = X
        return
        for(let i = 0 ; i < this.layer.length ; i++){
            x_in = this.layer[i].y(x_in)
        }
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
        text: '',
        fill: 'black',
    });
    layer.add(text_log);

    _UI.btn_start = createButton(layer,"Start",[10,10])
    _UI.btn_back  = createButton(layer,"<")
    _UI.btn_play  = createButton(layer,"Play")
    _UI.btn_next  = createButton(layer,">")

    align_X([_UI.btn_start,_UI.btn_back,_UI.btn_play,_UI.btn_next],10)
    align_Top([_UI.btn_start,_UI.btn_back,_UI.btn_play,_UI.btn_next])

    _UI.btn_start.on('click', () => {
        _events.STEP = 0     
        _events.RUN = true
    })

    _UI.btn_play.on('click', () => {
        _events.RUN = !_events.RUN
    })

    _UI.btn_back.on('click', () => {
        _events.RUN = false
        _events.STEP = _events.STEP - 1     
    })

    _UI.btn_next.on('click', () => {
        _events.RUN = false
        _events.STEP = _events.STEP + 1
    })

    _UI.stage = stage
    _UI.layer = layer

}

function drawNN(){
    
    const delta_x = _style.margin.nn_x
    const delta_y = _style.margin.nn_y

    max_nn = Math.max(...ML_NN)
    for(let i = 0 ; i < ML_NN.length ; i++){
        let _n = ML_NN[i];
        cur_layer = new layerNN(_n,2,
                _style.margin.origin_x+i*delta_x,
                _style.margin.origin_y+delta_y*(max_nn-_n)/2  )
        cur_layer.applyStyle(1)
        LayerList.push(cur_layer)
        _UI.layer.add(cur_layer._group)
        
        if(i==0){
            NN.layer[i].net_in = cur_layer._nets
        }
        if(i>=1 && i<ML_NN.length-1){
            NN.layer[i-1].net_out = cur_layer._nets
            NN.layer[i].net_in = cur_layer._nets
        }if(i==ML_NN.length-1){
            NN.layer[i-1].net_out = cur_layer._nets
        }
        
    }
    LayerList.at(0).applyStyle(0)
    LayerList.at(-1).applyStyle(2)


    for(let i = 1 ; i < ML_NN.length ; i++){
        var l0 = LayerList[i-1]
        var l1 = LayerList[i]
        var f = 0
        var c = 0
        l0._nets.forEach(_n0=>{
            c = 0
            l1._nets.forEach(_n1=>{
                var ln_01 = new Konva.Line({
                    points: [_n0.x(),_n0.y(),_n1.x(),_n1.y()],
                    stroke: 'black',
                    strokeWidth: 2,
                    parents:[_n0,_n1]
                });
                lines.add(ln_01)
                NN.layer[i-1].W_line.set([f,c],ln_01)
                c++;
            })
            f++;
        })
    }
}

function updateNN(){
    const delta_x = _style.margin.nn_x
    const delta_y = _style.margin.nn_y
    max_nn = Math.max(...ML_NN)
    
    LayerList.forEach((L,idx_l) => {
        
        L._nets.forEach((n,idx_n)=>{
            _n = L._nets.length
            n.setX(_style.margin.origin_x+idx_l*delta_x)
            n.setY(_style.margin.origin_y
                +delta_y*idx_n
                +delta_y*(max_nn-_n)/2
            )
        })        
    });

    lines.children.forEach(L=>{
        _n0 = L.attrs.parents[0]
        _n1 = L.attrs.parents[1]
        L.setPoints([_n0.x(),_n0.y(),_n1.x(),_n1.y()])
    })

}

NN = new nn_graph(ML_NN)


var LayerList = []
var lines = new Konva.Group();

createUI();
drawNN();
updateNN()

_UI.layer.add(lines)
lines.setZIndex(0)
_UI.lines = lines
_UI.stage.add(_UI.layer);


_events = new Proxy(_events, {
    set: function (target, key, value) {
        
        
        if(key == "RUN"){
            target[key] = value;

            if(_events.RUN){
                _UI.btn_play.children[1].setText("Stop")
                ExecuteAll(_events.STEP);
            }else{
                _UI.btn_play.children[1].setText("Play")
            }
            
        }else if(key == "STEP"){
            // _events.RUN = true
            if(value>=0 && value < NN.step_data.length){
                target[key] = value;
            }            
            ExecuteOnce(_events.STEP);
            
        }



        return true;
    }
});

_style.margin = new Proxy(_style.margin, {
    set: function (target, key, value) {
        target[key] = value;
        updateNN()
        return true;
    }
});

function net_setText(NN=NN,layer=0,net=0){
    var obj
    var value = "0"

    if(layer>=NN.Z-1){
        layer=layer-1
        obj = NN.layer[layer].net_out[net].children[1]
        value = NN.layer[layer].y_1.get([0,net])
    }else{
        obj = NN.layer[layer].net_in[net].children[1]
        value = NN.layer[layer].x_1.get([0,net])
    }

    value = parseFloat(value).toFixed(2)
    
    setTextCentered(obj,value)
}

net_setText(NN,NN.Z-1,0)



for(let i = 0 ; i < NN.layer.length ; i++){
    for(let j = 0 ; j < NN.layer[i].m ; j++){
        net_setText(NN,i,j)
    }
}


function clearNN_data(){
    for(let i = 0 ; i < NN.layer.length ; i++){
        NN.layer[i].x_1.forEach(function (value, index, matrix) {
            matrix.set(index,0)
        }) 
        NN.layer[i].y_1.forEach(function (value, index, matrix) {
            matrix.set(index,0)
        }) 
    }
    
}


clearNN_data()

function renderEquations(){
    latexW = ""
    latexY = ""

    for(let i = 0 ; i < NN.layer.length ; i++){
        latexW += `W^{${i}} = ` + matrix2Latex(NN.layer[i].W,3) + " ~ , ~ "
        latexY += `X^{${i}} = ` + matrix2Latex(NN.layer[i].x_1,3) + " ~ , ~ "
    }
    latexY += `Y^{out}` + matrix2Latex(NN.layer[NN.layer.length-1].y_1,3) + " ~ , ~ "

    katex.render(latexW, _UI.latex_1, {
        throwOnError: false
    });

    katex.render(latexY, _UI.latex_2, {
        throwOnError: false
    });
}

renderEquations();


function ExecuteOnce(step=0){
    if(step==1){
        clearNN_data()
        NN.predict(math.matrix([1,2,3]))
        console.log("First predict")
    }
    if(step>=0 && step<NN.step_data.length){        
        
        var sd0 = NN.step_data[step]
        

        if(sd0.n0!=-1){
            
            if(sd0.type == "ff"){
                var w = NN.layer[sd0.l].W.get([sd0.n0,sd0.n1])
                var x = NN.layer[sd0.l].x_1.get([0,sd0.n0])
                var c = NN.layer[sd0.l].y_1.get([0,sd0.n1])

                NN.layer[sd0.l].y_1.set([0,sd0.n1],c+w*x)

                if(sd0.l+1 != NN.layer.length){
                    NN.layer[sd0.l+1].x_1._data = NN.layer[sd0.l].y_1._data
                    net_setText(NN,sd0.l+1,sd0.n1)
                }
                    

            }

            NN.layer[sd0.l].W_line.get([sd0.n0,sd0.n1]).setStrokeWidth(_style.width.line_focus);

        }else{
            
            if(sd0.l<NN.layer.length)
                for(let i = 0 ; i < NN.layer[sd0.l].m ; i++)
                    net_setText(NN,sd0.l,i)
            else
                for(let i = 0 ; i < NN.layer[sd0.l-1].n ; i++)
                    net_setText(NN,sd0.l,i)
        }



        renderEquations();
        setTimeout(function(){
            
            if(sd0.n0!=-1){
                NN.layer[sd0.l].W_line.get([sd0.n0,sd0.n1]).setStrokeWidth(_style.width.line_unfocus);
            }
        },_style.time.dt_step)

    }else{
        _events.RUN = false
    }
}

function ExecuteAll(step=0){
    
    if(!_events.RUN) return;
    if(step<NN.step_data.length){        
        
        _events.STEP = step;
        
        setTimeout(function(){
            ExecuteAll(step+1)
        },_style.time.dt_all_step)

    }else{
        _events.RUN = false
    }
    
}
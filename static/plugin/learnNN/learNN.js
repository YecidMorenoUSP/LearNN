
class nn_layer{
    constructor(m,n){
        this.m = m
        this.n = n

        this.W = math.zeros(m,n)
        this.setW()

        this.line = math.zeros(m,n)
        this.net_in  = math.zeros(1,m)
        this.net_out = math.zeros(1,n)        
        this.y_1 = math.matrix(math.zeros(1,n))
        this.x_1 = math.matrix(math.zeros(1,m))
    }

    y(x){
        this.x_1 = math.matrix(x)
        this.y_1 = math.multiply(this.x_1,this.W)
        return this.y_1
    }

    setW(data=true){
        if(data===true){
            this.W = math.matrix(math.random([this.m,this.n]))   
        }else{
            if(data.length === undefined){
                this.W = math.matrix(math.zeros([this.m,this.n]))   
                this.W.forEach((v,i,M) => {
                    M.set(i,data)
                });
            }else{
                let aux = math.matrix(data)
                if(aux._size[0] == this.m && aux._size[1] == this.n){
                    this.W = aux
                }else{
                    throw "Error Baby"
                }                
            }
        }
    }
}

class NeuronalNetwork{

    constructor(ML_NN){
        this.ML_NN = ML_NN
        this.Z = ML_NN.length-1
        this.M = ML_NN.at(0)
        this.N = ML_NN.at(-1)
        this.H = ML_NN.length - 2
        this.X = math.ones([1,this.M])
        this.layer = []
        this.layer_in = []
        this.step_data = []
               
        this.layer_in =  new nn_layer(ML_NN[0],ML_NN[0])
    
        for(let i = 0 ; i < ML_NN.length-1 ; i++){
            this.layer.push( new nn_layer(ML_NN[i],ML_NN[i+1]) )
        }
    }

    predict(X){

        if(X._size == undefined || X._size.length == 1){
            X = math.reshape(X,[-1,X._size[0]])
        }

        this.X = math.matrix(X)
        var x_in = this.X
        this.layer[0].x_1 = this.X
        
    }

    clear(){
        
    }

}

function make_steps(_nn){

    _nn.steps = []
    NN = _nn.NN
   
    _nn.steps.push({l:0,n0:0,n1:0,type:"_init",visited:false})

    for(let l=0 ; l < NN.Z ; l++){
        for(let m=0 ; m < NN.layer[l].m ; m++){
            for(let n=0 ; n < NN.layer[l].n ; n++){
                let s = {l:l,n0:m,n1:n,type:"ff",visited:false}
                _nn.steps.push(s)
            }
        }
    }
    
    _nn.steps.push({l:0,n0:0,n1:0,type:"p0",visited:false})

    for(let l=NN.Z-1 ; l >= 0 ; l--){
        for(let m=NN.layer[l].m-1 ; m >= 0 ; m--){
            for(let n=NN.layer[l].n-1 ; n >= 0 ; n--){
                let s = {l:l,n0:m,n1:n,type:"fb",visited:false}
                _nn.steps.push(s)
            }
        }
    }

    _nn.steps.push({l:0,n0:0,n1:0,type:"_end",visited:false})
}

function GO_callback(){
    _nn.NN = new NeuronalNetwork(_nn.vec_in)
    make_steps(_nn)
    UI_drawNN(_UI,_nn.NN)
}

function UI_tween_multiple(node,style=[],save=[],idx=0){
    if(node==undefined) return
    if(style.length==0) return

    var tam = save.length
    var sl = style.length

    if(idx==sl) return

    save.push(new Konva.Tween({...{node:node},
        ...style[idx],
        onFinish:function(){
            UI_tween_multiple(node,style,save,idx+1)        
        }}))

    save.at(-1).play()
    
}

function runLine(l){
    var lt=_ui.tweens_line[_ui.lines[l].line._id]
    return lt
}

function animate(step=0){
    _ui = _UI
    NN = _nn.NN
    if(step>=0 && step<_nn.steps.length){
        var s = _nn.steps[step];
        let line = undefined
        
        if(s.type == "ff" || s.type == "fb"){
            line = NN.layer[s.l].line.get([s.n0,s.n1])
            _ui.tweens_line[line._id].forEach((t)=>{
                t.destroy()
            })
        }
        
        if(s.type == "ff"){    
            UI_tween_multiple(line,[
                {..._style.line_ff.Self,..._style.line_ff._Tween},
                {..._style.line.Self,..._style.line._Tween}
            ],_ui.tweens_line[line._id])
            
            
        }else if(s.type == "fb"){
            UI_tween_multiple(line,[
                {..._style.line_fb.Self,..._style.line_fb._Tween},
                {..._style.line.Self,..._style.line._Tween}
            ],_ui.tweens_line[line._id])
        }        

        setTimeout(animate,_style.time.dt_step,step+1)
    }
}



let _UI = UI_createUI()
GO_callback()

NN = _nn.NN

animate(0)
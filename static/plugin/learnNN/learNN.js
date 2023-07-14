
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
        this.ML_NN = [ML_NN[0],...ML_NN,ML_NN.at(-1)]
        this.Z = ML_NN.length-1
        this.M = ML_NN.at(0)
        this.N = ML_NN.at(-1)
        this.H = ML_NN.length - 2
        this.X = math.ones([1,this.M])
        this.layer = []
        this.step_data = []    
        // this.layer_in =  new nn_layer(this.ML_NN[0],this.ML_NN[0])
    
        for(let i = 0 ; i < this.ML_NN.length-1 ; i++){
            this.layer.push( new nn_layer(this.ML_NN[i],this.ML_NN[i+1]) )
        }
        this.layer.at(0).setW(1)
        this.layer.at(-1).setW(1)
    }

    predict(X){

        if(X._size == undefined || X._size.length == 1){
            X = math.reshape(X,[-1,X._size[0]])
        }

        this.X = math.matrix(X)
        var x_in = this.X
        this.layer[0].x_1 = this.X
        this.layer[0].y_1 = this.X
        this.layer[1].x_1 = this.X
        
    }

    clear(){
        for(let l = 0 ; l <= this.Z ; l++){
            this.layer[l].y_1.map((v,i,m)=>{
                m.set(i,0)
            })
            this.layer[l].x_1.map((v,i,m)=>{
                m.set(i,0)
            })
        }
    }

}

function NN_make_steps(_nn){

    _nn.step_cur = 0
    _nn.steps = []
    NN = _nn.NN
   
    _nn.steps.push({l:0,n0:0,n1:0,type:"_init",visited:false})

    _nn.steps.push({l:0,n0:0,n1:0,type:"ff_init",visited:false})

    for(let l=1 ; l <= NN.Z ; l++){
        _nn.steps.push({l:l,n0:0,n1:0,type:"ff_layer",visited:false})
        for(let n=0 ; n < NN.layer[l].n ; n++){
            for(let m=0 ; m < NN.layer[l].m ; m++){
                let s = {l:l,n0:m,n1:n,type:"ff",visited:false}
                _nn.steps.push(s)
            }
        }
    }
    
    _nn.steps.push({l:0,n0:0,n1:0,type:"p0",visited:false})

    for(let l=NN.Z ; l >= 1 ; l--){
        for(let n=NN.layer[l].n-1 ; n >= 0 ; n--){
            for(let m=NN.layer[l].m-1 ; m >= 0 ; m--){
                let s = {l:l,n0:m,n1:n,type:"fb",visited:false}
                _nn.steps.push(s)
            }
        }
    }

    _nn.steps.push({l:0,n0:0,n1:0,type:"_end",visited:false})
}

function GO_callback(){
    _nn.NN = new NeuronalNetwork(_nn.vec_in)
    NN_make_steps(_nn)

    UI_drawNN(_UI,_nn.NN)
    UI_updateNodes(_ui)
    UI_renderEquations(_ui)
}



function runLine(l){
    var lt=_ui.tweens_line[_ui.lines[l].line._id]
    return lt
}

function UI_animate(step=0,continuios=false){
    // console.log("UI_animate")
    if(step<=0) step = 0

    _ui = _UI
    NN = _nn.NN
    _nn.step_cur = step

    if(step>=0 && step<_nn.steps.length){
        var s = _nn.steps[step];
        
                
        if(!s.visited){
            if(s.type == "_init"){

            }else if(s.type == "ff_layer"){
                UI_addLOG("<br>Calculando saída da camada #"+s.l+"<br>");
            }else  if(s.type == "ff_init"){
                UI_addLOG("Preparando o primeiro paso (feedforward) <br>")
            }else if(s.type == "ff"){    
              
                var res = NN.layer[s.l].W.get([s.n0,s.n1])*
                            NN.layer[s.l-1].x_1.get([0,s.n0]) + 
                            NN.layer[s.l].y_1.get([0,s.n1])            
                
                UI_addLOG(""+
                katex.renderToString(`~~~~Y_{${s.l},${s.n1}} += W_{${s.n0},${s.n1}} 
                * X_{${s.l},${s.n0}}~:~
                ${NN.layer[s.l].y_1.get([0,s.n1]).toFixed(2)} + 
                ${NN.layer[s.l].W.get([s.n0,s.n1]).toFixed(2)} *
                ${NN.layer[s.l-1].x_1.get([0,s.n0]).toFixed(2)}:
                ${res.toFixed(2)}`)+
                "<br>");

                NN.layer[s.l].y_1.set([0,s.n1],res)
                NN.layer[s.l+1].x_1.set([0,s.n1],res)  

                
            }else if(s.type == "fb"){

            }
            s.visited = true;
        }
        
        let line = undefined
        if(s.type == "ff" || s.type == "fb"){
            line = NN.layer[s.l].line.get([s.n0,s.n1])
            _ui.tweens_line[line._id].forEach((t)=>{
                t.destroy()
            })
        }

        if(s.type == "_init"){
            UI_addLOG()
            NN_make_steps(_nn)
            UI_addLOG("Limpando variaveis para inicio da execução <br><br>");
            NN.clear()
            UI_addLOG("Definindo entrada da rede "+
            katex.renderToString("X_0 = "+matrix2Latex(math.matrix([_nn.x0]),2))
            +"<br><br>");
            NN.predict(math.matrix(_nn.x0))
        }else if(s.type == "ff_layer"){
            
        }else  if(s.type == "ff_init"){

        }else if(s.type == "ff"){    
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
      

       
                
        UI_updateNodes(_ui)
        UI_renderEquations(_ui,s)
        UI_setUI(_ui)

        if(continuios && _nn.running == true)
            setTimeout(UI_animate,_style.time.dt_step,step+1,continuios)
    }else{
        _nn.running = false
    }
}

function UI_updateNodes(_ui=_UI){
    for(let l=0 ; l <= NN.Z ; l++){
        for(let idx=0 ; idx < NN.layer[l].n ; idx++){
            var value = NN.layer[l].y_1.get([0,idx])
            UI_setStyle(NN.layer[l].net_out.get([0,idx]),
                {Text:{text: value.toFixed(3) }})
        }
    }
}

// item = [[1,1,'\\color{orange}','']]



let _UI = UI_createUI()
GO_callback()

NN = _nn.NN

// UI_animate(0,true)
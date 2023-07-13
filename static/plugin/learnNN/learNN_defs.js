//#####################################
//            Defines
//#####################################

_style = {
    color:{
        "NN_in":"#FFA400",
        "NN_hidden":"#80BC00",
        "NN_out":"#FF414E",
        "bg_btn":"black"
    },
    stage:{
        Self:{draggable:false},
        const:{scaleBy:0},
        // Self:{draggable:true},
        // const:{scaleBy:1.2},
    },
    width:{
        line:2,
        line_focus:8,
        line_unfocus:2
    },
    margin:{
        origin_x:100,
        origin_y:100,
        nn_x:200,
        nn_y:160,
    },
    time:{
        dt_step: 100
    },
    neuron:{
        // draggable:true
    },
    line:{
        Self:{stroke: '#CCC',strokeWidth: 5},
        _Tween:{duration: .5},
    },
    line_focus:{
        Self:{stroke: '#000',strokeWidth: 8},
        _Tween:{duration: .5}
    },
    line_ff:{
        Self:{stroke: '#00CC00',strokeWidth: 6},
        _Tween:{duration: .5}
    },
    line_fb:{
        Self:{stroke: '#FF8000',strokeWidth: 6},
        _Tween:{duration: .5}
    },
    layer_in:{
        Text:{fill:"#FFF"},
        Circle:{fill:"#FFA400",stroke:"#CCC",strokeWidth:"2"},
    },
    layer_hidden:{
        Text:{fill:"#FFF"},
        Circle:{fill:"#80BC00",stroke:"#CCC",strokeWidth:"2"},
    },
    layer_out:{
        Text:{fill:"#FFF"},
        Circle:{fill:"#FF414E",stroke:"#CCC",strokeWidth:"2"},
    },
    latex_anim:{
        ff:['\\color{green}  (',')'],
        fb:['\\color{orange} (',')'],
        ff_layer:[]
    }
}
_nn = {
    vec_in : [3,2,2,1],
    x0: [1,2,3]
}

_events = {}

//#####################################
//            Prototypes
//#####################################

math.Matrix.prototype.toFixed = function(n){
    this.forEach((v,i,M)=>{
        M.set(i,parseFloat(v).toFixed(n))
    })
    return this
}

//#####################################
//            UI
//#####################################

function UI_setStyle(obj,s){
    Object.keys(s).forEach((type)=>{
        if(type!="Self"){
            if(obj.find != undefined){
                obj.find(type).forEach((node)=>{
                    Object.keys(s[type]).forEach((attr)=>{
                        eval(`node.${attr}(s[type][attr])`);
                    })    
                })
            }
        }else{
            Object.keys(s[type]).forEach((attr)=>{
                eval(`obj.${attr}(s[type][attr])`);
            })    
        }
            
    })
}

function UI_create_neuron(style){
    
    let _node = new Konva.Label({
        x: 0,
        y: 0,
        opacity: 1,
        draggable:_style.neuron.draggable
    });

    _node.add(new Konva.Circle({
        x: 0,
        y: 0,
        radius: 40,
        fill: 'red',
        stroke: 'black',
        strokeWidth: 4,
    }))
    
    _node.add( new Konva.Text({
        x: -40,
        y: -40,
        text:"0",
        align: "center",
        verticalAlign:"middle",
        width:80,
        height:80,
        fontSize:22
    }))
 
    if(style!=undefined){
        UI_setStyle(_node,style)
    }

    return _node
}

function UI_update_lines(_ui=_UI){
    _ui.lines.forEach((l)=>{
        l.line.points([l.n0.x(),l.n0.y(),l.n1.x(),l.n1.y()])
    })
}

function UI_update_nodes(_ui=_UI,NN=_nn.NN){
    let MaxNet = Math.max(...NN.ML_NN)

    for(let l=0 ; l <= NN.Z ; l++){
        for(let idx=0 ; idx < NN.layer[l].n ; idx++){

            var _node = NN.layer[l].net_out.get([0,idx])
            
            _node.x(_style.margin.origin_x+_style.margin.nn_x*(l))
            _node.y(_style.margin.origin_y+_style.margin.nn_y*idx +
                    (MaxNet-NN.layer[l].n)*_style.margin.nn_y/2 )
    
        }
    }
    UI_update_lines(_ui)
}

function UI_drawNN(_ui=_UI,NN=_node.NN){
    
    _ui.nodes = []

    var _group_nodes = new Konva.Group();
    
    for(let l=0 ; l <= NN.Z ; l++){
        for(let idx=0 ; idx < NN.layer[l].n ; idx++){

            var _node

            if(l==0){
                _node = UI_create_neuron(style=_style.layer_in)                
            }else if(l==NN.Z){
                _node = UI_create_neuron(style=_style.layer_out)
            }else{
                _node = UI_create_neuron(style=_style.layer_hidden)
            }
           
            _node.on("dragmove",()=>{
                UI_update_lines(_ui)
            })

            NN.layer[l].net_out.set([0,idx],_node)

            if(l != NN.Z){
                NN.layer[l+1].net_in.set([0,idx],_node)
            }

            _ui.nodes.push(_node)
            _group_nodes.add(_node)
        }
    }
    
    var _group_lines = new Konva.Group();
    
    _ui.lines = []

    for(let l=1 ; l <= NN.Z ; l++){
        for(let n=0 ; n < NN.layer[l].n ; n++){
            for(let m=0 ; m < NN.layer[l].m ; m++){
                let n0 = NN.layer[l].net_in.get([0,m])
                let n1 = NN.layer[l].net_out.get([0,n])
                
                let line = new Konva.Line({
                    points:[n0.x(),n0.y(),n1.x(),n1.y()]
                })
                UI_setStyle(line,_style.line)

                let data_line = {line:line,n0:n0,n1:n1,l:l}             

                line.on("mouseover",function(e){
                    UI_setStyle(e.currentTarget,_style.line_focus)
                    UI_renderEquations(_ui,{n0:m,n1:n,l:l,type:'ff'})
                })

                line.on("mouseout",function(e){
                    UI_setStyle(e.currentTarget,_style.line)
                    UI_renderEquations()
                })

                NN.layer[l].line.set([m,n],line)   
                _group_lines.add(line)
                _ui.lines.push(data_line)
            }
        }
    }    

    _ui.layer.add(_group_lines)
    _ui.layer.add(_group_nodes)
    
    _ui.tweens_node = {}
    _ui.nodes.forEach((n)=>{
        _ui.tweens_node[n._id] = []
    })

    _ui.tweens_line = {}
    _ui.lines.forEach((l)=>{
        _ui.tweens_line[l.line._id] = []
    })

    UI_update_nodes(_ui,_nn.NN)

}

function UI_createUI(){
    _ui = {}
    
    var stage = new Konva.Stage({
        container: 'nn_render_container',
        width: window.innerWidth*.99, 
        height: 600,
    });

    UI_setStyle(stage,_style.stage)

    var scaleBy = _style.stage.const.scaleBy;
    if(scaleBy>0)
    stage.on('wheel', (e) => {
        // stop default scrolling
        e.evt.preventDefault();

        var oldScale = stage.scaleX();
        var pointer = stage.getPointerPosition();

        var mousePointTo = {
          x: (pointer.x - stage.x()) / oldScale,
          y: (pointer.y - stage.y()) / oldScale,
        };

        // how to scale? Zoom in? Or zoom out?
        let direction = e.evt.deltaY > 0 ? 1 : -1;

        // when we zoom on trackpad, e.evt.ctrlKey is true
        // in that case lets revert direction
        if (e.evt.ctrlKey) {
          direction = -direction;
        }

        var newScale = direction < 0 ? oldScale * scaleBy : oldScale / scaleBy;

        stage.scale({ x: newScale, y: newScale });

        var newPos = {
          x: pointer.x - mousePointTo.x * newScale,
          y: pointer.y - mousePointTo.y * newScale,
        };
        stage.position(newPos);
      });
    var layer = new Konva.Layer();
    
    layer.add(new Konva.Text({
        x: 10,
        y: stage.height()-12,
        fontFamily: 'Calibri',
        fontSize: 12,
        text: 'LearNN, by YecidMorenoUSP',
        fill: '#CCC',
        align: "center",
    }))
    layer.children.at(-1).x(stage.width()-layer.children.at(-1).width())

    _ui.stage = stage
    _ui.layer = layer

    _ui.stage.add(_ui.layer)
    UI_getUI(_ui)

    return _ui
}

function UI_getUI(_ui=_UI){
    _ui.latex_1 = document.querySelector("#latex_1")
    _ui.latex_2 = document.querySelector("#latex_2")
    _ui.latex_3 = document.querySelector("#latex_3")
    _ui.n_step = document.querySelector("#n_step")
    _ui.LOG = document.querySelector("#LOG")
    document.querySelector("#btn_cls").onclick = ()=>{
        UI_animate(0)
    }
    document.querySelector("#btn_next").onclick = ()=>{
        UI_animate(_nn.step_cur+1)
    }
    document.querySelector("#btn_back").onclick = ()=>{
        UI_animate(_nn.step_cur-1)
    }
}

function UI_setUI(_ui=_UI){
    _ui.n_step.innerHTML = _nn.step_cur+" of "+(_nn.steps.length-1)
}

function UI_renderEquations(_ui=_UI,s){

    latexW = ""
    latexX = ""
    latexY = ""
    var style 
    for(let i = 1 ; i <= NN.Z ; i++){
        style = ""
        if(s && s.l == i){
            style = [[s.n0, s.n1,..._style.latex_anim[s.type]]]
        }
        latexW += `W^{${i}} = ` + matrix2Latex(NN.layer[i].W,3,style) + " ~ , ~ "
        style = ""
        if(s && s.l == i){
            style = [[0, s.n0,..._style.latex_anim[s.type]]]
        }
        latexX += `X^{${i}} = ` + matrix2Latex(NN.layer[i].x_1,3,style) + " ~ , ~ "
        style = ""
        if(s && s.l == i){
            style = [[0, s.n1,..._style.latex_anim[s.type]]]
        }
        latexY += `Y^{${i}} = ` + matrix2Latex(NN.layer[i].y_1,3,style) + " ~ , ~ "

        latexW += "\\\\"
        latexX += "\\\\"
        latexY += "\\\\"
    }
    // latexY += `Y^{out}` + matrix2Latex(NN.layer[NN.layer.length-1].y_1,3) + " ~ , ~ "

    katex.render(latexW, _UI.latex_1, {
        throwOnError: false
    });

    katex.render(latexX, _UI.latex_2, {
        throwOnError: false
    });

    katex.render(latexY, _UI.latex_3, {
        throwOnError: false
    });
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

function UI_addLOG(txt=undefined){
    if(txt) _ui.LOG.innerHTML += txt;
    else _ui.LOG.innerHTML = ""
}

//#####################################
//            Latex
//#####################################

function matrix2Latex(M,fixed=-1,item=[]){
    var txt_in = ""
    var m,n
    
    m = M._size[0]
    n = M._size[1]
    var to_add = ""
    for(var f = 0 ; f < m ; f++){
        for(var c = 0 ; c < n ; c++){
            
            to_add = ""
            
            if(fixed==-1){
                to_add += M._data[f][c]
            }else{
                to_add += parseFloat(M._data[f][c]).toFixed(fixed)
            }

            if(item){
                item.forEach((i)=>{
                    if(i[0]==f && i[1]==c){
                        to_add = `${i[2]}{${to_add}}${i[3]}`
                    }else{
                        to_add = `~~{${to_add}}~~`
                    }
                })
            }

            txt_in += to_add

            if((c+1)!=n){
                txt_in += "&"    
            }
        }
        if((f+1)!=m){
            txt_in += "\\\\"
        }
    }

    return `\\begin{bmatrix}${txt_in}\\end{bmatrix}`
}
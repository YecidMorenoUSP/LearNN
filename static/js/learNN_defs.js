_style = {
    color:{
        "NN_in":"#FFA400",
        "NN_hidden":"#80BC00",
        "NN_out":"#FF414E",
        "bg_btn":"black"
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
        dt_step: 500,
        dt_all_step: 1000,
    }
}

function align_X(items,delta=20,pos=-1){
    if(pos != -1)items[0].setX(pos);
    for(let i = 1 ; i < items.length; i++){
        items[i].setX(items[i-1].getX()+items[i-1].getWidth()+delta);
    }
}
function align_Top(items,pos=-1){
    if(pos != -1)items[0].setY(pos);
    for(let i = 1 ; i < items.length; i++){
        items[i].setY(items[i-1].getY());
    }
}

function setTextCentered(obj,txt){
    obj.text( txt )
    obj.offsetX(obj.width() / 2);
    obj.offsetY(obj.height() / 2);
}

function fixedMatrix(M,count){
   
    for(let f = 0 ; f < M._size[0] ; f++){
        for(let c = 0 ; c < M._size[1] ; c++){
            M.set([f,c], M.get([f,c]).toFixed(count))
        }
    }

}

function matrix2Latex(M,fixed=-1){
    var txt_in = ""
    var m,n
    
    m = M._size[0]
    n = M._size[1]
    
    
    for(let f = 0 ; f < m ; f++){
        for(let c = 0 ; c < n ; c++){
            if(fixed==-1){
                txt_in += M._data[f][c]
            }else{
                txt_in += parseFloat(M._data[f][c]).toFixed(fixed)
            }
            
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

async function sleep_ms(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

String.prototype.format = function () {
    var args = arguments;
    return this.replace(/{([0-9]+)}/g, function (match, index) {
      // check if the argument is there
      return typeof args[index] == 'undefined' ? match : args[index];
    });
  };

function createButton(layer,name,coords=[100,100]){
    var button = new Konva.Label({
        x: coords[0],
        y: coords[1],
        opacity: 0.99
    });
    layer.add(button);

    button.add(new Konva.Tag({
        fill: _style.color["bg_btn"],
        lineJoin: 'round',
        shadowColor: 'grey',
        shadowBlur: 10,
        shadowOffset: 10,
        shadowOpacity: 0.5
    }));

    button.add(new Konva.Text({
        text: name,
        fontFamily: 'Calibri',
        fontSize: 18,
        padding: 5,
        fill: 'white'
    }));

    return button;
      
}
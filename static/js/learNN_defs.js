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
        shadowColor: 'black',
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
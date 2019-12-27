var socket = io.connect('192.168.0.119:3000')
//const remote = require('electron').remote;
socket.on('parking', (data) => {
    console.log("parking event")
    for (var k in data) {
        if(k !== 'active'){
        var path = "./sensor_" + data[k] + ".png"
        console.log(k)
        document.getElementById(k).src = path;
        }
    }
    })
socket.on('test', (data) => {
    //console.log(data)
    // if(data) {
    //     var window = remote.getCurrentWindow();
    //     window.minimize();
    // }
})
document.addEventListener("click", function(){
    console.log("pressed");
    var window = remote.getCurrentWindow();
    window.minimize();
  });

function onDomReadyHandler(event) {
    console.log("setting socket")
    socket.on('parking', (data) => {
        console.log("parking event")
        for (var k in data) {
            console.log(data[k])
        }
        })
    socket.on('test', (data) => {
        console.log(data)
        // if(data) {
        //     var window = remote.getCurrentWindow();
        //     window.minimize();
        // }
    })
    } 
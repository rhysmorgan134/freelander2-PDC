var socket = io.connect('localhost:3000')
const remote = require('electron').remote;

document.addEventListener("click", function(){
    console.log("pressed");
    var window = remote.getCurrentWindow();
    window.minimize();
  });

count = 4

setInterval(() => {
    var path = "./sensor_" + count + ".png"
    console.log(path)
    document.getElementById("topRight").src = path;
    count = count -1
    if(count ===0) {
        count = 4
    }
}, 1000)

function onDomReadyHandler(event) {
    socket.on('parking', (data) => {
        for (var k in data) {
            console.log(data[k])
        }
        })
    } 
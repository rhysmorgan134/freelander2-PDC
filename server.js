var express = require('express');
var app=express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var can = require('socketcan');
var fs = require("fs");
var temp = require("pi-temperature");
var Gpio = require("onoff").Gpio
var fan = new Gpio(17, 'out')
var {exec} = require('child_process');
var info = {}
var fanOn = fan.readSync()
//message object which is used to send can message

//console.log("bringing can up res: " + JSON.stringify(exec("sudo /sbin/ip link set can0 up type can bitrate 125000")))
var brightness = 255
exec("sudo sh -c 'echo " + '"' + brightness +'"' +" > /sys/class/backlight/rpi_backlight/brightness'")

//create indicator object, this sends the status of all leds over the socket
var parking = {}
parking.active = 0
parking.topRight = 4
parking.topLeft = 4
parking.botLeft = 4
parking.botRight = 4

//create can channel
var channel = can.createRawChannel("can0", true);
channel.setRxFilters([{id:392,mask:392}])
// create listener for all can bus messages
channel.addListener("onMessage", function(msg) {
    //console.log(msg)
    //check if message id = 520, hex - 0x208, this contains the statuses sent to the panel
    if(msg.id === 392) {
        var arr = [...msg.data]
        if(arr[0] > 10) {
            console.log(arr)
            parking.active = 1
	//exec("xdotool search --name 'PDC' windowactivate")
            parking.topRight = getDist(arr[6])
            parking.topLeft = getDist(arr[7])
            parking.botLeft = getDist(arr[3])
            parking.botRight = getDist(arr[4])
            console.log(JSON.stringify(parking))
        } else {
            parking.active =0
        }
    } else if (msg.id === 99999999999) {
        var arr = [...msg.data]
        var newBrightness = arr[3]
        if (newBrightness !== brightness) {
            brightness = newBrightness        
//		console.log("new brightness is " + brightness)            
		if(brightness != 0) {
		exec("sudo sh -c 'echo " + '"' + brightness +'"' +" > /sys/class/backlight/rpi_backlight/brightness'")
    }
        }
    }
} );

var getDist = function(val) {
    var dist =4;
    switch(true) {
        case (val < 64):
            dist = 4;
            break;
        case(val<128):
            dist =3;
            break;
        case(val<192):
            dist=2;
            break;
        default:
            dist=1;
            break;
    }
    return dist;
    
}

//can bus channel start
channel.start()

//server start
server.listen(3000)

//serve static html
app.use(express.static(__dirname + '/html'))

//on socket connection
io.on('connection', function(client) {
 
    console.log('Client connected....');

})


setInterval(() => {
    //create output object for the canbus message
    var close = 0;
    if(parking.active) {
        io.emit('parking',parking)
    } else {
        io.emit('parking',parking)
        io.emit('test','parking')
        console.log("sent Parking")
    }
}, 100)

setInterval(() => {
    temp.measure(function(err, temp) {
        if (err) console.error(err);
        else {
            info['cpu'] = temp
        }
    });

    io.emit('info', info);
}, 500)

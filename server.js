var sys = require('sys');
var posix = require('posix');
var http = require('http');

http.createServer( function( req, res ){
  var activity_id = req.url.replace('/','');
  sys.print("Fetching " + activity_id + " from connect.garmin.com: ");
  var proc1 = process.createChildProcess("snapurl", ["http://connect.garmin.com/activity/" + activity_id, "-f", activity_id]);
  proc1.addListener("exit", function( d1 ){
    sys.puts("done!");
    sys.print("Cropping map: ");
    var proc2 = process.createChildProcess("convert", ["-crop", "640x420+370+210", activity_id + "-fullsize.png", activity_id + "-map.png"]);
    proc2.addListener("exit", function( d2 ){
      sys.puts("done!");
      sys.print("Sending PNG to client: ")
      posix.stat( activity_id + "-map.png" ).addCallback( function( stats ){
        posix.open( activity_id + "-map.png", process.O_RDONLY, process.S_IRWXU ).addCallback( function( fd ){
          posix.read( fd, stats['size'], 0 ).addCallback( function( d3, bytes, input ){
            res.sendHeader(200, {
                "Content-Length": d3.length,
                "Content-Type": "image/png"
              });
            res.sendBody(d3,'binary');
            sys.puts("done!");
            sys.print("Cleaning up: ");
            var proc3 = process.createChildProcess("rm", [ "-f", activity_id + "-clip.png", activity_id + "-fullsize.png", activity_id + "-thumbnail.png", activity_id + "-map.png" ]);
            proc3.addListener("exit", function(){
              sys.puts("done!")
              res.finish();             
            });
          });
        });        
      });
    });
  });

}).listen(8000);
sys.puts('Server running at http://127.0.0.1:8000/');
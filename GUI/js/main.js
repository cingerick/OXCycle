
var ArduinoReady=false;
var ArduinoCommandReady=false;
var serialConnected=false;
var serialNumber="";
var serialFlashed=false;
var ArduinoHomed=false;
var serialQueue=[];
var portSearch;
var eligiblePorts;
var recieveError=false;
var recieveSuccess=false;
var jsonErrorCount=0;
var lastSent="";
var writeDirectory;




var Arduino = new SerialConnection();

Arduino.onConnect.addListener(function(path) {
  //console.log('connected to: ' + this.DEVICE_PATH);
  //Arduino.send("hello arduino");
});

Arduino.onReadLine.addListener(function(line) {
  //console.log('read line: ' + line);
});


function onOpen(openInfo) {
  connectionId = openInfo.connectionId;
  console.log("connectionId: " + connectionId);
  if (connectionId == -1) {
    setStatus('Could not open');
    return;
  }
  setStatus('Connected');

  setPosition(0);
  //chrome.serial.onReceive.addListener(onread);
  //chrome.serial.read(connectionId, 1, onRead);
};



////////////////////////////////////    Read Serial Input
function useInput(st) {
  println('Read: '+st);
  try
  {
     var json = JSON.parse(st);
     var r = json.r!=undefined  ? json.r  : null;
  	if (r!=null){
      var check1 = r.id!=undefined ? r.id : null ;
      var jsonCheck = r.json!=undefined ? r.json : null ;
    }
    if (jsonCheck !=null ) {
      if (jsonCheck){
        recieveError=false;
        recieveSuccess=true;
        println("json success");
      }
      else{
        recieveError=true;
        recieveSuccess=false;
      }
    } 
    if (check1 !=null ) {
      ArduinoReady=true;
      recieveError=false;
      recieveSuccess=true;
      println("conected to: "+check1)
    }	
  }
  catch(e)
  {
  	println(e);
     println('invalid json');
  }
}

///////////////////////////////////////////

function setStatus(status) {
  document.getElementById('status').innerText = status;
}

function tryPorts(){
  if (ArduinoReady || eligiblePorts.length==0){
    clearInterval(portSearch);
    return;
  }

    if (Arduino.connectionId != -1) {
       Arduino.disconnect(connectionId, function() {});
      //return;
      }
    try{
      var tmpPrt=eligiblePorts.shift();
      println("trying " +tmpPrt.path);
      Arduino.connect(tmpPrt.path);
    }
  catch(err){
    println(err);
  }

};


function testSerial(ports){
  eligiblePorts = ports.filter(function(port) {
	return !port.path.match(/[Bb]luetooth/) && (port.path.match(/\/dev\/tty/) || port.path.match(/COM[1234567890]/));
  });
  ArduinoReady=false;
  if (eligiblePorts.length>0){
      portSearch=setInterval(function(){tryPorts();}, 200);
  }
}

onload = function() {
  chrome.serial.getDevices(function(ports) {
   try{
   testSerial(ports);
   }catch(e){
	println(e);
   }
  });
  
  $( "#snd" ).click(function() {
		ArduinoSafeWrite($("#cmd").val()+'\n');
    $("#cmd").val("");
  });

  $( "#sndtst" ).click(function() {
		ArduinoSafeWrite('{"tid":0,"sid":0,"tpe":0,"freq":1,"tar":100,"spd":70,"devid":0}' );
		ArduinoSafeWrite('{"tid":0,"sid":1,"tpe":0,"freq":1,"tar":50,"spd":70,"devid":0}' );
		ArduinoSafeWrite('{"tid":0,"cnt":1000}');
  });



  $( "#sndang" ).click(function() {
		sendAngle($("#ang").val()+'\n');
    $("#ang").val("");
  });

  $( "#sndfeed" ).click(function() {
		sendFeed($("#feed").val()+'\n');
    $("#feed").val("");
  });

  $( "#home" ).click(function() {
		ArduinoHome();
});

};


/* Converts a string to UTF-8 encoding in a Uint8Array; returns the array buffer. */
var str2ab = function(str) {
  var encodedString = unescape(encodeURIComponent(str));
  var bytes = new Uint8Array(encodedString.length);
  for (var i = 0; i < encodedString.length; ++i) {
    bytes[i] = encodedString.charCodeAt(i);
  }
  return bytes.buffer;
};

/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
//                                                                     //
//                                                                     //
//                                                                     //  
//                            Serial Out                               //
//                                                                     //
//                                                                     //
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////


// runs the queue every second
setInterval(function(){flushQueue();}, 1000);

function flushQueue(){
    if (serialQueue.length>0 && (recieveSuccess||jsonErrorCount>2 ) ){
        recieveError=false;
        recieveSuccess=false;
        jsonErrorCount=0;
        println("Sent "+serialQueue[0]+'\n');
        Arduino.send(serialQueue[0]+'\n');
        lastSent=serialQueue[0]+'\n';
        serialQueue.shift();
    }
    else if (recieveError){
      recieveError=false;
      recieveSuccess=false;
      Arduino.send(lastSent);
      jsonErrorCount++;
    }

}

function ArduinoSafeWrite(st){
  serialQueue.push(st);
}

function println(st){
	console.log(st);
}

function ArduinoCode(IN){
  ArduinoSafeWrite ("{\"gc\":\""+IN+"\"}"+'\n');
}

function ArduinoSetting(set, va){
  ArduinoSafeWrite ("{\""+set+"\":"+va+"}"+'\n');
}

function ArduinoRequest(bla){
  ArduinoSafeWrite("{\""+bla+"\":\"\"}"+'\n');
}

function sendStart(i){
  ArduinoSafeWrite ("{\"tid\":"+i+",\"run\":1}"+'\n');
}
function sendStop(i){
  ArduinoSafeWrite ("{\"tid\":"+i+",\"run\":0}"+'\n');
}
function stopAll(i){
  ArduinoSafeWrite ("{\"stop\":1}"+'\n');
}


//////////////////////////////////////////////////////////////////////////// UI


     function dataURItoBlob(dataURI, callback) {
        // convert base64 to raw binary data held in a string
        // doesn't handle URLEncoded DataURIs
        println("here");

        var byteString;
        if (dataURI.split(',')[0].indexOf('base64') >= 0) {
            byteString = atob(dataURI.split(',')[1]);
        } else {
            byteString = unescape(dataURI.split(',')[1]);
        }

        // separate out the mime component
        var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

        // write the bytes of the string to an ArrayBuffer
        var ab = new ArrayBuffer(byteString.length);
        var ia = new Uint8Array(ab);
        for (var i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }

        // write the ArrayBuffer to a blob, and you're done
        var BlobBuilder = window.WebKitBlobBuilder || window.MozBlobBuilder;
        var bb = new BlobBuilder();
        bb.append(ab);
        return bb.getBlob(mimeString);
    }




/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
//                                                                     //
//                                                                     //
//                                                                     //  
//                            JQuery UI                                //
//                                                                     //
//                                                                     //
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////

  $(function() {



///////////   Lists
  
  $( ".leftList .portlet" )
  .addClass( "ui-widget ui-widget-content ui-helper-clearfix ui-corner-all" )
  .find( ".portlet-header" )
  .addClass( "ui-widget-header ui-corner-all" )
  .prepend( "<span class='sortIcon ui-icon ui-icon-arrowthick-2-n-s'> <span class='ui-icon ui-icon-plusthick portlet-toggle'></span>");
    
	
  $( ".sortable" ).sortable({
    items: "li:not(.head)",
      revert: true,
    handle: ".portlet-header",
    receive:function(){
    refreshPortlets();
    }
  });

  $( ".leftList li" ).draggable({
      connectToSortable: ".sortable ",
    handle: ".portlet-header",
      helper: "clone",
      revert: "invalid"
  });
  
  
  $( "ul, li" ).disableSelection();


  $(".trash").droppable({
    accept: ".sortable li",
    hoverClass: "ui-state-hover",
    drop: function(ev, ui) {
        ui.draggable.remove();
    }
  });

  $( document ).on("click",".portlet-toggle",function(){
      var icon = $( this );
      icon.toggleClass( "ui-icon-minusthick ui-icon-plusthick" );
      icon.closest( ".portlet" ).find( ".portlet-content" ).toggle();
  });
  



///////////  Tabs


$('#testTabs a').click(function (e) {
  e.preventDefault();
  $(this).tab('show');
});

//$('#myTab  a[href="#defTab"]').tab('show'); // Select tab by name
$('#testTabs a:first').tab('show'); // Select first tab
//$('#myTab li:eq(2) a').tab('show'); // Select third tab (0-indexed)


  $("#defaultTab").addClass("newTabHTML");
	$("#defaultTab").attr("id","");
	var tabHTML=$(".newTabHTML").clone();
	$(".newTabHTML").attr("id","defaultTab");
	$("#defaultTab").removeClass("newTabHTML");
	

  var tabCount=2;
  

  
  $("#newTab").click(function(){
  var li="<li><a href='#Tab-"+tabCount+"' role='tab' data-toggle='tab'>Test "+tabCount+"</a></li>";
  $(tabHTML.clone()).insertBefore($("#newTabs"));
  $(".newTabHTML").attr("id","Tab-"+tabCount);
  $(".newTabHTML").removeClass("newTabHTML");
  $('#testTabs a').click(function (e) {
    e.preventDefault();
    $(this).tab('show');
    });

  tabCount++;
  refreshPortlets();
  
  });


//////// Buttons
	
	$( "input[type=submit], button, .button" )
      .button()
      .click(function( event ) {
        event.preventDefault();
      });
	


    $(".sendTest").click(function(e){
      var dat=$(this).closest(".actionList").find("form").each(function(){
          var dat=$(this).serializeArray();
          var myjson = {}; 
          $.each(dat, function() { myjson[this.name] = this.value; }); 
          serialQueue.push(myjson);
          //println(myjson);
      });
    });

    $(".stopButton").click(function(e){
      stopAll();
    });


	

  /////////   Progress Bar
    $( ".testProgress" ).progressbar({
      value: 37
    });

	
	
  });
  

  function refreshPortlets(){

	
	$( ".spinner" ).spinner({
	  min: 1,
      step: 1,
      start: 1
	});
	
	
	//$(".slider").slider();

  $( ".slider" ).slider({
        range: "min",
        min: 0,
        max: 100,
        slide: function( event, ui ) {
          $(ui.handle).parent().closest("form").find('input[name="'+$(ui.handle).parent().attr('name')+'"]').val(ui.value );
        }
  });



   	$( "input[type=submit], button, .button" ).button();
	
	$( ".sortable" ).sortable({
	  connectWith:".trash",
	  items: "li:not(.head)",
      revert: true,
	  handle: ".portlet-header",
    stop: function(event, ui) {
        $(ui.item).closest("ul").find("li").each(function(){
          $(this).find('input[name="sid"]').val($(this).index());
        });
    },
	  receive:function(){
	  refreshPortlets();
	  }
    });
    $( ".leftList li" ).draggable({
      connectToSortable: ".sortable",
	  handle: ".portlet-header",
      helper: "clone",
      revert: "invalid"
    });
    $( "ul, li" ).disableSelection();
	
	  $( ".sortable .portlet" )
      .addClass( "ui-widget ui-widget-content ui-helper-clearfix ui-corner-all" )
      .find( ".portlet-header" )
      .addClass( "ui-state-highlight ui-corner-all" );
	  
	  	$(".trash").droppable({
    accept: ".sortable li",
    hoverClass: "ui-state-hover",
    drop: function(ev, ui) {
        ui.draggable.remove();
    }
	});
  }
  



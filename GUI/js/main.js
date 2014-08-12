var connectionId = -1;
var readBuffer = "";
const serial = chrome.serial;
var tinyGFlashReady=false;
var tinyGCommandReady=false;
var serialConnected=false;
var serialNumber="";
var serialFlashed=false;
var tinyGHomed=false;
var serialQueue=[];



/* Interprets an ArrayBuffer as UTF-8 encoded string data. */
var ab2str = function(buf) {
  var bufView = new Uint8Array(buf);
  var encodedString = String.fromCharCode.apply(null, bufView);
  return decodeURIComponent(escape(encodedString));
};

var SerialConnection = function() {
  this.connectionId = -1;
  this.lineBuffer = "";
  this.boundOnReceive = this.onReceive.bind(this);
  this.boundOnReceiveError = this.onReceiveError.bind(this);
  this.onConnect = new chrome.Event();
  this.onReadLine = new chrome.Event();
  this.onError = new chrome.Event();
};

SerialConnection.prototype.onConnectComplete = function(connectionInfo) {
  if (!connectionInfo) {
    log("Connection failed.");
    return;
  }
  this.connectionId = connectionInfo.connectionId;
  chrome.serial.onReceive.addListener(this.boundOnReceive);
  chrome.serial.onReceiveError.addListener(this.boundOnReceiveError);
  this.onConnect.dispatch();
};

SerialConnection.prototype.onReceive = function(receiveInfo) {
  if (receiveInfo.connectionId !== this.connectionId) {
    return;
  }
   this.lineBuffer += ab2str(receiveInfo.data);

  var index;
  while ((index = this.lineBuffer.indexOf('\n')) >= 0) {
    var line = this.lineBuffer.substr(0, index + 1);
    this.onReadLine.dispatch(line);
	useInput(line);
	$("#txt").append(line);
    this.lineBuffer = this.lineBuffer.substr(index + 1);
  } 
  
};

SerialConnection.prototype.onReceiveError = function(errorInfo) {
  if (errorInfo.connectionId === this.connectionId) {
    this.onError.dispatch(errorInfo.error);
  }
};

SerialConnection.prototype.connect = function(path) {
  serial.connect(path,{bitrate:9600},this.onConnectComplete.bind(this))
};

SerialConnection.prototype.send = function(msg) {
  if (this.connectionId < 0) {
    throw 'Invalid connection';
  }
  serial.send(this.connectionId, str2ab(msg), function() {});
};

SerialConnection.prototype.disconnect = function() {
  if (this.connectionId < 0) {
    throw 'Invalid connection';
  }
  serial.disconnect(this.connectionId, function() {});
};

var TinyG = new SerialConnection();

TinyG.onConnect.addListener(function(path) {
  console.log('connected to: ' + this.DEVICE_PATH);
  TinyG.send("hello arduino");
});

TinyG.onReadLine.addListener(function(line) {
  console.log('read line: ' + line);
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

function useInput(st) {
try
{
   var json = JSON.parse(st);
   var r = json.r!=undefined  ? json.r  : null;
   var er= json.er!=undefined ? json.er : null;
   var id= json.er!=undefined ? json.er : null;
	else if (r!=null){
          var check1 = r.posy!=undefined ? r.posy : -999 ;
          var check2 = r.posx!=undefined ? r.posx : -999 ;
          var check3 = r.f!=undefined ? r.f.length :0;
          var check4 = r.id!=undefined ? r.id : null ;
          var check7 = r.homx!=undefined ? r.homx : 0 ;
     }
	 else if (er!=null){
            var check5=er.val!=undefined ? er.val : -1 ;
      }
	 else if (id!=null){
            tinyGFlashReady=true;
      }

      if (check3 > 0) {
        tinyGFlashReady=true;
      }	
}
catch(e)
{
	println(e);
   println('invalid json');
}
};

function setStatus(status) {
  document.getElementById('status').innerText = status;
}

function testSerial(ports){
  var eligiblePorts = ports.filter(function(port) {
	return !port.path.match(/[Bb]luetooth/) && (port.path.match(/\/dev\/tty/) || port.path.match(/COM[1234567890]/));
  });
  eligiblePorts.every(function(port) {
       if (TinyG.connectionId != -1) {
       TinyG.disconnect(connectionId, openSelectedPort);
      //return;
			}
	  try{
			println(port.path);
			TinyG.connect(port.path);
		}
	catch(err){
		println(err);
	}

  });

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
		TinyGSafeWrite($("#cmd").val()+'\n');
  $("#cmd").val("");
});

  $( "#sndtst" ).click(function() {

		setTimeout(function(){TinyGSafeWrite('{"tid":0,"sid":0,"tpe":0,"freq":1,"tar":100,"spd":70,"devid":0}' );},100);
		setTimeout(function(){TinyGSafeWrite('{"tid":0,"sid":1,"tpe":0,"freq":1,"tar":50,"spd":70,"devid":0}' );},1000);
		setTimeout(function(){TinyGSafeWrite('{"tid":0,"cnt":1000}');},2000);
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
		tinyGHome();
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



///////////////////////////////////////////////////////////////////////////////////////////

function TinyGSafeWrite(st) {
  try {
    console.log("write: "+st);
    TinyG.send(st+'\n');
    //delay(70);
  } 
  catch (err) {
    //TinyG.stop();
    console.log("Exception: "+err);
    console.log("write fail");
    //popUpWarning="connection";
    //displayCase="warning";
  }
}

function println(st){
	console.log(st);
}

function tinyGCode(IN){
  TinyGSafeWrite ("{\"gc\":\""+IN+"\"}"+'\n');
}

function tinyGSetting(set, va){
  TinyGSafeWrite ("{\""+set+"\":"+va+"}"+'\n');
}

function tinyGRequest(bla){
  TinyGSafeWrite("{\""+bla+"\":\"\"}"+'\n');
}

function tinyGHome() {
  if (!serialConnected){
    testSerial();
  }
  if (serialConnected){
    tinyGHomed=false;
    tinyGCommandReady=false;
     //delay(50);
     tinyGCode ("g28.3 x0"); //drop pin
     tinyGCode ("g28.2 x0"); //drop pin
     
    //TinyGSafeWrite (homeText);
    //delay(1000);
    tinyGCode ("g28.3 y0"); //drop pin
    yAt0=false;
    flashStartMillis=System.currentTimeMillis();
    //while(!tinyGCommandReady && (System.currentTimeMillis()-flashStartMillis)<7000 ){

    //}
    
    
   tinyGFlashReady=true;

    tinyGRequest("homx");
    homeResponse=false;
    tinyGHomed=false;  
    yAt0=false;
    xAt0=false;
	var d = new Date();
    //var homeStartMillis= d.getMilliseconds();
    while(!homeResponse && (Date.now()-d)<15000 ){

    }
	
	
    tinyGHomed=true;  
    
    tinyGRequest("posy");
    tinyGRequest("posx");
    //xAt0=true;
    //yAt0=true;
    //println(tinyGHomed);
    lastangle=1;
  }
}


function sendFeed(f){
      tinyGCommandReady=false;
      f=Math.round(f*1000)/1000;
      tinyGCode ("g0 y"+f);
      feedSent=f;
      yAt0=false;
}



//////////////////////////////////////////////////////////////////////////// UI

  $(function() {
  
  	  $( ".leftList .portlet" )
      .addClass( "ui-widget ui-widget-content ui-helper-clearfix ui-corner-all" )
      .find( ".portlet-header" )
        .addClass( "ui-widget-header ui-corner-all" )
        .prepend( "<span class='sortIcon ui-icon ui-icon-arrowthick-2-n-s'> <span class='ui-icon ui-icon-plusthick portlet-toggle'></span>");
    
	
  	$("#defaultTab").addClass("newTabHTML");
	$("#defaultTab").attr("id","");
	var tabHTML=$(".newTabHTML").clone();
	$(".newTabHTML").attr("id","defaultTab");
	$("#defaultTab").removeClass("newTabHTML");
	
    var tabFresh = $( "#tabs" ).tabs();
	$(".slider").slider({
	  range: "min",
      value: 2,
      min: .1,
      max: 3,
      slide: function( event, ui ) {
        $( "#amount" ).val( "$" + ui.value );
      }
	  });
	
	$( "input[type=submit], button, .button" )
      .button()
      .click(function( event ) {
        event.preventDefault();
      });
	
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
	

		
		
	$( document ).on("click",".portlet-toggle",function(){
      var icon = $( this );
      icon.toggleClass( "ui-icon-minusthick ui-icon-plusthick" );
      icon.closest( ".portlet" ).find( ".portlet-content" ).toggle();
    });
  
	var tabCount=2;
	

	
	$("#newTab").click(function(){
	var li="<li><a id='tabtop"+tabCount+"' href='#Tab-"+tabCount+"' role='presentation'>Test "+tabCount+"</a></li>";
	$(li).insertBefore($("#newTab").parent());
	//tabFresh.find( ".ui-tabs-nav" ).append( li );
	tabFresh.append($(tabHTML.clone()));
	$(".newTabHTML").attr("id","#Tab-"+tabCount);
	$(".newTabHTML").attr("role","tabpanel");
	$(".newTabHTML").addClass("ui-tabs-panel ui-widget-content ui-corner-bottom");
	$(".newTabHTML").removeClass("newTabHTML");
	
	// $( "#tabs" ).tabs();
	tabFresh.tabs("refresh");
	//$("#tabs").tabs('load', tabCount-2);
	tabCount++;
	refreshPortlets();
	
	});
	$(".trash").droppable({
    accept: ".sortable li",
    hoverClass: "ui-state-hover",
    drop: function(ev, ui) {
        ui.draggable.remove();
    }
	});
	
	
  });
  

  function refreshPortlets(){

	
	$( ".spinner" ).spinner({
	  min: 1,
      step: 1,
      start: 1
	});
	
	
	$(".slider").slider();
   	$( "input[type=submit], button, .button" ).button();
	
	$( ".sortable" ).sortable({
	  connectWith:".trash",
	  items: "li:not(.head)",
      revert: true,
	  handle: ".portlet-header",
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
  


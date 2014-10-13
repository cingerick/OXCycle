
var ArduinoReady        =false;
var ArduinoCommandReady =false;
var serialConnected     =false;
var serialNumber        ="";
var serialFlashed       =false;
var ArduinoHomed        =false;
var serialQueue         =[];
var portSearch;
var eligiblePorts;
var recieveError        =false;
var recieveSuccess      =false;
var jsonErrorCount      =0;
var lastSent            ="";
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


/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
//                                                                     //
//                                                                     //
//                                                                     //  
//                            on page Load                             //
//                                                                     //
//                                                                     //
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////


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
//                            Sensor portlets                          //
//                                                                     //
//                                                                     //
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////


function addPortlet(destinationList,type,settings){
  var isDefault=true;
  if (settings){

    isDefault=false
  }
    settings = settings || {type:type,
                            testID: 1, 
                            order:1, 
                            devID:1, 
                            speed:50, 
                            freq:1, 
                            actTarget:50,
                            stepTarget:90,
                            errCheck:1,
                            errType:1,
                            errCnt:1};
    var output="1";
    var title="1";
    var devName='1';

    switch(parseInt(settings.type)){
      case 1:
        title="Actuator";
        devName= "Actuator";
        break;
      case 2:
        title="Step";
        devName= "Actuator";
        break;
      case 3:
        title="Force";
        devName= "Actuator";
        break;
      case 4:
        title="Force";
        devName= "Actuator";
        break;
      default:
        title="Default";
        devName= "Actuator";
      break;
    };

var portletStart=
            '<li  class="">'+
              '<div class="portlet">'+
               ' <div class="portlet-header">'+title+'</div>'+
                '<div class="portlet-content" style="display:none"> ' +
                '<ul>';



var frequency=    '<li>'+
                    '<div>frequency:every </div>' +
                    '<div><input name="freq" class="spinner freqInput" value=1></div>'+
                    '<div>nth cycle</div>'+
                  '</li>';
var devID=        '<li><label>'+devName+' #</label>'+
                    '<select name="devid" class="devIDInput">'+
                      '<option value="1">1</option>'+
                      '<option value="2">2</option>'+
                      '<option value="3">3</option>'+
                    '</select>'+
                  '</li>';
var actThrow=     '<li>'+
                    '<div>Throw</div>'+
                    '<div class="slider actuatorSlider" name="actTarg"></div>'+
                    '<div class="testBtn button">test</div>'+
                  '</li>';


var currentBtn=   '<li>'+
                    '<div class="button actuatorBtn">use current</div>'+
                  '</li>';

var speedSlider=  '<li>'+
                    '<div>Speed</div>'+
                    '<div class="slider actuatorSlider" name="speed"></div>'+
                  '</li>';

var portletEnd=   '<form class="actionSettings">'+
                    '<input type="hidden" name="testID"    value='+settings.testID+'>'+
                    '<input type="hidden" name="order"     value='+settings.order+'>'+
                    '<input type="hidden" name="type"      value='+settings.type+'>'+
                    '<input type="hidden" class="speedVal"    name="speed"     value='+settings.speed+'>'+
                    '<input type="hidden" class="devIDVal"    name="devID"     value='+settings.devID+'>'+
                    '<input type="hidden" class="freqVal"     name="freq"      value='+settings.freq+'>'+
                    '<input type="hidden" class="actTargVal"  name="actTarg"   value='+settings.actTarget+'>'+
                    '<input type="hidden" class="stepTargVal" name="stepTarg"  value='+settings.stepTarget+'>'+
                    '<input type="hidden" class="errCheckVal" name="errCheck"  value='+settings.errCheck+'>'+
                    '<input type="hidden" class="errTypeVal"  name="errType"   value='+settings.errType+'>'+
                    '<input type="hidden" class="errCntVal"   name="errCnt"    value='+settings.errCnt+'>'+
                 '</form>'+
                '</ul>'+
                '</div>'+
              '</div>'+
            '</li>';

    switch(parseInt(settings.type)){
      case 1:
      output= portletStart+
              frequency+
              devID+
              actThrow+
              currentBtn+
              speedSlider+
              portletEnd;
        break;
      default:
      output= portletStart+
              frequency+
              devID+
              actThrow+
              currentBtn+
              speedSlider+
              portletEnd;
      break;
    };
  //$(destinationList).find(ul).append(output);

  if (isDefault){
   $('#'+destinationList).find('.leftList').append(output);
  }
  else{
    $('#'+destinationList).find('.actionList').append(output);
  }
 
};

function addTab(testID, settings){
      settings = settings || {testID: 1, 
                            email:1, 
                            cycleCnt:9865, 
                            name:"newTest",

                          };




//var tabPane='<div class="tab-pane" id="'+testID+'">testID</div>'

var settingsPanel=
        '<div class="panel panel-default">'+

            '<div class="panel-heading">'+
               '<h3 class="panel-title">Info</h3>'+
            '</div>'+
          '<form class="testSettings">'+

            '<div class="panel-body">'+
            '<div class="testStatus">'+
             ' <div class="row">'+
                '<div class="col-md-4">'+
                '<div class="form-group">'+
                  '<label for="testName" class="col-sm-5 control-label">Test Name</label>'+
                  '<div class="col-sm-7">'+
                  '<input type="hidden" name="testID" value="1">'+
                    '<input type="text" name="name" class="form-control"  value="Test 1">'+
                  '</div>'+
                '</div>'+
               '</div>'+
                  '<div class="col-md-4">'+
                '<div class="form-group">'+
                  '<label for="testName" class="col-sm-2 control-label">Email</label>'+
                  '<div class="col-sm-10">'+
                      
                      '<input type="email" name="email" class="form-control user_email" Value="jdoe@OXO.com">'+
              
                 '</div>'+
                '</div>'+
               '</div>'+
                 '<div class="col-md-4">'+
                '<div class="checkbox">'+
                  '<label><input type="checkbox" name="emailFlag" value="false">Email me when complete</label>'+
                '</div>'+
              '</div>'+

              '<div class="row">'+
                '<div class="col-md-5">'+
                  '<div class="form-group">'+
                    '<label for="testName" class="col-sm-5 control-label">Number of cycles</label>'+
                  '<div class="col-sm-5">'+
                    '<input type="number" name="numCycles" class="form-control"  value="1000">'+
                  '</div>'+
                '</div>'+
               '</div>'+
                  '<div class="col-md-4">'+
                '<div class="form-group">'+
                  '<label for="testName" class="col-sm-6 control-label">Allowed Errors</label>'+
                  '<div class="col-sm-4">'+
                    '<input type="number" name="numErr"class="form-control" value="5">'+
                  '</div>'+
                '</div>'+
               '</div>'+
            '</div>'+


            '</div>'+
          '</div>'+
          '</div>'+
          '</form>'+
        '</div>';




 var actionsPanel=       
        '<div class="panel panel-default">'+
          '<div class="panel-heading">'+
            '<h3 class="panel-title">Test Settings</h3>'+
          '</div>'+
          '<div class="panel-body">'+
            '<div class="row">'+
              '<div class="col-md-3">'+
                '<ul class="leftList">'+
                '</ul>'+
          '</div>'+
        '<div class="col-md-8">'+
          '<ul class="actionList sortable connectedSortable">'+
            '<li class="ui-state-default head">Drag actions here</li>'+
          '</ul>'+
        '</div>'+
        '</div>'+
          
         '<div class=" trash ui-state-error head">Trash</div>'+
        '</div>'+
        '</div>';

var buttonsPanel=
        '<div class="panel panel-default">'+
          '<div class="panel-body">'+
            '<div class="testStatus">'+
              '<div class="btn-group">'+
                '<button type="button" class="btn btn-success sendTest">Start</button>'+
                '<button type="button" class="btn btn-danger">Stop</button>'+
                '<button type="button" class="btn ">Pause</button>'+
                '<button type="button" class="btn ">Resume</button>'+
                '<button type="button" class="btn saveBtn">Save</button>'+
              '</div>'+
            '</div>'+
          '</div>'+
        '</div>';



var tabPane= 
    '<div class="tab-pane" id="'+testID+'">'+
      settingsPanel+
      actionsPanel+
      buttonsPanel+
    '</div>';
  $('#testTabs').find('li:last').after('<li><a href="#'+testID+'" role="tab" data-toggle="tab">'+settings.name+'</a></li>');
  //$('#testTabs').append('<li><a href="#'+testID+' " role="tab" data-toggle="tab">'+settings.name+'</a></li>');
  $("#tabContent").append(tabPane);


//
  addPortlet(testID,1);
  addPortlet(testID,2);
  addPortlet(testID,3);
//if test exists, add more


  refreshPortlets();
  newPortlets(testID);

  $('#testTabs a').click(function (e) {
  e.preventDefault();
  $(this).tab('show');
});

$('#testTabs li:last a').tab('show');
  //$('#testTabs li a[href="#'+testID+'"]').click();

  //$('a[href="#'+testID+'"]').parent().trigger('click');

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
  //addPortlet("leftlist",1);
  //addPortlet("leftlist",2);
  //addPortlet("leftlist",3);
  
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
  // var li="<li><a href='#Tab-"+tabCount+"' role='tab' data-toggle='tab'>Test "+tabCount+"</a></li>";
  // $(tabHTML.clone()).insertBefore($("#newTabs"));
  // $(".newTabHTML").attr("id","Tab-"+tabCount);
  // $(".newTabHTML").removeClass("newTabHTML");
  // $('#testTabs a').click(function (e) {
  //   e.preventDefault();
  //   $(this).tab('show');
  //   });
addTab(new Date().getTime());
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

    $(document).on("click",".saveBtn",function(e){
      var id=$(this).closest('.tab-pane').attr('id');
      $( "input[name='testID']" ).val( id );
      saveTest(id);
      
    });

    $(document).on("click",".clearTests",function(e){
        indexedDB.deleteDatabase('tests');
        listTests();
      
    });

    
    $(document).on("click",".loadTestBtn",function(e){
        var id =$(this).attr('testid');
        println("load clicked");
        println(id);
        if ($("#"+id).length<=0){
          addTab(id);
          listActions(id);   
        }
        else{
          $('#testTabs li a[href="#'+id+'"]').click();
        }

    });




	

  /////////   Progress Bar
    $( ".testProgress" ).progressbar({
      value: 37
    });

	
	
  });

function newPortlets(testID){
  $("#"+testID).
  find(".leftList .portlet" )
  .addClass( "ui-widget ui-widget-content ui-helper-clearfix ui-corner-all" )
  .find( ".portlet-header" )
  .remove("span")
  .addClass( "ui-widget-header ui-corner-all" )
  .prepend( "<span class='sortIcon ui-icon ui-icon-arrowthick-2-n-s'> <span class='ui-icon ui-icon-plusthick portlet-toggle'></span>");
}

function newActionPortlets(testID){
  $("#"+testID).
  find(".actionList .portlet" )
  .addClass( "ui-widget ui-widget-content ui-helper-clearfix ui-corner-all" )
  .find( ".portlet-header" )
  .remove("span")
  .addClass( "ui-widget-header ui-corner-all" )
  .prepend( "<span class='sortIcon ui-icon ui-icon-arrowthick-2-n-s'> <span class='ui-icon ui-icon-plusthick portlet-toggle'></span>");
}

function refreshPortlets(){

  


  	$( ".spinner" ).spinner({
  	    min: 1,
        step: 1,
        start: 1
  	});
  $( ".slider" ).slider({
        range: "min",
        min: 0,
        max: 100,
        slide: function( event, ui ) {
          $(ui.handle).parent().closest(".portlet-content").find('input[name="'+$(ui.handle).parent().attr('name')+'"]').val(ui.value );
        }
  });

$(document).on("change", ".freqInput",function(e){
  println("freq change"+$(this).val());
  $(this).closest(".portlet-content").find(".freqVal").val($(this).val());
});

$(document).on("change", ".devIDInput",function(e){
  println("freq change"+$(this).val());
  $(this).closest(".portlet-content").find(".devIDVal").val($(this).val());
});

$(document).on("change", ".devIDInput",function(e){
  println("freq change"+$(this).val());
  $(this).closest(".portlet-content").find(".devIDVal").val($(this).val());
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

  



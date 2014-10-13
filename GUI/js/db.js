window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
// DON'T use "var indexedDB = ..." if you're not in a function.
// Moreover, you may need references to some window.IDB* objects:
window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
// (Mozilla has never prefixed these objects, so we don't need window.mozIDB*)

if (!window.indexedDB) {
    window.alert("Your browser doesn't support a stable version of IndexedDB. Such and such feature will not be available.");
}


function listTests(){
//indexedDB.deleteDatabase('tests');
var request = indexedDB.open("tests");
request.onerror = function(event) {};
request.onupgradeneeded = function(event) {
  const dummyData = [
   // {name: "Sippy Pull Test", description: "super cool test",email: "JohnDoe@OXO.com"},
   // {name: "snack cup Test", description: "dummy test", email:"JaneDoe@OXO.com" }
  ];
  var db = event.target.result;
  println("upgrayedd");
 //var objectStore = db.createObjectStore("tests", { autoIncrement : true });
     var objectStore = db.createObjectStore("tests", {keyPath: "testID" });
objectStore.createIndex("testID", "testID", { unique: true });
  objectStore.createIndex("name", "name", { unique: false });
  //objectStore.createIndex("testID", "testID", { unique: false });
  //objectStore.createIndex("description", "description", { unique: false });
  objectStore.createIndex("email", "email", { unique: false });
  objectStore.createIndex("numCycles", "numCycles", { unique: false });
  objectStore.createIndex("numErr", "numErr", { unique: false });
  objectStore.transaction.oncomplete = function(event) {
    // Store values in the newly created objectStore.
    var customerObjectStore = db.transaction("tests", "readwrite").objectStore("tests");
    for (var i in dummyData) {
      //customerObjectStore.add(dummyData[i]);
    }
  }
};
request.onsuccess = function(event) {
  var db = event.target.result;
  println("Success");
  $("#loadModal").find("tbody").html("");
  var trans = db.transaction("tests", "readwrite");
  var store = trans.objectStore("tests");

  // Get everything in the store;
  var keyRange = IDBKeyRange.lowerBound(0);
  var cursorRequest = store.openCursor(keyRange);
  var tableText="";
  var count=1;
  var mailz=new Array();
  cursorRequest.onsuccess = function(e) {
    var result = e.target.result;
    if(!!result == false)
      return;

    tableText+="<tr>";
    tableText+=("<td>");
    tableText+=count;
    count++;
    tableText+=("</td>");
    tableText+=("<td>");
    tableText+=(result.value.name);
    tableText+=("</td>");
    tableText+=("<td>");
    tableText+=(result.value.email);
    tableText+=("</td>");
    tableText+=("<td>");
    tableText+=(result.value.numCycles);
    tableText+=("</td>");
    tableText+=("<td>");
    tableText+=('<button type="button" class="btn btn-primary loadTestBtn" data-dismiss="modal" testid='+result.value.testID+'>Load</button>');
    tableText+=("</td>");
    tableText+=("</tr>");
    mailz.push(result.value.email);
    result.continue();
  };
  cursorRequest.transaction.oncomplete= function(e) {
    $("#loadModal").find("tbody").html(tableText);
    $( ".user_email" ).autocomplete({ source: mailz });
    println("updated test list");
  };


  }
};



listTests();


function saveTest(testID){
var testData=$("#"+testID).find('.testSettings').serializeObject();
var actionData= [];
$("#"+testID+" .actionList").find('.actionSettings').each(function(){
  actionData.push($(this).serializeObject());
});
println(actionData[0]);

var request = indexedDB.open("tests");
request.onerror = function(event) {};

request.onsuccess = function(event) {
    var db = event.target.result;
    println("Success");
    var customerObjectStore = db.transaction("tests", "readwrite").objectStore("tests");
    customerObjectStore.add(testData);
    listTests();
  };

  //indexedDB.deleteDatabase(testID);
  var request2 = indexedDB.open(testID);
  request2.onerror = function(event) {};
  request2.onupgradeneeded = function(event) {
    var db2 = event.target.result;
    println("upgrayedd");
   var objectStore2 = db2.createObjectStore(testID, { autoIncrement : true });

    // objectStore.createIndex("name", "name", { unique: false });
    // //objectStore.createIndex("testID", "testID", { unique: false });
    // //objectStore.createIndex("description", "description", { unique: false });
    // objectStore.createIndex("email", "email", { unique: false });
    // objectStore.createIndex("numCycles", "numCycles", { unique: false });
    // objectStore.createIndex("numErr", "numErr", { unique: false });
    objectStore2.transaction.oncomplete = function(event) {
      // Store values in the newly created objectStore.
      var customerObjectStore2 = db2.transaction(testID, "readwrite").objectStore(testID);
      for (var i in actionData) {
        customerObjectStore2.add(actionData[i]);
    println("added portlet datas") ;
     }
  }
};

}

function listActions(testID){
//indexedDB.deleteDatabase('tests')
var request = indexedDB.open(testID);
request.onerror = function(event) {
  return null;
};
request.onupgradeneeded = function(event) {
  return null;
};
request.onsuccess = function(event) {
  var db = event.target.result;
  println("Success");

  var trans = db.transaction(testID, "readwrite");
  var store = trans.objectStore(testID);

  // Get everything in the store;
  var keyRange = IDBKeyRange.lowerBound(0);
  var cursorRequest = store.openCursor(keyRange);
  var tableText="";
  cursorRequest.onsuccess = function(e) {
    var result = e.target.result;
    if(!!result == false)
      return;
      //println(result);
      println(result.value);

      addPortlet(testID,1,result.value)
    result.continue();
  };
  cursorRequest.transaction.oncomplete= function(e) {
    newActionPortlets(testID);
    refreshPortlets();
  };


  }
};

$.fn.serializeObject = function()
{
    var o = {};
    var a = this.serializeArray();
    $.each(a, function() {
        if (o[this.name] !== undefined) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};

$(function() {
    $('form').submit(function() {
        
        return false;
    });
});
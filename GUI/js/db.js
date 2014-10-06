  // In the following line, you should include the prefixes of implementations you want to test.
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
//indexedDB.deleteDatabase('tests')
var request = indexedDB.open("tests");
request.onerror = function(event) {};
request.onupgradeneeded = function(event) {
  const dummyData = [
    {name: "Sippy Pull Test", description: "super cool test",email: "JohnDoe@OXO.com"},
    {name: "snack cup Test", description: "dummy test", email:"JaneDoe@OXO.com" }
  ];
  var db = event.target.result;
  println("upgrayedd");
  var objectStore = db.createObjectStore("tests", { autoIncrement : true });
  objectStore.createIndex("name", "name", { unique: false });
  objectStore.createIndex("description", "description", { unique: false });
  objectStore.createIndex("email", "email", { unique: false });
  objectStore.transaction.oncomplete = function(event) {
    // Store values in the newly created objectStore.
    var customerObjectStore = db.transaction("tests", "readwrite").objectStore("tests");
    for (var i in dummyData) {
      customerObjectStore.add(dummyData[i]);
    }
  }
};
request.onsuccess = function(event) {
  var db = event.target.result;
  println("Success");

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
    tableText+=(result.value.description);
    tableText+=("</td>");
    tableText+=("<td>");
    tableText+=(result.value.email);
    tableText+=("</td>");
    tableText+=("<td>");
    tableText+=('<button type="button" class="btn btn-primary">Load</button>');
    tableText+=("</td>");
    tableText+=("</tr>");
    mailz.push(result.value.email);
    println("run through");
    result.continue();
  };
  cursorRequest.transaction.oncomplete= function(e) {
    $("#loadModal").find("tbody").html(tableText);
    $( ".user_email" ).autocomplete({ source: mailz });
  };


  }
};
listTests();


function saveTest(){
var dummyData = [{name: "Sippy Pull Test", description: "super cool test",email: "JohnDoe@OXO.com"}]
    ];

var request = indexedDB.open("tests");
request.onerror = function(event) {};

request.onsuccess = function(event) {
  var db = event.target.result;
  println("Success");
  var customerObjectStore = db.transaction("tests", "readwrite").objectStore("tests");
    for (var i in dummyData) {
      customerObjectStore.add(dummyData[i]);
    };
};


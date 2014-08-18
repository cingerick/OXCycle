void sendResponse(String s){
     String c="{\"r\":";
     c.concat(s);
     c.concat("}");
     Serial.println(c);
}

String makeJSON(String key,String val){
     String s="{\"";
     s.concat(key);
     s.concat("\":\"");
     s.concat(val);
     s.concat("\"}");
    return s;
}

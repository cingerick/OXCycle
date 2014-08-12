void Read() {   
  
   while (Serial.available())    //Check for serial signal
  {
    //delay(10); 
    // get the new byte:
    //inputString[sI] = Serial.read(); 
    Serial.readBytesUntil('\n',inputString,bufferLength);
    //Serial1.print(inputString[sI]);
    // if the incoming character is a newline, set a flag
    // so the main loop can do something about it:
    //if (inputString[sI] == '\n') {
     // inputString[sI] = '\0';
      Serial.println("tried");
      JsonParser<bufferLength> parser;
      JsonHashTable hashTable = parser.parseHashTable(inputString);
      //char inputString[bufferLength]= "";
      
      if (hashTable.success())
      {
        Serial.println("success");
        /*
        {"tid":0,"sid":0,"tpe":0,"freq":1,"tar":100,"spd":70,"devid":0}   
        {"tid":0,"sid":1,"tpe":0,"freq":1,"tar":50,"spd":70,"devid":0}
        */
      int testid = hashTable.getLong("tid");
      if (hashTable.containsKey("tpe")){
              int type = hashTable.getLong("tpe");
  
              switch (type){
                case actuator:
                    steps[numSteps][stepTest]=testid;
                    steps[numSteps][stepType]=type;
                    steps[numSteps][stepNumber]=hashTable.getLong("sid");
                    steps[numSteps][stepFrequency]=hashTable.getLong("freq");
                    steps[numSteps][devId]=hashTable.getLong("devid");
                    steps[numSteps][actuatorTarget]=map(hashTable.getLong("tar"),0,100,actuatorMinThrow,actuatorMaxThrow);
                    steps[numSteps][stepSpeed]=map(hashTable.getLong("spd"),0,100,actuatorMinSpeed,actuatorMaxSpeed);
                    stepStart[numSteps]=0;
                    Serial.println(steps[numSteps][actuatorTarget]);

                  break;
                case stepper:
                
                  break;
                case pause:
                    steps[numSteps][stepTest]=testid;
                    steps[numSteps][stepType]=type;
                    steps[numSteps][pauseLength]=hashTable.getLong("pause");
                    stepStart[numSteps]=0;
                  break;
                  
                  
              }
              numSteps++;
      
      }
      //{"tid":0,"cnt":1000}
      else if (hashTable.containsKey("cnt")){
        tests[testid][targetCycle]= hashTable.getLong("cnt");
        tests[testid][currentCycle]=0;
        tests[testid][isRunning]=1;
        Serial.println(tests[testid][targetCycle]);
      }
      else if (hashTable.containsKey("id")){
        Serial.println("{\"id\":1}");
      }
        
      }
      else{
       Serial.println("Failed"); 
      }
      memset(inputString,'\0',bufferLength);

      

//      sI=0;
//    }
//     else
//    {
//     sI++;
//    } 
  }
 
}



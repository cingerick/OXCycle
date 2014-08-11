void Read() {   
  
   while (Serial.available())    //Check for serial signal
  {
    delay(10); 
    // get the new byte:
    inputString[sI] = Serial.read(); 
    //Serial1.print(inputString[sI]);
    // if the incoming character is a newline, set a flag
    // so the main loop can do something about it:
    if (inputString[sI] == '\n') {
      inputString[sI] = '\0';
      JsonHashTable hashTable = parser.parseHashTable(inputString);
      if (hashTable.success())
      {
        //{"test":1,"Actions":[{"stepID":1,"MaxSpeed":},{}]}
      int testid = hashTable.getLong("testid");
      if (hashTable.containsKey("type")){
              int type = hashTable.getLong("type");
               numSteps++;
              switch (type){
                case actuator:
                    steps[numSteps][stepTest]=testid;
                    steps[numSteps][stepNumber]=hashTable.getLong("stepid");
                    steps[numSteps][stepFrequency]=hashTable.getLong("freq");
                    steps[numSteps][actuatorTarget]=hashTable.getLong("target");
                    steps[numSteps][1]=hashTable.getLong("speed");
                  break;
                case stepper:
                
                  break;
                  
                  
              }
      
      }
      else if (hashTable.containsKey("count")){
        tests[testid][targetCycle]= hashTable.getLong("count");
      }
      

        
        
        
        
        
        
        JsonArray skills = hashTable.getArray("Skills");
        int type = hashTable.getLong("type");
        
      }
      
      

      sI=0;
    }
     else
    {
     sI++;
    } 
  }
 
}



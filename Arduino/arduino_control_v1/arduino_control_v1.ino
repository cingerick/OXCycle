#include <JsonParser.h>
#include "declarations.h"



void setup(){
  Serial.begin(9600);
  setupMotors();
  setupActuators();
  
      Serial.println("Board Reset");

  //set actuator dir  (temp)
  digitalWrite(actuatorPins[0][0],LOW);
  digitalWrite(actuatorPins[0][1],HIGH);

}
void loop(){

  //checkActuators();
//checkSteps();
Read();
}

void moveActuator(int i){

        int id=steps[i][devId];
        int spd=steps[i][actuatorSpeed];
        int target=steps[i][actuatorTarget];

        int cur =analogRead(actuatorPins[id][actuatorPosition]);
        
        if (abs(cur-target)<10){
          steps[i][stepFinished]=1;
        }        
        else if (cur<target){
           digitalWrite(actuatorPins[id][actuatorIn],HIGH);
           digitalWrite(actuatorPins[id][actuatorOut],LOW);
           analogWrite(actuatorPins[id][actuatorSpeed],spd);
          
        }
        else if(cur>target){
          digitalWrite(actuatorPins[i][actuatorIn],LOW);
          digitalWrite(actuatorPins[i][actuatorOut],HIGH);
          analogWrite(actuatorPins[i][actuatorSpeed],70);
        }
}

void moveStepper(int i){
  
        int id=steps[i][devId];
        int spd=steps[i][stepperSpeed];
        int target=steps[i][stepperTarget];
  
      if(stepperPosition[id]<target){
        digitalWrite(stepperPins[id][0],HIGH);
        digitalWrite(stepperPins[id][1],HIGH);
        delayMicroseconds(20);
        digitalWrite(stepperPins[id][1],LOW);
        stepperPosition[id]++;
      }
      else if(stepperPosition[id]<target){
        digitalWrite(stepperPins[id][0],LOW);
        digitalWrite(stepperPins[id][1],HIGH);
        delayMicroseconds(20);
        digitalWrite(stepperPins[id][1],LOW);
        stepperPosition[id]--;
      }
      if(stepperPosition[id]==target){
        steps[i][stepFinished]=1;
      }
}


void checkSteps(){
  for (int j=0;j<numTests;j++){
    boolean stepFlag=false;
    for (int i=0;i<numSteps;i++){
          if ((steps[i][stepTest]==j)&&(steps[i][stepNumber]==tests[j][currentStep])&&steps[i][stepFinished]!=1 && tests[j][currentCycle] % steps[i][stepFrequency]==0){
            stepFlag=true;
            switch(steps[i][stepType]){
             case actuator:
               moveActuator(i);
               break;
             case stepper:
               moveStepper(i);
               break;
             case pause:
               break;
             
            } 
          }        
      }
      if (!stepFlag){
        if (tests[j][currentStep]<numSteps){
          tests[j][currentStep]++;
        }
        else{
         tests[j][currentStep]=0;
         tests[j][currentCycle]++;
        }
        
      }
    }
  
}



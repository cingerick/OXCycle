#include <JsonParser.h>
#include "declarations.h"



void setup(){
  Serial.begin(9600);
  //setupMotors();
  setupActuators();
  Serial.println("{\"Board Reset\":\"\"}");

  //set actuator dir  (temp)
  digitalWrite(actuatorPins[0][0],LOW);
  digitalWrite(actuatorPins[0][1],HIGH);

}
void loop(){

  //checkActuators();
checkSteps();
Read();
}

void moveActuator(int i){

        int id=steps[i][devId];
        int spd=steps[i][stepSpeed];
        int target=steps[i][actuatorTarget];

        int cur =analogRead(actuatorPins[id][actuatorPosition]);
        Serial.println(target);
        Serial.println(cur);
        
        if (stepStart[i]==0){
          stepStart[i]=millis();
        }
        
        if (abs(cur-target)<10){
          steps[i][stepFinished]=1;
          stepStart[i]=0;
          digitalWrite(actuatorPins[i][actuatorIn],LOW);
          digitalWrite(actuatorPins[i][actuatorOut],LOW);
        }        
        else if (millis()-stepStart[i]>actuatorTimeout){
          steps[i][stepFinished]=1;
          Serial.println("timeout");
          tests[steps[i][stepTest]][errorCount]++;
          stepStart[i]=0;
          digitalWrite(actuatorPins[i][actuatorIn],LOW);
          digitalWrite(actuatorPins[i][actuatorOut],LOW);
        }
        else if (cur>target){
           digitalWrite(actuatorPins[id][actuatorIn],HIGH);
           digitalWrite(actuatorPins[id][actuatorOut],LOW);
           analogWrite(actuatorPins[id][actuatorSpeed],spd);
          
        }
        else if(cur<target){
          digitalWrite(actuatorPins[i][actuatorIn],LOW);
          digitalWrite(actuatorPins[i][actuatorOut],HIGH);
          analogWrite(actuatorPins[i][actuatorSpeed],spd);
        }
}

void moveStepper(int i){
  
        int id=steps[i][devId];
        int spd=steps[i][stepSpeed];
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

void movePause(int i){
        
        if (stepStart[i]==0){
          stepStart[i]=millis();
        }
         
        if (millis()-stepStart[i]>steps[i][pauseLength]){
          steps[i][stepFinished]=1;
          Serial.println("paused");
          stepStart[i]=0;
        }
}


void checkSteps(){
  for (int j=0;j<numTests;j++){
    if(tests[j][isRunning]==1){
    boolean stepFlag=false;
    for (int i=0;i<numSteps;i++){
          if ((steps[i][stepTest]==j)&&(steps[i][stepNumber]==tests[j][currentStep])&&steps[i][stepFinished]!=1 && tests[j][currentCycle] % steps[i][stepFrequency]==0){
            stepFlag=true;
            switch(steps[i][stepType]){
             case actuator:
               Serial.println("moveAct");
               moveActuator(i);
               break;
             case stepper:
               moveStepper(i);
               break;
             case pause:
               movePause(i);
               break;
             
            } 
          }        
      }
      if (!stepFlag){
        if (tests[j][currentStep]<numSteps){
          for (int i=0;i<numSteps;i++){
            if (steps[i][stepTest]==j&&steps[i][stepNumber]==tests[j][currentStep]){
              steps[i][stepFinished]=0;
            }
          }
          tests[j][currentStep]++;
        }
        else{
         tests[j][currentStep]=0;
         tests[j][currentCycle]++;
         Serial.println("Test:");
         Serial.println(j);
         Serial.println("cycle:");
         Serial.println(tests[j][currentCycle]);
         
         if (tests[j][currentCycle]>tests[j][targetCycle]){
           tests[j][isRunning]=0;
         }


        }
        
      }
  }
    }
  
}



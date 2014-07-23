#include "declarations.h"

void setup(){
  Serial.begin(9600);
  setupMotors();
  setupActuators();

  //set actuator dir  (temp)
  digitalWrite(actuatorPins[0][0],LOW);
  digitalWrite(actuatorPins[0][1],HIGH);

}
void loop(){

  checkActuators();
  checkSteppers();
}


void setTargets(){

}

void checkActuators(){
  for (int i=0;i<numActuators;i++){
    if(actuatorPosition[i][0]==1){
      for (int i=0;i<numActuators;i++){
        analogRead(actuatorPins[0][0]);
      }

      if(actuatorPosition[i][1]<actuatorPosition[i][2]){
        digitalWrite(actuatorPins[i][0],HIGH);
        digitalWrite(actuatorPins[i][1],LOW);
        analogWrite(actuatorPins[i][2],70);
      }
      else if(actuatorPosition[i][0]>actuatorPosition[i][2]){
        digitalWrite(actuatorPins[i][0],LOW);
        digitalWrite(actuatorPins[i][1],HIGH);
        analogWrite(actuatorPins[i][2],70);
      }
    }
  }
}

void checkStepper(){
    for (int i=0;i<numSteppers;i++){
    if(stepperPosition[i][0]==1){
      for (int i=0;i<numActuators;i++){
        analogRead(actuatorPins[0][0]);
      }

      if(stepperPosition[i][1]<stepperPosition[i][2]){
        digitalWrite(stepperPins[i][0],HIGH);
        digitalWrite(stepperPins[i][1],HIGH);
        delayMicroseconds(20);
        digitalWrite(stepperPins[i][1],LOW);
        stepperPosition[i][0]++;
      }
      else if(stepperPosition[i][0]>stepperPosition[i][2]){
        digitalWrite(stepperPins[i][0],HIGH);
        digitalWrite(stepperPins[i][1],HIGH);
        delayMicroseconds(20);
        digitalWrite(stepperPins[i][1],LOW);
        stepperPosition[i][0]--;
        
      }
    }
  }

}






void setupActuators(){
   for (int i=0;i<numActuators;i++){
    for (int j=0;j<3;j++){
      pinMode(actuatorPins[i][j], OUTPUT);
    }
  }
}

void setupMotors(){
   for (int i=0;i<numSteppers;i++){
    for (int j=0;j<2;j++){
      pinMode(stepperPins[i][j], OUTPUT);
    }
  }
}

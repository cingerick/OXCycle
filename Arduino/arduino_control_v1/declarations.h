int numActuators=3;
int numSteppers=1;

//dir1,dir2,pwm speed,analog read
int actuatorPins[][4]={
  {2,3,5,0}, 
  {0,0,0,0},
  {0,0,0,0}
};
int stepperPins[][2]={
  {9,10},
  {9,10},
  {9,10}
};

int actuatorTimeoutThreshhold=5000;  //not sure yet

int actuatorPosition[][4]={ //enable, current Step, target Step, timeout
  {0,0,0,0},
  {0,0,0,0},
  {0,0,0,0}
};

int stepperPosition[][3]={ //enable, current Step, target Step
  {0,0,0},
  {0,0,0},
  {0,0,0}
};
int tests[][4]={  //current Step, cycle count, cycle target
  {0,0,0,0}
};

int steps[][8]={ //test id, step #,frequency, action Type, device id, target position, speed, pause length
  {0,0,0,0,0,0,0,0}
};

//Action typsa: 1=actuator, 2=2tepper, 3=read sensor, 4= pause



int numActuators=3;
int numSteppers=1;

//Serial 
char inputString[] = ""; 
int sI=0;// incoming serial  byte

JsonParser<32> parser;

int numTests=4;
int numSteps=0;

//step array value map
#define stepTest       0
#define stepNumber     1
#define stepType       2
#define devId          3
#define actuatorTarget 4
#define pauseLength    5
#define actuatorSpeed  6
#define stepperTarget  7
#define stepperSpeed   8
#define stepFinished   9
#define stepFrequency  10



//types
#define actuator 0
#define stepper  1
#define pause    2
#define limit    3
#define force    4

//Test aray value Map
#define currentStep   0
#define currentCycle  1
#define targetCycle   2

//actuarorPins aray value Map
#define actuatorIn       0
#define actuatorOut      1
#define actuatorSpeed    2  
#define actuatorPosition 3

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

int stepperPosition[3]={0,0,0};

int tests[][3]={ // see Test aray value Map above
  {0,0,0},
  {0,0,0},
  {0,0,0}
};

int steps[][11]={ //see step array value map above
  {0,0,0,0,0,0,0,0,0}
};




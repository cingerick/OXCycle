
String inputString = "";        
boolean stringComplete = false;  
boolean dir=true;


//xlimits[

// {motor step pin, motor Direction Pin, g0 velocity}

int motor[][5] ={{2,5,30,30,10},
                 {3,6,100,120,10},
                 {4,7,100,120,10}};


//{start Step, current Step, target Step}
int steps[][3]={{0,0,0},{0,0,0},{0,0,0}};

int jogMotor[][2]={{1,1},{1,0},{0,0}};

int motEnable=8;
int minDelay=30;
int limitPin=20;


float delays;
boolean homing =false;


void setup() {
  pinMode(6,OUTPUT);
  pinMode(3,OUTPUT);
  pinMode(8,OUTPUT);
  pinMode(limitPin,INPUT);
  digitalWrite(3, LOW);
  digitalWrite(6, HIGH);
  
  
  Serial.begin(9600);
  Serial.println("Board Reset");
  inputString.reserve(200);
}

void loop() {

checkSteps();
jog();
//checkLimits();
  
}


void serialEvent() {
  while (Serial.available()) {
    // get the new byte:
    char inChar = (char)Serial.read(); 
    // add it to the inputString:
    inputString += inChar;
    // if the incoming character is a newline, set a flag
    // so the main loop can do something about it:
    if (inChar == '\n') {
      if (inputString.substring(0,inputString.length()-1)=="A")
      {
        Serial.println("found");
        homeX(0);
      }
      inputString="";
    } 
  }
}



void checkSteps(){
  
  for (int i=0;i<3;i++){
  if (steps[i][1]!=steps[i][2]){
    digitalWrite(motEnable, LOW);
    if (steps[i][1]<steps[i][2]){
      digitalWrite(motor[i][1],HIGH);
      steps[i][1]++;
    }
    else{
      digitalWrite(motor[i][1],LOW);
      steps[i][1]--;
    }
    
    if (getDelay( abs(steps[i][1]-steps[i][2]) )>motor[i][2] ){
      delays=getDelay(abs(steps[i][1]-steps[i][2]));
    }
    else if(getDelay(abs(steps[i][1]-steps[i][0]))>motor[i][2] ){
      delays=getDelay(abs(steps[i][0]-steps[i][1]));
    }
    else{
      delays=motor[i][2];
    }  
      digitalWrite(motor[i][0],HIGH);
      delayMicroseconds(delays);
      digitalWrite(motor[i][0],LOW);
      delayMicroseconds(delays);
      
      digitalWrite(motEnable, HIGH);
  }
  
//  else{
//    delay(1000);
//    if (steps[i][2]==0){
//      sendPos(i,16000);
//    }
//    else{
//      sendPos(i,0);
//    } 
//  }
}
}

void sendPos(int i,int pos){
  steps[i][0]=steps[i][1];
  steps[i][2]=pos;
}

void checkLimits(){
  if (homing&& digitalRead(limitPin)==HIGH){
//      jogMotor[0][0]=0;
//      Serial.println("found");
//       homing=true;
  }
  
  
}

int getDelay(int stepCt){
  int d;
  if (stepCt<1000){
    d=1000-(7*stepCt);
  }
  else
  d=minDelay;
  return(d);
}

void jog(){
  for (int i=0;i>3;i++){
    if (jogMotor[i][0]==1){
      digitalWrite(motEnable, LOW);
      if (jogMotor[i][1]==1){
        digitalWrite(motor[i][1],HIGH);
      }
      else{
        digitalWrite(motor[i][1],LOW);
      }
      digitalWrite(motor[i][0],HIGH);
      delayMicroseconds(motor[i][2]);
      digitalWrite(motor[i][0],LOW);
      delayMicroseconds(motor[i][2]);
      Serial.println(i);
      
      digitalWrite(motEnable, HIGH);
    }
  }
}

void homeX(int i){
  jogMotor[0][0]=1;
  jogMotor[0][1]=1;
  homing=true;
}




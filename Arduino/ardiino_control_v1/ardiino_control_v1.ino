int actPins[][4]={{2,3,5,0}, //dir1,dir2,pwm speed,analog read
                  {0,0,0,0}};


int highLimit=800;
int lowLimit=50;


void setup(){
  Serial.begin(9600);
  pinMode(actPins[0][0], OUTPUT);
  pinMode(actPins[0][1], OUTPUT);
  pinMode(actPins[0][2], OUTPUT);
       digitalWrite(actPins[0][0],LOW);
     digitalWrite(actPins[0][1],HIGH);
  
}
void loop(){
  checkMotor();
  Serial.println(analogRead(0));
  delay(100);
}

void checkMotor(){
   if (analogRead(actPins[0][3])>highLimit){
     digitalWrite(actPins[0][0],HIGH);
     digitalWrite(actPins[0][1],LOW);
   }
   else if(analogRead(actPins[0][3])<lowLimit){
     digitalWrite(actPins[0][0],LOW);
     digitalWrite(actPins[0][1],HIGH);
   }
   
   analogWrite(actPins[0][2],70);
}


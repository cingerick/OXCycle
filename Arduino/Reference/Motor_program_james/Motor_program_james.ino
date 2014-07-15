//NOTES for programming tablet and processing
//need variables for the ADC values that correspond to the actuators extension
//need PWM for setting speed as well as extension.
//Engineer will want to control the extension in order to make test run faster. Keeping the limits of the throw
//equal to the  range of a button, hindge, or other test fixture will allow for faster cycles
//Do design research to figure out what people like/don't like about the cycle tester today
//tests that people do often?
//must have logic for the encorporation of multiple motors, only run in loop if a flag is turned on
//http://www.instructables.com/id/Arduino-Timer-Interrupts/?ALLSTEPS
// in p"documentation" have an illustration of the problem youre solving with this technology
int fsrread = A2;
char fsr = 2;
unsigned int time;
int pos;
int x=0;
int avg=0;


//Motor1 Variables
int upperlimit1 = 600;
int lowerlimit1 = 350;
int CW1 = 12;
int CCW1= 13; 
int motorposition1 = A0;
int pos1;
int period1 = 31;//selectable in processing
char a1=0;//flags!
char b1=0;//flags!
char c1=0;//flags!
unsigned int time1a=0;
unsigned int time1b=0;
unsigned int delay1a=0;
unsigned int delay1b=0;
unsigned int delaytotal1=0;
unsigned int difference1=0;

//Motor2 Variables
int upperlimit2 = 750;
int lowerlimit2 = 350;
int CW2 = 11;
int CCW2= 10; 
int motorposition2 = A1;
int pos2;
int period2 = 11;//selectable in processing
char a2=0;//flags!
char b2=0;//flags!
char c2=0;//flags!
unsigned int time2a=0;
unsigned int time2b=0;
unsigned int delay2a=0;
unsigned int delay2b=0;
unsigned int delaytotal2=0;
unsigned int difference2=0;

//Motor3 Variables
int upperlimit3 = 600;
int lowerlimit3 = 350;
int CW3 = 22;
int CCW3= 23; 
int period3 = 31;//selectable in processing
char a3=0;//flags!
char b3=0;//flags!
char c3=0;//flags!
unsigned int time3a=0;
unsigned int time3b=0;
unsigned int delay3a=0;
unsigned int delay3b=0;
unsigned int delaytotal3=0;
unsigned int difference3=0;

// the setup routine runs once when you press reset:
void setup() {                
  // initialize the digital pin as an output.
  Serial.begin (128000); //from 115200, just changed to 128000, all calculations must be redone
  pinMode(CW1, OUTPUT);     
  pinMode(CCW2, OUTPUT);
  pinMode(CW2, OUTPUT);     
  pinMode(CCW1, OUTPUT);
   pinMode(CW3, OUTPUT);     
  pinMode(CCW3, OUTPUT);
  pinMode(6, OUTPUT);
  pinMode(7, OUTPUT);
  pinMode(4, OUTPUT);
  pinMode(3, OUTPUT);
  pinMode(2, OUTPUT);
  pinMode(24, OUTPUT);
  pinMode(23, OUTPUT);
  pinMode(22, OUTPUT);
  
  digitalWrite(24, HIGH);
  digitalWrite(6,HIGH);
  digitalWrite(7,HIGH);
  digitalWrite(4,HIGH);
  digitalWrite(3,HIGH);
  digitalWrite(2,HIGH);
  digitalWrite(CCW1, HIGH); //starts it off in one direction
  digitalWrite(CW1,LOW);
    digitalWrite(CCW2, HIGH); //starts it off in one direction
  digitalWrite(CW2,LOW);

  cli();//stop interrupts



//set timer1 interrupt at 1Hz
  TCCR1A = 0;// set entire TCCR1A register to 0
  TCCR1B = 0;// same for TCCR1B
  TCNT1  = 0;//initialize counter value to 0
  // set compare match register for 1hz increments
  OCR1A = 1000; //should be 200hz at 68? or maybe 1024
  //OCR1A = 15624;// = (16*10^6) / (1*1024) - 1 (must be <65536)
  // turn on CTC mode
  TCCR1B |= (1 << WGM12);
  // Set CS10 and CS12 bits for 1024 prescaler
  TCCR1B |= (1 << CS12) | (1 << CS10);  
  // enable timer compare interrupt
  TIMSK1 |= (1 << OCIE1A);




  sei();//allow interrupts
  
  delay(100); //without this delay, first timer reading will be zero, and thus freeze program
}//end setup



ISR(TIMER1_COMPA_vect)
{  
  time++; 
}
  
void MotorFunction1(){
  
  pos1 = analogRead(motorposition1); //shouldnt this be in motorfunction1() ?   
   
   //Motor Function
 //if less than lower limit, extend out
  if(pos1<lowerlimit1)    //if below this value, move up
  {
    digitalWrite(CW1, LOW);  //this combo makes motor go up
    digitalWrite(CCW1,LOW);
    digitalWrite(CW1, HIGH);  //this combo makes motor go up
    digitalWrite(CCW1,LOW);
  }

  if ((pos1 > upperlimit1)&(b1==0))//times the first extension
  {
    digitalWrite(CCW1, HIGH); //hits the next limit, 
    digitalWrite(CW1, LOW); // 
    b1 = 1; //wont let it go back into this case if gone once
  } 

  if ((pos1 < (upperlimit1 - 30)) & (b1!=0))  //need this flag to allow the motor to retract
  {
    a1 = 1;
  } 
  
 //set "a" flag to signal the motor cycle has started
 

  if ((pos1 > upperlimit1) &  (a1==1)&(c1==0)) //once time1 taken, and cycles, time2 shall b taken
  {
 
    digitalWrite(CCW1,LOW); //turn the motor off, dont let it cycle again until period complete.
    digitalWrite(CW1,LOW);
    delay1a = time;
    c1 = 1;
  }   
 
 
  if(delay1a > 0)//allows for a period of rest. Delaytotal is 31 counts = 2000 ms
  {
    delay1b=time;
    delaytotal1=delay1b-delay1a;
    if(delaytotal1 >= period1)//after this delay, the flag is reset which lets the motor do its thing.
    {
      b1=0;
      delay1a = 0;
      c1=0;
      a1=0;
    }  
  }
  
  //once the period has run, code can return to normal.
}

void MotorFunction2(){
  
  pos2 = analogRead(motorposition2); //likewise?
   //Motor Function
 //if less than lower limit, extend out
  if(pos2<lowerlimit2)    //if below this value, move up
  {
    digitalWrite(CW2, LOW);  //this combo makes motor go up
    digitalWrite(CCW2,LOW);
    digitalWrite(CW2, HIGH);  //this combo makes motor go up
    digitalWrite(CCW2,LOW);
  }

  if ((pos2 > upperlimit2)&(b2==0))//times the first extension
  {
      digitalWrite(CCW2, HIGH); //hits the next limit, 
    digitalWrite(CW2, LOW); // 
    b2 = 1; //wont let it go back into this case if gone once
  } 

  if ((pos2 < (upperlimit2 - 30)) & (b2!=0))  //need this flag to allow the motor to retract
  {
    a2 = 1;
  } 
  
 //set "a" flag to signal the motor cycle has started
 

  if ((pos2 > upperlimit2) &  (a2==1)&(c2==0)) //once time1 taken, and cycles, time2 shall b taken
  {
 
    digitalWrite(CCW2,LOW); //turn the motor off, dont let it cycle again until period complete.
    digitalWrite(CW2,LOW);
    delay2a = time;
    c2 = 1;
  }   
 
 
  if(delay2a > 0)//allows for a period of rest. Delaytotal is 31 counts = 2000 ms
  {
    Serial.print(delaytotal2);
    Serial.println("yo");
    delay2b=time;
    delaytotal2=delay2b-delay2a;
    if(delaytotal2 >= period2)//after this delay, the flag is reset which lets the motor do its thing.
    {
      b2=0;
      delay2a = 0;
      c2=0;
      a2=0;
    }  
  }
  
} 
void MotorFunction3(){
  
  pos = analogRead(fsrread); //shouldnt this be in motorfunction1() ?   
   
   //Motor Function
 //if less than lower limit, extend out
  if(pos<lowerlimit3)    //if below this value, move up
  {
    digitalWrite(CW3, LOW);  //this combo makes motor go up
    digitalWrite(CCW3,LOW);
    digitalWrite(CW3, HIGH);  //this combo makes motor go up
    digitalWrite(CCW3,LOW);
  }

  if ((pos > upperlimit3)&(b3==0))//times the first extension
  {
    digitalWrite(CCW3, HIGH); //hits the next limit, 
    digitalWrite(CW3, LOW); // 
    b3 = 1; //wont let it go back into this case if gone once
  } 

  if ((pos < (upperlimit3 - 30)) & (b3!=0))  //need this flag to allow the motor to retract
  {
    a3 = 1;
  } 
  
 //set "a" flag to signal the motor cycle has started
 

  if ((pos > upperlimit3) &  (a3==1)&(c3==0)) //once time1 taken, and cycles, time2 shall b taken
  {
 
    digitalWrite(CCW3,LOW); //turn the motor off, dont let it cycle again until period complete.
    digitalWrite(CW3,LOW);
    delay3a = time;
    c3 = 1;
  }   
 
 
  if(delay3a > 0)//allows for a period of rest. Delaytotal is 31 counts = 2000 ms
  {
    delay3b=time;
    delaytotal3=delay3b-delay3a;
    if(delaytotal3 >= period3)//after this delay, the flag is reset which lets the motor do its thing.
    {
      b3=0;
      delay3a = 0;
      c3=0;
      a3=0;
    }  
  }
  
  //once the period has run, code can return to normal.
}  
  
  //once the period has run, code can return to normal.


void averagepressure()
{
  if (x<10)
  {
    avg=avg+pos;
  }
  
  else if(x >= 10)
  {
     avg=(avg/10);
   //Serial.print("DATA,TIME,"); Serial.println(avg);
    x=0;
  }
  
  pos = analogRead(fsrread);
  x++;
  delay (10);
 // Serial.print("Point");
 // Serial.println(pos);
}

// the loop routine runs over and over again forever:
void loop() {
   

  averagepressure(); // take pressure reading --> Let Processing 2.0 handle the averages & plot
  
  
 
  //Serial.println(pos2);
  //Serial.println(pos1);
  MotorFunction1();
  MotorFunction2();
  MotorFunction3();
}

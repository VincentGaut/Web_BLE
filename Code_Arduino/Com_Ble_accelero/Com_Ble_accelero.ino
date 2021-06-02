#define CS_1 5                                                      // affectation de la broche CS
#define CS_2 6

#include <bluefruit.h>
#include <Adafruit_AHRS.h>
#include <Adafruit_LIS3MDL.h>
#include <Adafruit_LSM6DS33.h> 
#include <Adafruit_Sensor.h>  // not used in this demo but required!
#include <Adafruit_Sensor_Calibration.h>
#include <SPI.h>                                                // appel de la bibliothèque

Adafruit_Sensor *accelerometer, *gyroscope, *magnetometer;
#include "LSM6DS_LIS3MDL.h"

// max concurrent connections supported by this example
#define MAX_PRPH_CONNECTION   2
uint8_t connection_count = 0;
Adafruit_Madgwick filter;  // faster than NXP

#if defined(ADAFRUIT_SENSOR_CALIBRATION_USE_EEPROM)
  Adafruit_Sensor_Calibration_EEPROM cal;
#else
  Adafruit_Sensor_Calibration_SDFat cal;
#endif

#define FILTER_UPDATE_RATE_HZ 10
#define PRINT_EVERY_N_UPDATES 10

int8_t buff[12];
uint16_t len=12;
//float buff[4];
float roll,pitch,yaw;
double Yh,Xh;

//Adafruit_LIS3MDL lis3mdl;   // magnetometer
//Adafruit_LSM6DS33 lsm6ds33; // accelerometer, gyroscope




/////////////////////FONCTIONS /////////////////////////////////////////////////////////

// callback invoked when central connects
void connect_callback(uint16_t conn_handle)
{
  (void) conn_handle;

  connection_count++;
  Serial.print("Connection count: ");
  Serial.println(connection_count);

  // Keep advertising if not reaching max
  if (connection_count < MAX_PRPH_CONNECTION)
  {
    Serial.println("Keep advertising");
    Bluefruit.Advertising.start(0);
  }
}

/**
 * Callback invoked when a connection is dropped
 * @param conn_handle connection where this event happens
 * @param reason is a BLE_HCI_STATUS_CODE which can be found in ble_hci.h
 */
void disconnect_callback(uint16_t conn_handle, uint8_t reason)
{
  (void) conn_handle;
  (void) reason;

  Serial.println();
  Serial.print("Disconnected, reason = 0x"); Serial.println(reason, HEX);

  connection_count--;
}



//////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////// INIT BLUETOOTH////////////////////////////////



/* LBS Service: 00001523-1212-EFDE-1523-785FEABCD123
 * LBS Capteurs : 00001524-1212-EFDE-1523-785FEABCD123
 * LBS Tare    : 00001525-1212-EFDE-1523-785FEABCD123
 */

const uint8_t LBS_UUID_SERVICE[] =
{
    0x23, 0xD1, 0xBC, 0xEA, 0x5F, 0x78, 0x23, 0x15,
    0xDE, 0xEF, 0x12, 0x12, 0x23, 0x15, 0x00, 0x00
};

const uint8_t LBS_UUID_CHR_CAPTEUR[] =
{
    0x23, 0xD1, 0xBC, 0xEA, 0x5F, 0x78, 0x23, 0x15,
    0xDE, 0xEF, 0x12, 0x12, 0x24, 0x15, 0x00, 0x00
};

const uint8_t LBS_UUID_CHR_TARE[] =
{
    0x23, 0xD1, 0xBC, 0xEA, 0x5F, 0x78, 0x23, 0x15,
    0xDE, 0xEF, 0x12, 0x12, 0x25, 0x15, 0x00, 0x00
};

BLEService        lbs(LBS_UUID_SERVICE);
BLECharacteristic lsbCapteur(LBS_UUID_CHR_CAPTEUR);
BLECharacteristic lsbTare(LBS_UUID_CHR_TARE);



int16_t capteur_1, capteur_2;



/////////////////////////////////////////////////////////////////////////////////////

/////////////// INIT CAPTEURS ET CALIBRATION ////////////////////////////////////////

uint16_t Measurement, Result;
uint32_t test;
int coef_dir = 56;
int Zero_force = 964;
int Force_Send; 
int measure;

uint8_t state = 0;
uint8_t state_2 = 0;
 // Status codes:
    // status = 0 : normal operation
    // status = 1 : device in command mode
    // status = 2 : stale data
    // status = 3 : diagnostic condition
byte led=0xFFF;
uint8_t recu[4], cap[4];
uint16_t pression, temp;
uint16_t pression_2, temp_2;
float pression_unit, temp_unit;
float pression_unit_2, temp_unit_2;
const float MIN_COUNT = 1638.4;
const float MAX_COUNT = 14745.6;
float MAX_PRES = 15*6894.76;//pa
float coef;
bool flag=true;
float offs=0;
float offs_2=0;

unsigned long previousMillis = 0;
const long interval = 100;           // interval at which to blink (milliseconds)




void setup() {
  coef= (MAX_COUNT-MIN_COUNT)/MAX_PRES;
  pinMode(CS_1, OUTPUT);
  digitalWrite(CS_1, HIGH);
  pinMode(CS_2, OUTPUT);
  digitalWrite(CS_2, HIGH);
  Serial.begin(115200);
  SPI.begin();// initialisation de la liaison série
  //lis3mdl.begin_I2C();
  //lsm6ds33.begin_I2C();

  if (!cal.begin()) {
    Serial.println("Failed to initialize calibration helper");
  } else if (! cal.loadCalibration()) {
    Serial.println("No calibration loaded/found");
  }

  if (!init_sensors()) {
    Serial.println("Failed to find sensors");
    while (1) delay(10);
  }

  accelerometer->printSensorDetails();
  gyroscope->printSensorDetails();
  magnetometer->printSensorDetails();
  setup_sensors();
  filter.begin(FILTER_UPDATE_RATE_HZ);
  
  
  ////////////////////// INITIALISATION BLUEFRUIT ///////////////////////////////////////////////
  Bluefruit.begin(MAX_PRPH_CONNECTION, 0);
  Bluefruit.Periph.setConnectCallback(connect_callback);
  Bluefruit.Periph.setDisconnectCallback(disconnect_callback);
////////////////////////////////////////////////////////////////////////////////////////////////

//////////////////// INIT BLE//////////////////////////////////////////////////////////////////

  lbs.begin();

  capteur_1= 0;
  capteur_2 = 1;
  roll=0;
  pitch=0;
  yaw=0;


  lsbCapteur.setProperties(CHR_PROPS_READ | CHR_PROPS_NOTIFY);
  lsbCapteur.setPermission(SECMODE_OPEN, SECMODE_NO_ACCESS);
  lsbCapteur.setFixedLen(len);
  lsbCapteur.begin();

  
  lsbCapteur.write((const void*)buff,len);
 

  lsbTare.setProperties(CHR_PROPS_READ | CHR_PROPS_WRITE);
  lsbTare.setPermission(SECMODE_OPEN, SECMODE_OPEN);
  lsbTare.setFixedLen(1);
  lsbTare.begin();
  //lsbTare.write8(0x00); // led = off

  lsbTare.setWriteCallback(tare_write_callback);

  // Setup the advertising packet(s)
  Serial.println("Setting up the advertising");
  startAdv();
  /////////////////////////////////////////////////////////////////////////////////////////////////
}
void startAdv(void)
{
  // Advertising packet
  Bluefruit.Advertising.addFlags(BLE_GAP_ADV_FLAGS_LE_ONLY_GENERAL_DISC_MODE);
  Bluefruit.Advertising.addTxPower();

  // Include HRM Service UUID
  Bluefruit.Advertising.addService(lbs);

  // Secondary Scan Response packet (optional)
  // Since there is no room for 'Name' in Advertising packet
  Bluefruit.ScanResponse.addName();

  Bluefruit.Advertising.restartOnDisconnect(true);
  Bluefruit.Advertising.setInterval(32, 244);    // in unit of 0.625 ms
  Bluefruit.Advertising.setFastTimeout(30);      // number of seconds in fast mode
  Bluefruit.Advertising.start(0);                // 0 = Don't stop advertising after n seconds  
}

void tare_write_callback(uint16_t conn_hdl, BLECharacteristic* chr, uint8_t* data, uint16_t len)
{
  (void) conn_hdl;
  (void) chr;
  (void) len; // len should be 1

  if (data[0]==1)
  {
    offs=pression_unit;
    offs_2=pression_unit_2;
  }
}
 



void loop() {
  
  float gx, gy, gz;
  uint8_t count = 4;

        SPI.beginTransaction(SPISettings(800000, MSBFIRST, SPI_MODE0));
        digitalWrite(CS_1, LOW);
        SPI.transfer(recu, count);
        digitalWrite(CS_1, HIGH);
        SPI.endTransaction();

        SPI.beginTransaction(SPISettings(800000, MSBFIRST, SPI_MODE0));
        digitalWrite(CS_2, LOW);
        SPI.transfer(cap, count);
        digitalWrite(CS_2, HIGH);
        SPI.endTransaction();
        state = (recu[0]&0xC0)>>6;
        state_2 = (cap[0]&0xC0)>>6;
        
        if (state == 0)  {
          
        
        pression= ((uint16_t)((recu[0]&0x3F)<<8)| ((uint16_t)((recu[1]&0xFF))));
        temp= ((uint16_t)((recu[2]&0xFF)<<3)|((uint16_t)((recu[3]&0xE0)>>5)));
        }
        if (state_2==0){
        pression_2= ((uint16_t)((cap[0]&0x3F)<<8)| ((uint16_t)((cap[1]&0xFF))));
        temp_2= ((uint16_t)((cap[2]&0xFF)<<3)|((uint16_t)((cap[3]&0xE0)>>5)));
        }

        pression_unit= (pression-MIN_COUNT)/ coef;  
        temp_unit = (temp*200/2047)-50;
        pression_unit_2= (pression_2-MIN_COUNT)/ coef;  
        temp_unit_2 = (temp_2*200/2047)-50;
        if (flag)
        {
          offs=pression_unit;
          offs_2=pression_unit_2;
          flag=false;
        }
        

        unsigned long currentMillis = millis();
        if (currentMillis - previousMillis >= interval) {
          previousMillis = currentMillis;
            /* Get a new sensor event */ 
////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////// Accelerometre , Gyro , Magnet/////////////////////////////////////////////////
          sensors_event_t accel, gyro, mag;
          accelerometer->getEvent(&accel);
          gyroscope->getEvent(&gyro);
          magnetometer->getEvent(&mag);
          cal.calibrate(mag);
          cal.calibrate(accel);
          cal.calibrate(gyro);

          gx = gyro.gyro.x * SENSORS_RADS_TO_DPS;
          gy = gyro.gyro.y * SENSORS_RADS_TO_DPS;
          gz = gyro.gyro.z * SENSORS_RADS_TO_DPS;
          filter.update(gx, gy, gz, 
                accel.acceleration.x, accel.acceleration.y, accel.acceleration.z, 
                mag.magnetic.x, mag.magnetic.y, mag.magnetic.z);
          float qw, qx, qy, qz;
          filter.getQuaternion(&qw, &qx, &qy, &qz);
          Serial.print("Pression: ");
          Serial.print(capteur_1);
          Serial.print(", ");
          Serial.print(capteur_2);
          Serial.print("Quaternion: ");
          Serial.print((int)(qw*10000), 4);
          Serial.print(", ");
          Serial.print((int)(qx*10000), 4);
          Serial.print(", ");
          Serial.print((int)(qy*10000), 4);
          Serial.print(", ");
          Serial.println((int)(qz*10000), 4); 


          capteur_1=(pression_unit-offs)/10;
          capteur_2=(pression_unit_2-offs_2)/1O;

          buff [0] = capteur_1 >> 8;
          buff [1] = capteur_1 & 0x00FF;
          buff [2] = capteur_2 >> 8 ;
          buff [3] = capteur_2 & 0x00FF;
          buff [4] = ((int)(qx*10000)) >> 8 ;
          buff [5] = ((int)(qx*10000)) &0x00FF;
          buff [6] = ((int)(qy*10000)) >> 8;
          buff [7] = ((int)(qy*10000)) &0x00FF;
          buff [8] = ((int)(qz*10000)) >> 8;
          buff [9] = ((int)(qz*10000)) &0x00FF;
          buff [10] = ((int)(qw*10000)) >> 8;
          buff [11] = ((int)(qw*10000)) &0x00FF;

        /*  
          buff [0] = capteur_1 >> 8; 
          buff [1] = (capteur_1 & 0x00FF);
          buff [2] = capteur_2 >> 8;
          buff [3] = (capteur_2 & 0x00FF);
          buff [4] = accelero_x >> 8;
          buff [5] = (accelero_x & 0x00FF);
          buff [6] = accelero_y >>8 ;
          buff [7] = (accelero_y & 0x00FF);
          buff [8] = accelero_z >>8 ;
          buff [9] = (accelero_z & 0x00FF);
          buff [10] = magnetic_x >>8 ;
          buff [11] = (magnetic_x & 0x00FF);
          buff [12] = magnetic_y >>8 ;
          buff [13] = (magnetic_y & 0x00FF);
          buff [14] = magnetic_z >>8 ;
          buff [15] = (magnetic_z & 0x00FF);*/
        /*  buff [16] = gyro_x >>8 ;
          buff [17] = (gyro_x & 0x00FF);
          buff [18] = gyro_y >>8 ;
          buff [19] = (gyro_y & 0x00FF);
          buff [20] = gyro_z >>8 ;
          buff [21] = (gyro_z & 0x00FF);
          */
          
          lsbCapteur.write((const void*)buff,len);
          //lsbCapteur.write16(buff[0]);
          // notify all connected clients
    for (uint16_t conn_hdl=0; conn_hdl < MAX_PRPH_CONNECTION; conn_hdl++)
    {
      if ( Bluefruit.connected(conn_hdl) && lsbCapteur.notifyEnabled(conn_hdl) )
      {
        lsbCapteur.notify(conn_hdl, (const void*)buff, len);
        //lsbCapteur.notify16(conn_hdl, buff[0]);
      }
    }
          }
      

        


  

}

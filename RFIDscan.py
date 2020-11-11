import time
import serial
import RPi.GPIO as GPIO
GPIO.setmode(GPIO.BCM)
GPIO.setwarnings(False)
#============================================================================
# Setup the pins
#============================================================================
GPIO.setup(22,GPIO.OUT)
GPIO.setup(27,GPIO.OUT)
GPIO.setup(22,False)
GPIO.setup(27,False)
#============================================================================
port_baud = serial.Serial('/dev/serial0',9600) #configure the port and baudrate

#print "____________________________________________________"
#print "The RFID device has started"
#print "____________________________________________________"
while True:
    ID = ""
    read_byte = port_baud.read()

    if read_byte == "\2": #start flag 
    	for Counter in range(12):
        	read_byte=port_baud.read()
        	ID = ID + str(read_byte) # returns ascii values

    	GPIO.output(22,True)
    	GPIO.output(27,True)
    	time.sleep(1)
    	GPIO.output(22,False)
    	GPIO.output(27,False)
    	print ID
    	break


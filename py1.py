from picamera import PiCamera
import RPi.GPIO as GPIO
import time
import datetime
#_____________________________________________________________________________
GPIO.setmode(GPIO.BCM)
GPIO.setup(17,GPIO.IN,pull_up_down=GPIO.PUD_UP)
#_____________________________________________________________________________
date = datetime.datetime.now() #fetch date (type=datetime)
current_date = date.strftime("%Y-%m-%d %H:%M:%S") # convert date to a string
camera = PiCamera()
camera.resolution = (1920,1080) # set the max resolution for video
camera.framerate = 15 # include to enable max resolution

# this will simulate the door alarm being triggered
while True:
	if GPIO.input(17) == 0:
		camera.annotate_text = current_date # show the date and time on the vid$
                camera.start_recording("/home/pi/Desktop/video.h264") #directory and na$
                time.sleep(5) #record video for 5 seconds
                camera.stop_recording()
		# This is an example of a tag number returned by the alarm
		#print "12004A727A50"
		print "0123456789"
		#time.sleep(2)
		break

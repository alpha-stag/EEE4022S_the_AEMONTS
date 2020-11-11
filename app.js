var express		= require("express"), // include the express framework
    app			= express(), // store the express function into a variable
    {spawn}		= require("child_process"),
    bodyParser		= require("body-parser"), // include the Body-Parser package
    mongoose		= require("mongoose"), // include the mongoose server
    nodemailer		= require("nodemailer"), // to send emails
    methodOverride	= require("method-override"), // to set up our put and delete requests
    mongoURL		= 'mongodb+srv://user1:96701@cluster0.foscy.gcp.mongodb.net/Auto_Equipment?retryWrites=true&w=majority';

app.set("view engine","ejs"); // to avoid having to use the .ejs extension when$
app.use(bodyParser.urlencoded({extended: true})); // use the body parser package
app.use(express.static("public"));
app.use(methodOverride("_method"));

mongoose.connect(mongoURL,{
                useNewUrlParser: true,
                useUnifiedTopology: true
});
mongoose.connection.on("connected",function(){
        console.log("The database connection was successful");
});

// User names and passwords
//=======================================================
//mongoDb atlas
//---------------------
//password: 96701,
// username: user1}
//=======================================================
// dummy email adress to send emails:
var myEmail = 'dmail3867@gmail.com';
var myPassword = '99BTVdM77';
//=======================================================
// destination email address
var destEmail = 'malalamabia@gmail.com'
//=======================================================

// setup the schema for the Equippment database
var equipmentSchema = new mongoose.Schema({
    name:   		{type: String, default: "000000"}, //this is the equipment name/id
    studentID: 		{type: String, default: "000000000000"}, //student card tag number
    stdnum: 		{type: String, default: "UCTSTD001"}, // student number 
    //video_directory:	{type: String,default: "/home/pi/Desktop/video.h264"},
    ID :  String, // equipment tag ID
    date: {type: Date, default: Date.now} //created should be a date and the default value is Date.now
});

// setup the schema for the student database
var studentSchema = new mongoose.Schema({
	student_number: {type: String, default: "UCTSTD001"}, // student number
	tagID:   	{type: String, default: "000000000000"}
});

// compile the schema into a model
var Equipment = new mongoose.model("equipment",equipmentSchema);
var Student = new mongoose.model("student",studentSchema);


//pre-populate the equipment  database 
// Equipment.create({
//     ID:   "000000000000", 
// });

//pre-populate the student database
//Student.create({
     	//stdnum: "MLLALU001"
//});

//==================================================================================================================
//Reuseable Functions
//==================================================================================================================

// compare two arrays 
function compare(arr1,arr2){
	var finalArray = [];

	arr1.forEach(function(value1){
		arr2.forEach(function(value2){
			if (value1 === value2){
				finalArray.push(value1)
			}
		});
	});
	return finalArray
}
// Test the function
//array1 = [2,1,4,7,6,55];
//array2 = [2];
//var result = compare(array1,array2);
//console.log("The result was: " + result);
//--------------------------------------------------------------------------------------------------------------------

// Monitoring function
function monitor(){
        var myData;
        var mylist = [];
        var mylist2 = [];
        var finalList = [];

        //spawn new child process to call the python script
        var python = spawn("python",["py1.py"]);
        //collect data from the script
        python.stdout.on("data",function(data){
                myData = data.toString(); //data from python script
                //console.log("myData: " + myData);

                Equipment.find({}, function(error, foundItem){
                        if(error){
                                console.log("An error occurred");
                        } else{
                                foundItem.forEach(function(item){
                                        var new_item = item.ID + "\n"
                                        mylist.push(new_item);
                                });
                                mylist2.push(myData);
                                //console.log("myData: " + myData);
                                finalList.push(mylist2[0]);
                                var result= compare(mylist,mylist2);
                                //console.log("result: " + result);

                                if (result.length == 1){
                                        console.log("-------------------------------------------------------------------------------------");
                                        console.log("The scanned item with the tag id " + result +  " has been accounted for");
                                        console.log("-------------------------------------------------------------------------------------");
                                } else {
                                        console.log("-------------------------------------------------------------------------------------");
                                        console.log("an item has been stolen from the lab");
                                        console.log(" ");

                                        var transporter = nodemailer.createTransport({
                                                service: 'gmail',
                                                auth: {
                                                        user: myEmail,
                                                        pass: myPassword
                                                }
                                        });

                                        var mailOptions = {
                                                from: myEmail,
                                                to: destEmail,
                                                subject: 'Lab Equipment',
                                                text: 'A piece of lab equipment just left the lab without authorization. Download the footage below and open it with the VLC media player app ',
                                                attachments : [{
                                                        filename: 'video.h264',
                                                        path: '/home/pi/Desktop/video.h264'
                                                }]
                                        };

                                        transporter.sendMail(mailOptions, function(error,info){
                                                if (error){
                                                        console.log(error);
                                                } else {
                                                        console.log('The email was successfully sent' + info.response);
                                                }
                                        });

                                }
                        }
                });

        });

}


// monitor the lab equipment every second
setInterval(monitor,1000);


//==================================================================================================================
// SETUP THE ROUTES
//==================================================================================================================

//set up a get request for the home page
app.get("/", function(req,res){
    res.render("home");
});

//set up a get request for the equipment page which lists all of the equipment and their status
// INDEX ROUTE
app.get("/home", function(req,res){
    Equipment.find({},function(error,fullData){
	Student.find({}, function(error,studentData){
		if(error){
            		console.log("an error has occured")
        	} else{
            		res.render("index", {
						equipmentData: fullData,
						studentData: studentData
			});
        	}
	});
    });
});

// set up a get request for manually entering the info about the equipment
// NEW ROUTE
app.get("/home/new", function(req,res){

	var myData;
        //spawn new child process to call the python script
        var python = spawn("python",["RFIDscan.py"]);
        //collect data from the script
        python.stdout.on("data",function(data){
                myData = data.toString(); //data from python script
		Student.find({}, function(error,studentDet){
			if(error){
				res.redirect("/home");
			} else {
				res.render("new_page",{
							myData: myData,
							studentDet: studentDet
				});
			}
		});
        });
});

//SIGNUP ROUTE

app.get("/home/signup",function(req,res){

	var my_data;
	//spawn new child process to call the python script 
	var python = spawn("python",["RFIDscan.py"]);
	//collect data from the script
	python.stdout.on("data",function(data){
		my_data = data.toString();
		res.render("signup",{my_data: my_data});
	});

});

// set up a post requests submit information
// CREATE ROUTE for new_page
app.post("/home", function(req,res){
    //create 
    Equipment.create(req.body.equipment,function(error,newItem){
        if(error){
            res.render("new_page");
        } else{
            //redirect to home page
            res.redirect("/home");
        }
    });
});

//CREATE ROUTE for signups
app.post("/home",function(req,res){
    Student.create(req.body.students,function(error,newItem){
        if(error){
                res.render("signup");
        } else{
                //redirect to the home page
                res.redirect("/home");
        }
    });
});

//SHOW ROUTE
app.get("/home/:id",function(req,res){
    Equipment.findById(req.params.id,function(error,getEquipment){
        if(error){
            res.redirect("/home");
        } else{
            res.render("show_page",{equipData: getEquipment});
        }
    });
});

//EDIT ROUTE
//app.get("/home/:id/edit",function(req,res){
//    Equipment.findById(req.params.id,function(error, foundItem){
//        if(error){
//            res.redirect("/home");
//        } else {
//            res.render("edit_page", {foundItem: foundItem});
//        }
//    });
//});

//UPDATE ROUTE
app.put("/home/:id", function(req,res){
    // Equipment.findByIdAndUpdate(id, newData, callback)
    Equipment.findByIdAndUpdate(req.params.id, req.body.foundItem, function(error,updatedItem){
        if(error){
            res.redirect("/home");
        } else {
            res.redirect("/home/" + req.params.id);
        }
    });
});

//DELETE ROUTE
app.delete("/home/:id",function(req,res){
   // res.send("You have reached a delete route");
    //delete an item in the database
    Equipment.findByIdAndRemove(req.params.id,function(error,deleteItem){
        if(error){
            res.redirect("/home")
        } else {
            //redirect
            res.redirect("/home")
        }
    });
});


// Start the application
app.listen(3000, function(){
    console.log("The AEMONTS server has started");
});

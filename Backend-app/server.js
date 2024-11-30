


const express = require("express");                                                         //purpose here is to save jSON files and load files again
const bodyParser = require("body-parser");
const fs = require("fs");                                                                   //file systems

const cors = require("cors");
const path = require("path");

const app = express();
const port = 3000;

//MIDDLE WEARS
app.use(bodyParser.json());
app.use(express.static("public"));                                                          //using files and moving files in expres. This allows us to handle thoughs files
app.use(cors());

//DATABASE
let level = {};                                                                             //should be able to create, post, get, read and update levels

//GETS - 2 TYPES
        //1. Get - Level ID
        //2. Get - Level Data

app.get("/level/:id", (req, res) => {           //GET LEVEL ID      -       called with file path of levels & ID of filename (1.json -> ID = 1)
    const levelId = req.params.id;
    const filePath = path.join(__dirname, "levels", `${levelId}.json`)                      //__ means private variable that is already created. It's path we are currently at.

    
    fs.readFile(filePath, "utf8", (err, data) => {                                          //call back either gives error (err) or data (data)
        if (err) {                                                                          //if error returned
            console.error("error reading level data:", err)
            return res.status(404).send("level non found");
        }
        res.send(data)                                                                      //if data returned, send data as response
        
    });
});

app.get("/levels", (req, res) => {              //GET LEVEL DATA        -       called with file path of levels
    fs.readdir("levels", (err, files) => {
        if (err) {
            console.error("error reading levels directory", err);
            return res.status(500).send("server error");
        }

        
        const levelIds = files                                                              //.filter files back extension.  Returns array .json files
            .filter(file => file.endsWith(".json"))                                             //Go through all files by reading directory and check if file ends with .json.
            .map(file => path.basename(file, ".json"));                                     //take array that has json files, and remove the .json part, and only keep baasename

        res.json(levelIds);

    });
});

//POST
app.post("/level/:id", (req, res) => {      //POST LEVEL ID
    const levelId = req.params.id;                                                      //request body paramaeter "id" is sent when this POST is called.
                                                                                                //encodeURIComponent(levelId) in editor passes levelID
    const filePath = path.join(__dirname, "levels", `${levelId}.json`)                  //__dirname -> path where we're currently at      //find a folder called "levels"
                                                                                                // save to file`${levelId}.json`
    const levelData = req.body;                                                         //request body contains level data, save this as var

    if (!Array.isArray(levelData || levelData.length == 0)) {                           //validation - check if levelData is an array, or if levelData is empty
        return res.status(400).send("level data must be a non-empty array")
    };

    fs.writeFile(filePath, JSON.stringify(levelData, null, 2), (err) => {               //2 -> how many spaces you want to put, null->filter, null will take everything
        if (err) {
            console.error("error saving level data: ", err);
            return res.status(500).send("server error");
        };
        res.status(201).send("level saved successfully");
    });

});

app.delete("/level/:id", (req, res) => {
    const levelId = req.params.id;                                                      //request body paramaeter "id" is sent when this POST is called.
    const filepath = path.join(__dirname, "levels", `${levelId}.json`)                  //__dirname -> path where we're currently at      //find a folder called "levels"

    fs.unlink(filepath, (err) => {                                                      //delete file in failepath
        if (err) {
            console.log("error deleting", err)
        }
        else {
            console.log("file deleted.")
        }
    });
    res.json({message: `File ${levelId}.json deleted successfully` });                                                                  //send response with levelID info
});




//CHECK IF DIR EXIST                                                                    If directory for "levels" doesn't exist, then create it
if (!fs.existsSync("levels")) {
    fs.mkdirSync("levels");
};


//START SERVER
app.listen(port, () => {
    console.log(`sever is running at http://localhost:${port}`);

});

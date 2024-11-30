

//purpose here is to save jSON files and load files again
const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs"); //file systems

const cors = require("cors");
const path = require("path");

const app = express();
const port = 3000;

//mid wears
app.use(bodyParser.json());
app.use(express.static("public")); //using files and moving files in expres. This allows us to handle thoughs files
app.use(cors());

//DATABASE
let level = {}; //should be able to create, post, get, read and update levels

//GETS - 2 TYPES

//1. Get - Level ID

//2. Get - Level Data
app.get("/level/:id", (req, res) => {
    const levelId = req.params.id;
    const filePath = path.join(__dirname, "levels", `${levelId}.json`)//__ means private variable that is already created. It's path we are currently at.

    
    fs.readFile(filePath, "utf8", (err, data) => {//call back either gives error (err) or data (data)
        //if error returned
        if (err) {
            console.error("error reading level data:", err)
            return res.status(404).send("level non found");
        }
        //if data returned
        res.send(data)
        
    });
});

//post - create level
app.post("/level/:id", (req, res) => {
    const levelId = req.params.id;
    const filePath = path.join(__dirname, "levels", `${levelId}.json`)//__dirname -> path where we're currently at      //find a folder called "levels"     // save to file`${levelId}.json`
    const levelData = req.body;//info of level and send via body

    //validation - check if levelData is an array, or if levelData is empty
    if (!Array.isArray(levelData || levelData.length == 0)) {
        return res.status(400).send("level data must be a non-empty array")
    };

    fs.writeFile(filePath, JSON.stringify(levelData, null, 2), (err) => {//2 -> how many spaces you want to put, null->filter, null will take everything
        if (err) {
            console.error("error saving level data: ", err);
            return res.status(500).send("server error");
        };
        res.status(201).send("level saved successfully");
    });

});

//Put, delete id    (get level id)

app.get("/levels", (req, res) => {
    fs.readdir("levels", (err, files) => {
        //check and handle error
        if (err) {
            console.error("error reading levels directory", err);
            return res.status(500).send("server error");
        }

        //.filter files back extension. Go through all files by reading directory and check if file ends with .json. Returns array .json files
        const levelIds = files
            .filter(file => file.endsWith(".json"))
            .map(file => path.basename(file, ".json")); //take array that has json files, and remove the .json part, and only keep baasename

        res.json(levelIds);
        
    });
});

//check if directory exist and if it doesn't then create it
if (!fs.existsSync("levels")) {
    fs.mkdirSync("levels");
};


//start sever
app.listen(port, () => {
    console.log(`sever is running at http://localhost:${port}`);

});

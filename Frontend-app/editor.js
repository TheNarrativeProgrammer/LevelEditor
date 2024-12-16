




$(function () {
        //PHYSICS VARIABLES
    var pl = planck;

    var world = new pl.World({
        gravity: pl.Vec2(0,-10)
    });
    var timeStep = 1 / 60;                                          //tells engine how much time should pass beftween calculations (time pass in physics engine)
    var velocityIterations = 8;
    var positionIterations = 3;

    var scale = 30;                                             //change this into something related to width and height.


    //UI VARIABLES & LEVEL VARIABLES
    var levels = [];                                                       //levels loaded in loadLevels() funct 
    var pigs = [];
    var boxes = [];
    var isLevelComplete = false;
    var currentLevel = 0;
    var score = 0;
    var birdRemaining = 3;
    var bird;
    var birdLaunched = false;

    function ClearLevel(){
        for(var b = world.getBodyList(); b; b = b.getNext()) {
            if(b !== ground){
                world.destroyBody(b);
            }
        }
        pigs = [];
        blocks = [];
        isLevelComplete = false;
        birdLaunched = false;
        birdRemaining = 3;
    }

    //RESIZE CANVAS AND EDITOR
    
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");

        function resizeCanvas()
        {
            canvas.width = window.innerWidth - 50;                  
            canvas.height = window.innerHeight - document.querySelector("header").offsetHeight - document.querySelector("footer").offsetHeight;
            
            resizeEditor();
        }

        window.addEventListener("resize", resizeCanvas);            //let window know when we resize the canvas. Add listener listening for resizeCanvas funct
        resizeCanvas();                                             //Call resizeCanvas funct

        function resizeEditor(){
            const editor = document.getElementById("editor");
            editor.style.width = canvas.width + 'px';
            editor.style.height = canvas.height + 'px';
        }
    


    //PROMPT USER FOR EDITOR OR TO PLAY
    var btnPlayEdit = document.getElementById("btn-PlayEdit");
    btnPlayEdit.addEventListener("click", showAlert);

    function showAlert() {
        var canvas = document.getElementById("canvas");
        var editor = document.getElementById("editor");
        var modal = document.getElementById("custom-alert");
        const btnPlay = document.getElementById("btn-play");
        const btnEditor = document.getElementById("btn-editor");

        modal.style.display= "flex";                         //unhide the modal. Display by default is "hidden"
        canvas.style.display= "none";
        editor.style.display= "none";

        btnPlay.onclick = function() {
            console.log("click");
            loadEditorOrCanvas("load play");
            modal.style.display="none";                         //hide the modal. 
        }

        btnEditor.onclick = function() {
            loadEditorOrCanvas("load editor");
            modal.style.display="none";                         //hide the modal. 
        }
    }


    function loadEditorOrCanvas(response){
        var canvas = document.getElementById("canvas");
        var editor = document.getElementById("editor");
        if(response === "load play"){
            canvas.style.display = "block";
            editor.style.display = "none";

            let levelIndex = 0;
            if (levelIndex === "") {
                alert("Please add level 0 in editor"); 
            }
            else {
                ClearLevel();                                                                  //clear level so shapes from another level are wiped from Canvas
                initLevel(levelIndex);                                                         //pass in the levelIndex to initialize the level in Play mode
            }
        } else {
            canvas.style.display = "none";
            editor.style.display = "block";
        }
        //requestAnimationFrame();
        console.log("re-render");
    }


    //PHYSICS                                                                                                                                    //PHYSICS
                                        //create ground and world
    var ground = world.createBody();                                        //createbody() -> it's a rigid body. Ground has no physics applied so it's static.
                                                                            //createFixture() -> adds collider, adds mesh filiter and adds mesh render
    ground.createFixture(pl.Edge(pl.Vec2(0, 0), pl.Vec2(canvas.width, 0)), {
        friction: 0.6
    }); 

                                    //funcs for creating block, pig & bird
    function createBox(x, y, width, height, dynamic) {
        var bodyDef = {
            position: pl.Vec2(x,y)
        };
        if (dynamic) {
            bodyDef.type = "dynamic";
        }

        var body = world.createBody(bodyDef);
        body.createFixture(pl.Box(width / 2, height / 2), {
            density: 1.0,
            friction: 0.5,
            restitution: 0.1,
            userData: "block",
        });
        return body;
    }

    function createPig(x, y) {
        var pigRadius = 0.3;
        var pig = world.createDynamicBody(pl.Vec2(x,y));
        pig.createFixture(pl.Circle(pigRadius), {
            density: 0.5,
            friction: 0.5,
            restitution: 0.5,
            userData: "pig",
        });
        pig.isPig = true;
        pig.isDestroyed = false;
        return pig;
    }

    var birdRadius = 0.5;
    var birdStartPos = pl.Vec2(5,5);

    function createBird() {
        bird = world.createDynamicBody(birdStartPos);
        bird.createFixture(pl.Circle(birdRadius), {
            density: 1.5,
            friction: 0.5,
            restitution: 0.5,
            userData: "bird",
        });
    }

                                        //cursor state - down, move or up
    var isMouseDown = false;                                                        //variables
    var mousePos = pl.Vec2(0,0);
    var launchVector = pl.Vec2(0,0);

    canvas.addEventListener("mousedown", function (event) {
        if(birdRemaining > 0 && !birdLaunched) {
            var rect = canvas.getBoundingClientRect();
            var mouseX = (event.clientX - rect.left) / scale;
            var mouseY = (canvas.height - (event.clientY - rect.top)) / scale;
            var birdPos = bird.getPosition();
            var dist = pl.Vec2.distance(birdPos, pl.Vec2(mouseX, mouseY));
            if(dist < birdRadius){
                isMouseDown = true;
            }
        }
    });

                                                                                    //Once mouse is down, get a vector
    canvas.addEventListener("mousemove", function (event) {
        if(isMouseDown){
            var rect = canvas.getBoundingClientRect();
            var mouseX = (event.clientX - rect.left) / scale;
            var mouseY = (canvas.height - (event.clientY - rect.top)) / scale;
            var mousePos = pl.Vec2(mouseX, mouseY);
            launchVector = pl.Vec2.sub(bird.getPosition(), mousePos);
        }
    });

                                                                                    //mouse up - apply physics to bird

    canvas.addEventListener("mouseup", function (event) {
        if(isMouseDown) {
            isMouseDown = false;
            bird.setLinearVelocity(pl.Vec2(0,0));
            bird.setAngularVelocity(0);  
            bird.applyLinearImpulse(launchVector.mul(5), bird.getWorldCenter(), true);
            birdLaunched = true;
            birdRemaining--;
        }
    });










            //EDITOR  
    let blockCounter = 0;
    //ADD BLOCKS, PIGS & BIRDS
                                    //ADD BLOCK                                                 when element 'add-block' clicked, add block to world
    $("#add-block").click(function () {
        
        const blockId = `block-${blockCounter++}`;                                              //NOTE: this isn't single quotes, its the double tilda key, but not the tilda
                                                            //selector mode -> start with # or . and ID or element type. SEARCHES FOR that element$("#add-block") or <(".div")
                                                            //create mode -> beginning (<div) and end of element(/div>). Creates that element $("<div></div>")
        const block = $("<div></div>")                      //CREATE NEW BLOCK                 $("<div></div>") creates new div element                 
            .addClass("block")                              //                                  define attributes
            .attr("id", blockId)
            .css({ top: "10px", left: "10px" })
            .appendTo("#editor");                           //select element & append           select #editor and append new block to editor

        block.draggable({                                   //MAKE BLOCK DRAGGABLE          grab block that we just created and make it dragg-able
            containment: "#editor",                         //                              can drag, but but it can't be dragged outside editor
            stop: function (event, ui) {                    //                              when you stop dragging, what should happen. Example, save the current layout.
                //you can add stuff here
            }
        });
        
        block.click(function (event) {
            //
            event.stopPropogation();                        //                              propogation - stop propograption - if we click on block, nothing else happens
        }); 
        
        block.contextmenu(function (event) {                //RIGHT CLICK TO DELETE         contextMenu -> means right click                right click to delete block
            event.preventDefault();
            if (confirm("Delete this block?")) {
                //if user confirms, then remove block
                $(this).remove();
            }
        })
    });

                                    //ADD BIRD
    $("#add-bird").click(function () {
        const birdID = `bird-${blockCounter++}`;
        const bird = $("<div></div>")
            .addClass("bird")
            .attr("id", birdID)
            .css({ top: "10px", left: "10px" })
            .appendTo("#editor");
        bird.draggable({
            containment: "#editor",
            stop: function (event, ui) {
            }
        });
        
        bird.click(function (event) {
            event.stopPropogation();
        }); 
        
        bird.contextmenu(function (event) {
            event.preventDefault();
            if (confirm("Delete this bird?")) {
                //if user confirms, then remove bird
                $(this).remove();
            }
        })
    });


                                        //ADD PIG
    $("#add-pig").click(function () {
        const pigID = `pig-${blockCounter++}`;
        const pig = $("<div></div>")
            .addClass("pig")
            .attr("id", pigID)
            .css({ top: "10px", left: "10px" })
            .appendTo("#editor");

        pig.draggable({
            containment: "#editor",
            stop: function (event, ui) {
            }
        });
        
        pig.click(function (event) {
            event.stopPropogation();
        }); 
        
        pig.contextmenu(function (event) {
            event.preventDefault();
            if (confirm("Delete this pig?")) {
                $(this).remove();
            }
        })
    });


    


    //LOAD LEVEL
    $("#load-level").click(function () {
        let levelSelected = $("#level-list").val();
        if (levelSelected === "") {
            alert("Please select a level"); 
        }
        else {
            ClearEditor();                                                                  //clear level so shapes from another level are wiped from editor
            loadLevelSelected(levelSelected);                                               //pass in the level the user selected and call func to load level.
        }
    });
    //EDITOR MODE
    function loadLevelSelected(levelSelected) {             //AJAX - GET - LOAD LEVEL SELECTED FOR EDITOR
        $.ajax({
            url: `http://localhost:3000/level/` + encodeURIComponent(levelSelected),            //  ???? why does the file path only work with "level" and not "levels"???
            method: "GET",
            contentType: "application/json",
            
            success: function (res) {

                const parsedData = JSON.parse(res);             //parse response to JSON                ???? I thought cors automatically parsed to JSON. Why do I need this?
                
                for (let i = 0; i < parsedData.length; i++) {   //call render shape func                iterate though each element in parsed data
                    const Id = parsedData[i]["id"];//                                                   save ["tag"] value to variable 
                    const xPos = parsedData[i]["x"];
                    const yPos = parsedData[i]["y"];
                    const className = parsedData[i]["type"];
                    RenderShapeEditor(Id, className, xPos, yPos, levelSelected);//                            pass saved variables to RenderShapeEditor function
                }

            }
        });
    };

    function ClearEditor() {                //CLEAR EDITOR
        const $editor = $("#editor")
        $editor.children().remove();
    }


    //PLAY MODE
    function initLevel(levelIndex) {             //AJAX - GET - LOAD LEVEL SELECTED FOR PLAY
        $.ajax({
            url: `http://localhost:3000/level/` + encodeURIComponent(levelIndex),            //  ???? why does the file path only work with "level" and not "levels"???
            method: "GET",
            contentType: "application/json",
            
            success: function (res) {

                const parsedData = JSON.parse(res);             //parse response to JSON                ???? I thought cors automatically parsed to JSON. Why do I need this?
                
                for (let i = 0; i < parsedData.length; i++) {   //call render shape func                iterate though each element in parsed data
                    const Id = parsedData[i]["id"];//                                                   save ["tag"] value to variable 
                    const xPos = parsedData[i]["x"];
                    const yPos = parsedData[i]["y"];
                    const className = parsedData[i]["type"];
                    RenderShapePlay(Id, className, xPos, yPos, levelIndex);//                            pass saved variables to RenderShapePlay function
                }

            }
        });
    };

    

                                            //RENDER SHAPE - Editor
    function RenderShapeEditor(Id, className, xPos, yPos, levelSelected) {                           
        
        const blockBirdPig = $("<div></div>")                      //CREATE NEW blockBirdPig                 $("<div></div>") creates new div element                 
            .addClass(className)                              //                                  define attributes
            .attr("id", Id)
            .css({ top: yPos, left : xPos })
            .appendTo("#editor");                           //select element & append           select #editor and append new blockBirdPig to editor

            blockBirdPig.draggable({                                   //MAKE blockBirdPig DRAGGABLE          grab blockBirdPig that we just created and make it dragg-able
            containment: "#editor",                         //                              can drag, but but it can't be dragged outside editor
            stop: function (event, ui) {                    //                              when you stop dragging, what should happen. Example, save the current layout.
                //you can add stuff here
            }
        });
        const levelData = [];                               //this is array that holds data in each level. See 1.json or 2.json to see array
        $(".block").each(function () {                      //Jquery method and not a an array, so not doing "foreach", doing "each"
            const $this = $(this);                          //loops through each element of class "block", collects properties, and pushes to array levelData
            const position = $this.position();              //$(".block") -> returns a JQuery object containing all elements of class block.
            levelData.push({
                id: $this.attr("id"),                       //this -> not a Jquery element, it's a DOM element, and therefore doesn't have access to 
                x: position.left,                                   //to Jquery methods like .attr .position . width.
                y: position.top,                            //($this) -> adding $ and wraping it in () turns this into Jquery object
                width: $this.width(),
                height: $this.height(),
                type: $this.data("type"),
            });
        });

        $(".bird").each(function () {                      
            const $this = $(this);                          
            const position = $this.position();
            levelData.push({
                id: $this.attr("id"),
                x: position.left,
                y: position.top,
                width: $this.width(),
                height: $this.height(),
                type: $this.data("type"),
            });
        });

        $(".pig").each(function () {                      
            const $this = $(this);                          
            const position = $this.position();
            levelData.push({
                id: $this.attr("id"),
                x: position.left,
                y: position.top,
                width: $this.width(),
                height: $this.height(),
                type: $this.data("type"),
            });
        });

        blockBirdPig.contextmenu(function (event) {                //RIGHT CLICK TO DELETE         contextMenu -> means right click                right click to delete block
            event.preventDefault();
            if (confirm("Delete this block?")) {
                //if user confirms, then remove block
                $(this).remove();
            }
        })
    }

                                          //RENDER SHAPE - Play mode
    function RenderShapePlay(Id, className, xPos, yPos, levelSelected) {                           
        
        if(className ==="block"){
            boxes.push(createBox(xPos, yPos, 1, 2, true));
        }

        if(className ==="pig"){
            boxes.push(createPig(xPos, yPos));
        }

        createBird();
    }
    


    //LOAD DROP MENU OF LEVELS SAVED 
    function loadLevelList() {
        console.log("load level cal")
        $.ajax({                                        //AJAX - GET - LOAD LEVEL SELECTED      RESPONSE = levelIds (name of file level saved as minus file extension)
            url: "http://localhost:3000/levels",                                                //  ???? why is the file path "levels" work here and "level" other places???
            method: "GET",
            success: function (levelIds) {                                                       //Grab "#level-list" hmtl element and store in Jquy var
                const $levelList = $("#level-list")                                             //$ at beginning of variable means it's a Jquery type variable.
                $levelList.empty();                                                             //clear the list
                $levelList.append('<option value=""> Select a Level</option>');                 //append default text now that it was cleared in previous step

                levelIds.forEach(function (id) {                                                //iterator through each levelID (levelId.json in levels folder)
                    $levelList.append(`<option value="${id}">${id}</option>`)                       //??? Raf, where is this ${id} info coming from? How is it getting the info
                    levels[id]=id;
                });                                                                                 //from $levelList. I get function (id) is passing id as an arguement, but 
            },                                                                                      //where is the data being assigned to "id"??????????
            error: function(xhr, status, error) {
                console.error("error fetching level list", error);
            }
        });
    };

    //DELETE LEVEL
    $("#delete-level").click(function () {
        const levelId = $("#level-id").val().trim();
        if (!levelId) {
            alert("Please enter a level ID");
            return;
        }

        $.ajax({                                            //AJAX - DELETE - SAVE LEVEL              RESPONSE = confirmation message 
            url: `http://localhost:3000/level/` + encodeURIComponent(levelId),
            method: "DELETE", //post call
            contentType: "application/json",

            success: function (response) {
                loadLevelList(); // load the level list again once the level is saved
                ClearEditor();
                alert(response.message)
            },
            error: function (xhr, status, error) {
                alert("error deleting level: ", + xhr.responseText);
            }
        });

    });
    //SAVE LEVEL 
    $("#save-level").click(function () {
        const levelId = $("#level-id").val().trim();

        if (!levelId) {
            alert("Please enter a level ID");
            return;
        }

        const levelData = [];                                                               //this is array that holds data in each level. See 1.json or 2.json to see array

        $(".block").each(function () {                                                      //Jquery method and not a an array, so not doing "foreach", doing "each"
            const $this = $(this);
            const position = $this.position();
            levelData.push({
                id: $this.attr("id"),
                x: position.left,
                y: position.top,
                width: $this.width(),
                height: $this.height(),
                type: "block",
            });
        });

        $(".bird").each(function () {
            const $this = $(this);
            const position = $this.position();
            levelData.push({
                id: $this.attr("id"),
                x: position.left,
                y: position.top,
                width: $this.width(),
                height: $this.height(),
                type: "bird",
            });
        });

        $(".pig").each(function () {
            const $this = $(this);
            const position = $this.position();
            levelData.push({
                id: $this.attr("id"),
                x: position.left,
                y: position.top,
                width: $this.width(),
                height: $this.height(),
                type: "pig",
            });
        });

        
        
        if (levelData.length == 0) {                                                        //check if level is empty
            alert("the level is empty. Add some blcoks before saving")
            return;
        };

        $.ajax({                                            //AJAX - POST - SAVE LEVEL              RESPONSE = confirmation message 
            url: `http://localhost:3000/level/` + encodeURIComponent(levelId),
            method: "POST", //post call
            contentType: "application/json",
            data: JSON.stringify(levelData),

            success: function (response) {
                alert(response);
                loadLevelList(); // load the level list again once the level is saved
            },
            error: function (xhr, status, error) {
                alert("error saving level: ", + xhr.responseText);
            }
        });
    });

    //UPDATE FUNCTION - 

    
    function update() {
        world.step(timeStep, velocityIterations, positionIterations);
        pigs = pigs.filter(function (pig) {
            if(pig.isDestroyed) {
                world.destroyBody(pig);
                score += 100;
                return false;
            }
            return true;
        });
        if(pigs.length === 0 && !isLevelComplete){
            isLevelComplete = true;
            setTimeout(function () {
                alert("level complete!");
                nextLevel();
            }, 500);
        }

        if(birdLaunched) {
            var birdPos = bird.getPosition();
            if(birdPos.x > 50 || birdPos.y < -10 || (bird.getLinearVelocity().length() < 0.1 && !isMouseDown)) {
                if(birdRemaining > 0) {
                    createBird();
                    birdLaunched = false;
                } else if (!isLevelComplete) {
                    setTimeout(function () {
                        alert("game over");
                        resetLevel();
                    }, 500);

                }
            }
        }
    }


    //CALCS AFTER MAIN CALCULATION
    world.on("post-solve", function(contact, impulse) {
        if(!impulse) return;
        var fixtureA = contact.getFixtureA();
        var fixtureB = contact.getFixtureB();
        var bodyA = fixtureA.getBody();
        var bodyB = fixtureB.getBody();
        function isGround(body) {
            return body === ground;
        }
        if(bodyA.isPig || bodyB.isPig) {
            var pigBody = bodyA.isPig ? bodyA : bodyB;
            var otherBody = bodyA.isPig ? bodyB : bodyA;
    
            if(isGround(otherBody)) return;
            var normalImpulse = impulse.normalImpulses[0];
            if(normalImpulse > 1.0){
                pigBody.isDestroyed = true;
            }
        }
    });
    
    
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    
        ctx.beginPath();
        ctx.moveTo(0, canvas.height);
        ctx.lineTo(canvas.width, canvas.height);
        ctx.strokeStyle = "#004d40";
        ctx.lineWidth = 2;
        ctx.stroke();
    
        boxes.forEach(function (box) {
            var position = box.getPosition();
            var angle = box.getAngle();
            var shape = box.getFixtureList().getShape();
            var vertices = shape.m_vertices;
            ctx.save();
            ctx.translate(position.x * scale, canvas.height - position.y * scale);
            ctx.rotate(-angle);
            ctx.beginPath();
            ctx.moveTo(vertices[0].x * scale, -vertices[0].y * scale);
            for (var i = 1; i < vertices.length; i++) {
                ctx.lineTo(vertices[i].x * scale, -vertices[i].y * scale);
            }
            ctx.closePath();
            ctx.fillStyle = "#795548";
            ctx.fill();
            ctx.restore();
        });
    
        //DRAW PIGS
        pigs.forEach(function (pig){
            var pigPos = pig.getPosition();
            var pigRadius = 0.3;
            ctx.beginPath();
            ctx.arc(pigPos.x * scale, canvas.height - pigPos.y * scale, pigRadius * scale, 0, 2 * Math.PI);
            ctx.fillStyle = "#8bc34a";
            ctx.fill();
        });
    
        if(bird)
        {
            var birdPos = bird.getPosition();
            ctx.beginPath();
            ctx.arc(birdPos.x * scale, canvas.height - birdPos.y * scale, birdRadius * scale, 0, 2 * Math.PI);
            ctx.fillStyle = "#f44336";
            ctx.fill();
        }
    
        if(isMouseDown){
            var birdPos = bird.getPosition();
            ctx.beginPath();
            ctx.moveTo(birdPos.x * scale, canvas.height - birdPos.y * scale);
            ctx.lineTo(mousePos.x * scale, canvas.height - mousePos.y * scale);
            ctx.strokeStyle = "#9e9e9e"
            ctx.lineWidth = 2;
            ctx.stroke();
        }
        //DRAW UI 
        ctx.fillStyle = "#000"
        ctx.font = "16px Arial";
        ctx.fillText("Score: " + score, 10, 20);
        ctx.fillText("Level: " + (currentLevel + 1), 10, 40);
        ctx.fillText("Birds remaining: " + birdRemaining, 10, 60);
    }
    
    
    function resetLevel(){
        initLevel(currentLevel);
    }
    
    function nextLevel(){
        currentLevel++;
        if(currentLevel < levels.length){
            initLevel(currentLevel)
        } else{
            alert("congrats you won life");
            currentLevel = 0;
            score = 0;
            initLevel(currentLevel);
        }
    }
    
    function loop(){
        update();
        draw();
        requestAnimationFrame(loop);
    }
    
    //INITIALIZE GAME
    initLevel(currentLevel);
    loop();

    





loadLevelList();
});



//PLAY FUNCTIONS 


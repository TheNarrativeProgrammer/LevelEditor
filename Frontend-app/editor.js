
$(function () {
    let blockCounter = 0;
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
            //event.stopPropogation();                        //                              propogation - stop propograption - if we click on block, nothing else happens
        }); 
        
        block.contextmenu(function (event) {                //RIGHT CLICK TO DELETE         contextMenu -> means right click                right click to delete block
            event.preventDefault();
            if (confirm("Delete this block?")) {
                //if user confirms, then remove block
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

    function loadLevelSelected(levelSelected) {             //AJAX - GET - LOAD LEVEL SELECTED
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
                    RenderShape(Id, className, xPos, yPos, levelSelected);//                            pass saved variables to RenderShape function
                }

            }
        });
    };

    function ClearEditor() {                //CLEAR EDITOR
        const $editor = $("#editor")
        $editor.children().remove();
    }

                                            //RENDER SHAPE
    function RenderShape(Id, className, xPos, yPos, levelSelected) {                           
        
        const block = $("<div></div>")                      //CREATE NEW BLOCK                 $("<div></div>") creates new div element                 
            .addClass("block")                              //                                  define attributes
            .attr("id", Id)
            .css({ top: yPos, left : xPos })
            .appendTo("#editor");                           //select element & append           select #editor and append new block to editor

        block.draggable({                                   //MAKE BLOCK DRAGGABLE          grab block that we just created and make it dragg-able
            containment: "#editor",                         //                              can drag, but but it can't be dragged outside editor
            stop: function (event, ui) {                    //                              when you stop dragging, what should happen. Example, save the current layout.
                //you can add stuff here
            }
        });
        const levelData = [];                               //this is array that holds data in each level. See 1.json or 2.json to see array
        $(".block").each(function () {                      //Jquery method and not a an array, so not doing "foreach", doing "each"
            const $this = $(this);
            const position = $this.position();
            levelData.push({
                id: $this.attr("id"),
                x: position.left,
                y: position.top,
                width: $this.width(),
                height: $this.height(),
                type: "block"
            });
        });

        block.contextmenu(function (event) {                //RIGHT CLICK TO DELETE         contextMenu -> means right click                right click to delete block
            event.preventDefault();
            if (confirm("Delete this block?")) {
                //if user confirms, then remove block
                $(this).remove();
            }
        })
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
                type: "block"
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

loadLevelList();
});
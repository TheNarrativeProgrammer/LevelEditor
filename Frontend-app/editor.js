//function to

$(function () {
    //block counter
    let blockCounter = 0;
    //when element 'add-block' clicked, add block to world
    $("#add-block").click(function () {
        const blockId = `block-${blockCounter++}`; //NOTE: this isn't single quotes, its the double tilda key, but not the tilda

        //selector mode -> start with # or . and ID or element type. SEARCHES FOR that element$("#add-block") or <(".div")
        //create mode -> beginning (<div) and end of element(/div>). Creates that element $("<div></div>")
        const block = $("<div></div>")
            .addClass("block")
            .attr("id", blockId)
            .css({ top: "10px", left: "10px" })
            .appendTo("#editor");

        //grab block that we just created and make it dragg-able
        block.draggable({
            containment: "#editor", //can drag, but but it can't be dragged outside editor
            stop: function (event, ui) { //when you stop dragging, what should happen. Example, save the current layout.
                //you can add stuff here
            }
        });

        //propogation - stop propograption - if we click on block, nothing else happens
        block.click(function (event) {
            event.stopPropogation();
        });

        //contextMenu -> means right click
        //right click to delete block
        block.contextmenu(function (event) {
            event.preventDefault();
            if (confirm("Delete this block?")) {
                //if user confirms, then remove block
                $(this).remove();
            }
        })
    });

    


    //get all the levels, make random call to server and if we get numbers back then we know things are working
    function loadLevelList() {
        $.ajax({
            url: "http://localhost:3000/levels",  //define end point
            method: "GET",
            success: function (levelIds) {
                const $levelList = $("#level-list")       //$ at beginning of variable means it's a Jquery type variable. Grab "#level-list" hmtl element and store in Jquy var
                $levelList.empty();        //clear the list
                $levelList.append('<option value=""> Select a Level</option>');

                levelIds.forEach(function (id) {
                    $levelList.append(`<option value="${id}">${id}</option>`)
                });
            },
            //handle error
            error: function(xhr, status, error) {
                console.error("error fetching level list", error);
            }
        });
    };
    //SAVE LEVEL //get save level ID. When clicked, make call back function
    $("#save-level").click(function () {
        const levelId = $("#level-id").val().trim();

        if (!levelId) {
            alert("Please enter a level ID");
            return;
        }

        const levelData = []; //this is array that holds data in each level. See 1.json or 2.json to see array

        $(".block").each(function () { //Jquery method and not a an array, so not doing "foreach", doing "each"
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
        //check if level is empty
        if (levelData.length == 0) {
            alert("the level is empty. Add some blcoks before saving")
            return;
        };

        //after we have all the stuff, make post requet
        $.ajax({
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
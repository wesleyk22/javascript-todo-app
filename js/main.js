/* Select the scrollable list */
const scrollableList = document.querySelector('.scrollable-list');
// Global variable for checking if the saved tasks are loaded
let savedTasksLoaded = false;

/* Function to create a "template" number of taskItem elements, will 
 * be named task1, task2, task3, etc. (not used in final product but was
 * used for testing in the beginning) */
function createTemplateTasks(numOfTasks) {
    for (let i = 0; i < numOfTasks; i++) {
        addTask("Task #" + (i+1), false);
    }
};

function loadSavedTasks() {
    console.log("Loading saved tasks...")
    /* Declare a variable savedTasks that will refer to the taskList that we get
     * from local storage, this variable could be null and if it is this function
     * will return nothing, if it's not null that means there are tasks to load */
    const savedTaskList = localStorage.getItem("taskList");

    /* If there are no savedTasks to load, end the function here by
     * returning nothing */
    if (savedTaskList == null) {
        return; 
    }

    /* Create an array of tasks to load by parsing the stringified tasks
     * objects in the array */
    const tasksToLoad = JSON.parse(savedTaskList);

    /* For each loop to load these tasks */
    tasksToLoad.forEach(savedTask => {
        let taskName = savedTask.text;
        let taskChecked = savedTask.checked;
        /* Add the task using the addTask function
         * with the taskName and taskChecked variables */
        addTask(taskName, taskChecked);
    });

    savedTasksLoaded = true;
}

function saveTasks() {
    console.log("Saving tasks...")
    // Use queryselector on the task items
    taskItems = document.querySelectorAll(".scrollable-list .task-item")
    taskCount = taskItems.length;
    console.log("The number of tasks to save is " + taskCount + "");
    /* Declare an empty array called "TasksToSave" this will be an array of custom task objects, when
     * we loop through the html we will push task objects to this array. This way we don't have to 
     * clear the localstorage and replace tasks individually, instead we can just replace one key/value
     * IN the localstorage that IS the array, removing the risk of losing all data if something happens
     * between clearing the local storage and saving to it. */
    const tasksToSave = []
    // Loop through these task items with a for each loop
    taskItems.forEach((task, index) => {
        // Select the editable text and save that text to taskText variable
        const text = task.querySelector(".editable-text").textContent;
        // Select the checkbox element and see if it's checked or not, save that to checked variable
        const checked = task.querySelector(".custom-checkbox").checked; 

        // Convert task into object
        const taskObject = {
            position: index,
            text,
            checked
        }

        // Add the object to array
        tasksToSave.push(taskObject);
    });

    /* Save the tasksToSave array to localstorage, overriding the key/value pair with 
     * key of "taskList". The value is a stringified array that can then be parsed later
     * in the loadSavedTasks function. */
    localStorage.setItem("taskList", JSON.stringify(tasksToSave));
    

}

/* Function to add tasks with parameters of taskName, and whether or not is
 * checked/unchecked upon it's creation */
function addTask(taskName, checked) {
        // Create a div
        let taskItem = document.createElement('div');
        // Give the div the class of "task-item"
        taskItem.classList.add('task-item');

        // Create checkbox
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "custom-checkbox"

        /* Add an event listener to this checkbox so that whenever it's
         * checked/unchecked it saves each time */
        checkbox.addEventListener("change", function() {
            console.log("test");
            saveTasks();
        });

        /* If the checked variable is true, check the box upon 
         * It's creation */
        if (checked) {
            checkbox.checked = true;
        }


        // Add checkbox to taskItem
        taskItem.appendChild(checkbox);

        // Create text and add it to the element
        // const taskItemText = document.createTextNode("Task #" + (i+1));
        const taskItemText = createEditableText(taskName);
        taskItem.appendChild(taskItemText);

        // Create delete button
        const taskDeleteButton = document.createElement("button");
        taskDeleteButton.className = ("small-btn task-del-btn");

        // Create the fontawesome icon for delete button
        const icon = document.createElement("i");
        icon.className = "fa fa-trash fa-1x";
        icon.setAttribute("aria-hidden", "true");

        // Add icon to delete button
        taskDeleteButton.appendChild(icon);

        // Add functionality for the delete button
        taskDeleteButton.addEventListener("click", function() {
            taskItem.remove();
            saveTasks();
        });

        // Add delete button to taskItem
        taskItem.appendChild(taskDeleteButton);

        // Add it into the scrollable list
        scrollableList.appendChild(taskItem);
}

/* Function to create an editable text field (these are used in taskItems) */
function createEditableText(textContent) {
    let textElement = document.createElement("div");
    textElement.className = "editable-text";
    textElement.innerText = textContent;

    /* Function to enter "text edit mode", this function can be activated through
    either clicking on it, but it's also activated once by default upon it's
    creation */
    function enterTextEditMode() {
        console.log("check below if textElement exists vv")
        console.log(textElement);
        // Allow use to click and edit with textinput/inputfield
        // being put into focus
        
        /* Changing this below element from "input" to "textarea" to 
         * allow for height change */
        let inputField = document.createElement("textarea");
        inputField.type = "text";
        inputField.value = textElement.innerText;
        inputField.className = "text-input text-sm"; // Adding text-lg to see how it looks

        // Replace that text with an input field that is focused on
        textElement.replaceWith(inputField);
        inputField.focus();

        // Function to "save" text
        function saveText() {
            // Check if the text is empty, if it is, then remove the task (parent node)
            if (inputField.value.trim() === "") {
                this.parentNode.remove();
            } else { // Otherwise, save the text
                textElement.innerText = inputField.value;
                inputField.replaceWith(textElement);
                console.log("text saved");
                saveTasks();
            }
        }

        // Add an event listener to the inputField if it's blurred, to save text
        inputField.addEventListener("blur", saveText);

        // OR if enter is pressed, that will also blur the inputField, 
        // and thus call the saveText() function
        inputField.addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                inputField.blur();
            }
        });

        /* Function that will set the height of the text-input accordingly 
         * based on how much text is in the textarea */
        let resizeHeight = () => {
            inputField.style.height = "auto"; // Resets the height?
            /* Set the height based on how much scrollHeight there is.
             * it happens to be the case that the only way to access 
             * the scrollheight property is through javascript which is
             * why we do this. */
            inputField.style.height = inputField.scrollHeight + "px";
        }
        
        // Add event listener that will call the resizeHeight function
        inputField.addEventListener("input", resizeHeight);
        
        /* Adding an event listener to make sure that the horizontal scroll bar,
         * while it's not visible, doesn't move to the right at all. There is a case
         * where it can move to the right when the spacebar is held on the text-input
         * field, so I'm gonna add this event listener to combat this problem */
        // I dont like this solution commenting out for now
        // inputField.addEventListener("input", function() {
        //     setTimeout(() => {
        //         scrollableList.scrollLeft = 0;
        //     }, 1);
            
        //     console.log("scrolling all the way to left (with delay now)");
        // });

        /* Adding an event listener that doesn't allow for more than 3 spaces to
         * prevent layout bugs/unwanted behavior for holding spacebar and adding lots of
         * spaces to the text-input */
        inputField.addEventListener("input", function() {
            /* Replace any four or more spaces with exactly 3 to prevent 
             * "spacebar spam" */
            // setTimeout(() => {
                inputField.value = inputField.value.replace(/ {10,}/g, '         ');
            // }, 1);
            
            console.log('test');
        });

        /* Resize height here by default so make sure once it's
         * created (Remember it's just being deleted and recreated each time
         * the user clicks on it) it is at the right height */
        resizeHeight();

    }
    
    // If the text element is clicked, then enter text edit mode
    textElement.addEventListener("click", function () {
        enterTextEditMode()
    });

    /* When we are at this point in the code, the element/task has been created, 
     * so we can enter edit mode so the user can start typing instantly without
     * having to click on it, a 1ms delay is necessary because we need to wait
     * for the element to actually be there for the enterTextEditMode() function
     * to properly activate */
    if (savedTasksLoaded == true) {
        setTimeout(() => {
            enterTextEditMode();
        }, 1); // This delay is needed to ensure it gets focused
    }
    
    // Return this so that it can be used throughout this code
    return textElement;
}

/* Code to run once the page has loaded */
document.addEventListener('DOMContentLoaded', function() {
    //createTemplateTasks(1);
    loadSavedTasks();
});

/* For each loop that selects the add, uncheck, and delete buttons and adds
 * tooltips to them and functionality for each button */
document.querySelectorAll(".add-btn, .uncheck-btn, .del-btn").forEach(button => {
    
    // Functionality for entering/exiting the mouse
    button.addEventListener("mouseenter", function (event) {

        // Create the tooltip
        let tooltip = document.createElement("div");
        tooltip.className = "tooltip";

        // Based on the button, assign the tooltip text accordingly
        if (button.classList.contains("add-btn")) {
            tooltip.innerText = "Add Task";
        } else if (button.classList.contains("uncheck-btn")) {
            tooltip.innerText = "Uncheck All";
        } else if (button.classList.contains("del-btn")) {
            tooltip.innerText = "Delete all";
        }

        // Add the element to the body element on the page
        document.body.appendChild(tooltip);
        // Add the small text class to it
        tooltip.classList.add("text-sm");

        /* Position tooltip near button (using currentTarget to not also apply
         * this to inner elements) */
        let rect = event.currentTarget.getBoundingClientRect();
        tooltip.style.left = rect.left + rect.width / 2 + "px";
        tooltip.style.top = rect.top - 50 + "px"; // Can adjust this depending on how high you want the tooltip
        setTimeout(() => {
            tooltip.style.opacity = "1";
        }, 0); // can adjust this delay depending on how long it should take to appear after hovering
        // tooltip.style.opacity = "1";

        // Event listener for when the mouse moves out to remove the tooltip
        event.currentTarget.addEventListener("mouseleave", function () {
            // Smooth fadeout before removing using setTimeout()
            tooltip.style.opacity = "0";
            setTimeout(() => tooltip.remove(), 300);
            // tooltip.remove();
        });
    });
});

/* Variables that refer to the modal and elements inside it */
const modal = document.getElementById("modal");
const modalHeader = modal.querySelector("h2");
const modalContent = modal.querySelector("p");
const modalCancelButton = document.querySelector(".modal-cancel-button");
const modalYesButton = document.querySelector(".modal-yes-button");

/* This variable will store the function of whatever will happen when 
 * "Yes" is clicked on the modal, it's re-usable and changeable */
let modalFunction = null;

/* Functionality for the add button */
let addButton = document.querySelector(".add-btn") 
addButton.addEventListener("click", function() {
    addTask(" ", false);
    /* Set the scroll bar to the bottom, this delay is needed because 
     * we are creating a text area, and waiting for it to change it's
     * height, but the scrollbar's position is set I'm guessing BEFORE 
     * the textarea height is changed, making it not scroll all the way
     * down without this solution of using JS to set scrollbar to bottom
     * a millisecond after adding a task */
    setTimeout(() => {
       scrollableList.scrollTop = scrollableList.scrollHeight;
    }, 1); 
    
})

/* Functionality for the uncheck all button */
let checkButton = document.querySelector(".uncheck-btn")
checkButton.addEventListener("click", function() {
    let uncheckAllFunction = function() {
        console.log("Running code to uncheck all tasks...");
        let taskCheckboxes = document.querySelectorAll(".custom-checkbox");
        taskCheckboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        saveTasks();
    }
    let headerContent = "Uncheck all?";
    let innerContent = "Are you sure you want to uncheck all tasks?";
    // Call the displayModal function 
    displayModal(headerContent, innerContent, uncheckAllFunction);
})

/* Functionality for the delete all button */
let deleteButton = document.querySelector(".del-btn")
deleteButton.addEventListener("click", function() {
    let deleteAllFunction = function() {
        console.log("Running code to delete all tasks...");
        /* Remove all elements that are children of scrollableList (effectively
         * deleting all tasks) */
        while (scrollableList.firstChild) {
            scrollableList.removeChild(scrollableList.firstChild);
        }
        saveTasks();
    }
    let headerContent = "Delete all?";
    let innerContent = "Are you sure you want to delete all tasks?";
    // Call the displayModal function 
    displayModal(headerContent, innerContent, deleteAllFunction);
})

/* Function for the modal that takes three parameters, a header message, a content
message, (both strings), and then a function as a parameter, if the "yes" button
is clicked than that function will activate */
function displayModal(header, content, callbackFunction) {
    modal.style.display = "block";
    modalHeader.textContent = header;
    modalContent.textContent = content;
    // Set the modal function to be this callBack
    modalFunction = callbackFunction;
}

/* Functionality for the Modal cancel button */
modalCancelButton.addEventListener("click", function() {
    console.log("cancel button clicked");
    // Hide the modal
    modal.style.display = "none";
});

/* Functionality for the Modal yes button */
modalYesButton.addEventListener("click", function() {
    console.log("yes button clicked");
    if (modalFunction != null) {
        modalFunction();
    } else {
        console.log("modalFunction variable was null, no function to run");
    }
    // Hide the modal
    modal.style.display = "none";
});




/* Commenting this out for now since I don't like the animations, but they are a 
cool thing that I can add and helps me know how I can use fontawesome along
with javascript to create animations, I will probably just use them in a different 
spot in the app though if I can find one, cause I just don't like them where
they are at currently */

/* Loop through all of the big buttons, and make sure
 * that when they are hovered, their inner icon is
 * animated */

// const panelButtons = document.querySelectorAll('.big-btn');
// panelButtons.forEach((panelButton) => {
//     panelButton.addEventListener('mouseover', () => {
//         console.log("Hovered this button")
//         // Target the icon and add the animation
//         const icon = panelButton.querySelector('i');
//         icon.classList.add("fa-fade");
        
//     });
//     panelButton.addEventListener('mouseout', () => {
//         console.log("left this button")
//         const icon = panelButton.querySelector('i');
//         icon.classList.remove("fa-fade");
//     });
// });


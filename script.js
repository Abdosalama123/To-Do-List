
"use strict";
const btns = document.querySelectorAll('.btn');
const tasks = document.querySelectorAll('.tasks');
const inputField = document.querySelector('.input-field');
const taskTitle = document.querySelector('.task-title');
const exitBtn = document.querySelector('.close');


let desiredTask = null; //which task will modify
let drag = null;  //carry draggable element
let numTasks = 0;  //number of all tasks
let myTasks = [];  //arr of all tasks


//////////////////////////////////////function to convert element to object
const convertEleToObj = function (arr) {
    const arrOfObjs = [];
    arr.forEach((myElement) => {
        const taskType = myElement.getAttribute('type');
        const taskNum = myElement.getAttribute('task-num');
        const eleInputTaskValue = myElement.querySelector('input').value;
        // console.log(eleInputTaskValue);
        const obj = {
            type: taskType,
            num: taskNum,
            data: eleInputTaskValue,
        }
        arrOfObjs.push(obj);
    })
    return arrOfObjs;

}


//////////////////////////////////////function to get all tasks and give it a readonly property
const readonly = function () {
    const allTasks = document.querySelectorAll('.task');
    if (allTasks) {
        // loop on all tasks to make it read only
        allTasks.forEach(task => {
            task.querySelector('.input-task').setAttribute('readonly', 'ture');
        })
    }
}

//////////////////////////////////////////local storage////////////////////////////////

//set local storage
const setLocalStorage = function () {
    localStorage.setItem('tasks', JSON.stringify(convertEleToObj(myTasks)));
    // localStorage.setItem('numTasks', numTasks);
}

//get local storage
const getLocalStorage = function () {
    const data = JSON.parse(localStorage.getItem('tasks'));
    // numTasks = localStorage.getItem('numTasks');

    if (!data) return;

    data.forEach(task => {
        const html = createElement();
        const type = task.type;
        const taskTitle = task.data;
        tasks.forEach((taskList) => {
            if (taskList.getAttribute('title') === type) {
                taskList.insertAdjacentHTML('beforeend', html);


                //push the last task in the task arr
                myTasks.push(taskList.lastElementChild);


                //add title to task (not stated / progress / finished) 
                taskList.lastElementChild.setAttribute('type', `${type}`);

                //add the title to task
                taskList.lastElementChild.querySelector('input').value = taskTitle;

                //make this element read only
                taskList.lastElementChild.querySelector('input').setAttribute('readonly', 'ture');


                //call func to drag and drop
                dragitem();

                dragitemMobile();

                //call local storage function
                setLocalStorage();

            }
        })

    })
}

window.addEventListener('load', function () {
    getLocalStorage();
});


//////////////////////////////////////////////handel clicking add buttons to add task
//add element function
const createElement = function () {
    const html = `
                    <div class="task" draggable='true' task-num="${++numTasks}">
                        <input type="text" class="input-task" >
                        <div class="icons">
                            <i class="fa-solid fa-pen-to-square edit-icon"></i>
                            <i class="fa-solid fa-trash delete-icon"></i>
                        </div>
                    </div>
        `;

    return html;

}


////call createElement func when you click button add
btns.forEach(btn => btn.addEventListener('click', function () {

    const taskMenu = btn.closest('.min-container').querySelector('.tasks');

    const html = createElement();


    //insert task in the menu
    taskMenu.insertAdjacentHTML('beforeend', html);

    //add title to task (not stated / progress / finished) 
    taskMenu.lastElementChild.setAttribute('type', `${taskMenu.getAttribute('title')}`);

    //make this element read only
    taskMenu.lastElementChild.querySelector('input').setAttribute('readonly', 'ture');


    //push the last task in the task arr
    myTasks.push(taskMenu.lastElementChild);

    //call func to drag and drop
    dragitem();

    dragitemMobile();

    //call local storage function
    setLocalStorage();



}));


/////////////////////////////////////////function when click trash and modfiy button////////////////////
const trashAndModfiy = function (e) {

    e.preventDefault();
    ////handel task delete button
    if (e.target.classList.contains('delete-icon')) {
        const desiredTask = e.target.closest('.task');
        //remove from the Dom
        desiredTask.remove();

        //remove from the myTasks arr
        myTasks.forEach(task => {
            if (desiredTask.getAttribute('task-num') === task.getAttribute('task-num')) {
                myTasks.splice(task.getAttribute('task-num') - 1, 1);
            };
        })

        //decrease the number of tasks
        numTasks--;

        //set local storage again
        setLocalStorage();


    }

    ////handel modify button
    if (e.target.classList.contains('edit-icon')) {
        desiredTask = e.target.closest('.task');

        //display the input field
        inputField.classList.remove('hidden');


        taskTitle.focus();

    }
}

//////////////////////////////////////////////////////////////////////////////////////////////
tasks.forEach((task) => task.addEventListener('click', function (e) {
    trashAndModfiy(e);
}));



////event close input field
exitBtn.addEventListener('click', function () {
    ////display head user write in task
    desiredTask.querySelector('input').value = taskTitle.value;

    ////clear value of input field
    taskTitle.value = '';

    ///hide inputField
    inputField.classList.add('hidden');

    //set change to local storage
    setLocalStorage();

})

//////////////////////////////////////////////handel drag and drop for desktop//////////////////
const dragitem = function () {

    let allTasks = document.querySelectorAll('.task')
    allTasks.forEach(draggable => {
        draggable.addEventListener('dragstart', function () {
            drag = draggable;
            draggable.style.opacity = .5;

        })


        draggable.addEventListener('dragend', function (e) {

            drag = null;
            draggable.style.opacity = 100;
        })
    })

    tasks.forEach(taskList => {
        taskList.addEventListener('dragover', function (e) {
            e.preventDefault();

        })
        taskList.addEventListener('dragleave', function (e) {
            e.preventDefault();

        })
        taskList.addEventListener('drop', function (e) {
            e.preventDefault();

            //change type of task when you drop it 
            drag.setAttribute('type', `${taskList.getAttribute('title')}`)

            setLocalStorage();

            this.append(drag);
        })
    })

}

//////////////////////////////////////////////handel drag and drop for mobile//////////////////
const dragitemMobile = function () {
    let allTasks = document.querySelectorAll('.task');
    allTasks.forEach(dragElement => {
        let touchX, touchY, currentX, currentY;
        // Initialize variables to track the position of the touch

        // Add event listeners for touchstart, touchmove, and touchend
        dragElement.addEventListener('touchstart', function (event) {
            // Prevent default touch behavior
            event.preventDefault();

            //handle delete and modfiy btns
            if (event.target.classList.contains('delete-icon')) {
                trashAndModfiy(event);
                return;
            };
            if (event.target.classList.contains('edit-icon')) {
                trashAndModfiy(event);
                return;
            };


            // Get the initial touch position
            touchX = event.touches[0].pageX;
            touchY = event.touches[0].pageY;



            // Store the current position of the drag element
            let rect = dragElement.getBoundingClientRect();
            currentX = rect.left;
            currentY = rect.top;

        });


        // Add a touchmove event listener to the document
        dragElement.addEventListener('touchmove', e => {
            // Prevent the default behavior of touchmove
            e.preventDefault();


        });


        dragElement.addEventListener('touchend', function (event) {
            event.preventDefault();


            let touches = event.changedTouches; // Retrieve the changedTouches array
            let lastTouch = touches[touches.length - 1]; // Retrieve the last touch point in the array
            let x = lastTouch.clientX; // Retrieve the x coordinate
            let y = lastTouch.clientY; // Retrieve the y coordinate

            // console.log(event.target.closest('.task'));
            tasks.forEach(taskList => {
                let dropRect = taskList.getBoundingClientRect();

                if (x >= dropRect.left && x <= dropRect.right && y >= dropRect.top && y <= dropRect.bottom) {

                    event.target.closest('.task').setAttribute('type', `${taskList.getAttribute('title')}`)

                    setLocalStorage();

                    taskList.append(event.target.closest('.task'));

                }
            })

        })
    });

}
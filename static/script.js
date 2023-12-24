document.addEventListener('DOMContentLoaded', function () {
    var createTaskButton = document.querySelector('.create-task');
    var taskList = document.querySelector('.task-list');

    // Function to add a task to the list
    function addTask(taskText, completed) {
        var taskElement = document.createElement('div');
        taskElement.className = 'task';

        var taskTextElement = document.createElement('span');
        taskTextElement.textContent = taskText;

        var cancelIconElement = document.createElement('span');
        cancelIconElement.className = 'material-symbols-outlined cancel-icon';
        cancelIconElement.textContent = 'cancel';

        // Set the 'completed' class based on the completed parameter
        if (completed) {
            taskElement.classList.add('completed');
        }

        // Click event listener for each task element
        taskElement.addEventListener('click', function () {
            // Toggle the 'completed' class on the clicked task
            taskElement.classList.toggle('completed');

            // Make an AJAX request to the Flask server to update the task status
            fetch('/update_task', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: 'task_data=' + encodeURIComponent(taskText) +
                    '&completed=' + taskElement.classList.contains('completed'),
            })
                .then(response => response.json())
                .then(data => {
                    // Handle the response if needed
                    console.log('Server response:', data);
                });
        });

        // Click event listener for the cancel icon
        cancelIconElement.addEventListener('click', function (event) {
            event.stopPropagation();  // Prevent the taskElement click event from firing

            // Remove the task from the DOM
            taskList.removeChild(taskElement);

            // Make an AJAX request to the Flask server to delete the task
            fetch('/delete_task', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: 'task_data=' + encodeURIComponent(taskText),
            })
                .then(response => response.json())
                .then(data => {
                    // Handle the response if needed
                    console.log('Server response:', data);
                });
        });

        taskElement.appendChild(taskTextElement);
        taskElement.appendChild(cancelIconElement);

        taskList.appendChild(taskElement);
    }

    // Click event listener for the "create task" button
    createTaskButton.addEventListener('click', function () {
        var taskText = prompt('Enter task name:');
        if (taskText) {
            // Make an AJAX request to the Flask server to save the new task
            fetch('/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: 'task_data=' + encodeURIComponent(taskText),
            })
                .then(response => response.json())
                .then(data => {
                    // Handle the response if needed
                    console.log('Server response:', data);

                    // Add the task to the front-end task list with the completed status
                    addTask(taskText, false);
                });
        }
    });

    // Load existing tasks from the server
    fetch('/tasks')
        .then(response => response.json())
        .then(tasks => {
            tasks.forEach(task => {
                addTask(task.taskText, task.completed);
            });
        });
});
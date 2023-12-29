document.addEventListener('DOMContentLoaded', function () {
    var createTaskButton = document.querySelector('.create-task');
    var taskList = document.querySelector('.task-list');

    createTaskButton.addEventListener('click', function () {
        var taskText = prompt('Enter task name:');
        if (taskText) {
            var formData = new URLSearchParams();
            formData.append('task_data', taskText);

            fetch('/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData,
            })
            .then(response => response.json())
            .then(data => {
                console.log('Server response:', data);
                addTask(taskText, false);
            });
        }
    });

    function addTask(taskText, completed) {
        var taskElement = document.createElement('div');
        taskElement.className = 'task';

        var taskTextElement = document.createElement('span');
        taskTextElement.textContent = taskText;

        var cancelIconElement = document.createElement('span');
        cancelIconElement.className = 'material-symbols-outlined cancel-icon';
        cancelIconElement.textContent = 'cancel';

        if (completed) {
            taskElement.classList.add('completed');
        }

        taskElement.addEventListener('click', function () {
            taskElement.classList.toggle('completed');
            updateTaskStatus(taskText, taskElement.classList.contains('completed'));
        });

        function updateTaskStatus(taskText, completed) {
            fetch('/update_task', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: 'task_data=' + encodeURIComponent(taskText) +
                    '&completed=' + completed,
            })
                .then(response => response.json())
                .then(data => {
                    console.log('Server response:', data);
                });
        }

        function deleteTask(taskText) {
            fetch('/delete_task', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: 'task_data=' + encodeURIComponent(taskText),
            })
                .then(response => response.json())
                .then(data => {
                    console.log('Server response:', data);
                });
        }

        cancelIconElement.addEventListener('click', function (event) {
            event.stopPropagation();
            deleteTask(taskText);
            taskList.removeChild(taskElement);
        });

        taskElement.appendChild(taskTextElement);
        taskElement.appendChild(cancelIconElement);
        taskList.appendChild(taskElement);
    }

    fetch('/tasks')
        .then(response => response.json())
        .then(tasks => {
            tasks.forEach(task => {
                addTask(task.taskText, task.completed);
            });
        });
});
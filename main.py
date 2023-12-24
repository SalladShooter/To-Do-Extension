from flask import Flask, render_template, request, jsonify
import json

app = Flask(__name__)

# Path to the JSON file to store tasks
JSON_FILE_PATH = 'database/data.json'

def load_tasks():
    try:
        with open(JSON_FILE_PATH, 'r') as file:
            tasks = json.load(file)
    except FileNotFoundError:
        tasks = {'tasks': []}  # Initialize tasks as a dictionary with a 'tasks' key
    return tasks.get('tasks', [])  # Return the 'tasks' key or an empty list if it doesn't exist

def save_tasks(tasks):
    with open(JSON_FILE_PATH, 'w') as file:
        json.dump({'tasks': tasks}, file)  # Save tasks as a dictionary with a 'tasks' key

@app.route('/tasks', methods=['GET'])
def get_tasks():
    tasks = load_tasks()
    return jsonify(tasks)

@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        task_data = request.form.get('task_data')
        if task_data:
            tasks = load_tasks()
            tasks.append({'taskText': task_data, 'completed': False})
            save_tasks(tasks)
            return jsonify({'status': 'success', 'message': 'Task added'})

    tasks = load_tasks()
    return render_template('index.html', tasks=tasks)

@app.route('/delete_task', methods=['POST'])
def delete_task():
    task_data = request.form.get('task_data')
    if task_data:
        tasks = load_tasks()
        if task_data in [task['taskText'] for task in tasks]:
            tasks = [task for task in tasks if task['taskText'] != task_data]
            save_tasks(tasks)
            return jsonify({'status': 'success', 'message': 'Task deleted'})

    return jsonify({'status': 'error', 'message': 'Task not found'})

@app.route('/update_task', methods=['POST'])
def update_task():
    task_data = request.form.get('task_data')
    completed = request.form.get('completed') == 'true'
    if task_data:
        tasks = load_tasks()
        for task in tasks:
            if task['taskText'] == task_data:
                task['completed'] = completed
                save_tasks(tasks)
                return jsonify({'status': 'success', 'message': 'Task updated'})

    return jsonify({'status': 'error', 'message': 'Task not found'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
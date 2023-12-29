from flask import Flask, render_template, request, jsonify
import json
import os
import logging

app = Flask(__name__)

logging.basicConfig(level=logging.INFO)

def get_replit_username():
    username = os.environ['REPL_OWNER']
    logging.info(f"Retrieved username: {username}")
    return username

def get_json_file_path(username):
    return f'database/{username}_data.json'

def load_tasks(username):
    json_file_path = get_json_file_path(username)
    try:
        with open(json_file_path, 'r') as file:
            tasks = json.load(file)
    except FileNotFoundError:
        tasks = {'tasks': []}
    return tasks.get('tasks', [])

def save_tasks(username, tasks):
    json_file_path = get_json_file_path(username)
    with open(json_file_path, 'w') as file:
        json.dump({'tasks': tasks}, file) 

@app.route('/tasks', methods=['GET'])
def get_tasks():
    username = get_replit_username()
    tasks = load_tasks(username)
    return jsonify(tasks)

@app.route('/', methods=['GET', 'POST'])
def index():
    logging.info(f"Request method: {request.method}")
    username = get_replit_username()

    if request.method == 'POST':
        task_data = request.form.get('task_data')
        if task_data:
            tasks = load_tasks(username)
            tasks.append({'taskText': task_data, 'completed': False})
            save_tasks(username, tasks)
            return jsonify({'status': 'success', 'message': 'Task added'})

    tasks = load_tasks(username)
    return render_template('index.html', tasks=tasks)

@app.route('/delete_task', methods=['POST'])
def delete_task():
    username = get_replit_username()
    task_data = request.form.get('task_data')
    if task_data:
        tasks = load_tasks(username)
        if task_data in [task['taskText'] for task in tasks]:
            tasks = [task for task in tasks if task['taskText'] != task_data]
            save_tasks(username, tasks)
            return jsonify({'status': 'success', 'message': 'Task deleted'})

    return jsonify({'status': 'error', 'message': 'Task not found'})

@app.route('/update_task', methods=['POST'])
def update_task():
    username = get_replit_username()
    task_data = request.form.get('task_data')
    completed = request.form.get('completed') == 'true'
    if task_data:
        tasks = load_tasks(username)
        for task in tasks:
            if task['taskText'] == task_data:
                task['completed'] = completed
                save_tasks(username, tasks)
                return jsonify({'status': 'success', 'message': 'Task updated'})

    return jsonify({'status': 'error', 'message': 'Task not found'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)

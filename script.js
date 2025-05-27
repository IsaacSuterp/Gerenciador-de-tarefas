document.addEventListener('DOMContentLoaded', () => {
    // --- SELETORES DO DOM ---
    const addTaskForm = document.getElementById('add-task-form');
    const taskInput = document.getElementById('task-input');
    const taskPriority = document.getElementById('task-priority');
    const taskDueDate = document.getElementById('task-due-date');
    const taskList = document.getElementById('task-list');
    const searchInput = document.getElementById('search-input');
    const filterButtons = document.querySelectorAll('.filter-btn');

    let currentFilter = 'todas';

    // --- FUNÇÕES DE DADOS (localStorage) ---
    const getTasks = () => {
        return JSON.parse(localStorage.getItem('tasks')) || [];
    };

    const saveTasks = (tasks) => {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    };

    // --- FUNÇÃO PRINCIPAL DE RENDERIZAÇÃO ---
    const renderTasks = () => {
        const tasks = getTasks();
        taskList.innerHTML = '';

        // Aplicar filtro de busca e de status
        const filteredTasks = tasks.filter(task => {
            const matchesSearch = task.name.toLowerCase().includes(searchInput.value.toLowerCase());
            if (currentFilter === 'pendentes') return !task.completed && matchesSearch;
            if (currentFilter === 'concluidas') return task.completed && matchesSearch;
            return matchesSearch; // Filtro "todas"
        });

        if (filteredTasks.length === 0) {
            taskList.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">Nenhuma tarefa encontrada.</p>';
            return;
        }

        filteredTasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `task-item ${task.completed ? 'completed' : ''} priority-${task.priority}`;
            li.dataset.id = task.id;

            const formattedDueDate = task.dueDate ? new Date(task.dueDate + 'T00:00:00').toLocaleDateString('pt-BR') : '';

            li.innerHTML = `
                <div class="task-info">
                    <span class="task-name">${task.name}</span>
                    ${formattedDueDate ? `<span class="task-due-date"><i class="fa-solid fa-calendar-days"></i> ${formattedDueDate}</span>` : ''}
                </div>
                <div class="task-actions">
                    <button class="btn-complete" title="Marcar como concluída">
                        <i class="fa-solid ${task.completed ? 'fa-circle-xmark' : 'fa-circle-check'}"></i>
                    </button>
                    <button class="btn-edit" title="Editar tarefa"><i class="fa-solid fa-pencil"></i></button>
                    <button class="btn-delete" title="Excluir tarefa"><i class="fa-solid fa-trash"></i></button>
                </div>
            `;
            taskList.appendChild(li);
        });
    };

    // --- FUNÇÕES DE MANIPULAÇÃO DE TAREFAS ---
    const addTask = (e) => {
        e.preventDefault();
        const taskName = taskInput.value.trim();
        if (!taskName) {
            alert('Por favor, insira o nome da tarefa.');
            return;
        }

        const newTask = {
            id: Date.now(),
            name: taskName,
            priority: taskPriority.value,
            dueDate: taskDueDate.value,
            completed: false,
        };

        const tasks = getTasks();
        tasks.push(newTask);
        saveTasks(tasks);
        
        addTaskForm.reset();
        taskInput.focus();
        renderTasks();
    };
    
    const handleTaskAction = (e) => {
        const target = e.target.closest('button');
        if (!target) return;

        const li = target.closest('.task-item');
        const taskId = Number(li.dataset.id);

        if (target.classList.contains('btn-delete')) {
            deleteTask(taskId);
        } else if (target.classList.contains('btn-complete')) {
            toggleComplete(taskId);
        } else if (target.classList.contains('btn-edit')) {
            editTask(li, taskId);
        }
    };
    
    const deleteTask = (id) => {
        if (!confirm('Tem certeza que deseja excluir esta tarefa?')) return;
        
        let tasks = getTasks();
        tasks = tasks.filter(task => task.id !== id);
        saveTasks(tasks);
        renderTasks();
    };

    const toggleComplete = (id) => {
        let tasks = getTasks();
        const task = tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            saveTasks(tasks);
            renderTasks();
        }
    };
    
    const editTask = (li, id) => {
        const taskNameSpan = li.querySelector('.task-name');
        const currentName = taskNameSpan.textContent;

        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentName;
        input.className = 'edit-input';
        
        taskNameSpan.replaceWith(input);
        input.focus();

        const saveEdit = () => {
            const newName = input.value.trim();
            if (newName) {
                let tasks = getTasks();
                const task = tasks.find(t => t.id === id);
                if (task) {
                    task.name = newName;
                    saveTasks(tasks);
                }
            }
            renderTasks(); // Re-renderiza para restaurar a estrutura original
        };

        input.addEventListener('blur', saveEdit);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                saveEdit();
            }
        });
    };
    
    // --- EVENT LISTENERS ---
    addTaskForm.addEventListener('submit', addTask);
    taskList.addEventListener('click', handleTaskAction);
    searchInput.addEventListener('input', renderTasks);
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentFilter = button.dataset.filter;
            renderTasks();
        });
    });

    // --- INICIALIZAÇÃO ---
    renderTasks();
});

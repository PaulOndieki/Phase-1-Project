// Load EmailJS library
emailjs.init('oz66B3hlvG-1qQFAv');

document.addEventListener('DOMContentLoaded', () => {
  const themeToggleBtn = document.querySelector('#theme-toggle');
  const moodButtons = document.querySelectorAll('.mood-btn');
  const selectedMoodDisplay = document.querySelector('#selected-mood');
  const quoteDisplay = document.querySelector('#quote-display');
  const todoForm = document.querySelector('#todo-form');
  const todoInput = document.querySelector('#todo-input');
  const todoList = document.querySelector('#todo-list');
  const progressBar = document.querySelector('#progress-bar');
  const tipDisplay = document.querySelector('#tip-display');
  const newTipBtn = document.querySelector('#new-tip');
  const startTimerBtn = document.querySelector('#start-timer');
  const pauseTimerBtn = document.querySelector('#pause-timer');
  const resumeTimerBtn = document.querySelector('#resume-timer');
  const resetTimerBtn = document.querySelector('#reset-timer');
  const timerDisplay = document.querySelector('#timer-display');

  const quotesByMood = {
    happy: ["Smile, it’s a good day!", "Celebrate small wins!", "Spread joy like confetti!"],
    stressed: ["Breathe. Reset. Restart.", "You are stronger than your stress.", "Take it one step at a time."],
    tired: ["Rest is productive.", "Recharge and come back stronger.", "You've done enough for today."],
    default: ["Keep pushing forward!", "Believe in yourself!", "One step at a time."]
  };

  const codingTips = [
    "Use meaningful variable names.",
    "Break code into reusable functions.",
    "Always keep your code DRY.",
    "Use version control (like Git).",
    "Comment the 'why', not the 'what'."
  ];

  const TODOS_API = 'http://localhost:3000/todos';

  let currentMood = null;
  let todos = [];
  let timer = null;
  let timerSeconds = 25 * 60;
  let remainingSeconds = timerSeconds;

  // Theme
  themeToggleBtn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    document.documentElement.setAttribute('data-theme', current === 'dark' ? 'light' : 'dark');
  });

  // Mood
  moodButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const mood = btn.dataset.mood;
      currentMood = mood;
      selectedMoodDisplay.textContent = `Mood: ${mood}`;
      showMotivationalQuote(mood);
    });
  });

  async function showMotivationalQuote(mood) {
    try {
      const res = await fetch('https://programming-quotes-api.herokuapp.com/quotes/random');
      const data = await res.json();
      const fallback = quotesByMood[mood] || quotesByMood.default;
      quoteDisplay.textContent = data.en || fallback[Math.floor(Math.random() * fallback.length)];
    } catch (error) {
      const fallback = quotesByMood[mood] || quotesByMood.default;
      quoteDisplay.textContent = fallback[Math.floor(Math.random() * fallback.length)];
    }
  }

  // To-Do
  todoForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = todoInput.value.trim();
    if (!text) return;

    const newTodo = { text, completed: false };
    try {
      const res = await fetch(TODOS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTodo)
      });
      const created = await res.json();
      todos.push(created);
      renderTodos();
      todoInput.value = '';
    } catch (error) {
      console.error("Error adding todo:", error);
    }
  });

  async function fetchTodos() {
    try {
      const res = await fetch(TODOS_API);
      todos = await res.json();
      renderTodos();
    } catch (error) {
      console.error("Error fetching todos:", error);
    }
  }

  async function toggleTodoCompletion(id, completed) {
    try {
      await fetch(`${TODOS_API}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed })
      });
      todos = todos.map(todo => todo.id === id ? { ...todo, completed } : todo);
      renderTodos();
    } catch (error) {
      console.error("Error updating todo:", error);
    }
  }

  async function deleteTodo(id) {
    try {
      await fetch(`${TODOS_API}/${id}`, { method: 'DELETE' });
      todos = todos.filter(todo => todo.id !== id);
      renderTodos();
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  }

  function renderTodos() {
    todoList.innerHTML = '';
    todos.forEach(todo => {
      const li = document.createElement('li');
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = todo.completed;
      checkbox.addEventListener('change', () => toggleTodoCompletion(todo.id, checkbox.checked));

      const span = document.createElement('span');
      span.textContent = todo.text;
      if (todo.completed) span.classList.add('completed');

      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = '❌';
      deleteBtn.addEventListener('click', () => deleteTodo(todo.id));

      li.appendChild(checkbox);
      li.appendChild(span);
      li.appendChild(deleteBtn);
      todoList.appendChild(li);
    });

    const completed = todos.filter(t => t.completed).length;
    const progress = todos.length ? (completed / todos.length) * 100 : 0;
    progressBar.style.width = `${progress}%`;
  }

  // Tips
  function showRandomTip() {
    const tip = codingTips[Math.floor(Math.random() * codingTips.length)];
    tipDisplay.textContent = tip;
  }

  newTipBtn.addEventListener('click', showRandomTip);

  // Timer
  function updateTimerDisplay(seconds) {
    const m = String(Math.floor(seconds / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    timerDisplay.textContent = `${m}:${s}`;
  }

  startTimerBtn.addEventListener('click', () => {
    if (timer) return;
    remainingSeconds = timerSeconds;
    runTimer();
  });

  pauseTimerBtn.addEventListener('click', () => {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  });

  resumeTimerBtn.addEventListener('click', () => {
    if (!timer && remainingSeconds > 0) {
      runTimer();
    }
  });

  resetTimerBtn.addEventListener('click', () => {
    clearInterval(timer);
    timer = null;
    remainingSeconds = timerSeconds;
    updateTimerDisplay(timerSeconds);
  });

  function runTimer() {
    updateTimerDisplay(remainingSeconds);
    timer = setInterval(() => {
      remainingSeconds--;
      updateTimerDisplay(remainingSeconds);
      if (remainingSeconds <= 0) {
        clearInterval(timer);
        timer = null;
        alert("Pomodoro complete! Take a break.");
        updateTimerDisplay(timerSeconds);
      }
    }, 1000);
  }

  // Report Sending
  document.querySelector('#send-report').addEventListener('click', () => {
    const em = document.querySelector('#report-email').value;
    if (!em || !em.includes('@')) {
      alert('Please enter a valid email.');
      return;
    }

    const moodText = currentMood ? `Current mood: ${currentMood}` : 'No mood selected.';
    const completed = todos.filter(t => t.completed).length;
    const pending = todos.length - completed;
    const taskSummary = `Total tasks: ${todos.length}\nCompleted: ${completed}\nPending: ${pending}`;
    const reportText = `${moodText}\n\n${taskSummary}`;

    emailjs.send('gmail_service', 'template_516q1hh', {
      user_email: em,
      report: reportText
    })
    .then(() => alert("Report sent! 🎉"))
    .catch(err => {
      console.error(err);
      alert("Failed to send report.");
    });
  });

  // Init
  fetchTodos();
  showRandomTip();
  updateTimerDisplay(timerSeconds);
});

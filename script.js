// Selecting DOM elements
const inputFieldEl = document.querySelector("#inputField");
const btn = document.getElementById("btn");
const toDoList = document.querySelector("#todoList");
const doneBtn = document.getElementById("doneBtn");

// Initial state of the application
const state = {
  todos: [],
  filter: "All", // Default filter setting
};

// Function to render the todo list based on current state
function render() {
  // Clear existing todo list
  toDoList.innerHTML = "";

  // Filter todos based on the current filter state
  let filteredTodos = state.todos;
  if (state.filter === "Active") {
    filteredTodos = state.todos.filter((todo) => !todo.done);
  } else if (state.filter === "Completed") {
    filteredTodos = state.todos.filter((todo) => todo.done);
  }

  // Create DOM elements for each filtered todo item
  filteredTodos.forEach((note) => {
    const li = document.createElement("li");

    // Create checkbox for todo item
    const checkBox = document.createElement("input");
    checkBox.type = "checkbox";
    checkBox.checked = note.done;
    checkBox.id = "checkbox-" + note.id; // Unique ID for checkbox

    // Create label for todo item description
    const label = document.createElement("label");
    label.htmlFor = checkBox.id;
    label.textContent = note.description;

    // Append checkbox and label to list item
    li.appendChild(checkBox);
    li.appendChild(label);
    toDoList.appendChild(li);

    // Event listener for checkbox change (marking todo as done/undone)
    checkBox.addEventListener("change", async () => {
      note.done = !note.done; // Toggle done status
      await fetch("http://localhost:4730/todos/" + note.id, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(note),
      }); // Save state to API
      render(); // Re-render todo list
    });
  });
}

// Event listener for form submission (adding new todo)
document
  .getElementById("todoForm")
  .addEventListener("submit", async (event) => {
    event.preventDefault();

    const inputField = inputFieldEl.value.trim();

    // Check for duplicate todos
    const found = state.todos.find(
      (element) => element.description === inputField
    );
    if (inputField === "" || found !== undefined) return;

    // Add new todo to state
    const newTodo = {
      description: inputField,
      done: false,
    };

    await saveTodosToAPI(newTodo); // Save state to API
    render(); // Render updated todo list automatically

    inputFieldEl.value = ""; // Clear input field
  });

// Function to save current state to the API
async function saveTodosToAPI(todo) {
  const response = await fetch("http://localhost:4730/todos", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(todo),
  });

  const data = await response.json();
  state.todos.push(data);
  console.log("Todos saved to API:", data);
}

// Function to load todos from API on application startup
async function loadTodosFromAPI() {
  const response = await fetch("http://localhost:4730/todos", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();
  state.todos = data; // Update state with fetched todos
  render(); // Render todos on UI
}

// Event listener for 'Delete Done Todos' button
doneBtn.addEventListener("click", async (event) => {
  event.preventDefault();

  // Filter out completed todos
  const completedTodos = state.todos.filter((note) => note.done);

  // Delete each completed todo from the API
  for (const todo of completedTodos) {
    await deleteTodoFromAPI(todo.id);
  }

  // Remove completed todos from local state
  state.todos = state.todos.filter((note) => !note.done);

  render(); // Re-render todo list
});

// Function to delete a todo from API
async function deleteTodoFromAPI(id) {
  const url = "http://localhost:4730/todos/" + id; // URL for DELETE request
  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });
}

// Event listeners for radio buttons (filtering todos)
document.querySelectorAll('input[name="tasks"]').forEach((radio) => {
  radio.addEventListener("change", (event) => {
    state.filter = event.target.value; // Update filter state
    render(); // Re-render todo list based on new filter
  });
});

// Initialize the application
loadTodosFromAPI(); // Load todos from API

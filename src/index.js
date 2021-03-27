const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(user => user.username === username);

  if(!user) {
    return response.status(404).json({ error: "username not found!"})
  }

  request.user = user;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const verifyUser = users.find(user => user.username === username);

  if(verifyUser) {
    return response.status(400).json({ error: "username already exists"})
  }

  const user1 = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(user1);

  return response.status(201).json(user1);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;

  const { user } = request;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
   const { id } = request.params;
   const { title, deadline } = request.body;

   const { user } = request;

   const verifytodo = user.todos.find(todo => todo.id === id);

   if(!verifytodo) {
      return response.status(404).json({ error: "todo not exists!"})
   }

   verifytodo.title = title;
   verifytodo.deadline = new Date(deadline);

   return response.json(verifytodo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;

  const { user } = request;

  const verifytodo = user.todos.find(todo => todo.id === id);

  if(!verifytodo) {
    return response.status(404).json({ error: "todo not exists!"})
  }

  verifytodo.done = true;

  return response.json(verifytodo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;

  const { user } = request;

  const verifytodo = user.todos.findIndex(todo => todo.id === id);

  if(verifytodo === -1) {
    return response.status(404).json({ error: "todo not exists!"})
  }

  user.todos.splice(verifytodo, 1);

  return response.status(204).send();
});

module.exports = app;
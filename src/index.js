const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());

app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(user => user.username === username)

  if(!user){
    return response.status(400).json({error : "Username didn't exist"})
  }

  request.user = user;

  return next()
}

app.post('/users',(request, response) => {
  const {name , username} = request.body;

  const UserAlreadyExist = users.find(user => user.username === username)

  if(UserAlreadyExist){
    return response.status(400).json({error: "User already exists"})
  }

  users.push({
    name,
    username,
    uuid: uuidv4(),
    todos: []
  })

  return response.status(201).send();
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  const { title, done, deadline} = request.body

  user.todos.push({ 
    id: uuidv4(),
    title,
    done, 
    deadline: new Date(deadline),
    created_at: new Date()
  })

  return response.status(201).send()
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;
  const { id } = request.params;

  const selectedTodo = user.todos.find(todo => todo.id === id)

  if (!selectedTodo){
    return response.status(400).json({error: "This todo doesn't exist"});
  }

  selectedTodo.title = title

  selectedTodo.deadline = new Date(deadline)

  return response.json(selectedTodo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const todo = user.todos.find(todo => todo.id === id);

  if (!todo){
    return response.status(400).json({error: "This todo doesn't exist"});
  }

  todo.done = "done";

  return response.status(200).json(todo)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.findIndex(todo => todo.id === id)

  if (todo < 0){
    return response.status(400).json({error: "This todo doesn't exist"});
  }

  user.todos.splice(todo, 1)

  return response.status(200).json({success: "O plano foi deletado com sucesso"})
});

module.exports = app;
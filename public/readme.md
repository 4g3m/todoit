**Assumptions**

Main Components
1. Todo List Page
2. Modal

Milestone 2: a Todo list with due dates and the ability to mark todos as complete

After a todo is created, you can click on it which will bring up a modal that shows details of the todo. Here you can add a due date for the todo after you click on "save," it should close the modal, save the todo and reflect any changes in the DOM. For example, if the todo's name is "buy some milk" and it's due on 08/20/2016, show it as "buy some milk - 08/16".

In the details modal of a todo, have a button to mark this todo as complete. Once clicked, this should close the modal, and show the todo as completed with a strike-through.

all completed tasks should be at the bottom of the todo list.


## Classes

------------
#### Todo App
   * State:
    * Todo Manager object
    * Display object
   * Methods
    * init
   * Tasks
    * gets initial todos from server
    * renders them onto server webpage displayed

#### Display
   * Grab all templates and render them onto browser
   * Update templates when necessary

#### TodoList
   * Contains all todos
   * State
      * name (e.g. completed)

#### Todo
   * Handle all Todo Objects
   * State:
      * Title
      * Day Due
      * Month Due
      * Year Due
      * Description
      * Completed
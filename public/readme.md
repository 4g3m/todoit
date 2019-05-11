**Assumptions**

Main Components
1. Todo List Page
2. Modal

Milestone 1: a Todo list (focus on the right panel)

* You can click on "+ Add new to do" to bring up the modal to create a new todo
* You can delete a todo (we'll do "mark as complete" later) using the trash can icon.
* The number after on the top of the right panel should reflect the total number of todos.
### Classes

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
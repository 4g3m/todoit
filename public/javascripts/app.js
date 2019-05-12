var test;

$(function() {
  class TodoApp {
    constructor(){
      this.lists = {};
      this.lists['all'] = new TodoList('All Todos')
      this.lists['completed'] = new TodoList('Completed')
      this.display = null;
      this.context = {selected: this.lists.all.todos, current_section: {title: this.lists.all.name, data: this.lists.all.length}, done: [], todos: [], todos_by_date: {}, done_todos_by_date: {}, };
      this.getTodos();
    }

    updateCurrentSection(list) {
      const obj = this.context['current_section']
      obj.title = list.name
      obj.data = list.length
    } //context updater

    refreshSidebarLists(todos=this.lists.all.todos){
      var done = {};
      var notDone = {};
      var self = this;

      var addCompletedTodo = function(todo) {
          var date;
          if (todo.month && todo.year) {
            date = `${todo.month}/${todo.year}`
            if (!done.hasOwnProperty(date)) {
               var list = new TodoList(date)
               list.addTodo(todo)
               done[date] = list
            } else {
              done[date].addTodo(todo)
            }
          } else {
            if (!done.hasOwnProperty('No Due Date')) {
               var list = new TodoList('No Due Date')
               list.addTodo(todo)
               done['No Due Date'] = list
            } else {
              done['No Due Date'].addTodo(todo)
            }
          }
       }
      var addGeneralTodo = function(todo){
          var date;
          if (todo.month && todo.year) {
            date = `${todo.month}/${todo.year}`
            if (!notDone.hasOwnProperty(date)) {
               var list = new TodoList(date)
               list.addTodo(todo)
               notDone[date] = list
            } else {
              notDone[date].addTodo(todo)
            }
          } else {
            if (!notDone.hasOwnProperty('No Due Date')) {
               var list = new TodoList('No Due Date')
               list.addTodo(todo)
               notDone['No Due Date'] = list
            } else {
              notDone['No Due Date'].addTodo(todo)
            }
          }
      }

      todos.forEach((todo) => {
        if (todo.completed) {addCompletedTodo(todo)};
        addGeneralTodo(todo)
      })

      self.context['done_todos_by_date'] = done
      self.context['todos_by_date'] = notDone
    } //context updater

    updateSelected(list) {
      this.context.selected = list.todos
    } //context updater

    addContext(todo) {
      var self = this

      self.lists.all.addTodo(todo)
      self.context.todos.push(todo)
      if (todo.completed) {
          self.lists.completed.addTodo(todo)
          self.context.done.push(todo)
      }

      self.refreshSidebarLists()
    } //context updater

    refreshDisplay(context=this.context, list=this.lists.all) {
      const self = this;
      self.refreshSidebarLists()
      self.updateCurrentSection(list)
      self.updateSelected(list)
      self.display.refreshMain(context)
    }

    findList(name, title){
      switch (name) {
        case 'All Lists':
          return this.lists.all
        case 'Completed':
          return this.lists.completed
      }

      var list = title === 'Completed'  ? this.context['done_todos_by_date'] : this.context['todos_by_date']
      return list[name]
    } // fetches List

    formToJSON(form) {
        const obj = {};
        const data = $(form).serializeArray()
        $(data).each(function(idx, inputObj) {
            var name = inputObj.name;
            if (name.includes('due_')) {name = name.replace(/due_/, '')}
            var val = inputObj.value;
            let invalidVal = ['day', 'month', 'year'].includes(val.toLowerCase())
            if (invalidVal) {val = ''}
            obj[name] = val;
        });
        return obj;
    }

    objToTodoArgs(obj){
      const {id, title, day, month, year, completed, description} = obj
      const arr = [id, title, day, month, year, completed, description]
      return arr;
    }

    getTodos(){
      var self = this
      $.ajax({
        url: '/api/todos',
        method: 'GET',
        dataType: 'json',
        success: function(json, respText, xhr) {
          var todos = json;
          json.forEach((todo) => {
            let args = self.objToTodoArgs(todo)
            var todo = new Todo(...args)
            self.addContext(todo)
          });

          self.updateCurrentSection(self.lists.all)
          self.display = new Display(self.context)
          $("#all_header").addClass('active')
        },
      });
    } // loads at beginning to fetch all todos on database.

    newTodo(data) {
      var self = this

      var name = $('div#items time').text()
      var title = $('.active').closest('section').attr('class') === 'completed' ? 'Completed' : 'All Todos'

        $.ajax({
            url: '/api/todos',
            method: 'POST',
            data: data,
            dataType: 'json',
            success: function(json, statusText, xhr) {
              if (xhr.status === 201) {
                var vals = self.objToTodoArgs(json)
                let todo = new Todo(...vals)
                self.addContext(todo)
                self.display.renderForm(true)
                self.refreshDisplay(undefined, self.findList(name, title))
              }
            },
          });
    }

    updateTodo(id, data) {
      var self = this;
      var todo = self.lists.all.findTodo(id);

      var name = $('div#items time').text()
      var title = $('.active').closest('section').attr('class') === 'completed' ? 'Completed' : 'All Todos'

        $.ajax({
            url: `/api/todos/${id}`,
            method: 'PUT',
            data: data,
            dataType: 'json',
            success: function(json, statusText, xhr) {
              if (xhr.status === 200) {
                self.display.renderEditForm(true)
                todo.update(data)
                self.refreshDisplay(undefined, self.findList(name, title))
              }
            },
          });
    }

    completeTodo(id) {
      var self = this;
      var id = +id;
      var name = $('div#items time').text()
      var title = $('.active').closest('section').attr('class') === 'completed' ? 'Completed' : 'All Todos'

        $.ajax({
            url: `/api/todos/${id}`,
            method: 'PUT',
            data: {completed: true},
            dataType: 'json',
            success: function(json, statusText, xhr) {
              if (xhr.status === 200) {
                console.log(json, 'completed request')
                let todo = self.lists.all.findTodo(+json.id);
                todo.markCompleted()
                self.lists.completed.addTodo(todo)
                self.context.done = self.lists.completed.todos
                self.updateCurrentSection(self.context.selected)
                self.display.markCompleted(id)
                self.display.renderEditForm(true)
                debugger;
                self.refreshDisplay(undefined, self.findList(name, title))
              }
            },
          });
    }

    deleteTodo(id) {
      id = +id
      var self = this
      $.ajax({
        url: `/api/todos/${id}`,
        method: 'DELETE',
        success: function(data, respText, xhr) {
          if (xhr.status === 204) {
            self.lists.all.removeTodo(id)
            self.context.todos = self.context.todos.filter((todo) => todo.id !== id)
            self.context.done = self.context.done.filter((todo) => todo.id !== id)
            self.updateCurrentSection(self.context.selected)
            self.refreshSidebarLists()
            self.refreshDisplay()
          };
        },
      });
    }

 }

  class TodoList {
    constructor(name){
      this.name = name;
      this.todos = [];
      this.length = this.todos.length;
    }

    addTodo(todo) {
      this.todos.push(todo);
      this.sort()
      this.length += 1
      return todo;
    }

    sort(){
      var dateSort = (a, b) => {
        return new Date(a[1], a[0], 1) - new Date(b[1], b[0], 1)
      }

      this.todos.sort((todo1, todo2) =>{
        if (todo1.completed && todo2.completed || !todo1.completed && !todo2.completed) {
          let todo1Date = [todo1.month, todo1.year]
          let todo2Date = [todo2.month, todo2.year]
          return dateSort(todo1Date, todo2Date)
        } else if (todo1.completed && !todo2.completed) {
          return 1
        } else if (!todo1.completed && todo2.completed) {
          return -1
        }
      })
    }

    removeTodo(id) {
      this.todos = this.todos.filter(todo => todo.id !== +id)
      this.sort()
      this.length -= 1;
    }

    findTodo(id) {
      return this.todos.find(t => t.id === id)
    }

    findTodoByTitle(title) {
      return this.todos.find(t => t.title === title)
    }

    getIndex(id) {
      id = +id
      const self = this;
      for (let i = 0; i < self.todos.length; i++) {
        let todo = self.todos[i]
        if (todo.id === id) {return i}
      };
    }
  };

  class Todo {
    constructor(id, title, day, month, year, completed=false, description) {
      if (!id) {throw new Error('Invalid Todo.')}
      this.id = +id
      this.title = title
      this.day = day
      this.month = month
      this.year = year
      this.completed = completed === 'true' || completed === true ? true : false
      this.description = description
    }

    due_date(){
      const date = `${this.month}/${this.year}`
      if (date === '/') {return "No Due Date"}
      return date;
    }

    markCompleted(){
      this.completed = true;
    }

    update(data) {
      for (let prop in data) {
        this[prop] = data[prop]
      }
    }
  }

  class Display {
    constructor(jsonCtx){
      this.registerPartials();
      this.renderMain(jsonCtx);
    }

    registerPartials(){
      const $partialTmpls = $("script[data-type='partial']")
      $partialTmpls.each( (idx, e) => Handlebars.registerPartial(e.id, $(e).html()))
    }

    renderMain(jsonCtx={}){
      const html = $('script#main_template').html()
      var mainTmplFnc = Handlebars.compile(html)
      $(document.body).append(mainTmplFnc(jsonCtx))
    }

    refreshMain(json){
      $(document.body).children(':not(script)').remove()
      this.renderMain(json)
    }

    renderForm(hide=false){
      var $formModal = $('#form_modal')
      var $modalLayer = $('#modal_layer')
      if (hide) {
        $formModal.fadeOut('slow')
        $modalLayer.fadeOut('slow')
        $formModal.trigger('reset')
      } else if (!hide) {
        $modalLayer.fadeIn()
        $formModal.fadeIn()
      }
    }

    populateForm(todoObj) {
      var $inputs = [$('input#title'), $('select#due_day'), $('select#due_month'), $('select#due_year'), $("textarea[name='description']")]
      var [$title, $day, $month, $year, $description] = $inputs
      $title.val(todoObj.title)
      $day.val(todoObj.day)
      $month.val(todoObj.month)
      $year.val(todoObj.year)
      $description.val(todoObj.description)
    }

    renderEditForm(hide=false, todo){
      hide ? this.renderForm(true) : this.renderForm()
    }

    markCompleted(id) {
      var $input = $(`tr[data-id=${id}]`).find('input')
      $input.is(':checked') ? $input.prop("checked", false) : $input.prop("checked", true);
    }
  };

  var app = new TodoApp();
  test = app;

  $(document).on('click', "label[for='new_item']", function(e){
    $('form').trigger('reset')
    $('form').attr('method', 'post').removeAttr('data-id')
    app.display.renderForm();
  });

  $(document).on('click', "#modal_layer", function(e){
    var form = document.querySelector('#form_modal')
    app.display.renderForm(true);
  });

  $(document).on('click', "td.delete", function(e){
    var id = $(this).closest('tr').data('id')
    console.log(id, this)
    app.deleteTodo(+id)
  });

  $(document).on('submit', '#form_modal',function(e){
    e.preventDefault();
    var $form = $('form');
    var data = app.formToJSON($form[0]);

    $form.attr('method').toLowerCase() === 'post' ? app.newTodo(data) : app.updateTodo($form.data('id'), data)
  });

  $(document).on('click', "button[name='complete']", function(e){
    if ($(e.target).closest('form').attr('method').toLowerCase() === 'post') {
      alert('Cannot mark as complete as item has not been created yet!')
      return;
    }
    const data = app.formToJSON($('form')[0]);
    let todo = app.lists.all.findTodo($('form').data('id'))
    app.completeTodo(todo.id)
  })

  $(document).on('click', 'tr td.list_item', function(e){
    e.preventDefault()
    let id = +$(this).closest('tr').data('id')
    let todo = app.lists.all.findTodo(id)

    if (e.target.tagName === 'LABEL') {

      console.log(id, todo, 'edit clicked')

      $('form').attr('method', 'put').attr('data-id', id)
      app.display.populateForm(todo)
      app.display.renderEditForm()
      return;
    }
  }); // edit event

  $(document).on('click', '#sidebar header', function(e){
    var target = e.target
    var listName = $(target).closest('header').data('title')
    $('.active').removeClass('active')
    var id = $(target).closest('section').attr('id')

    app.refreshDisplay(undefined, app.findList(listName))

    var $start = (id === 'all' ? $('section#all') : $('.completed') )
    $start.find('header').addClass('active')
  }); // highlight todo section header

  $(document).on('click', '#sidebar article dl', function(e){
    e.preventDefault()
    e.stopPropagation()

    var target = e.target
    var listName = $(target).closest('dl').data('title')

    var header = $(target).closest('section').find('header').data('title')
    var data = header

    var id = $(target).closest('section').attr('id')
    $('.active').removeClass('active')


    app.refreshDisplay(undefined, app.findList(listName, header))
    var $start = (id === 'all' ? $('section#all') : $('.completed') )
    $start.find(`dl[data-title='${listName}']`).addClass('active')
  })  // highlight todo date

})

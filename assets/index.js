let data = [];

async function init() {
  const res = await fetch("/get-todos");
  const data_ = await res.json();
  data = data_;
  render();


  document.querySelector('.addTodo').addEventListener('keypress', async (e) => {
    const add = e.target.value;
    if (e.key === 'Enter' && add !== '') {
      fetch('/add', {
        body: JSON.stringify({
          title: add,
          completed: false,
        }),
        headers: {
          "Content-Type": "application/json;charset=utf-8",
        },
        method: 'POST',
      });
      const res = await fetch("/get-todos");
      const data_ = await res.json();
      data = data_;
      // data.push({ title: add, completed: false });
      console.log(data);
      e.target.value = '';
      render();
    }
  });

  document.querySelector('.buttonClear').addEventListener('click', () => {
    let clearArray = [];
    for (let i = 0; i < data.length; i++) {
      if (data[i].completed) {
        clearArray.push(data[i]._id);
      }
    }
    fetch('/remove', {
      body: JSON.stringify(clearArray),
      headers: { "Content-Type": "application/json;charset=utf-8", },
      method: 'POST',
    });
    data = data.filter((x) => !x.completed);
    render();
  });

  document.querySelector('.check-all').addEventListener('change', () => {
    const check_all = data.filter((x) => x.completed).length === data.length;
    fetch('/check-all', {
      body: JSON.stringify({ check_all }),
      headers: { "Content-Type": "application/json;charset=utf-8", },
      method: 'POST',
    });
    check_all === false ? data.map((x) => x.completed = true) : data.map((x) => x.completed = false);
    render();
  });

  const setTodoFilter = document.querySelectorAll('.fil');
  for (const filter of setTodoFilter) {
    filter.addEventListener('change', () => {
      render();
    });
  }

  document.querySelector('.search').addEventListener('input', (e) => {
    render();
  });
}

function render() {
  const filter = document.querySelector('.fil:checked');
  const str = document.querySelector('.search').value;
  const re = new RegExp(_.escapeRegExp(str), 'im');
  document.querySelector('.list').innerHTML = data
    .map((item, index) => ({
      todo: item,
      index: index,
    }))
    .filter((y) => filter.value === 'all' ||
      (filter.value === 'completed' && y.todo.completed) ||
      (filter.value === 'uncompleted' && !y.todo.completed))
    .filter((z) =>
      re.test(z.todo.title))
    .map((x) => {
      const titleEscape = _.escape(x.todo.title);
      const title = str !== '' ? titleEscape.replace(re, (c) => `<span style="color: red">${c}</span>`) : titleEscape;
      const check = x.todo.completed ? 'checked' : '';
      return '<div class="item"><input type="checkbox" class="checkbox" id="' +
        x.index + '" value="' +
        x.index + '" ' + check + '/><label for="' +
        x.index + '">' + (x.index + 1) + '. ' + title +
        '</label><button class="remove" value="' + x.index + '">❌</button></div>'
    })
    .join('');

  if (data.filter((x) => x.completed).length === 0) {
    document.querySelector('.buttonClear').style.visibility = 'hidden';
  }
  else {
    document.querySelector('.buttonClear').style.visibility = 'visible';
  }

  document.querySelector('.listTodo').innerHTML = `<span style="color: red">${
    data.filter((x) => !x.completed).length}</span><span style="color: rgb(124, 133, 255)"> дел осталось</span>`;

  const check_all = (data.filter((x) => x.completed).length === data.length) && data.length !== 0;
  if (check_all) {
    document.querySelector('.check-all').checked = true;
  }
  else {
    document.querySelector('.check-all').checked = false;
  }

  const removeTodo = document.querySelectorAll('.remove');
  for (let i = 0; i < removeTodo.length; i++) {
    const remove = removeTodo[i];
    let removeIndex = [];
    removeIndex.push(data[i]._id);
    remove.addEventListener('click', () => {
      fetch('/remove', {
        body: JSON.stringify(removeIndex),
        headers: { "Content-Type": "application/json;charset=utf-8", },
        method: 'POST',
      });
      data.splice(remove.value, 1);
      render();
    });
  }

  const toggleTodo = document.querySelectorAll('.checkbox');
  for (let i = 0; i < toggleTodo.length; i++) {
    const toggle = toggleTodo[i];
    const toggleIndex = toggle.value;
    toggle.addEventListener('change', () => {
      fetch('/toggle', {
        body: JSON.stringify({ number: data[i]._id }),
        headers: { "Content-Type": "application/json;charset=utf-8", },
        method: 'POST',
      });
      data[toggleIndex].completed = !data[toggleIndex].completed;
      render();
    });
  }

}

init();
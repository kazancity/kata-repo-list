const searchField = document.querySelector('.search-field');
const outputField = document.querySelector('.output-field');
const autocomplete = document.querySelector('#autocomplete');

let activeIndex = -1; // индекс активного элемента, -1 = ничего не выбрано
let currentItems = []; // репозитории, отображённые в списке

const debounce = (fn, debounceTime) => {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), debounceTime)
  }
}

const setActive = (index) => {
  activeIndex = index;
  autocomplete.querySelectorAll('.choice').forEach((el, i) => {
    el.classList.toggle('active', i === activeIndex); // подсветка только на активном
  });
};

const addCard = (item) => {
  const card = document.createElement('div');
  card.className = 'card';
  const text = document.createElement('div');
  text.className = 'card-text';
  const name = document.createElement('span');
  name.className = 'card-name';
  name.textContent = `Name: ${item.name}`;
  const owner = document.createElement('span');
  owner.className = 'card-owner';
  owner.textContent = `Owner: ${item.owner.login}`;
  const stars = document.createElement('span');
  stars.className = 'card-stars';
  stars.textContent = `Stars: ${item.stargazers_count}`;

  text.append(name, owner, stars);

  const button = document.createElement('button');
  button.className = 'card-button';
  button.type = 'button';
  button.addEventListener('click', (evt) => {
    evt.target.parentNode.remove();
  });

  card.append(text, button);
  outputField.append(card);

  searchField.value = '';
  autocomplete.innerHTML = '';
  currentItems = [];
  setActive(-1);
};

const renderAutocomplete = (items) => {
  autocomplete.innerHTML = '';
  currentItems = items;
  setActive(-1); // новый список — старая подсветка не нужна

  if (items.length === 0) {
    autocomplete.innerHTML = '<p class="no-results">No results</p>';
    return;
  }

  items.forEach((item) => {
    const choice = document.createElement('p');
    choice.className = 'choice';
    choice.textContent = item.name;
    choice.addEventListener('click', () => addCard(item));
    autocomplete.append(choice);
  });
};

const getRepos = async (request) => {
  const response = await fetch(`https://api.github.com/search/repositories?q=${encodeURIComponent(request)}`)

  if (!response.ok) {
    autocomplete.innerHTML = '<p class="no-results">Something went wrong. Please try again.</p>';
    throw new Error(`Ошибка API: ${response.status}`);
  }
  renderAutocomplete((await response.json()).items.slice(0, 5));
};

const debounceGetRepos = debounce(getRepos, 1000);

searchField.addEventListener('input', () => {
  if (searchField.value[0] === ' ') return;
  debounceGetRepos(searchField.value.trim());
});

searchField.addEventListener('keydown', (event) => {
  if (!currentItems.length) return;

  if (event.key === 'ArrowDown') {
    event.preventDefault();
    setActive((activeIndex + 1) % currentItems.length); // зацикливание вниз
  } else if (event.key === 'ArrowUp') {
    event.preventDefault();
    setActive((activeIndex - 1 + currentItems.length) % currentItems.length); // зацикливание вверх
  } else if (event.key === 'Enter' && activeIndex >= 0) {
    event.preventDefault();
    addCard(currentItems[activeIndex]); // Enter добавляет подсвеченный репозиторий
  }
});

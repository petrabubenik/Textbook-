const storageKeys = {
  campus: 'campusbooks-campus',
  cart: 'campusbooks-cart',
  listings: 'campusbooks-listings',
  users: 'campusbooks-users',
  session: 'campusbooks-session',
  requests: 'campusbooks-requests',
  messages: 'campusbooks-messages'
};

function readStoredArray(key) {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : [];
}

function updateCartCount() {
  const count = readStoredArray(storageKeys.cart).length;
  for (const badge of document.querySelectorAll('.cart-count')) {
    badge.textContent = count;
  }
}

function showToast(message) {
  const toast = document.querySelector('#toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove('show'), 5000);
}

function formatPrice(value) {
  const amount = Number(value);
  return `$${amount.toFixed(Number.isInteger(amount) ? 0 : 2)}`;
}

function getCurrentUser() {
  const sessionId = localStorage.getItem(storageKeys.session);
  return sessionId
    ? readStoredArray(storageKeys.users).find((user) => user.id === sessionId) || null
    : null;
}

updateCartCount();

const universitySearch = document.querySelector('#university-search');
if (universitySearch) {
  const cards = [...document.querySelectorAll('.campus-card')];
  const emptyState = document.querySelector('#campus-empty');
  const selectedLabel = document.querySelector('#campus-selected');
  const currentCampus = localStorage.getItem(storageKeys.campus);
  if (currentCampus) selectedLabel.textContent = `Selected campus: ${currentCampus}`;

  universitySearch.addEventListener('input', () => {
    const query = universitySearch.value.trim().toLowerCase();
    let visibleCount = 0;
    for (const card of cards) {
      const matches = card.dataset.search.includes(query);
      card.hidden = !matches;
      if (matches) visibleCount += 1;
    }
    emptyState.hidden = visibleCount > 0;
  });

  for (const button of document.querySelectorAll('.campus-select')) {
    button.addEventListener('click', () => {
      localStorage.setItem(storageKeys.campus, button.dataset.university);
      selectedLabel.textContent = `Selected campus: ${button.dataset.university}`;
      showToast(`${button.dataset.university} selected. Browse books or post a listing for this campus.`);
    });
  }
}

const campusContext = document.querySelector('#campus-context');
if (campusContext) {
  campusContext.textContent = localStorage.getItem(storageKeys.campus)
    ? ` · ${localStorage.getItem(storageKeys.campus)}`
    : ' · Select a university';
}

const bookGrid = document.querySelector('#book-grid');
if (bookGrid) {
  const searchInput = document.querySelector('#book-search');
  const resultCount = document.querySelector('#result-count');
  const emptyState = document.querySelector('#empty-state');
  const selectedCampus = localStorage.getItem(storageKeys.campus);
  const sampleCampuses = [
    'Northwood University',
    'Foxbridge College',
    'Pinevale University',
    'Lakebend Institute',
    'Cedarfield College',
    'Rivermere University'
  ];
  function makeActionButton(mode, price, book) {
    const button = document.createElement('button');
    button.className = 'request-button';
    button.type = 'button';
    button.dataset.mode = mode;
    button.dataset.bookId = book.id;
    button.dataset.title = book.title;
    button.dataset.price = price;
    button.dataset.campus = book.campus || selectedCampus || 'Campus sample';
    button.dataset.sellerId = book.sellerId || 'sample-seller';
    button.dataset.sellerName = book.sellerName || 'CampusBooks sample seller';
    button.dataset.listingId = book.id;
    button.dataset.rentalMonths = book.rentalMonths || '';
    button.dataset.damageFee = book.damageFee || '0';
    button.dataset.lateReturnFee = book.lateReturnFee || '0';
    const rentalTerm = book.rentalMonths
      ? `for ${book.rentalMonths} ${Number(book.rentalMonths) === 1 ? 'month' : 'months'}`
      : 'per semester';
    button.setAttribute('aria-label', mode === 'buy'
      ? `Buy ${book.title} for ${formatPrice(price)}`
      : `Rent ${book.title} for ${formatPrice(price)} ${rentalTerm}`);
    button.title = button.getAttribute('aria-label');
    button.textContent = mode === 'buy' ? 'Buy' : 'Rent';
    const arrow = document.createElement('span');
    arrow.setAttribute('aria-hidden', 'true');
    arrow.textContent = '→';
    button.append(arrow);
    return button;
  }

  function addBookActions(card, book) {
    const priceNodes = [...card.querySelectorAll('.prices strong')];
    const prices = priceNodes.map((node) => Number(node.textContent.replace(/[^0-9.]/g, '')));
    const oldButton = card.querySelector('.request-button');
    const actions = document.createElement('div');
    actions.className = 'book-actions';
    actions.append(
      makeActionButton('buy', prices[0], book),
      makeActionButton('rent', prices[1], book)
    );
    if (oldButton) {
      oldButton.replaceWith(actions);
    } else {
      card.querySelector('.card-bottom').append(actions);
    }
  }

  function makePostedCard(book) {
    const card = document.createElement('article');
    card.className = 'book-card';
    card.dataset.search = `${book.title} ${book.course} ${book.condition} ${book.campus}`.toLowerCase();
    card.dataset.posted = 'true';
    card.dataset.campus = book.campus;
    const top = document.createElement('div');
    top.className = 'card-top';
    const category = document.createElement('span');
    category.className = 'book-category';
    category.textContent = book.status === 'Sold' ? 'SOLD' : 'STUDENT LISTING';
    const condition = document.createElement('span');
    condition.className = 'condition';
    const dot = document.createElement('span');
    condition.append(dot, document.createTextNode(book.condition));
    top.append(category, condition);
    const cover = document.createElement('div');
    cover.className = 'mini-book cover-sage';
    const title = document.createElement('span');
    title.className = 'cover-title';
    title.textContent = book.title;
    const coverLabel = document.createElement('span');
    coverLabel.className = 'cover-detail';
    coverLabel.textContent = 'STUDENT POSTED';
    cover.append(title, coverLabel);
    const heading = document.createElement('h3');
    heading.textContent = book.title;
    const course = document.createElement('p');
    course.className = 'book-course';
    course.textContent = `${book.course} · ${book.campus}`;
    const seller = document.createElement('p');
    seller.className = 'book-seller';
    seller.textContent = `Listed by ${book.sellerName || 'a student'}`;
    const bottom = document.createElement('div');
    bottom.className = 'card-bottom';
    const prices = document.createElement('div');
    prices.className = 'prices';
    const buyPrice = document.createElement('span');
    const buyStrong = document.createElement('strong');
    buyStrong.textContent = formatPrice(book.buyPrice);
    buyPrice.append(buyStrong, document.createTextNode(' buy'));
    const rentPrice = document.createElement('span');
    const rentStrong = document.createElement('strong');
    rentStrong.textContent = formatPrice(book.rentPrice);
    rentPrice.append(
      rentStrong,
      document.createTextNode(book.rentalMonths
        ? ` / ${book.rentalMonths} ${Number(book.rentalMonths) === 1 ? 'month' : 'months'}`
        : ' / semester')
    );
    prices.append(buyPrice, rentPrice);
    bottom.append(prices);
    if (book.rentalMonths) {
      const fees = document.createElement('p');
      fees.className = 'rental-terms';
      fees.textContent = `Damage fee: ${formatPrice(book.damageFee || 0)} · Late return: ${formatPrice(book.lateReturnFee || 0)}`;
      bottom.append(fees);
    }
    card.append(top, cover, heading, course, seller, bottom);
    if (book.status === 'Sold') {
      const soldLabel = document.createElement('span');
      soldLabel.className = 'listing-status';
      soldLabel.textContent = 'No longer available';
      bottom.append(soldLabel);
    } else {
      addBookActions(card, book);
    }
    return card;
  }

  for (const [index, card] of [...bookGrid.querySelectorAll('.book-card')].entries()) {
    const title = card.querySelector('h3').textContent.trim();
    const course = card.querySelector('.book-course').textContent.trim();
    const condition = card.querySelector('.condition').textContent.trim();
    const priceNodes = [...card.querySelectorAll('.prices strong')];
    const book = {
      id: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      title,
      course,
      condition,
      buyPrice: Number(priceNodes[0].textContent.replace(/[^0-9.]/g, '')),
      rentPrice: Number(priceNodes[1].textContent.replace(/[^0-9.]/g, '')),
      campus: sampleCampuses[index % sampleCampuses.length],
      sellerId: 'sample-seller',
      sellerName: 'CampusBooks sample seller'
    };
    card.dataset.campus = book.campus;
    if (selectedCampus && book.campus !== selectedCampus) card.hidden = true;
    addBookActions(card, book);
  }

  const postedListings = readStoredArray(storageKeys.listings);
  const visibleListings = selectedCampus
    ? postedListings.filter((book) => book.campus === selectedCampus)
    : postedListings;
  for (const book of visibleListings) {
    bookGrid.append(makePostedCard(book));
  }

  function filterBooks() {
    const query = searchInput.value.trim().toLowerCase();
    let visibleCount = 0;
    for (const card of bookGrid.querySelectorAll('.book-card')) {
      const matches = card.dataset.search.includes(query)
        && (!selectedCampus || card.dataset.campus === selectedCampus);
      card.hidden = !matches;
      if (matches) visibleCount += 1;
    }
    resultCount.textContent = `${visibleCount} ${visibleCount === 1 ? 'book' : 'books'}`;
    emptyState.hidden = visibleCount > 0;
  }

  searchInput.addEventListener('input', filterBooks);
  document.addEventListener('keydown', (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      searchInput.focus();
    }
  });
  filterBooks();

  bookGrid.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-mode]');
    if (!button) return;
    const cart = readStoredArray(storageKeys.cart);
    if (cart.some((item) => item.id === button.dataset.bookId && item.mode === button.dataset.mode)) {
      showToast('That option is already in your checkout.');
      return;
    }
    cart.push({
      id: button.dataset.bookId,
      title: button.dataset.title,
      mode: button.dataset.mode,
      price: Number(button.dataset.price),
      campus: button.dataset.campus,
      listingId: button.dataset.listingId,
      sellerId: button.dataset.sellerId,
      sellerName: button.dataset.sellerName,
      rentalMonths: button.dataset.rentalMonths ? Number(button.dataset.rentalMonths) : null,
      damageFee: Number(button.dataset.damageFee),
      lateReturnFee: Number(button.dataset.lateReturnFee)
    });
    localStorage.setItem(storageKeys.cart, JSON.stringify(cart));
    updateCartCount();
    showToast(`${button.dataset.title} added to checkout.`);
  });
}

const postForm = document.querySelector('#post-form');
if (postForm) {
  const campusSelect = document.querySelector('#post-campus');
  const chosenCampus = localStorage.getItem(storageKeys.campus);
  if (chosenCampus && [...campusSelect.options].some((option) => option.value === chosenCampus)) {
    campusSelect.value = chosenCampus;
  }

  postForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const seller = getCurrentUser();
    if (!seller) {
      document.querySelector('#post-message').textContent = 'Sign in to your account before posting a book.';
      return;
    }
    const formData = new FormData(postForm);
    const listing = {
      id: `posted-${Date.now()}`,
      sellerId: seller.id,
      sellerName: seller.name,
      title: formData.get('title').trim(),
      course: formData.get('course').trim(),
      campus: formData.get('campus'),
      condition: formData.get('condition'),
      buyPrice: Number(formData.get('buyPrice')),
      rentPrice: Number(formData.get('rentPrice')),
      rentalMonths: Number(formData.get('rentalMonths')),
      damageFee: Number(formData.get('damageFee')),
      lateReturnFee: Number(formData.get('lateReturnFee'))
    };
    const listings = readStoredArray(storageKeys.listings);
    listings.push(listing);
    localStorage.setItem(storageKeys.listings, JSON.stringify(listings));
    localStorage.setItem(storageKeys.campus, listing.campus);
    document.querySelector('#post-message').textContent = `${listing.title} is listed at ${listing.campus} with both buy and rent prices. You can find it on the Browse tab.`;
    postForm.reset();
    campusSelect.value = listing.campus;
    window.dispatchEvent(new Event('campusbooks-listings-updated'));
  });
}

const checkoutItems = document.querySelector('#checkout-items');
if (checkoutItems) {
  const checkoutEmpty = document.querySelector('#checkout-empty');
  const checkoutSummary = document.querySelector('#checkout-summary');
  const checkoutMessage = document.querySelector('#checkout-message');
  const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

  function renderCheckout() {
    const cart = readStoredArray(storageKeys.cart);
    checkoutItems.replaceChildren();
    checkoutEmpty.hidden = cart.length > 0;
    checkoutSummary.hidden = cart.length === 0;
    let buyTotal = 0;
    let rentTotal = 0;

    for (const item of cart) {
      if (item.mode === 'buy') buyTotal += item.price;
      else rentTotal += item.price;
      const row = document.createElement('article');
      row.className = 'checkout-item';
      const details = document.createElement('div');
      const title = document.createElement('h3');
      title.textContent = item.title;
      const description = document.createElement('p');
      const rentTerm = item.rentalMonths
        ? `Rent · ${item.rentalMonths} ${item.rentalMonths === 1 ? 'month' : 'months'}`
        : 'Rent · per semester';
      description.textContent = `${item.mode === 'buy' ? 'Buy' : rentTerm} · ${item.campus}`;
      details.append(title, description);
      if (item.mode === 'rent') {
        const fees = document.createElement('p');
        fees.textContent = `Damage fee: ${formatPrice(item.damageFee || 0)} · Late return fee: ${formatPrice(item.lateReturnFee || 0)}`;
        details.append(fees);
      }
      const price = document.createElement('strong');
      price.textContent = currency.format(item.price);
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'remove-item';
      remove.dataset.removeId = item.id;
      remove.dataset.removeMode = item.mode;
      remove.textContent = 'Remove';
      const trailing = document.createElement('div');
      trailing.className = 'checkout-item-trailing';
      trailing.append(price, remove);
      row.append(details, trailing);
      checkoutItems.append(row);
    }

    document.querySelector('#buy-total').textContent = currency.format(buyTotal);
    document.querySelector('#rent-total').textContent = currency.format(rentTotal);
    document.querySelector('#grand-total').textContent = currency.format(buyTotal + rentTotal);
    updateCartCount();
  }

  checkoutItems.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-remove-id]');
    if (!button) return;
    const cart = readStoredArray(storageKeys.cart).filter((item) =>
      item.id !== button.dataset.removeId || item.mode !== button.dataset.removeMode
    );
    localStorage.setItem(storageKeys.cart, JSON.stringify(cart));
    renderCheckout();
  });

  document.querySelector('#checkout-confirm').addEventListener('click', () => {
    const cart = readStoredArray(storageKeys.cart);
    if (cart.length === 0) return;
    const buyer = getCurrentUser();
    if (!buyer) {
      checkoutMessage.replaceChildren(document.createTextNode('Sign in before sending your buy or rent request. '));
      const signInLink = document.createElement('a');
      signInLink.href = 'account.html';
      signInLink.textContent = 'Sign in or create an account';
      checkoutMessage.append(signInLink);
      return;
    }
    const requests = readStoredArray(storageKeys.requests);
    for (const item of cart) {
      requests.push({
        id: `request-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        listingId: item.listingId || item.id,
        listingTitle: item.title,
        campus: item.campus,
        buyerId: buyer.id,
        buyerName: buyer.name,
        sellerId: item.sellerId || 'sample-seller',
        sellerName: item.sellerName || 'CampusBooks sample seller',
        mode: item.mode,
        price: item.price,
        rentalMonths: item.rentalMonths || null,
        damageFee: item.damageFee || 0,
        lateReturnFee: item.lateReturnFee || 0,
        status: 'Interested',
        createdAt: new Date().toISOString()
      });
    }
    localStorage.setItem(storageKeys.requests, JSON.stringify(requests));
    localStorage.setItem(storageKeys.cart, JSON.stringify([]));
    checkoutMessage.replaceChildren(document.createTextNode('Your interest is in your account. No order was sent and no payment was collected. '));
    const accountLink = document.createElement('a');
    accountLink.href = 'account.html';
    accountLink.textContent = 'View requests';
    checkoutMessage.append(accountLink);
    renderCheckout();
  });

  renderCheckout();
}

const studentSlider = document.querySelector('#student-slider');
if (studentSlider) {
  const studentValue = document.querySelector('#student-value');
  const bookTotal = document.querySelector('#book-total');
  const matchRate = document.querySelector('#match-rate');
  const updateCommunity = () => {
    const students = Number(studentSlider.value);
    const proportion = (students - Number(studentSlider.min)) / (Number(studentSlider.max) - Number(studentSlider.min));
    studentValue.value = students;
    studentValue.textContent = students;
    bookTotal.textContent = Math.round(students * 1.4).toLocaleString();
    matchRate.textContent = `${Math.round(8 + proportion * 87)}%`;
    studentSlider.style.setProperty('--range-progress', `${proportion * 100}%`);
  };
  studentSlider.addEventListener('input', updateCommunity);
  updateCommunity();
}

const accountRoot = document.querySelector('#account-root');
if (accountRoot) {
  const loginPanel = document.querySelector('#account-login');
  const dashboard = document.querySelector('#account-dashboard');
  const loginForm = document.querySelector('#account-form');
  const loginMessage = document.querySelector('#account-message');
  const selectedRequest = { id: null };

  function makeTextElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    element.textContent = text;
    return element;
  }

  function renderActivityCard(request, incoming) {
    const card = document.createElement('article');
    card.className = 'activity-card';
    const heading = document.createElement('div');
    heading.className = 'activity-heading';
    const title = makeTextElement('h3', '', request.listingTitle);
    const status = makeTextElement('span', `status-pill status-${request.status.toLowerCase()}`, request.status);
    heading.append(title, status);
    const otherParty = incoming ? request.buyerName : request.sellerName;
    const details = makeTextElement(
      'p',
      'activity-details',
      `${incoming ? 'From' : 'To'} ${otherParty} · ${request.mode === 'buy' ? 'Wants to buy' : 'Wants to rent'} · ${formatPrice(request.price)}${request.mode === 'rent'
        ? ` / ${request.rentalMonths ? `${request.rentalMonths} ${request.rentalMonths === 1 ? 'month' : 'months'}` : 'semester'} · Damage fee ${formatPrice(request.damageFee || 0)} · Late return fee ${formatPrice(request.lateReturnFee || 0)}`
        : ''} · ${request.campus}`
    );
    const actions = document.createElement('div');
    actions.className = 'activity-actions';
    const messageButton = document.createElement('button');
    messageButton.type = 'button';
    messageButton.className = 'text-button';
    messageButton.textContent = 'Open chat';
    messageButton.addEventListener('click', () => {
      selectedRequest.id = request.id;
      renderChat(request);
    });
    actions.append(messageButton);

    if (incoming && !['Bought', 'Rented', 'Declined'].includes(request.status)) {
      const nextStatus = request.status === 'Interested'
        ? 'Accept request'
        : request.mode === 'buy' ? 'Mark bought' : 'Mark rented';
      const statusButton = document.createElement('button');
      statusButton.type = 'button';
      statusButton.className = 'text-button';
      statusButton.textContent = nextStatus;
      statusButton.addEventListener('click', () => {
        const status = request.status === 'Interested'
          ? 'Accepted'
          : request.mode === 'buy' ? 'Bought' : 'Rented';
        const requests = readStoredArray(storageKeys.requests).map((entry) => {
          if (entry.id === request.id) return { ...entry, status };
          if (status === 'Bought'
            && entry.listingId === request.listingId
            && ['Interested', 'Accepted'].includes(entry.status)) {
            return { ...entry, status: 'Declined' };
          }
          return entry;
        });
        localStorage.setItem(storageKeys.requests, JSON.stringify(requests));
        if (status === 'Bought') {
          const listings = readStoredArray(storageKeys.listings).map((listing) =>
            listing.id === request.listingId ? { ...listing, status: 'Sold' } : listing
          );
          localStorage.setItem(storageKeys.listings, JSON.stringify(listings));
        }
        renderDashboard(getCurrentUser());
      });
      actions.append(statusButton);

      if (request.status === 'Interested') {
        const declineButton = document.createElement('button');
        declineButton.type = 'button';
        declineButton.className = 'text-button text-button-muted';
        declineButton.textContent = 'Decline';
        declineButton.addEventListener('click', () => {
          const requests = readStoredArray(storageKeys.requests).map((entry) =>
            entry.id === request.id ? { ...entry, status: 'Declined' } : entry
          );
          localStorage.setItem(storageKeys.requests, JSON.stringify(requests));
          renderDashboard(getCurrentUser());
        });
        actions.append(declineButton);
      }
    }

    card.append(heading, details, actions);
    return card;
  }

  function renderChat(request) {
    const panel = document.querySelector('#chat-panel');
    panel.replaceChildren();
    const otherParty = request.buyerId === getCurrentUser()?.id ? request.sellerName : request.buyerName;
    panel.append(
      makeTextElement('h2', 'chat-heading', `Chat about ${request.listingTitle}`),
      makeTextElement('p', 'chat-context', `With ${otherParty} · ${request.mode === 'buy' ? 'Buying' : 'Renting'} · ${request.status}`)
    );

    const messageList = document.createElement('div');
    messageList.className = 'chat-messages';
    const messages = readStoredArray(storageKeys.messages)
      .filter((message) => message.requestId === request.id);
    if (messages.length === 0) {
      messageList.append(makeTextElement('p', 'chat-empty', 'No messages yet. Say hello to start the conversation.'));
    } else {
      for (const message of messages) {
        const bubble = document.createElement('p');
        bubble.className = `chat-bubble${message.senderId === getCurrentUser()?.id ? ' chat-bubble-own' : ''}`;
        bubble.append(
          makeTextElement('strong', '', message.senderName),
          document.createTextNode(message.body)
        );
        messageList.append(bubble);
      }
    }

    const form = document.createElement('form');
    form.className = 'chat-form';
    const input = document.createElement('input');
    input.name = 'message';
    input.type = 'text';
    input.maxLength = 500;
    input.placeholder = 'Write a message…';
    input.setAttribute('aria-label', 'Write a message');
    input.required = true;
    const sendButton = document.createElement('button');
    sendButton.type = 'submit';
    sendButton.className = 'button button-dark';
    sendButton.textContent = 'Send';
    form.append(input, sendButton);
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const sender = getCurrentUser();
      if (!sender) return;
      const body = input.value.trim();
      if (!body) {
        input.focus();
        return;
      }
      const messages = readStoredArray(storageKeys.messages);
      messages.push({
        id: `message-${Date.now()}`,
        requestId: request.id,
        senderId: sender.id,
        senderName: sender.name,
        body,
        createdAt: new Date().toISOString()
      });
      localStorage.setItem(storageKeys.messages, JSON.stringify(messages));
      renderChat(request);
    });
    panel.append(messageList, form);
    input.focus();
  }

  function renderDashboard(user) {
    loginPanel.hidden = true;
    dashboard.hidden = false;
    document.querySelector('#account-greeting').textContent = `Hello, ${user.name}.`;
    const listings = readStoredArray(storageKeys.listings).filter((listing) => listing.sellerId === user.id);
    const listingContainer = document.querySelector('#my-listings');
    listingContainer.replaceChildren();
    if (listings.length === 0) {
      listingContainer.append(makeTextElement('p', 'account-empty', 'You have not posted a book yet.'));
    } else {
      for (const listing of listings) {
        const item = document.createElement('article');
        item.className = 'owned-listing';
        const rentalPeriod = listing.rentalMonths
          ? `${listing.rentalMonths} ${listing.rentalMonths === 1 ? 'month' : 'months'}`
          : 'semester';
        item.append(
          makeTextElement('h3', '', listing.title),
          makeTextElement('p', '', `${listing.course} · ${listing.campus}`),
          makeTextElement('p', 'owned-listing-prices', `${formatPrice(listing.buyPrice)} to buy · ${formatPrice(listing.rentPrice)} for ${rentalPeriod} to rent`),
          ...(listing.rentalMonths ? [
            makeTextElement('p', '', `Damage fee: ${formatPrice(listing.damageFee || 0)} · Late return fee: ${formatPrice(listing.lateReturnFee || 0)}`)
          ] : []),
          makeTextElement('p', 'owned-listing-availability', listing.status === 'Sold' ? 'Sold' : 'Available')
        );
        listingContainer.append(item);
      }
    }

    const requests = readStoredArray(storageKeys.requests);
    const incoming = requests.filter((request) => request.sellerId === user.id);
    const outgoing = requests.filter((request) => request.buyerId === user.id);
    const incomingContainer = document.querySelector('#incoming-requests');
    const outgoingContainer = document.querySelector('#sent-requests');
    incomingContainer.replaceChildren();
    outgoingContainer.replaceChildren();
    document.querySelector('#incoming-count').textContent = incoming.length;
    document.querySelector('#sent-count').textContent = outgoing.length;
    if (incoming.length === 0) {
      incomingContainer.append(makeTextElement('p', 'account-empty', 'No one has asked to buy or rent your books yet.'));
    } else {
      incoming.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .forEach((request) => incomingContainer.append(renderActivityCard(request, true)));
    }
    if (outgoing.length === 0) {
      outgoingContainer.append(makeTextElement('p', 'account-empty', 'Your buy and rent requests will show up here.'));
    } else {
      outgoing.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .forEach((request) => outgoingContainer.append(renderActivityCard(request, false)));
    }

    const activeRequest = requests.find((request) => request.id === selectedRequest.id);
    if (activeRequest) renderChat(activeRequest);
    else {
      selectedRequest.id = null;
      document.querySelector('#chat-panel').replaceChildren(
        makeTextElement('h2', 'chat-heading', 'Your messages'),
        makeTextElement('p', 'chat-empty', 'Open a chat from a buy or rent request to talk with the other student.')
      );
    }
  }

  function renderAccount() {
    const user = getCurrentUser();
    if (user) {
      renderDashboard(user);
      return;
    }
    dashboard.hidden = true;
    loginPanel.hidden = false;
  }

  window.addEventListener('campusbooks-listings-updated', () => {
    const user = getCurrentUser();
    if (user) renderDashboard(user);
  });

  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(loginForm);
    const name = formData.get('name').trim();
    const email = formData.get('email').trim().toLowerCase();
    const users = readStoredArray(storageKeys.users);
    let user = users.find((entry) => entry.email === email);
    if (user) {
      user.name = name;
      localStorage.setItem(storageKeys.users, JSON.stringify(users));
    } else {
      user = { id: `user-${Date.now()}`, name, email };
      users.push(user);
      localStorage.setItem(storageKeys.users, JSON.stringify(users));
    }
    localStorage.setItem(storageKeys.session, user.id);
    loginMessage.textContent = '';
    loginForm.reset();
    renderAccount();
    if (location.hash === '#post-book') {
      document.querySelector('#post-book').scrollIntoView();
    }
  });

  document.querySelector('#sign-out').addEventListener('click', () => {
    localStorage.removeItem(storageKeys.session);
    selectedRequest.id = null;
    renderAccount();
  });

  renderAccount();
}

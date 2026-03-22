const state = {
  excursions: [],
  filtered: [],
  selectedId: "",
  telegramUsername: "",
  currency: "USD",
  emailService: null
};

const refs = {
  cardsGrid: document.querySelector("#cardsGrid"),
  cardTemplate: document.querySelector("#cardTemplate"),
  searchInput: document.querySelector("#searchInput"),
  tagFilter: document.querySelector("#tagFilter"),
  form: document.querySelector("#requestForm"),
  excursionSelect: document.querySelector("#excursionSelect"),
  peopleInput: document.querySelector("#peopleInput"),
  totalPrice: document.querySelector("#totalPrice"),
  formNote: document.querySelector("#formNote"),
  managerLink: document.querySelector("#managerLink"),
  detailsDialog: document.querySelector("#detailsDialog"),
  detailsContent: document.querySelector("#detailsContent"),
  dialogClose: document.querySelector("#dialogClose")
};

initialize().catch((error) => {
  refs.cardsGrid.innerHTML = '<div class="empty-state">Не удалось загрузить данные экскурсий.</div>';
  refs.formNote.textContent = "Ошибка загрузки. Проверьте файл data/excursions.json";
  console.error(error);
});

async function initialize() {
  const response = await fetch("data/excursions.json");
  if (!response.ok) {
    throw new Error(`Ошибка загрузки: ${response.status}`);
  }

  const data = await response.json();
  state.excursions = data.excursions ?? [];
  state.filtered = [...state.excursions];
  state.currency = data.agency?.currency ?? "USD";
  state.telegramUsername = normalizeTelegramUsername(data.telegram?.managerUsername);
  state.emailService = normalizeEmailServiceConfig(data.emailService);

  setupManagerLink();
  populateTagFilter();
  populateExcursionSelect();
  renderCards(state.filtered);
  bindEvents();
  updateTotalPrice();
}

function bindEvents() {
  refs.searchInput.addEventListener("input", applyFilters);
  refs.tagFilter.addEventListener("change", applyFilters);
  refs.excursionSelect.addEventListener("change", onSelectFromForm);
  refs.peopleInput.addEventListener("input", updateTotalPrice);
  refs.form.addEventListener("submit", onFormSubmit);
  refs.dialogClose.addEventListener("click", closeDialog);
  refs.detailsDialog.addEventListener("click", (event) => {
    const { target } = event;
    if (target === refs.detailsDialog) {
      closeDialog();
    }
  });
}

function setupManagerLink() {
  if (state.telegramUsername) {
    refs.managerLink.href = `https://t.me/${state.telegramUsername}`;
    refs.managerLink.textContent = `Менеджер в Telegram: @${state.telegramUsername}`;
    return;
  }

  refs.managerLink.href = "https://t.me/share/url";
  refs.managerLink.textContent = "Открыть Telegram";
}

function populateTagFilter() {
  const tags = [...new Set(state.excursions.flatMap((item) => item.tags || []))].sort();

  for (const tag of tags) {
    const option = document.createElement("option");
    option.value = tag;
    option.textContent = capitalize(tag);
    refs.tagFilter.append(option);
  }
}

function populateExcursionSelect() {
  const fragment = document.createDocumentFragment();

  for (const excursion of state.excursions) {
    const option = document.createElement("option");
    option.value = excursion.id;
    option.textContent = `${excursion.title} (${formatPrice(excursion.price)})`;
    fragment.append(option);
  }

  refs.excursionSelect.append(fragment);
}

function applyFilters() {
  const query = refs.searchInput.value.trim().toLowerCase();
  const tag = refs.tagFilter.value;

  state.filtered = state.excursions.filter((item) => {
    const byTag = tag === "all" || (item.tags || []).includes(tag);
    const searchSource = [item.title, item.overview, ...(item.tags || [])].join(" ").toLowerCase();
    const byQuery = !query || searchSource.includes(query);
    return byTag && byQuery;
  });

  renderCards(state.filtered);
}

function renderCards(items) {
  refs.cardsGrid.innerHTML = "";

  if (!items.length) {
    refs.cardsGrid.innerHTML = '<div class="empty-state">По вашему запросу экскурсии не найдены.</div>';
    return;
  }

  const fragment = document.createDocumentFragment();

  for (const item of items) {
    const node = refs.cardTemplate.content.cloneNode(true);
    const card = node.querySelector(".tour-card");
    const image = node.querySelector(".tour-card-image");

    image.src = item.images?.[0] || "";
    image.alt = item.title;

    node.querySelector(".tour-card-title").textContent = item.title;
    node.querySelector(".tour-card-overview").textContent = item.overview;
    node.querySelector(".tour-card-price").textContent = formatPrice(item.price);

    const detailsBtn = node.querySelector('[data-action="details"]');
    const selectBtn = node.querySelector('[data-action="select"]');

    detailsBtn.addEventListener("click", () => openDetails(item.id));
    selectBtn.addEventListener("click", () => selectExcursion(item.id, true));

    card.style.animationDelay = `${Math.min(320, fragment.childNodes.length * 60)}ms`;
    fragment.append(node);
  }

  refs.cardsGrid.append(fragment);
}

function openDetails(excursionId) {
  const excursion = getExcursionById(excursionId);
  if (!excursion) {
    return;
  }

  let slideIndex = 0;

  refs.detailsContent.innerHTML = `
    <div class="details-layout">
      <div class="slider">
        <img src="${excursion.images[0]}" alt="${excursion.title}" data-slider-image />
        <button class="slider-control slider-prev" type="button" aria-label="Предыдущее фото">‹</button>
        <button class="slider-control slider-next" type="button" aria-label="Следующее фото">›</button>
      </div>
      <div class="details-body">
        <h3>${excursion.title}</h3>
        <p class="details-meta">${excursion.overview}</p>
        <p class="details-meta">${excursion.description}</p>
        <p><strong>Стоимость:</strong> ${formatPrice(excursion.price)} / чел.</p>
        <p>${(excursion.tags || []).map((tag) => `<span class="details-chip">${capitalize(tag)}</span>`).join("")}</p>
        <div class="details-lists">
          <div>
            <strong>Что включено</strong>
            <ul>${(excursion.included || []).map((point) => `<li>${point}</li>`).join("")}</ul>
          </div>
          <div>
            <strong>Что взять с собой</strong>
            <ul>${(excursion.bring || []).map((point) => `<li>${point}</li>`).join("")}</ul>
          </div>
        </div>
        <button class="btn btn-primary" type="button" data-action="choose-from-dialog">Выбрать экскурсию</button>
      </div>
    </div>
  `;

  const sliderImage = refs.detailsContent.querySelector("[data-slider-image]");
  const prevButton = refs.detailsContent.querySelector(".slider-prev");
  const nextButton = refs.detailsContent.querySelector(".slider-next");
  const chooseButton = refs.detailsContent.querySelector('[data-action="choose-from-dialog"]');

  const updateSlide = (step) => {
    const length = excursion.images.length;
    slideIndex = (slideIndex + step + length) % length;
    sliderImage.src = excursion.images[slideIndex];
  };

  prevButton.addEventListener("click", () => updateSlide(-1));
  nextButton.addEventListener("click", () => updateSlide(1));
  chooseButton.addEventListener("click", () => {
    selectExcursion(excursion.id, true);
    closeDialog();
  });

  refs.detailsDialog.showModal();
}

function closeDialog() {
  refs.detailsDialog.close();
}

function selectExcursion(excursionId, scrollToForm = false) {
  state.selectedId = excursionId;
  refs.excursionSelect.value = excursionId;
  updateTotalPrice();

  if (scrollToForm) {
    document.querySelector("#request").scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function onSelectFromForm(event) {
  state.selectedId = event.target.value;
  updateTotalPrice();
}

function updateTotalPrice() {
  const selected = getExcursionById(state.selectedId || refs.excursionSelect.value);
  const count = Math.max(1, Number(refs.peopleInput.value) || 1);

  if (!selected) {
    refs.totalPrice.value = "Выберите экскурсию";
    return;
  }

  const total = selected.price * count;
  refs.totalPrice.value = `${formatPrice(total)} (${count} чел.)`;
}

async function onFormSubmit(event) {
  event.preventDefault();

  if (!refs.form.checkValidity()) {
    refs.form.reportValidity();
    return;
  }

  const formData = new FormData(refs.form);
  const excursion = getExcursionById(formData.get("excursionId"));

  if (!excursion) {
    refs.formNote.textContent = "Выберите экскурсию из списка.";
    return;
  }

  const peopleCount = Math.max(1, Number(formData.get("peopleCount")) || 1);
  const totalPrice = excursion.price * peopleCount;
  const requestDetails = {
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    excursionTitle: excursion.title,
    peopleCount,
    totalPrice: formatPrice(totalPrice),
    pickupPoint: formData.get("pickupPoint"),
    desiredDate: formData.get("desiredDate"),
    contact: formData.get("contact")
  };

  const message = [
    "Привет! Я хочу заказать экскурсию, вот детали моей заявки:",
    `Имя и фамилия: ${requestDetails.firstName} ${requestDetails.lastName}`,
    `Экскурсия: ${requestDetails.excursionTitle}`,
    `Количество человек: ${requestDetails.peopleCount}`,
    `Итоговая стоимость: ${requestDetails.totalPrice}`,
    `Отель/точка Google Maps: ${requestDetails.pickupPoint}`,
    `Желаемая дата: ${requestDetails.desiredDate}`,
    `Контакт: ${requestDetails.contact}`
  ].join("\n");

  if (state.emailService?.endpoint) {
    refs.formNote.textContent = "Отправляем заявку...";
    const sent = await sendRequestViaEmailService(requestDetails, message);

    if (sent) {
      refs.formNote.textContent = "Заявка отправлена. Мы свяжемся с вами в ближайшее время.";
      return;
    }
  }

  const telegramUrl = buildTelegramRequestUrl();
  window.open(telegramUrl, "_blank", "noopener,noreferrer");

  if (state.telegramUsername) {
    const copied = await copyToClipboard(message);
    refs.formNote.textContent = copied
      ? `Открыт чат @${state.telegramUsername}. Текст заявки скопирован, вставьте его в диалог.`
      : `Открыт чат @${state.telegramUsername}. Скопируйте текст заявки вручную и отправьте менеджеру.`;
    return;
  }

  refs.formNote.textContent = "Открываем Telegram с готовым текстом заявки...";
}

async function sendRequestViaEmailService(requestDetails, message) {
  try {
    const payload = {
      subject: `Новая заявка на экскурсию: ${requestDetails.excursionTitle}`,
      message,
      ...requestDetails
    };

    const response = await fetch(state.emailService.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      return true;
    }

    console.error("Email service error", response.status);
    return false;
  } catch (error) {
    console.error("Email service unavailable", error);
    return false;
  }
}

function normalizeEmailServiceConfig(config) {
  if (!config || typeof config !== "object") {
    return null;
  }

  const endpoint = String(config.endpoint || "").trim();
  if (!endpoint) {
    return null;
  }

  return { endpoint };
}

function buildTelegramRequestUrl() {
  if (state.telegramUsername) {
    return `https://t.me/${state.telegramUsername}`;
  }

  return "https://t.me/share/url";
}

function normalizeTelegramUsername(value) {
  if (!value) {
    return "";
  }

  let normalized = String(value).trim();
  normalized = normalized.replace(/^https?:\/\//i, "");
  normalized = normalized.replace(/^t\.me\//i, "");
  normalized = normalized.replace(/^@+/, "");
  normalized = normalized.split(/[/?#]/)[0];

  return normalized;
}

async function copyToClipboard(text) {
  if (!navigator.clipboard || !window.isSecureContext) {
    return false;
  }

  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function getExcursionById(excursionId) {
  return state.excursions.find((item) => item.id === excursionId);
}

function formatPrice(value) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: state.currency,
    maximumFractionDigits: 0
  }).format(value);
}

function capitalize(value) {
  if (!value) {
    return "";
  }
  return value.slice(0, 1).toUpperCase() + value.slice(1);
}

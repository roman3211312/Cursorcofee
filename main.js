const OPEN_HOUR = 8;
const CLOSE_HOUR = 22;
const ZONE = ["покровка", "чистые пруды", "китай-город", "басманный", "красные ворота"];

const DELIVERY_ITEMS = [
  { id: "filter", name: "Фильтр с собой", price: 320 },
  { id: "croissant", name: "Круассан с маслом", price: 280 },
  { id: "granola", name: "Гранола и йогурт", price: 420 },
];

function $(sel, root = document) {
  return root.querySelector(sel);
}

function $all(sel, root = document) {
  return [...root.querySelectorAll(sel)];
}

function setHours() {
  const now = new Date();
  const h = now.getHours();
  const open = h >= OPEN_HOUR && h < CLOSE_HOUR;
  $all("[data-hours]").forEach((el) => {
    el.classList.toggle("is-open", open);
    el.classList.toggle("is-closed", !open);
    el.textContent = open ? `Открыто до ${CLOSE_HOUR}:00` : "Закрыто";
  });
}

function setupNav() {
  const toggle = $(".menu-toggle");
  const nav = $(".nav");
  if (!toggle || !nav) return;
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
  });
}

function setupBooking() {
  const form = $("#booking-form");
  const success = $("#booking-success");
  if (!form) return;

  const date = form.querySelector('[name="date"]');
  if (date) {
    const today = new Date();
    date.min = today.toISOString().slice(0, 10);
    if (!date.value) date.value = date.min;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    form.classList.add("is-hidden");
    success.classList.add("is-visible");
    success.querySelector("[data-summary]").textContent =
      `${data.date}, ${data.time}, ${data.guests} гостя. Ждём ${data.name}.`;
  });
}

function cart() {
  const raw = localStorage.getItem("okno-cart");
  return raw ? JSON.parse(raw) : [];
}

function saveCart(items) {
  localStorage.setItem("okno-cart", JSON.stringify(items));
  renderCart();
}

function addToCart(id) {
  const item = DELIVERY_ITEMS.find((x) => x.id === id);
  if (!item) return;
  const items = cart();
  const existing = items.find((x) => x.id === id);
  if (existing) existing.qty += 1;
  else items.push({ ...item, qty: 1 });
  saveCart(items);
}

function renderCart() {
  const box = $("#cart");
  const totalEl = $("#cart-total");
  if (!box) return;
  const items = cart();
  if (!items.length) {
    box.innerHTML = "<p>Корзина пустая — добавьте фильтр или круассан.</p>";
    if (totalEl) totalEl.textContent = "0 ₽";
    return;
  }
  box.innerHTML = items
    .map(
      (i) =>
        `<div class="cart-line"><span>${i.name} × ${i.qty}</span><strong>${i.price * i.qty} ₽</strong></div>`
    )
    .join("");
  const total = items.reduce((s, i) => s + i.price * i.qty, 0);
  if (totalEl) totalEl.textContent = `${total} ₽`;
}

function setupDelivery() {
  $all("[data-add]").forEach((btn) => {
    btn.addEventListener("click", () => addToCart(btn.dataset.add));
  });
  renderCart();

  const form = $("#delivery-form");
  const success = $("#delivery-success");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const items = cart();
    const total = items.reduce((s, i) => s + i.price * i.qty, 0);
    if (!items.length) {
      alert("Сначала добавьте что-то в корзину.");
      return;
    }
    if (total < 700) {
      alert("Минимум заказа 700 ₽ — добавьте ещё позицию.");
      return;
    }
    const address = String(form.address.value).toLowerCase();
    const inZone = ZONE.some((z) => address.includes(z));
    if (!inZone) {
      alert("Пока возим Покровку, Чистые пруды, Китай-город, Басманный и Красные ворота.");
      return;
    }
    form.classList.add("is-hidden");
    success.classList.add("is-visible");
    success.querySelector("[data-summary]").textContent =
      `Привезём на ${form.slot.value} по адресу ${form.address.value}.`;
    localStorage.removeItem("okno-cart");
  });
}

function setupMiniBooking() {
  const form = $("#mini-booking");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const date = form.date.value;
    const guests = form.guests.value;
    window.location.href = `booking.html?date=${encodeURIComponent(date)}&guests=${encodeURIComponent(guests)}`;
  });

  const params = new URLSearchParams(location.search);
  const booking = $("#booking-form");
  if (booking && params.get("date")) booking.date.value = params.get("date");
  if (booking && params.get("guests")) booking.guests.value = params.get("guests");
}

document.addEventListener("DOMContentLoaded", () => {
  setHours();
  setupNav();
  setupBooking();
  setupMiniBooking();
  setupDelivery();
});

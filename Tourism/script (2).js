<!doctype html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Andaman Co. — небольшие путешествия по Пхукету без туристической суеты.">
  <title>Andaman Co. — Пхукет с местными</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <header class="site-header">
    <a class="logo" href="#top" aria-label="Niko Phuket на главную"><img src="image.png" alt="Niko Phuket" width="31" height="31"> Niko Phuket</a>
    <nav class="main-nav" aria-label="Основная навигация">
      <a href="#trips">Впечатления</a>
      <a href="#how">Как это работает</a>
      <a href="#journal">Журнал</a>
    </nav>
    <button class="header-booking" type="button" data-open-booking>Мои заявки <span id="bookingCount">0</span></button>
  </header>

  <main id="top">
    <section class="hero">
      <div class="hero-copy">
        <p class="eyebrow">Пхукет · Таиланд <span></span> 07:42</p>
        <h1>Остров, который<br><em>остается с тобой.</em></h1>
        <p class="hero-description">Камерные поездки, хорошие лодки и люди, которые знают Андаманское море не по путеводителю.</p>
        <a class="primary-button" href="#trips">Выбрать впечатление <span>↘</span></a>
      </div>
      <div class="hero-note"><span class="note-line"></span><span>Made for slow<br>island days</span></div>
      <div class="hero-stats"><strong>12</strong><span>маршрутов<br>без толпы</span><strong>4.9</strong><span>средняя<br>оценка гостей</span></div>
    </section>

    <section class="trust-row" aria-label="Преимущества">
      <span>01 <b>Местные гиды</b></span><span>02 <b>Группы до 8 человек</b></span><span>03 <b>Без скрытых платежей</b></span><span>04 <b>Поддержка 24/7</b></span>
    </section>

    <section class="catalog-section" id="trips">
      <div class="section-heading">
        <div><p class="eyebrow">Коллекция / 2026</p><h2>Выберите свой<br><em>ритм острова</em></h2></div>
        <p class="heading-side">Не экскурсии по расписанию.<br>Дни, к которым хочется вернуться.</p>
      </div>
      <div class="catalog-toolbar">
        <div class="filter-tabs" role="tablist" aria-label="Категории впечатлений">
          <button class="filter-tab active" data-filter="all">Все <small>06</small></button>
          <button class="filter-tab" data-filter="sea">Море <small>05</small></button>
          <button class="filter-tab" data-filter="land">Земля <small>01</small></button>
          <button class="filter-tab" data-filter="food">Еда <small>00</small></button>
        </div>
        <label class="search-box"><span>⌕</span><input id="searchInput" type="search" placeholder="Найти впечатление" aria-label="Найти впечатление"></label>
      </div>
      <div class="product-grid" id="productGrid"></div>
    </section>

    <section class="how-section" id="how">
      <div><p class="eyebrow">Ваш день на острове</p><h2>Меньше планов.<br><em>Больше Пхукета.</em></h2></div>
      <div class="steps"><div class="step"><span>01</span><h3>Выбираете настроение</h3><p>Море, джунгли или вкусный вечер — собрали главное.</p></div><div class="step"><span>02</span><h3>Оставляете заявку</h3><p>Пара деталей, чтобы мы подобрали лучший день и лодку.</p></div><div class="step"><span>03</span><h3>Мы всё подтверждаем</h3><p>Ответим в течение часа и останемся на связи до возвращения.</p></div></div>
    </section>

    <section class="journal" id="journal"><div class="journal-image"></div><div class="journal-copy"><p class="eyebrow">Из журнала / 04</p><h2>Где встречать<br><em>закат сегодня?</em></h2><p>Три места на острове, где солнце садится прямо в воду, а вокруг достаточно тихо, чтобы это заметить.</p><a href="#journal" class="text-link">Читать заметку <span>↗</span></a></div></section>
  </main>

  <footer class="site-footer"><a class="logo" href="#top"><img src="image.png" alt="Niko Phuket" width="31" height="31"> Niko Phuket</a><p>Ваш личный Пхукет, 2026</p><a href="mailto:hello@nikophuket.com">hello@nikophuket.com ↗</a></footer>

  <div class="modal-backdrop" id="bookingModal" aria-hidden="true"><section class="booking-modal" role="dialog" aria-modal="true" aria-labelledby="modalTitle"><button class="modal-close" type="button" data-close-booking aria-label="Закрыть">×</button><p class="eyebrow">Запрос на бронирование</p><h2 id="modalTitle">Ваше следующее<br><em>приключение</em></h2><p class="selected-trip" id="selectedTrip">Выберите впечатление в каталоге</p><form id="bookingForm"><div class="form-row"><label>Ваше имя<input name="name" type="text" placeholder="Как к вам обращаться" required></label><label>Телефон или WhatsApp<input name="contact" type="text" placeholder="+66 ..." required></label></div><div class="form-row"><label>Желаемая дата<input name="date" type="date" required></label><label>Гостей<input name="guests" type="number" min="1" max="8" value="2" required></label></div><div class="form-row"><label>Вариант поездки<select name="program" id="programSelect" required><option value="">Сначала выберите экскурсию</option></select></label><label>Зона трансфера<select name="pickup" id="pickupSelect" required><option value="">Выберите вариант поездки</option></select></label></div><label>Комментарий<textarea name="message" rows="3" placeholder="Что важно учесть?"></textarea></label><input type="hidden" name="trip"><input type="hidden" name="price"><button class="primary-button form-submit" type="submit">Отправить заявку <span>↗</span></button><p class="form-status" id="formStatus" role="status"></p></form></section></div>
  <script src="script.js"></script>
</body>
</html>

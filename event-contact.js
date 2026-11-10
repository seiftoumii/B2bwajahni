// Contact form on the event pages (Caravan, Edu-Career, Roadshow).
// The Figma export draws the form as boxes with grey placeholder text, so
// nothing could be typed and "Envoyer" did nothing. Put a real input in each
// box and make "Envoyer" prepare the e-mail, like the home page form does.
(() => {
  const FIELDS = {
    'Input - Prénom': { name: 'firstName', autocomplete: 'given-name', required: true },
    'Input - Nom': { name: 'lastName', autocomplete: 'family-name', required: true },
    'Input - Email': { name: 'email', type: 'email', autocomplete: 'email', required: true },
    'Input - Téléphone': { name: 'phone', type: 'tel', autocomplete: 'tel' },
    'Input - Objet': { name: 'subject', required: true },
    'Textarea - Message': { name: 'message', textarea: true, required: true },
  };

  const style = document.createElement('style');
  style.textContent = `
    .event-contact-box { position: relative; cursor: text; transition: border-color .2s ease, box-shadow .2s ease; }
    .event-contact-box:focus-within { border-color: #f7861d !important; box-shadow: 0 0 0 3px rgba(247, 134, 29, .18); }
    .event-contact-box > * { visibility: hidden; }
    .event-contact-box > .event-contact-input { visibility: visible; position: absolute; inset: 0; width: 100%; height: 100%; margin: 0; padding: 10.834px 13.334px; border: 0; outline: 0; background: transparent; color: #1b2a4a; font: 400 12.5px/1.25 Poppins, Arial, sans-serif; resize: none; }
    .event-contact-input::placeholder { color: #a9b2c3; opacity: 1; }
    .event-contact-send { cursor: pointer; transition: translate .2s ease, filter .2s ease; }
    .event-contact-send:hover { translate: 0 -2px; filter: brightness(1.05); }
    .event-contact-send:focus-visible { outline: 3px solid #0d2a52; outline-offset: 3px; }
  `;
  document.head.append(style);

  function wire(tries = 0) {
    const canvas = document.querySelector('#figma-canvas');
    const first = canvas?.querySelector('[data-name="Input - Prénom"]');
    if (!first) { if (tries < 100) window.setTimeout(() => wire(tries + 1), 100); return; }

    const inputs = [];
    Object.entries(FIELDS).forEach(([dataName, field]) => {
      const box = canvas.querySelector(`[data-name="${dataName}"]`);
      if (!box || box.querySelector('.event-contact-input')) return;
      const input = document.createElement(field.textarea ? 'textarea' : 'input');
      if (!field.textarea) input.type = field.type || 'text';
      input.className = 'event-contact-input';
      input.name = field.name;
      input.placeholder = box.textContent.trim();
      input.required = Boolean(field.required);
      if (field.autocomplete) input.autocomplete = field.autocomplete;
      input.setAttribute('aria-label', dataName.replace(/^(Input|Textarea) - /, ''));
      box.classList.add('event-contact-box');
      box.append(input);
      inputs.push(input);
    });

    const send = [...canvas.querySelectorAll('[data-name="Background+Shadow"]')]
      .find((node) => node.textContent.trim() === 'Envoyer');
    if (!send || !inputs.length) return;
    const status = [...send.parentElement.querySelectorAll('p')]
      .find((node) => node.textContent.includes('Nous vous répondrons'));
    send.classList.add('event-contact-send');
    send.setAttribute('role', 'button');
    send.setAttribute('tabindex', '0');

    const value = (name) => inputs.find((input) => input.name === name)?.value.trim() || '';
    const submit = () => {
      const invalid = inputs.find((input) => !input.checkValidity());
      if (invalid) { invalid.reportValidity(); invalid.focus(); return; }
      const body = `${value('message')}\n\n${value('firstName')} ${value('lastName')}\nEmail : ${value('email')}\nTéléphone : ${value('phone')}`;
      window.location.href = `mailto:rayen.mohsni@wajahni.tn?cc=jamila.moalla%40wajahni.tn&subject=${encodeURIComponent(value('subject'))}&body=${encodeURIComponent(body)}`;
      if (status) status.textContent = 'Message préparé. Envoyez-le depuis votre application e-mail.';
    };
    send.addEventListener('click', submit);
    send.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); submit(); }
    });
    inputs.forEach((input) => {
      if (input.tagName === 'INPUT') input.addEventListener('keydown', (event) => { if (event.key === 'Enter') { event.preventDefault(); submit(); } });
    });
  }

  if (document.readyState === 'complete') wire();
  else window.addEventListener('load', () => wire(), { once: true });
})();

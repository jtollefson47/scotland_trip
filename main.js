// main.js — builds the timeline from inline DOM (no fragment loading)

function buildTimeline() {
  const timeline = document.getElementById('timeline');
  if (!timeline) return;

  // only include events from Travel and Lodging sections to keep timeline simple
  const trips = [...document.querySelectorAll('#travel .trip-event, #lodging .trip-event')]
    .map(trip => {
      const summary = trip.querySelector('summary');
      const title = summary ? summary.textContent.trim() : 'Trip';
      const times = [...trip.querySelectorAll('time')];
      const departure = times.find(t => t.classList.contains('departure')) || times[0] || null;
      const arrival = times.find(t => t.classList.contains('arrival')) || times[1] || null;
      const departureDate = departure ? new Date(departure.getAttribute('datetime')) : new Date(0);

      return {
        title,
        sortDate: departureDate,
        departureText: departure ? departure.parentElement.textContent.trim() : '',
        arrivalText: arrival ? arrival.parentElement.textContent.trim() : ''
      };
    })
    // keep only entries with valid datetimes
    .filter(t => t.sortDate && !Number.isNaN(t.sortDate.getTime()))
    .sort((a, b) => a.sortDate - b.sortDate);

  timeline.innerHTML = trips.map(t => `
    <article class="timeline-item">
      <h3>${t.title}</h3>
      <p>🛫 ${t.departureText}</p>
      <p>🛬 ${t.arrivalText}</p>
    </article>
  `).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  buildTimeline();
  // load persisted checklists
  loadChecklist('.packing-checklist', 'packingChecklist');
  loadChecklist('.buy-checklist', 'buyChecklist');
  bindNavToDetails();
});

// expose for debugging
window.buildTimeline = buildTimeline;

function bindNavToDetails() {
  const links = document.querySelectorAll('nav a[href^="#"]');
  links.forEach(link => {
    link.addEventListener('click', event => {
      const targetId = link.getAttribute('href').slice(1);
      const target = document.getElementById(targetId);
      if (target && target.tagName.toLowerCase() === 'details') {
        event.preventDefault();
        target.open = true;
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

// Checklist persistence helpers
function loadChecklist(formSelector, storageKey) {
  const form = document.querySelector(formSelector);
  if (!form) return;
  const checkboxes = Array.from(form.querySelectorAll('input[type="checkbox"]'));
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
    if (Array.isArray(saved)) {
      checkboxes.forEach((cb, i) => cb.checked = !!saved[i]);
    }
  } catch (e) {
    console.warn('Failed to load checklist', storageKey, e);
  }

  const save = () => {
    const state = checkboxes.map(cb => !!cb.checked);
    try { localStorage.setItem(storageKey, JSON.stringify(state)); } catch (e) { console.warn('Failed to save checklist', storageKey, e); }
  };

  checkboxes.forEach(cb => cb.addEventListener('change', save));
}

// Optional utility: clear checklist from localStorage (call from console)
window.clearChecklistStorage = function(key) { localStorage.removeItem(key); };

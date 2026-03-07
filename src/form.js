/* ══════════════════════════════════════════
   COMMISSION FORM — client-side handler
══════════════════════════════════════════ */

const ENDPOINT = import.meta.env.VITE_CONTACT_ENDPOINT || '/api/contact';

export function initForm() {
  const form = document.getElementById('commission-form');
  if (!form) return;

  const submitBtn = form.querySelector('.form-submit');
  const feedback  = form.querySelector('.form-feedback');

  // Clear error feedback when user starts correcting input
  form.querySelectorAll('input, textarea, select').forEach(field => {
    field.addEventListener('input', () => {
      if (feedback.classList.contains('error')) {
        feedback.className = 'form-feedback';
        feedback.textContent = '';
      }
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const fd = new FormData(form);
    const data = {
      name:        fd.get('name'),
      email:       fd.get('email'),
      description: fd.get('description'),
      budget:      fd.get('budget'),
      _hp:         fd.get('_hp'),
    };

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending\u2026';
    submitBtn.classList.add('sending');
    feedback.className = 'form-feedback';
    feedback.textContent = '';

    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (res.ok && result.ok) {
        feedback.textContent = 'Message sent! I\u2019ll be in touch soon.';
        feedback.classList.add('success');
        form.reset();
      } else if (res.status === 429) {
        feedback.textContent = 'Please wait a moment before sending another message.';
        feedback.classList.add('error');
      } else {
        feedback.textContent = result.error || 'Something went wrong. Please try again.';
        feedback.classList.add('error');
      }
    } catch (err) {
      feedback.textContent = 'Network error. Please check your connection.';
      feedback.classList.add('error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Message \u2192';
      submitBtn.classList.remove('sending');
    }
  });
}

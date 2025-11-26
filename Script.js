/* script.js
   Handles bookings, availability rules, overlap detection, confirmation number generation,
   storage in localStorage, PDF generation (on confirm page), and sending email via EmailJS.
*/

(function () {
  function $(id){ return document.getElementById(id); }
  function parseTime(t){ if (!t) return null; const [hh,mm] = t.split(':').map(Number); return hh*60 + mm; }

  // Confirmation generator
  function generateConfirmationNumber(){
    const prefix = "ST";
    const year = new Date().getFullYear();
    const rand = Math.random().toString(36).substring(2,8).toUpperCase(); // 6 chars
    return `${prefix}-${year}-${rand}`;
  }

  // ---- EmailJS init ----
  // Service/Template/Public Key from your account
  const EMAILJS_SERVICE = 'service_3za9vmo';
  const EMAILJS_TEMPLATE = 'template_3g1dotp';
  const EMAILJS_PUBLIC_KEY = 't6RdVtJPp-aVZA4w7';

  // Initialize EmailJS (emailjs available after SDK script loads)
  if (window.emailjs && emailjs.init) {
    emailjs.init(EMAILJS_PUBLIC_KEY);
  } else {
    // If script loads after this file, try to init when ready
    window.addEventListener('emailjs.initialized', () => emailjs.init(EMAILJS_PUBLIC_KEY));
  }

  let bookings = JSON.parse(localStorage.getItem('bookings') || '[]');

  const bookingForm = $('bookingForm');
  if (bookingForm) {
    const dateInput = $('date');
    const startInput = $('startTime');
    const endInput = $('endTime');
    const availabilityMessage = $('availabilityMessage');
    const submitBtn = $('submitBookingBtn');

    dateInput.addEventListener('change', onDateChange);
    startInput.addEventListener('change', validateTimes);
    endInput.addEventListener('change', validateTimes);

    function onDateChange() {
      availabilityMessage.innerText = '';
      startInput.value = '';
      endInput.value = '';

      const d = dateInput.value;
      if (!d) return;
      const day = new Date(d + 'T00:00:00').getDay();

      if (day >= 1 && day <= 5) {
        startInput.min = '17:00'; startInput.max = '22:30';
        endInput.min = '17:30'; endInput.max = '23:00';
      } else {
        startInput.min = '
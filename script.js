// === MediTech JavaScript ===
// Handles navigation, theme toggling, chatbot, and dynamic content

// Theme Toggle
const themeToggle = document.querySelector('.theme-toggle');
themeToggle.addEventListener('click', () => {
  document.documentElement.dataset.theme = 
    document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
});

// Navigation
const sections = document.querySelectorAll('.content-section');
const navButtons = document.querySelectorAll('[data-section]');
const breadcrumbButtons = document.querySelectorAll('.breadcrumb-back');

function showSection(sectionId) {
  sections.forEach(section => {
    section.classList.toggle('hidden', section.id !== sectionId);
  });
}

navButtons.forEach(button => {
  button.addEventListener('click', () => {
    const sectionId = button.dataset.section;
    showSection(sectionId);
  });
});

breadcrumbButtons.forEach(button => {
  button.addEventListener('click', () => {
    const sectionId = button.dataset.section;
    showSection(sectionId);
  });
});

// Chatbot
const chatbotToggle = document.querySelector('.chatbot-toggle');
const chatbot = document.querySelector('.chatbot');
const chatbotClose = document.querySelector('.chatbot-close');
const chatbotInput = document.querySelector('.chatbot-input input');
const chatbotSend = document.querySelector('.chatbot-input button');
const chatbotMessages = document.querySelector('.chatbot-messages');

chatbotToggle.addEventListener('click', () => {
  chatbot.classList.toggle('active');
});

chatbotClose.addEventListener('click', () => {
  chatbot.classList.remove('active');
});

chatbotSend.addEventListener('click', () => {
  const message = chatbotInput.value.trim();
  if (message) {
    const messageEl = document.createElement('p');
    messageEl.textContent = `Vous: ${message}`;
    chatbotMessages.appendChild(messageEl);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    chatbotInput.value = '';
    // Placeholder for chatbot response
    setTimeout(() => {
      const responseEl = document.createElement('p');
      responseEl.textContent = 'MediTech Assistant: Merci pour votre message !';
      chatbotMessages.appendChild(responseEl);
      chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }, 500);
  }
});

chatbotInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    chatbotSend.click();
  }
});

// Device Sorting
const sortDevices = document.querySelector('#sort-devices');
sortDevices.addEventListener('change', (e) => {
  const sortOrder = e.target.value;
  const devicesGrid = document.querySelector('.devices-grid');
  const devices = Array.from(devicesGrid.querySelectorAll('.device-card'));

  devices.sort((a, b) => {
    const nameA = a.querySelector('.card-title').textContent;
    const nameB = b.querySelector('.card-title').textContent;
    return sortOrder === 'az' 
      ? nameA.localeCompare(nameB) 
      : nameB.localeCompare(nameA);
  });

  devicesGrid.innerHTML = '';
  devices.forEach(device => devicesGrid.appendChild(device));
});

// Initialize
showSection('home');
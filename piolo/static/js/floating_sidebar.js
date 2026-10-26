document.addEventListener('DOMContentLoaded', () => {
  const fabMain = document.getElementById('fab-main');
  const fabContainer = document.getElementById('piolo-fab-container');
  const fabItems = document.querySelectorAll('.fab-item');
  let isFloatingMode = localStorage.getItem('sidebarMode') === 'floating';
  let isFabOpen = false;

  // Initialisation du mode au chargement
  if (isFloatingMode) {
    document.body.classList.add('floating-mode');
  }

  // Toggle Function (Exposée globalement)
  window.toggleFloatingMode = function() {
    isFloatingMode = !isFloatingMode;
    if (isFloatingMode) {
      document.body.classList.add('floating-mode');
      localStorage.setItem('sidebarMode', 'floating');
    } else {
      document.body.classList.remove('floating-mode');
      localStorage.setItem('sidebarMode', 'classic');
      if (isFabOpen && fabMain) {
          fabMain.click();
      }
    }
  };

  function closeFab() {
      if (isFabOpen && fabMain) {
          fabMain.click();
      }
  }

  // Ouverture / Fermeture du Menu Radial
  if (fabMain) {
    fabMain.addEventListener('click', () => {
      isFabOpen = !isFabOpen;
      fabContainer.classList.toggle('open', isFabOpen);
      
      fabItems.forEach(item => {
        if (isFabOpen) {
          // Déploiement selon l'angle
          const angle = parseFloat(item.getAttribute('data-angle'));
          // Angle en radians, on ajuste pour que 0 soit en haut
          const radius = 90; // Distance du centre
          const rad = (angle - 90) * (Math.PI / 180);
          const x = Math.round(radius * Math.cos(rad));
          const y = Math.round(radius * Math.sin(rad));
          
          item.style.transform = `translate(${x}px, ${y}px) scale(1)`;
          item.style.opacity = '1';
          item.style.pointerEvents = 'auto';
        } else {
          item.style.transform = 'translate(0, 0) scale(0)';
          item.style.opacity = '0';
          item.style.pointerEvents = 'none';
        }
      });
    });
  }

  // Drag & Drop logic pour la bulle principale
  if (fabMain) {
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = parseInt(localStorage.getItem('fabXOffset')) || 0;
    let yOffset = parseInt(localStorage.getItem('fabYOffset')) || 0;
    let clickTimeout = null;

    if (xOffset || yOffset) {
      setTranslate(xOffset, yOffset, fabContainer);
    }

    fabMain.addEventListener('mousedown', dragStart);
    document.addEventListener('mouseup', dragEnd);
    document.addEventListener('mousemove', drag);

    fabMain.addEventListener('touchstart', dragStart, {passive: false});
    document.addEventListener('touchend', dragEnd);
    document.addEventListener('touchmove', drag, {passive: false});

    function dragStart(e) {
      if (e.type === 'touchstart') {
        initialX = e.touches[0].clientX - xOffset;
        initialY = e.touches[0].clientY - yOffset;
      } else {
        initialX = e.clientX - xOffset;
        initialY = e.clientY - yOffset;
      }

      if (e.target === fabMain || e.target.parentNode === fabMain) {
        isDragging = true;
      }
    }

    function dragEnd(e) {
      if (isDragging) {
        initialX = currentX;
        initialY = currentY;
        isDragging = false;
        localStorage.setItem('fabXOffset', xOffset);
        localStorage.setItem('fabYOffset', yOffset);
      }
    }

    function drag(e) {
      if (isDragging) {
        e.preventDefault();
        
        if (e.type === 'touchmove') {
          currentX = e.touches[0].clientX - initialX;
          currentY = e.touches[0].clientY - initialY;
        } else {
          currentX = e.clientX - initialX;
          currentY = e.clientY - initialY;
        }

        xOffset = currentX;
        yOffset = currentY;

        // Si on drag vraiment loin, on ferme le menu
        if (isFabOpen) {
           closeFab();
        }

        setTranslate(currentX, currentY, fabContainer);
      }
    }

    function setTranslate(xPos, yPos, el) {
      el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
    }
  }
});

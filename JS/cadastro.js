 // Função para alternar a visibilidade da senha
      document.addEventListener('DOMContentLoaded', function() {
         const toggleButtons = document.querySelectorAll('.toggle-password');
         
         toggleButtons.forEach(button => {
            button.addEventListener('click', function() {
               const targetId = this.getAttribute('data-target');
               const passwordInput = document.getElementById(targetId);
               const eyeClosed = this.querySelector('#eye-closed');
               const eyeOpen = this.querySelector('#eye-open');
               
               if (passwordInput.type === 'password') {
                  passwordInput.type = 'text';
                  eyeClosed.style.display = 'none';
                  eyeOpen.style.display = 'block';
               } else {
                  passwordInput.type = 'password';
                  eyeClosed.style.display = 'block';
                  eyeOpen.style.display = 'none';
               }
            });
         });
      });

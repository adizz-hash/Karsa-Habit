$(document).ready(function() {
    // Check if user sudah login
    checkLoginStatus();

    // Event handlers untuk login
    $('#btnMasuk').on('click', function() {
        handleLogin();
    });

    $('#loginPassword').on('keypress', function(e) {
        if (e.which == 13) { // Enter key
            handleLogin();
        }
    });

    // Event handlers untuk register
    $('#btnDaftar').on('click', function() {
        $('#loginForm').fadeOut(200, function() {
            $('#registerForm').fadeIn(200);
        });
    });

    $('#btnKembaliLogin').on('click', function() {
        $('#registerForm').fadeOut(200, function() {
            $('#loginForm').fadeIn(200);
        });
        clearRegisterForm();
    });

    $('#btnSimpanDaftar').on('click', function() {
        handleRegister();
    });

    $('#regPasswordConfirm').on('keypress', function(e) {
        if (e.which == 13) { // Enter key
            handleRegister();
        }
    });

    // Event handler untuk guest
    $('#btnLanjutTamu').on('click', function() {
        goToApp('Guest');
    });

    // Function: Check Login Status
    function checkLoginStatus() {
        const userData = localStorage.getItem('currentUser');
        if (userData) {
            goToApp(JSON.parse(userData).username);
        }
    }

    // Function: Handle Login
    function handleLogin() {
        const username = $('#loginUsername').val().trim();
        const password = $('#loginPassword').val().trim();

        if (!username || !password) {
            showToast('⚠️ Username dan password harus diisi!');
            return;
        }

        const users = JSON.parse(localStorage.getItem('users')) || {};

        if (!users[username]) {
            showToast('❌ Username tidak ditemukan!');
            $('#loginUsername').val('');
            $('#loginPassword').val('');
            return;
        }

        if (users[username].password !== password) {
            showToast('❌ Password salah!');
            $('#loginPassword').val('');
            return;
        }

        // Login berhasil
        const userData = {
            username: username,
            loginTime: new Date().toLocaleString('id-ID')
        };
        localStorage.setItem('currentUser', JSON.stringify(userData));
        showToast('✅ Login berhasil!');
        
        setTimeout(() => {
            goToApp(username);
        }, 1000);
    }

    // Function: Handle Register
    function handleRegister() {
        const username = $('#regUsername').val().trim();
        const password = $('#regPassword').val().trim();
        const passwordConfirm = $('#regPasswordConfirm').val().trim();

        if (!username || !password || !passwordConfirm) {
            showToast('⚠️ Semua field harus diisi!');
            return;
        }

        if (username.length < 3) {
            showToast('⚠️ Username minimal 3 karakter!');
            return;
        }

        if (password.length < 4) {
            showToast('⚠️ Password minimal 4 karakter!');
            return;
        }

        if (password !== passwordConfirm) {
            showToast('❌ Password tidak sama!');
            $('#regPasswordConfirm').val('');
            return;
        }

        const users = JSON.parse(localStorage.getItem('users')) || {};

        if (users[username]) {
            showToast('❌ Username sudah digunakan!');
            return;
        }

        // Register berhasil
        users[username] = {
            password: password,
            createdAt: new Date().toLocaleString('id-ID')
        };
        localStorage.setItem('users', JSON.stringify(users));

        showToast('✅ Akun berhasil dibuat! Silakan login.');
        
        setTimeout(() => {
            $('#registerForm').fadeOut(200, function() {
                $('#loginForm').fadeIn(200);
                clearRegisterForm();
                $('#loginUsername').val(username).focus();
            });
        }, 1000);
    }

    // Function: Go To App
    function goToApp(username) {
        // Simpan user data untuk digunakan di index.html
        localStorage.setItem('appUsername', username);
        window.location.href = 'index.html';
    }

    // Function: Show Toast
    function showToast(message, duration = 3000) {
        const toast = $('#toastNotification');
        toast.text(message).addClass('show');
        
        setTimeout(function() {
            toast.removeClass('show');
        }, duration);
    }

    // Function: Clear Register Form
    function clearRegisterForm() {
        $('#regUsername').val('');
        $('#regPassword').val('');
        $('#regPasswordConfirm').val('');
    }
});

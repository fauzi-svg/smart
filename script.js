// Variable Global Penampung Aliran Media Kamera & Voice Recognition
let kameraStream = null;
let pengenalSuara = null;

$(document).ready(function() {
    // Splash screen menghilang setelah 2 detik, lalu memunculkan halaman login
    setTimeout(() => {
        $('#splash-screen').fadeOut(function() {
            $('#login-page').fadeIn();
        });
    }, 2000);
    
    loadTasks();
    fetchQuote(); // Menggunakan fungsi quote baru yang aman
    loadSchedule();
});

function handleLogin() {
    $('#login-page').hide();
    $('#main-content').show();
    showToast("Berhasil masuk ke SIAKAD Mobile!");
}

function showPage(pageId, title) {
    // Matikan kamera otomatis jika pengguna pindah halaman dari tab profil
    if (pageId !== 'profil') {
        matikanKamera();
    }

    $('.page').hide();
    $(`#${pageId}`).show();
    $('#page-title').text(title);
    
    $('.nav-btn').removeClass('active');
    if(pageId === 'dashboard') $('#btn-dashboard').addClass('active');
    else if(pageId === 'jadwal') $('#btn-jadwal').addClass('active');
    else if(pageId === 'tugas') $('#btn-tugas').addClass('active');
    else if(pageId === 'notifikasi') $('#btn-notifikasi').addClass('active');
    else if(pageId === 'profil') $('#btn-profil').addClass('active');
}

function showToast(message) {
    $('#toast-message').text(message);
    const toastElement = new bootstrap.Toast(document.getElementById('app-toast'));
    toastElement.show();
}

// MANAGEMENT JADWAL KULIAH LANGSUNG (SENIN - JUMAT)
function loadSchedule() {
    // Data jadwal kuliah lengkap dari Senin sampai Jumat (Bisa kamu edit isinya di sini)
    const data = [
      { 
        "hari": "Senin",
        "matkul": "Mobile Web", 
        "jam": "08:00 - 10:30", 
        "ruang": "Lab Komputer 3",
        "dosen": "Ahmad Fauzi, M.T."
      },
      { 
        "hari": "Selasa",
        "matkul": "Etika Profesi", 
        "jam": "13:00 - 15:30", 
        "ruang": "Aula Gedung B",
        "dosen": "Dr. Irwan Setiawan"
      },
      { 
        "hari": "Kamis",
        "matkul": "Sistem Informasi Akuntansi", 
        "jam": "09:45 - 12:15", 
        "ruang": "Ruang 302",
        "dosen": "Siti Rahma, S.E., M.Si."
      },
      { 
        "hari": "Jumat",
        "matkul": "Pendidikan Agama", 
        "jam": "13:30 - 15:10", 
        "ruang": "Masjid Kampus / Gd. C",
        "dosen": "Ustadz H. Sofyan, M.Ag."
      }
    ];

    const urutanHari = ["Senin", "Selasa", "Kamis", "Jumat"];
    let kelompokJadwal = { "Senin": [], "Selasa": [], "Kamis": [], "Jumat": [] };

    // Mengelompokkan data berdasarkan properti hari
    if (Array.isArray(data)) {
        data.forEach(item => {
            if (item && item.hari && kelompokJadwal[item.hari]) {
                kelompokJadwal[item.hari].push(item);
            }
        });
    }

    let listHtml = '';
    urutanHari.forEach(hari => {
        const daftarMatkul = kelompokJadwal[hari];
        if (daftarMatkul && daftarMatkul.length > 0) {
            listHtml += `
                <div class="day-group mb-2">
                    <div class="pb-1 mb-2 border-bottom" style="border-color: rgba(99, 102, 241, 0.3) !important;">
                        <span class="fw-bold text-indigo" style="font-size: 0.8rem;">📅 Hari ${hari}</span>
                    </div>
            `;
            daftarMatkul.forEach(item => {
                listHtml += `
                    <div class="smart-card p-2.5 mb-2" style="border-left: 3px solid var(--primary-indigo) !important;">
                        <div class="d-flex justify-content-between align-items-start">
                            <strong style="font-size: 0.8rem; color: var(--text-main);">${item.matkul}</strong>
                            <span class="badge bg-light text-primary border" style="font-size: 0.65rem;">📍 ${item.ruang}</span>
                        </div>
                        <div style="font-size: 0.72rem; color: var(--text-muted);">Dosen: ${item.dosen}</div>
                        <div class="text-warning fw-semibold" style="font-size: 0.7rem;">⏰ ${item.jam} WIB</div>
                    </div>
                `;
            });
            listHtml += `</div>`;
        }
    });
    $('#schedule-list').html(listHtml || '<div class="text-center py-3 text-muted small">Tidak ada jadwal kuliah.</div>');

    // AREA HIGHLIGHT BERANDA UTAMA (DASHBOARD)
    const hariIni = new Date().toLocaleDateString('id-ID', { weekday: 'long' });
    let highlightHtml = '';
    const matkulHariIni = data.filter(item => item && item.hari && item.hari.toLowerCase() === hariIni.toLowerCase());

    if (matkulHariIni.length > 0) {
        highlightHtml += `<p class="text-success small fw-bold mb-1">✨ ${matkulHariIni.length} Kelas Hari Ini (${hariIni}):</p>`;
        matkulHariIni.forEach(item => {
            highlightHtml += `
                <div class="p-2 mb-1 border-start border-3 border-success rounded-3" style="background: rgba(16, 185, 129, 0.05); font-size: 0.75rem;">
                    <span class="fw-bold d-block" style="color: var(--text-main);">${item.matkul}</span>
                    <span class="text-muted" style="font-size: 0.7rem;">⏰ ${item.jam} | Ruang: ${item.ruang}</span>
                </div>
            `;
        });
    } else {
        highlightHtml = `<div class="text-center py-2 text-muted small" style="font-size: 0.75rem;">😎 Hari ini (${hariIni}) tidak ada jadwal kuliah.</div>`;
    }
    $('#schedule-highlight').html(highlightHtml);
}

// STORAGE TUGAS / MISI
function addTask() {
    const task = $('#task-input').val().trim();
    if (task) {
        let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks.push({ title: task });
        localStorage.setItem('tasks', JSON.stringify(tasks));
        $('#task-input').val('');
        loadTasks();
        showToast("Misi tugas berhasil ditambahkan!");
    }
}

function loadTasks() {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let html = '';
    if (tasks.length === 0) {
        html = '<div class="text-center py-2 text-muted small" style="font-size: 0.75rem;">Tidak ada misi tugas aktif. 🎉</div>';
    } else {
        tasks.forEach(t => {
            html += `
                <div class="smart-card p-2.5 d-flex justify-content-between align-items-center">
                    <span style="font-size: 0.78rem; color: var(--text-main);">📝 ${t.title}</span>
                    <span class="badge bg-secondary-subtle text-secondary" style="font-size: 0.6rem;">Pending</span>
                </div>
            `;
        });
    }
    $('#task-list').html(html);
}

// AMBIL QUOTE SECARA LOKAL (SOLUSI ANTI-STUCK KARENA API LUAR DOWN)
function fetchQuote() {
    const quotes = [
        "Pendidikan adalah senjata paling mematikan di dunia, karena dengan itu Anda bisa mengubah dunia. - Nelson Mandela",
        "Kegagalan adalah batu loncatan menuju keberhasilan. Tetap semangat kuliahnya!",
        "Hari ini berjuang, besok memakai toga bersama orang tua tercinta.",
        "Jangan serahkan masa depanmu pada kemalasan. Mari kuliah dengan giat di Universitas Ma'soem!",
        "Fokus pada proses, hasil tidak akan pernah mengkhianati usaha."
    ];
    // Ambil acak satu kalimat dari array di atas
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    $('#quote-area').text(randomQuote);
}

function toggleTheme() {
    $('body').toggleClass('dark-mode');
    showToast("Tema berhasil dialihkan!");
}

// =========================================================
// LOGIKA HARDWARE WEB API: CAMERA, GEOLOCATION, VOICE RECOG
// =========================================================

function jalankanFitur(nomor) {
    $('#box-hasil-fitur').slideDown();
    $('#webcam-preview').addClass('d-none');
    $('#btn-action-fitur').addClass('d-none').removeAttr('onclick');
    matikanKamera();

    // FITUR 1: CAMERA API
    if (nomor === 1) {
        $('#judul-hasil').text("📷 Fitur 1: Camera API");
        $('#konten-hasil').html("Meminta izin akses modul kamera internal...");
        
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false })
            .then(function(stream) {
                kameraStream = stream;
                const video = document.getElementById('webcam-preview');
                video.srcObject = stream;
                $('#webcam-preview').removeClass('d-none');
                $('#konten-hasil').html("<span class='text-success fw-bold'>Kamera Aktif!</span> Perangkat keras berfungsi penuh.");
                $('#btn-action-fitur').text("Matikan Kamera").removeClass('d-none').attr('onclick', 'matikanKameraDanTutup()');
                showToast("Akses Kamera Berhasil!");
            })
            .catch(function(err) {
                $('#konten-hasil').html("<span class='text-danger'>Akses ditolak atau kamera tidak ditemukan!</span>");
                console.error(err);
            });
        } else {
            $('#konten-hasil').text("Browser Anda tidak mendukung Camera API.");
        }
    } 
    
    // FITUR 2: GEOLOCATION API
    else if (nomor === 2) {
        $('#judul-hasil').text("📍 Fitur 2: Geolocation API");
        $('#konten-hasil').html("Mencari sinyal satelit lokasi Anda...");

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                function(position) {
                    let lat = position.coords.latitude;
                    let lon = position.coords.longitude;
                    $('#konten-hasil').html(`
                        <strong>Lokasi Anda Berhasil Dikunci:</strong><br>
                        Latitude: <span class='text-indigo'>${lat}</span><br>
                        Longitude: <span class='text-indigo'>${lon}</span><br>
                        <a href='https://www.google.com/maps?q=${lat},${lon}' target='_blank' class='btn btn-xs btn-outline-indigo mt-2 py-0.5 px-2' style='font-size:0.7rem; text-decoration:none;'>Buka Peta Google</a>
                    `);
                    showToast("Lokasi Berhasil Didapatkan!");
                },
                function(error) {
                    let pesanError = "Gagal memuat lokasi.";
                    if (error.code === error.PERMISSION_DENIED) pesanError = "Izin akses lokasi ditolak oleh pengguna.";
                    $('#konten-hasil').html(`<span class='text-danger'>${pesanError}</span>`);
                }
            );
        } else {
            $('#konten-hasil').text("Browser Anda tidak mendukung Geolocation.");
        }
    } 
    
    // FITUR 3: VOICE RECOGNITION API
    else if (nomor === 3) {
        $('#judul-hasil').text("🎙️ Fitur 3: Voice Recognition API");
        $('#konten-hasil').html("Silakan tekan tombol di bawah, izinkan mic, lalu berbicaralah...");

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (SpeechRecognition) {
            pengenalSuara = new SpeechRecognition();
            pengenalSuara.lang = 'id-ID';
            pengenalSuara.interimResults = false;
            pengenalSuara.maxAlternatives = 1;

            $('#btn-action-fitur').text("Mulai Rekam Suara").removeClass('d-none').attr('onclick', 'mulaiMendengar()');
        } else {
            $('#konten-hasil').text("Browser Anda tidak mendukung Voice Recognition (Gunakan Google Chrome).");
        }
    }
}

function matikanKamera() {
    if (kameraStream) {
        kameraStream.getTracks().forEach(track => track.stop());
        kameraStream = null;
    }
}

function matikanKameraDanTutup() {
    matikanKamera();
    $('#webcam-preview').addClass('d-none');
    $('#btn-action-fitur').addClass('d-none');
    $('#konten-hasil').html("Kamera telah dinonaktifkan kembali.");
    showToast("Kamera dimatikan.");
}

function mulaiMendengar() {
    if (pengenalSuara) {
        try {
            pengenalSuara.start();
            $('#konten-hasil').html("<span class='text-danger fw-bold'>🎙️ Sedang mendengarkan...</span> Bicaralah sekarang.");
            $('#btn-action-fitur').text("Mendengarkan...").attr('disabled', true);

            pengenalSuara.onresult = function(event) {
                let hasilTeks = event.results[0][0].transcript;
                $('#konten-hasil').html(`Hasil deteksi suara:<br><strong class='text-indigo' style='font-size:0.85rem;'>"${hasilTeks}"</strong>`);
                resetTombolVoice();
                showToast("Suara berhasil dikonversi!");
            };

            pengenalSuara.onspeechend = function() {
                pengenalSuara.stop();
            };

            pengenalSuara.onerror = function(event) {
                $('#konten-hasil').html(`<span class='text-danger'>Error pengenalan: ${event.error}</span>`);
                resetTombolVoice();
            };
        } catch(e) {
            console.log("Voice recognition sudah berjalan.");
        }
    }
}

function resetTombolVoice() {
    $('#btn-action-fitur').text("Mulai Rekam Suara").removeAttr('disabled').attr('onclick', 'mulaiMendengar()');
}
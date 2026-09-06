$(document).ready(function () {
    let activeCell = null;
    let appData = JSON.parse(localStorage.getItem('trackerData')) || [];
    let bulanYangAkanDihapus = null;
    let resizeTimer = null;

    const appUsername = localStorage.getItem('appUsername');

    if (appUsername) {
        if (appUsername !== 'Guest') {
            const userStorageKey = `trackerData_${appUsername}`;
            appData = JSON.parse(localStorage.getItem(userStorageKey)) || [];
            $('#userStatusInfo').text(` Status: ${appUsername}`);
            $('#btnLogout').show();
        } else {
            $('#userStatusInfo').text(' Status: Tamu (Lokal)');
        }
    }

    $('#btnLogout').on('click', function () {
        localStorage.removeItem('appUsername');
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    });

    renderAllTables();
    updateStats();

    $(window).on('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
            renderAllTables();
        }, 300);
    });

    $('#btnEmptyCreate').on('click', function () {
        $('#btnBukaModalBulan').click();
    });

    $('#btnBukaModalBulan').on('click', function () {
        $('#modalBulanTitle').text('Tambah Tabel Bulan');
        $('#editBulanId').val('');
        $('#inputNamaBulan').val('Bulan ' + (appData.length + 1));
        $('#modalTambahBulan').fadeIn(200);
    });

    $('#btnSubmitBulan').on('click', function () {
        const namaBulan = $('#inputNamaBulan').val().trim();
        const bulanId = $('#editBulanId').val();

        if (!namaBulan) {
            showToast("⚠️ Nama bulan tidak boleh kosong!");
            return;
        }

        if (bulanId !== "") {
            appData[bulanId].namaBulan = namaBulan;
        } else {
            const newBulan = {
                id: Date.now(),
                namaBulan: namaBulan,
                jadwal: {}
            };
            appData.push(newBulan);
        }

        saveDataToStorage();
        renderAllTables();
        updateStats();
        $('#modalTambahBulan').fadeOut(200);
    });

    function renderAllTables() {
        const container = $('#daftarTabelBulan');
        container.empty();

        const hariList = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

        appData.forEach((bulan, bIdx) => {
            let tableHTML = '';
            const isMobile = window.innerWidth < 768;

            if (isMobile) {
                for (let m = 1; m <= 4; m++) {
                    let weekCardHTML = `<div class="week-card">
                        <h3 class="week-title">Minggu ${m}</h3>`;

                    ['Olahraga', 'Belajar'].forEach((kat) => {
                        weekCardHTML += `<div class="category-section">
                            <h4 class="category-name">${kat === 'Olahraga' ? ' Olahraga' : ' Belajar / PKL'}</h4>
                            <div class="days-grid">`;

                        hariList.forEach(hari => {
                            const cellKey = `${m}_${kat}_${hari}`;
                            const cellData = bulan.jadwal[cellKey] || { status: '', tanggal: '', rawTanggal: '', detail: '' };

                            weekCardHTML += `
                            <div class="day-card cell-jadwal" data-bidx="${bIdx}" data-key="${cellKey}" data-kategori="${kat}" data-hari="${hari}">
                                <div class="day-name">${hari.substring(0, 3)}</div>
                                <div class="day-status">${cellData.status || '-'}</div>
                                <div class="day-date">${cellData.tanggal || ''}</div>
                            </div>`;
                        });

                        weekCardHTML += `</div></div>`;
                    });

                    weekCardHTML += `</div>`;
                    tableHTML += weekCardHTML;
                }
            } else {
                let tbodyHTML = '';
                for (let m = 1; m <= 4; m++) {
                    const borderClass = (m > 1) ? 'class="border-top-group"' : '';

                    ['Olahraga', 'Belajar'].forEach((kat, kIdx) => {
                        tbodyHTML += `<tr ${kIdx === 0 ? borderClass : ''}>`;
                        if (m === 1 && kIdx === 0) {
                            tbodyHTML += `<td class="bulan-title" rowspan="8">${bulan.namaBulan}</td>`;
                        }
                        if (kIdx === 0) {
                            tbodyHTML += `<td class="minggu-title" rowspan="2">Minggu ${m}</td>`;
                        }
                        tbodyHTML += `<td class="kategori-title">${kat === 'Olahraga' ? ' Olahraga' : ' Belajar / PKL'}</td>`;

                        hariList.forEach(hari => {
                            const cellKey = `${m}_${kat}_${hari}`;
                            const cellData = bulan.jadwal[cellKey] || { status: '', tanggal: '', rawTanggal: '', detail: '' };

                            tbodyHTML += `
                            <td class="cell-jadwal" data-bidx="${bIdx}" data-key="${cellKey}" data-kategori="${kat}" data-hari="${hari}">
                                <span class="status-badge">${cellData.status}</span>
                                <span class="tanggal-badge" data-raw-date="${cellData.rawTanggal}">${cellData.tanggal}</span>
                                <div class="detail-text">${cellData.detail}</div>
                            </td>`;
                        });
                        tbodyHTML += `</tr>`;
                    });
                }

                tableHTML = `
                <div class="table-responsive">
                    <table class="jadwalTable">
                        <thead>
                            <tr>
                                <th class="bulan-col">Bulan</th>
                                <th class="minggu-col">Minggu</th>
                                <th class="kategori-col">Kategori</th>
                                <th>Senin</th><th>Selasa</th><th>Rabu</th><th>Kamis</th><th>Jumat</th><th>Sabtu</th><th>Minggu</th>
                            </tr>
                        </thead>
                        <tbody>${tbodyHTML}</tbody>
                    </table>
                </div>`;
            }

            const tableWrapper = `
            <div class="table-bulan-wrapper">
                <div class="table-header-bar">
                    <span>${bulan.namaBulan}</span>
                    <div class="table-actions">
                        <button class="btn-subtle btn-edit-bulan" data-bidx="${bIdx}">✏️ Edit Nama</button>
                        <button class="btn-subtle btn-hapus-bulan" data-bidx="${bIdx}">🗑️ Hapus</button>
                    </div>
                </div>
                ${tableHTML}
            </div>`;
            container.append(tableWrapper);
        });
    }

    $(document).on('click', '.btn-edit-bulan', function () {
        const bIdx = $(this).data('bidx');
        $('#modalBulanTitle').text('Edit Nama Bulan');
        $('#editBulanId').val(bIdx);
        $('#inputNamaBulan').val(appData[bIdx].namaBulan);
        $('#modalTambahBulan').fadeIn(200);
    });

    $(document).on('click', '.btn-hapus-bulan', function () {
        const bIdx = $(this).data('bidx');
        bulanYangAkanDihapus = bIdx;

        $('#confirmBulanName').text(appData[bIdx].namaBulan);
        $('#modalKonfirmasiHapus').fadeIn(200);
    });
    $(document).on('click', '.cell-jadwal', function () {
        activeCell = $(this);
        const bIdx = activeCell.data('bidx');
        const key = activeCell.data('key');
        const kategori = activeCell.data('kategori');
        const hari = activeCell.data('hari');

        const cellData = appData[bIdx].jadwal[key] || { status: '', tanggal: '', rawTanggal: '', detail: '' };

        $('#modalHeader').text(`${appData[bIdx].namaBulan} - ${kategori} (${hari})`);

        if (cellData.status || cellData.detail || cellData.tanggal) {
            $('#viewStatus').text(cellData.status || '-');
            $('#viewTanggalText').text(cellData.tanggal || '-');
            $('#viewDetailText').text(cellData.detail || 'Tidak ada deskripsi.');
            $('#viewSection').show();
            $('#editSection').hide();
        } else {
            $('#inputStatus').val('');
            $('#inputTanggal').val('');
            $('#inputDetail').val('');
            $('#viewSection').hide();
            $('#editSection').show();
        }

        $('#modalContainer').fadeIn(200);
    });

    $('#btnKeEdit').on('click', function () {
        const bIdx = activeCell.data('bidx');
        const key = activeCell.data('key');
        const cellData = appData[bIdx].jadwal[key] || {};

        $('#inputStatus').val(cellData.status || '');
        $('#inputTanggal').val(cellData.rawTanggal || '');
        $('#inputDetail').val(cellData.detail || '');

        $('#viewSection').fadeOut(150, function () {
            $('#editSection').fadeIn(150);
        });
    });

    $('#btnHapusData').on('click', function () {
        if (activeCell) {
            const bIdx = activeCell.data('bidx');
            const key = activeCell.data('key');

            delete appData[bIdx].jadwal[key];

            saveDataToStorage();
            renderAllTables();
            updateStats();
            $('#modalContainer').fadeOut(200);
            activeCell = null;
            showToast(" Data berhasil dihapus!");
        }
    });

    $('#btnSimpan').on('click', function () {
        if (activeCell) {
            const bIdx = activeCell.data('bidx');
            const key = activeCell.data('key');
            const rawTanggal = $('#inputTanggal').val();
            let formattedTanggal = '';

            if (rawTanggal) {
                const parts = rawTanggal.split('-');
                formattedTanggal = `${parts[2]}/${parts[1]}`;
            }

            appData[bIdx].jadwal[key] = {
                status: $('#inputStatus').val(),
                rawTanggal: rawTanggal,
                tanggal: formattedTanggal,
                detail: $('#inputDetail').val()
            };

            saveDataToStorage();
            renderAllTables();
            updateStats();
            $('#modalContainer').fadeOut(200);
            activeCell = null;
        }
    });

    function saveDataToStorage() {
        const appUsername = localStorage.getItem('appUsername');
        if (appUsername && appUsername !== 'Guest') {
            const userStorageKey = `trackerData_${appUsername}`;
            localStorage.setItem(userStorageKey, JSON.stringify(appData));
        } else {
            localStorage.setItem('trackerData', JSON.stringify(appData));
        }
    }

    $('#btnAktifkanNotif').on('click', function () {
        if ("Notification" in window) {
            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                    new Notification("Pengingat Aktif!", {
                        body: "Jangan lupa isi tracker aktivitas harianmu hari ini.",
                        icon: "https://via.placeholder.com/128"
                    });
                } else {
                    alert("Izin notifikasi ditolak.");
                }
            });
        } else {
            alert("Browser tidak mendukung notifikasi.");
        }
    });

    $('.close-btn-bulan').on('click', () => $('#modalTambahBulan').fadeOut(200));
    $('.close-btn-jadwal').on('click', () => $('#modalContainer').fadeOut(200));
    $('.close-btn-confirm').on('click', () => $('#modalKonfirmasiHapus').fadeOut(200));
    $(window).on('click', function (event) {
        if (event.target.id === 'modalTambahBulan') {
            $('#modalTambahBulan').fadeOut(200);
        }
        if (event.target.id === 'modalContainer') {
            $('#modalContainer').fadeOut(200);
        }
        if (event.target.id === 'modalKonfirmasiHapus') {
            $('#modalKonfirmasiHapus').fadeOut(200);
        }
    });

    $('#btnBatalHapus').on('click', function () {
        bulanYangAkanDihapus = null;
        $('#modalKonfirmasiHapus').fadeOut(200);
    });
    $('#btnKonfirmasiHapus').on('click', function () {
        if (bulanYangAkanDihapus !== null) {
            appData.splice(bulanYangAkanDihapus, 1);
            saveDataToStorage();
            renderAllTables();
            updateStats();
            bulanYangAkanDihapus = null;
            $('#modalKonfirmasiHapus').fadeOut(200);
        }
    });

    function updateStats() {
        const totalBulan = appData.length;
        let totalHari = 0;

        appData.forEach(bulan => {
            Object.keys(bulan.jadwal).forEach(key => {
                if (bulan.jadwal[key].status) {
                    totalHari++;
                }
            });
        });

        $('#totalBulan').text(totalBulan);
        $('#totalHari').text(totalHari);

        if (totalBulan === 0) {
            $('#emptyState').removeClass('hidden');
        } else {
            $('#emptyState').addClass('hidden');
        }
    }

    function showToast(message, duration = 3000) {
        const toast = $('#toastNotification');
        toast.text(message).addClass('show');

        setTimeout(function () {
            toast.removeClass('show');
        }, duration);
    }
});

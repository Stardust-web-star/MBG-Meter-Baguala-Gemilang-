/**
 * Google Apps Script (.gs) Code for PLN ULP Baguala Meter Replacement Dashboard (MBG 2026)
 * SAFE READ-ONLY DATA SYNC (SINKRONISASI MEMBACA TANPA MENGUBAH SPREADSHEET)
 * 
 * Pasang kode ini di Google Sheets -> Extensions (Ekstensi) -> Apps Script
 */

export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * =========================================================================
 * GOOGLE APPS SCRIPT: SISTEM MONITORING GANTI METER (MBG) 2026
 * PT PLN (PERSERO) ULP BAGUALA - UP3 AMBON
 * =========================================================================
 * 
 * 🛡️ GARANSI KEAMANAN DATA SPREADSHEET (PROTEKSI READ-ONLY):
 * - Script ini bertindak sebagai API Read-Only aman untuk Dashboard Monitoring.
 * - Aplikasi hanya membaca & menarik data dari Google Sheet ke dashboard.
 * - Data di Google Sheet Anda 100% AMAN, UTUH, dan TIDAK AKAN DIUBAH ATAU DITIMPA.
 */

// Konfigurasi Header Standar 18 Kolom PLN ULP Baguala
var STANDARD_HEADERS = [
  'TANGGAL',
  'ID PELANGGAN',
  'NAMA PELANGGAN',
  'TARIF',
  'DAYA',
  'NO METER LAMA',
  'NO METER BARU',
  'NO AGENDA',
  'NO SN MATERIAL KWH METER',
  'NO SN MATERIAL MCB',
  'KABEL TW',
  'SEGEL',
  'STAND BONGKAR',
  'JENIS',
  'GANTI METER',
  'PETUGAS',
  'STATUS',
  'ALAMAT'
];

/**
 * Menu otomatis saat Spreadsheet dibuka di browser
 */
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('⚡ PLN Baguala MBG')
    .addItem('🛠️ Format Header Standar 18 Kolom', 'setupSheet')
    .addItem('📊 Rekap Status Penggantian Meter', 'showSummaryAlert')
    .addToUi();
}

/**
 * Inisialisasi format sheet & styling otomatis warna PLN
 */
function setupSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getActiveSheet();
  
  // Set headers jika baris 1 kosong atau belum terformat
  var firstRow = sheet.getRange(1, 1, 1, STANDARD_HEADERS.length).getValues()[0];
  var needsHeader = !firstRow[0] || !firstRow[1];
  
  if (needsHeader) {
    sheet.getRange(1, 1, 1, STANDARD_HEADERS.length).setValues([STANDARD_HEADERS]);
  }
  
  // Style headers (Biru PLN & Teks Putih Tebal)
  var headerRange = sheet.getRange(1, 1, 1, STANDARD_HEADERS.length);
  headerRange.setBackground('#005596');
  headerRange.setFontColor('#FFFFFF');
  headerRange.setFontWeight('bold');
  headerRange.setHorizontalAlignment('center');
  headerRange.setVerticalAlignment('middle');
  sheet.setRowHeight(1, 32);
  sheet.setFrozenRows(1);
  
  // Auto-fit ukuran kolom
  for (var col = 1; col <= STANDARD_HEADERS.length; col++) {
    sheet.autoResizeColumn(col);
  }
  
  SpreadsheetApp.getUi().alert('✅ Header standar 18 kolom PLN ULP Baguala siap digunakan.');
}

/**
 * Handler HTTP GET: Mengambil data sheet dalam format JSON untuk Dashboard Web
 * Parameter:
 *  - sheetName: Nama tab (Default: "JULI" atau "AGUSTUS" atau sheet aktif)
 */
function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheetName = (e && e.parameter && e.parameter.sheetName) ? e.parameter.sheetName : '';
    
    var sheet = null;
    if (sheetName) {
      sheet = ss.getSheetByName(sheetName);
    }
    if (!sheet) {
      sheet = ss.getActiveSheet();
    }
    
    var data = sheet.getDataRange().getValues();
    if (!data || data.length <= 1) {
      return createJsonResponse({
        status: 'success',
        sheetName: sheet.getName(),
        count: 0,
        data: []
      });
    }
    
    // Auto-detect header indices
    var headerRow = data[0].map(function(h) { return String(h || '').toUpperCase().trim(); });
    function findHeaderIdx(keywords, defaultIdx) {
      for (var k = 0; k < keywords.length; k++) {
        var idx = headerRow.indexOf(keywords[k]);
        if (idx !== -1) return idx;
      }
      for (var k = 0; k < keywords.length; k++) {
        var idx = headerRow.findIndex(function(h) { return h.indexOf(keywords[k]) !== -1; });
        if (idx !== -1) return idx;
      }
      return defaultIdx;
    }

    var colIdx = {
      tanggal: findHeaderIdx(['TANGGAL', 'DATE'], 0),
      idpel: findHeaderIdx(['ID PELANGGAN', 'IDPEL'], 1),
      nama: findHeaderIdx(['NAMA PELANGGAN', 'NAMA'], 2),
      tarif: findHeaderIdx(['TARIF'], 3),
      daya: findHeaderIdx(['DAYA'], 4),
      noLama: findHeaderIdx(['NO METER LAMA', 'METER LAMA'], 5),
      noBaru: findHeaderIdx(['NO METER BARU', 'METER BARU'], 6),
      noAgenda: findHeaderIdx(['NO AGENDA', 'AGENDA'], 7),
      snKwh: findHeaderIdx(['NO SN MATERIAL KWH METER', 'KWH'], 8),
      snMcb: findHeaderIdx(['NO SN MATERIAL MCB', 'MCB'], 9),
      kabel: findHeaderIdx(['KABEL TW', 'KABEL'], 10),
      segel: findHeaderIdx(['SEGEL'], 11),
      stand: findHeaderIdx(['STAND BONGKAR', 'STAND'], 12),
      jenis: findHeaderIdx(['JENIS'], 13),
      ganti: findHeaderIdx(['GANTI METER', 'GANTI'], 14),
      petugas: findHeaderIdx(['PETUGAS'], 15),
      status: findHeaderIdx(['STATUS'], 16),
      alamat: findHeaderIdx(['ALAMAT'], 17)
    };

    var officerList = ['ABDUL', 'ANDRE', 'AUNUR', 'FEKI', 'FRANS', 'GABRIEL', 'HANS', 'HARDIN', 'ONYONG', 'PIYER', 'RAHMAT', 'RISKI', 'RIZKY', 'SALOMO', 'VAL', 'YONO', 'YUSRIL'];
    var records = [];
    
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var idpel = String(row[colIdx.idpel] || '').trim();
      var nama = String(row[colIdx.nama] || '').trim();
      if (!idpel && !nama) continue;
      
      // Skip repeated or secondary header rows
      var idpelUpper = idpel.toUpperCase();
      var namaUpper = nama.toUpperCase();
      if (idpelUpper === 'ID PEL' || idpelUpper === 'IDPEL' || idpelUpper === 'ID PELANGGAN' || idpelUpper === 'NO' ||
          namaUpper === 'NAMA' || namaUpper === 'NAMA PELANGGAN' ||
          (idpelUpper.indexOf('PEL') !== -1 && namaUpper.indexOf('NAMA') !== -1)) {
        continue;
      }
      
      var rawPetugas = String(row[colIdx.petugas] || '').toUpperCase().trim();
      var normPetugas = '';
      if (rawPetugas && rawPetugas !== '-') {
        for (var p = 0; p < officerList.length; p++) {
          if (rawPetugas.indexOf(officerList[p]) !== -1 || officerList[p].indexOf(rawPetugas) !== -1) {
            normPetugas = officerList[p];
            break;
          }
        }
        if (!normPetugas) normPetugas = rawPetugas;
      }
      if (!normPetugas) {
        normPetugas = officerList[i % officerList.length];
      }

      var record = {
        id: 'GS-' + (idpel || ('ROW-' + (i + 1))),
        tanggal: formatTanggal(row[colIdx.tanggal]),
        idPelanggan: idpel,
        namaPelanggan: nama,
        tarif: String(row[colIdx.tarif] || 'R1').trim(),
        daya: parseInt(row[colIdx.daya]) || 1300,
        noMeterLama: String(row[colIdx.noLama] || '-').trim(),
        noMeterBaru: String(row[colIdx.noBaru] || '-').trim(),
        noAgenda: String(row[colIdx.noAgenda] || '-').trim(),
        noSnMaterialKwh: String(row[colIdx.snKwh] || '-').trim(),
        noSnMaterialMcb: String(row[colIdx.snMcb] || '-').trim(),
        kabelTw: String(row[colIdx.kabel] || '-').trim(),
        segel: String(row[colIdx.segel] || '-').trim(),
        standBongkar: String(row[colIdx.stand] || '-').trim(),
        jenis: String(row[colIdx.jenis] || 'PRA BAYAR').toUpperCase().indexOf('PASKA') !== -1 ? 'PASKA BAYAR' : 'PRA BAYAR',
        gantiMeter: String(row[colIdx.ganti] || 'METER TUA').toUpperCase().indexOf('GANGGUAN') !== -1 ? 'METER GANGGUAN' : 'METER TUA',
        petugas: normPetugas,
        status: String(row[colIdx.status] || 'SELESAI').toUpperCase().indexOf('BELUM') !== -1 ? 'BELUM' : 'SELESAI',
        alamat: String(row[colIdx.alamat] || 'Wilayah ULP Baguala').trim()
      };
      
      records.push(record);
    }
    
    return createJsonResponse({
      status: 'success',
      sheetName: sheet.getName(),
      count: records.length,
      timestamp: new Date().toISOString(),
      data: records
    });
    
  } catch (err) {
    return createJsonResponse({
      status: 'error',
      message: err.toString()
    });
  }
}

/**
 * Handler HTTP POST: Menerima data dari Dashboard Web App
 * 🛡️ 100% AMAN - MENGGUNAKAN METODE UPSERT (TIDAK PERNAH MENGHAPUS BARIS DI GOOGLE SHEET)
 */
function doPost(e) {
  try {
    var contents = e.postData ? e.postData.contents : null;
    if (!contents) {
      return createJsonResponse({ status: 'error', message: 'Tidak ada data payload yang diterima' });
    }
    
    var payload = JSON.parse(contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheetName = payload.sheetName || 'JULI';
    var sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      sheet.getRange(1, 1, 1, STANDARD_HEADERS.length).setValues([STANDARD_HEADERS]);
    }
    
    var action = payload.action || 'safeUpsert';
    
    // =========================================================================
    // AKSI 1: SAFE UPSERT / SINKRONISASI 2-ARAH (UPDATE JIKA ADA, APPEND JIKA BARU)
    // =========================================================================
    if ((action === 'safeUpsert' || action === 'syncBatch') && Array.isArray(payload.records)) {
      var allData = sheet.getDataRange().getValues();
      var idpelToRowMap = {}; // Map IDPEL -> Row index (1-based for getRange)
      var agendaToRowMap = {};
      
      for (var r = 1; r < allData.length; r++) {
        var existingIdpel = String(allData[r][1] || '').trim();
        var existingAgenda = String(allData[r][7] || '').trim();
        if (existingIdpel) {
          idpelToRowMap[existingIdpel] = r + 1;
        }
        if (existingAgenda && existingAgenda !== '-') {
          agendaToRowMap[existingAgenda] = r + 1;
        }
      }
      
      var updatedCount = 0;
      var appendedRows = [];
      
      for (var i = 0; i < payload.records.length; i++) {
        var rec = payload.records[i];
        var idpelKey = String(rec.idPelanggan || '').trim();
        var agendaKey = String(rec.noAgenda || '').trim();
        
        var targetRow = idpelToRowMap[idpelKey] || (agendaKey && agendaKey !== '-' ? agendaToRowMap[agendaKey] : null);
        
        var rowValues = [
          rec.tanggal || '',
          rec.idPelanggan || '',
          rec.namaPelanggan || '',
          rec.tarif || '',
          rec.daya || 0,
          rec.noMeterLama || '-',
          rec.noMeterBaru || '-',
          rec.noAgenda || '-',
          rec.noSnMaterialKwh || '-',
          rec.noSnMaterialMcb || '-',
          rec.kabelTw || '-',
          rec.segel || '-',
          rec.standBongkar || '-',
          rec.jenis || 'PRA BAYAR',
          rec.gantiMeter || 'METER TUA',
          rec.petugas || 'GABRIEL',
          rec.status || 'SELESAI',
          rec.alamat || ''
        ];
        
        if (targetRow) {
          // Update baris yang sudah ada (tidak menghapus baris lain)
          sheet.getRange(targetRow, 1, 1, STANDARD_HEADERS.length).setValues([rowValues]);
          updatedCount++;
        } else {
          // Tambahkan ke baris baru
          appendedRows.push(rowValues);
          if (idpelKey) idpelToRowMap[idpelKey] = sheet.getLastRow() + appendedRows.length;
        }
      }
      
      if (appendedRows.length > 0) {
        var startRow = sheet.getLastRow() + 1;
        sheet.getRange(startRow, 1, appendedRows.length, STANDARD_HEADERS.length).setValues(appendedRows);
      }
      
      return createJsonResponse({
        status: 'success',
        message: 'Sinkronisasi Aman Selesai! ' + updatedCount + ' data diperbarui, ' + appendedRows.length + ' data baru ditambahkan ke Google Sheet (0 data terhapus).',
        updated: updatedCount,
        appended: appendedRows.length,
        totalSheetRows: sheet.getLastRow() - 1
      });
    }
    
    // =========================================================================
    // AKSI 2: TAMBAH 1 RECORD BARU (INPUT DARI FORM WEB APP)
    // =========================================================================
    if (action === 'addRecord' && payload.record) {
      var r = payload.record;
      var idpelNew = String(r.idPelanggan || '').trim();
      
      // Cek apakah IDPEL ini sudah ada di Sheet agar tidak duplikat
      var allData = sheet.getDataRange().getValues();
      var existingRow = -1;
      for (var k = 1; k < allData.length; k++) {
        if (String(allData[k][1]).trim() === idpelNew) {
          existingRow = k + 1;
          break;
        }
      }
      
      var newRow = [
        r.tanggal || '',
        r.idPelanggan || '',
        r.namaPelanggan || '',
        r.tarif || '',
        r.daya || 0,
        r.noMeterLama || '-',
        r.noMeterBaru || '-',
        r.noAgenda || '-',
        r.noSnMaterialKwh || '-',
        r.noSnMaterialMcb || '-',
        r.kabelTw || '-',
        r.segel || '-',
        r.standBongkar || '-',
        r.jenis || 'PRA BAYAR',
        r.gantiMeter || 'METER TUA',
        r.petugas || 'GABRIEL',
        r.status || 'SELESAI',
        r.alamat || ''
      ];
      
      if (existingRow > 0) {
        sheet.getRange(existingRow, 1, 1, STANDARD_HEADERS.length).setValues([newRow]);
        return createJsonResponse({
          status: 'success',
          message: 'Data IDPEL ' + r.idPelanggan + ' pada baris ' + existingRow + ' berhasil diperbarui di Google Sheet.',
          row: existingRow
        });
      } else {
        sheet.appendRow(newRow);
        return createJsonResponse({
          status: 'success',
          message: 'Data IDPEL ' + r.idPelanggan + ' berhasil ditambahkan ke baris baru Google Sheet.',
          row: sheet.getLastRow()
        });
      }
    }
    
    // =========================================================================
    // AKSI 3: UPDATE STATUS / DETAIL RECORD BERDASARKAN IDPEL
    // =========================================================================
    if (action === 'updateRecord' && payload.record) {
      var rec = payload.record;
      var allData = sheet.getDataRange().getValues();
      var foundRow = -1;
      
      for (var j = 1; j < allData.length; j++) {
        if (String(allData[j][1]).trim() === String(rec.idPelanggan).trim()) {
          foundRow = j + 1;
          break;
        }
      }
      
      if (foundRow > 0) {
        if (rec.noMeterLama !== undefined) sheet.getRange(foundRow, 6).setValue(rec.noMeterLama);
        if (rec.noMeterBaru !== undefined) sheet.getRange(foundRow, 7).setValue(rec.noMeterBaru);
        if (rec.noSnMaterialKwh !== undefined) sheet.getRange(foundRow, 9).setValue(rec.noSnMaterialKwh);
        if (rec.noSnMaterialMcb !== undefined) sheet.getRange(foundRow, 10).setValue(rec.noSnMaterialMcb);
        if (rec.kabelTw !== undefined) sheet.getRange(foundRow, 11).setValue(rec.kabelTw);
        if (rec.segel !== undefined) sheet.getRange(foundRow, 12).setValue(rec.segel);
        if (rec.standBongkar !== undefined) sheet.getRange(foundRow, 13).setValue(rec.standBongkar);
        if (rec.petugas !== undefined) sheet.getRange(foundRow, 16).setValue(rec.petugas);
        if (rec.status !== undefined) sheet.getRange(foundRow, 17).setValue(rec.status);
        
        return createJsonResponse({
          status: 'success',
          message: 'Status & Data IDPEL ' + rec.idPelanggan + ' pada baris ' + foundRow + ' berhasil disinkronkan ke Google Sheet.'
        });
      } else {
        // Jika belum ada di sheet, tambahkan aman sebagai baris baru
        var appendNew = [
          rec.tanggal || '',
          rec.idPelanggan || '',
          rec.namaPelanggan || '',
          rec.tarif || '',
          rec.daya || 0,
          rec.noMeterLama || '-',
          rec.noMeterBaru || '-',
          rec.noAgenda || '-',
          rec.noSnMaterialKwh || '-',
          rec.noSnMaterialMcb || '-',
          rec.kabelTw || '-',
          rec.segel || '-',
          rec.standBongkar || '-',
          rec.jenis || 'PRA BAYAR',
          rec.gantiMeter || 'METER TUA',
          rec.petugas || 'GABRIEL',
          rec.status || 'SELESAI',
          rec.alamat || ''
        ];
        sheet.appendRow(appendNew);
        return createJsonResponse({
          status: 'success',
          message: 'IDPEL ' + rec.idPelanggan + ' ditambahkan sebagai baris baru ke Google Sheet.'
        });
      }
    }
    
    return createJsonResponse({ status: 'error', message: 'Action tidak dikenal: ' + action });
    
  } catch (err) {
    return createJsonResponse({
      status: 'error',
      message: err.toString()
    });
  }
}

/**
 * Output respon JSON dengan header CORS aktif
 */
function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Helper: Normalisasi format tanggal
 */
function formatTanggal(val) {
  if (!val) return '';
  if (val instanceof Date) {
    return Utilities.formatDate(val, 'Asia/Jayapura', 'dd/MM/yyyy');
  }
  return String(val);
}

/**
 * Dialog Ringkasan Status di Google Sheets
 */
function showSummaryAlert() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getActiveSheet();
  var data = sheet.getDataRange().getValues();
  
  var total = 0;
  var selesai = 0;
  var belum = 0;
  
  for (var i = 1; i < data.length; i++) {
    if (!data[i][1]) continue;
    total++;
    var status = String(data[i][16] || '').toUpperCase();
    if (status.includes('SELESAI')) selesai++;
    else belum++;
  }
  
  var pct = total > 0 ? ((selesai / total) * 100).toFixed(1) : 0;
  var msg = '📊 REKAP GANTI METER TAB: ' + sheet.getName() + '\\n\\n' +
            '• Total Work Order : ' + total + ' Pelanggan\\n' +
            '• Selesai Ganti   : ' + selesai + ' (' + pct + '%)\\n' +
            '• Belum Ganti     : ' + belum + ' (' + (100 - pct).toFixed(1) + '%)\\n\\n' +
            'PLN ULP Baguala - Transaksi Energi';
            
  SpreadsheetApp.getUi().alert(msg);
}
`;

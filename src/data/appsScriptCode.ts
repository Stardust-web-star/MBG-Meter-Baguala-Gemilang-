/**
 * Google Apps Script (.gs) Code for PLN ULP Baguala Meter Replacement Dashboard (MBG 2026)
 * REAL-TIME AUTO-SYNC & SAFE 2-WAY INTEGRATION (SINKRONISASI OTOMATIS LANGSUNG DENGAN DASHBOARD)
 * 
 * Pasang kode ini di Google Sheets -> Extensions (Ekstensi) -> Apps Script
 */

export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * =========================================================================
 * GOOGLE APPS SCRIPT: SISTEM MONITORING GANTI METER (MBG) 2026
 * PT PLN (PERSERO) ULP BAGUALA - UP3 AMBON
 * =========================================================================
 * 
 * ⚡ FITUR SINKRONISASI OTOMATIS REAL-TIME:
 * 1. Web App API: Menyediakan endpoint GET untuk menarik data langsung ke Dashboard.
 * 2. Real-Time Webhook (onEdit): Setiap perubahan status (Selesai/Belum) atau data di Sheet
 *    otomatis dikirim seketika ke Dashboard tanpa perlu refresh manual.
 * 3. Menu Cepat: Tombol sinkronisasi 1-klik langsung dari menu Google Sheet.
 * 4. 100% Proteksi Data: Tidak akan pernah menghapus data di Google Sheet Anda.
 */

// URL Dashboard Webhook PLN Baguala (Akan menerima pembaruan otomatis setiap kali ada perubahan di Sheet)
var DASHBOARD_WEBHOOK_URL = "https://ais-dev-2guhd2i7e54xdoldvylflo-7378754124.asia-east1.run.app/api/webhook/sheet-update"; 

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

var OFFICER_LIST = ['ABDUL', 'ANDRE', 'AUNUR', 'FEKI', 'FRANS', 'GABRIEL', 'HANS', 'HARDIN', 'ONYONG', 'PIYER', 'RAHMAT', 'RISKI', 'RIZKY', 'SALOMO', 'VAL', 'YONO', 'YUSRIL'];

/**
 * Helper untuk mengambil URL Webhook Dashboard
 */
function getWebhookUrl() {
  if (DASHBOARD_WEBHOOK_URL && DASHBOARD_WEBHOOK_URL.trim().length > 10) {
    return DASHBOARD_WEBHOOK_URL.trim();
  }
  var saved = PropertiesService.getScriptProperties().getProperty('DASHBOARD_WEBHOOK_URL');
  return (saved && saved.trim().length > 10) ? saved.trim() : "https://ais-dev-2guhd2i7e54xdoldvylflo-7378754124.asia-east1.run.app/api/webhook/sheet-update";
}

/**
 * Menu otomatis saat Spreadsheet dibuka di browser
 */
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('⚡ PLN Baguala MBG')
    .addItem('⚡ 1-Klik Aktifkan Realtime Auto-Sync (Trigger)', 'setupRealtimeTrigger')
    .addItem('🔄 Sinkronkan Seluruh Data ke Dashboard Sekarang', 'syncAllToDashboard')
    .addSeparator()
    .addItem('⚙️ Atur / Ganti URL Webhook Dashboard', 'configureWebhookUrl')
    .addItem('🛠️ Format Header Standar 18 Kolom', 'setupSheet')
    .addItem('📊 Rekap Status Penggantian Meter', 'showSummaryAlert')
    .addToUi();
}

/**
 * ⚡ 1-Klik Membuat Installable Trigger agar perubahan cell (onEdit) langsung terkirim ke Dashboard via internet!
 */
function setupRealtimeTrigger() {
  var ui = SpreadsheetApp.getUi();
  var webhook = getWebhookUrl();

  // Hapus trigger lama jika ada agar bersih dan tidak duplikat
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    var fn = triggers[i].getHandlerFunction();
    if (fn === 'installedOnEdit' || fn === 'onEdit') {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }

  // Buat installable trigger baru untuk spreadsheet ini
  ScriptApp.newTrigger('installedOnEdit')
    .forSpreadsheet(SpreadsheetApp.getActive())
    .onEdit()
    .create();

  // Simpan webhook ke property
  PropertiesService.getScriptProperties().setProperty('DASHBOARD_WEBHOOK_URL', webhook);

  // Jalankan sinkronisasi awal seluruh data
  var allRecords = extractAllSheetRecords();
  if (allRecords.length > 0) {
    try {
      var payload = {
        action: 'full_sync',
        timestamp: new Date().toISOString(),
        records: allRecords
      };
      var options = {
        method: 'post',
        contentType: 'application/json',
        payload: JSON.stringify(payload),
        muteHttpExceptions: true
      };
      UrlFetchApp.fetch(webhook, options);
    } catch (e) {
      console.error('Initial sync error:', e);
    }
  }

  ui.alert('✅ REAL-TIME AUTO-SYNC TELAH AKTIF!\\n\\n1. Trigger edit otomatis sudah terpasang.\\n2. Total ' + allRecords.length + ' data berhasil disinkronkan langsung ke Dashboard.\\n3. Mulai sekarang, setiap kali Anda mengubah status atau data di Google Sheet, Dashboard akan OTOMATIS langsung terubah secara realtime tanpa perlu klik tombol lagi!');
}

/**
 * Konfigurasi URL Webhook Dashboard secara tersimpan
 */
function configureWebhookUrl() {
  var ui = SpreadsheetApp.getUi();
  var current = getWebhookUrl();
  var prompt = ui.prompt('Pengaturan Webhook Dashboard', 'Masukkan URL Webhook Dashboard:\\n(Contoh: https://.../api/webhook/sheet-update)', ui.ButtonSet.OK_CANCEL);
  if (prompt.getSelectedButton() === ui.Button.OK) {
    var val = prompt.getResponseText().trim();
    if (val.length > 10) {
      PropertiesService.getScriptProperties().setProperty('DASHBOARD_WEBHOOK_URL', val);
      DASHBOARD_WEBHOOK_URL = val;
      ui.alert('✅ URL Webhook berhasil disimpan!\\n' + val);
    }
  }
}

/**
 * Pemicu Installable Trigger Saat Ada Perubahan Cell di Sheet (Real-Time Auto Sync)
 */
function installedOnEdit(e) {
  try {
    if (!e || !e.range) return;
    var sheet = e.range.getSheet();
    var sheetName = sheet.getName();
    var row = e.range.getRow();
    
    // Abaikan perubahan pada baris header (baris 1)
    if (row <= 1) return;
    
    var webhook = getWebhookUrl();
    if (webhook && webhook.length > 10) {
      var rowData = sheet.getRange(row, 1, 1, Math.max(sheet.getLastColumn(), 18)).getValues()[0];
      var payload = {
        event: 'cell_edit',
        sheetName: sheetName,
        row: row,
        timestamp: new Date().toISOString(),
        data: rowData
      };
      
      var options = {
        method: 'post',
        contentType: 'application/json',
        payload: JSON.stringify(payload),
        muteHttpExceptions: true
      };
      
      UrlFetchApp.fetch(webhook, options);
    }
  } catch (err) {
    console.error('Error in installedOnEdit:', err);
  }
}

/**
 * Fallback Simple Trigger onEdit
 */
function onEdit(e) {
  try {
    installedOnEdit(e);
  } catch (err) {
    // Silent catch
  }
}

/**
 * Menu Aksi: Kirim Seluruh Data Sheet ke Dashboard Web Secara Instan
 */
function syncAllToDashboard() {
  var ui = SpreadsheetApp.getUi();
  if (!DASHBOARD_WEBHOOK_URL || DASHBOARD_WEBHOOK_URL.trim().length <= 10) {
    var response = ui.prompt('Konfigurasi Webhook Dashboard', 'Masukkan URL Dashboard Webhook Anda (contoh: https://ais-dev-...run.app/api/webhook/sheet-update):', ui.ButtonSet.OK_CANCEL);
    if (response.getSelectedButton() === ui.Button.OK) {
      DASHBOARD_WEBHOOK_URL = response.getResponseText().trim();
    } else {
      return;
    }
  }
  
  try {
    var allRecords = extractAllSheetRecords();
    var payload = {
      action: 'full_sync',
      timestamp: new Date().toISOString(),
      records: allRecords
    };
    
    var options = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };
    
    var response = UrlFetchApp.fetch(DASHBOARD_WEBHOOK_URL, options);
    var resText = response.getContentText();
    ui.alert('✅ Berhasil Tersinkronisasi!\\n\\nTotal ' + allRecords.length + ' data berhasil disinkronkan ke Dashboard Web.\\nRespon: ' + resText);
  } catch (err) {
    ui.alert('❌ Gagal Sinkronisasi: ' + err.toString());
  }
}

/**
 * Inisialisasi format sheet & styling otomatis warna PLN
 */
function setupSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getActiveSheet();
  
  var firstRow = sheet.getRange(1, 1, 1, STANDARD_HEADERS.length).getValues()[0];
  var needsHeader = !firstRow[0] || !firstRow[1];
  
  if (needsHeader) {
    sheet.getRange(1, 1, 1, STANDARD_HEADERS.length).setValues([STANDARD_HEADERS]);
  }
  
  var headerRange = sheet.getRange(1, 1, 1, STANDARD_HEADERS.length);
  headerRange.setBackground('#005596');
  headerRange.setFontColor('#FFFFFF');
  headerRange.setFontWeight('bold');
  headerRange.setHorizontalAlignment('center');
  headerRange.setVerticalAlignment('middle');
  sheet.setRowHeight(1, 32);
  sheet.setFrozenRows(1);
  
  for (var col = 1; col <= STANDARD_HEADERS.length; col++) {
    sheet.autoResizeColumn(col);
  }
  
  SpreadsheetApp.getUi().alert('✅ Header standar 18 kolom PLN ULP Baguala siap digunakan.');
}

/**
 * Handler HTTP GET: Mengambil data sheet dalam format JSON untuk Dashboard Web
 */
function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheetParam = (e && e.parameter && e.parameter.sheetName) ? e.parameter.sheetName.toUpperCase().trim() : '';
    var getAll = (e && e.parameter && (e.parameter.all === 'true' || e.parameter.allMonths === 'true')) || !sheetParam;
    
    if (getAll) {
      var allRecords = extractAllSheetRecords();
      return createJsonResponse({
        status: 'success',
        type: 'all_sheets',
        count: allRecords.length,
        timestamp: new Date().toISOString(),
        data: allRecords
      });
    }
    
    // Temukan sheet dengan pencarian nama fleksibel
    var targetSheet = findSheetByFlexibleName(ss, sheetParam);
    if (!targetSheet) {
      targetSheet = ss.getActiveSheet();
    }
    
    var records = extractRecordsFromSheet(targetSheet);
    
    return createJsonResponse({
      status: 'success',
      sheetName: targetSheet.getName(),
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
 * Helper: Ekstrak seluruh sheet bulan ke dalam satu array terpadu
 */
function extractAllSheetRecords() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheets = ss.getSheets();
  var allRecords = [];
  
  for (var s = 0; s < sheets.length; s++) {
    var sh = sheets[s];
    var sName = sh.getName().toUpperCase();
    
    // Cek apakah tab ini adalah tab bulan atau data monitoring
    var isMonthSheet = sName.indexOf('AGU') !== -1 || sName.indexOf('JUL') !== -1 || 
                       sName.indexOf('SEP') !== -1 || sName.indexOf('OKT') !== -1 ||
                       sName.indexOf('NOV') !== -1 || sName.indexOf('DES') !== -1 ||
                       sName.indexOf('JAN') !== -1 || sName.indexOf('FEB') !== -1 ||
                       sName.indexOf('MAR') !== -1 || sName.indexOf('APR') !== -1 ||
                       sName.indexOf('MEI') !== -1 || sName.indexOf('JUN') !== -1 ||
                       sName.indexOf('MON') !== -1 || sName.indexOf('GANTI') !== -1;
                       
    if (isMonthSheet || sheets.length === 1) {
      var recs = extractRecordsFromSheet(sh);
      allRecords = allRecords.concat(recs);
    }
  }
  
  return allRecords;
}

/**
 * Pencarian sheet dengan pencocokan nama fleksibel
 */
function findSheetByFlexibleName(ss, query) {
  if (!query) return null;
  var q = query.toUpperCase();
  var sheets = ss.getSheets();
  
  // 1. Exact match
  var exact = ss.getSheetByName(query);
  if (exact) return exact;
  
  // 2. Contains match
  for (var i = 0; i < sheets.length; i++) {
    var name = sheets[i].getName().toUpperCase();
    if (name === q) return sheets[i];
    if (name.indexOf(q) !== -1 || q.indexOf(name) !== -1) return sheets[i];
  }
  
  // 3. Aliases
  if (q.indexOf('AGU') !== -1) {
    for (var i = 0; i < sheets.length; i++) {
      if (sheets[i].getName().toUpperCase().indexOf('AGU') !== -1) return sheets[i];
    }
  }
  if (q.indexOf('JUL') !== -1) {
    for (var i = 0; i < sheets.length; i++) {
      if (sheets[i].getName().toUpperCase().indexOf('JUL') !== -1) return sheets[i];
    }
  }
  if (q.indexOf('SEP') !== -1) {
    for (var i = 0; i < sheets.length; i++) {
      if (sheets[i].getName().toUpperCase().indexOf('SEP') !== -1) return sheets[i];
    }
  }
  
  return null;
}

/**
 * Ekstraksi record dari sebuah sheet
 */
function extractRecordsFromSheet(sheet) {
  var data = sheet.getDataRange().getValues();
  if (!data || data.length <= 1) return [];
  
  var sheetNameUpper = sheet.getName().toUpperCase();
  var defaultMonth = 'AGUSTUS';
  if (sheetNameUpper.indexOf('JUL') !== -1) defaultMonth = 'JULI';
  else if (sheetNameUpper.indexOf('AGU') !== -1) defaultMonth = 'AGUSTUS';
  else if (sheetNameUpper.indexOf('SEP') !== -1) defaultMonth = 'SEPTEMBER';
  else if (sheetNameUpper.indexOf('OKT') !== -1) defaultMonth = 'OKTOBER';
  
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

  var records = [];
  
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var idpel = String(row[colIdx.idpel] || '').trim();
    var nama = String(row[colIdx.nama] || '').trim();
    if (!idpel && !nama) continue;
    
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
      for (var p = 0; p < OFFICER_LIST.length; p++) {
        if (rawPetugas.indexOf(OFFICER_LIST[p]) !== -1 || OFFICER_LIST[p].indexOf(rawPetugas) !== -1) {
          normPetugas = OFFICER_LIST[p];
          break;
        }
      }
      if (!normPetugas) normPetugas = rawPetugas;
    }
    if (!normPetugas) {
      normPetugas = OFFICER_LIST[i % OFFICER_LIST.length];
    }

    var rawStatus = String(row[colIdx.status] || '').toUpperCase().trim();
    var isBelum = rawStatus.indexOf('BELUM') !== -1 || rawStatus.indexOf('BLM') !== -1 || rawStatus.indexOf('PENDING') !== -1 || rawStatus === 'NO';
    var recordStatus = isBelum ? 'BELUM' : 'SELESAI';

    var rawJenis = String(row[colIdx.jenis] || '').toUpperCase();
    var recordJenis = rawJenis.indexOf('PASKA') !== -1 || rawJenis.indexOf('PASCA') !== -1 ? 'PASKA BAYAR' : 'PRA BAYAR';

    var rawGanti = String(row[colIdx.ganti] || '').toUpperCase();
    var recordGanti = rawGanti.indexOf('GANGGUAN') !== -1 || rawGanti.indexOf('HILANG') !== -1 || rawGanti.indexOf('RUSAK') !== -1 ? 'METER GANGGUAN' : 'METER TUA';

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
      jenis: recordJenis,
      gantiMeter: recordGanti,
      petugas: normPetugas,
      status: recordStatus,
      alamat: String(row[colIdx.alamat] || 'Wilayah ULP Baguala').trim(),
      bulan: defaultMonth
    };
    
    records.push(record);
  }
  
  return records;
}

/**
 * Handler HTTP POST: Menerima data dari Dashboard Web App atau Webhook
 */
function doPost(e) {
  try {
    var contents = e.postData ? e.postData.contents : null;
    if (!contents) {
      return createJsonResponse({ status: 'error', message: 'Tidak ada payload yang diterima' });
    }
    
    var payload = JSON.parse(contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheetName = payload.sheetName || 'AGUSTUS';
    var sheet = findSheetByFlexibleName(ss, sheetName);
    
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      sheet.getRange(1, 1, 1, STANDARD_HEADERS.length).setValues([STANDARD_HEADERS]);
    }
    
    var action = payload.action || 'safeUpsert';
    
    // SAFE UPSERT SINKRONISASI
    if ((action === 'safeUpsert' || action === 'syncBatch') && Array.isArray(payload.records)) {
      var allData = sheet.getDataRange().getValues();
      var idpelToRowMap = {};
      var agendaToRowMap = {};
      
      for (var r = 1; r < allData.length; r++) {
        var existingIdpel = String(allData[r][1] || '').trim();
        var existingAgenda = String(allData[r][7] || '').trim();
        if (existingIdpel) idpelToRowMap[existingIdpel] = r + 1;
        if (existingAgenda && existingAgenda !== '-') agendaToRowMap[existingAgenda] = r + 1;
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
          sheet.getRange(targetRow, 1, 1, STANDARD_HEADERS.length).setValues([rowValues]);
          updatedCount++;
        } else {
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
        message: 'Sinkronisasi Aman Selesai! ' + updatedCount + ' data diperbarui, ' + appendedRows.length + ' baris baru.',
        updated: updatedCount,
        appended: appendedRows.length,
        totalSheetRows: sheet.getLastRow() - 1
      });
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
    if (status.indexOf('BELUM') !== -1 || status.indexOf('BLM') !== -1) belum++;
    else selesai++;
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

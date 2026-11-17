/**
 * Wajahni — fills "Date de connection 1…7" in the partners sheet from the
 * logins recorded on b2b.wajahni.tn (one date per day the partner logged in,
 * oldest first). Rows are matched on the "Identifiant" column.
 *
 * Setup (once): Extensions › Apps Script, paste this file, save, reload the
 * sheet, then use the "Wajahni" menu › "Configurer la clé" and paste the key
 * shown in /admin › Connexions. "Remplir automatiquement (toutes les heures)"
 * keeps the sheet up to date on its own.
 */
var SITE = 'https://b2b.wajahni.tn';
var MAX_DATES = 7;

function onOpen() {
  SpreadsheetApp.getUi().createMenu('Wajahni')
    .addItem('Remplir les dates de connexion', 'fillConnectionDates')
    .addSeparator()
    .addItem('Configurer la clé', 'setSyncKey')
    .addItem('Remplir automatiquement (toutes les heures)', 'installHourlyTrigger')
    .addItem('Arrêter le remplissage automatique', 'removeTriggers')
    .addToUi();
}

function setSyncKey() {
  var ui = SpreadsheetApp.getUi();
  var answer = ui.prompt('Clé de synchronisation', 'Collez la clé affichée dans /admin › Connexions :', ui.ButtonSet.OK_CANCEL);
  if (answer.getSelectedButton() !== ui.Button.OK) return;
  var key = answer.getResponseText().trim();
  if (!key) return;
  PropertiesService.getDocumentProperties().setProperty('WAJAHNI_SYNC_KEY', key);
  fillConnectionDates();
}

function norm_(value) {
  return String(value == null ? '' : value).trim().toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ');
}

function fillConnectionDates() {
  var key = PropertiesService.getDocumentProperties().getProperty('WAJAHNI_SYNC_KEY');
  if (!key) throw new Error('Clé manquante : menu Wajahni › Configurer la clé.');

  var res = UrlFetchApp.fetch(SITE + '/api/admin/connections?per=day&max=' + MAX_DATES + '&key=' + encodeURIComponent(key), { muteHttpExceptions: true });
  var data = JSON.parse(res.getContentText() || '{}');
  if (res.getResponseCode() !== 200) throw new Error(data.error || ('Erreur ' + res.getResponseCode()));

  var byUser = {};
  data.partners.forEach(function (p) { byUser[norm_(p.username)] = p; });

  var sheet = findSheet_();
  var values = sheet.getDataRange().getValues();
  var header = values[0].map(norm_);
  var idCol = header.indexOf('identifiant');
  var dateCols = [];
  header.forEach(function (h, c) {
    var m = h.match(/^date de connex?ion\s*(\d+)$/);
    if (m) dateCols[Number(m[1]) - 1] = c;
  });
  if (idCol < 0 || !dateCols.length) throw new Error('Colonnes "Identifiant" ou "Date de connection N" introuvables.');

  var filled = 0, unknown = [];
  for (var r = 1; r < values.length; r++) {
    var username = norm_(values[r][idCol]);
    if (!username) continue;
    var p = byUser[username];
    if (!p) { unknown.push(values[r][idCol]); continue; }
    dateCols.forEach(function (c, i) {
      if (c == null || !p.dates[i]) return; // keep whatever is already there
      var cell = sheet.getRange(r + 1, c + 1);
      cell.setValue(new Date(p.dates[i])).setNumberFormat('dd/mm/yyyy HH:mm');
      filled++;
    });
  }
  var msg = filled + ' date(s) écrite(s).' + (unknown.length ? ' Identifiants inconnus sur le site : ' + unknown.join(', ') : '');
  try { SpreadsheetApp.getActive().toast(msg, 'Wajahni', 8); } catch (e) {}
  return msg;
}

// The sheet with an "Identifiant" header (the active one when run by hand).
function findSheet_() {
  var ss = SpreadsheetApp.getActive();
  var sheets = [ss.getActiveSheet()].concat(ss.getSheets());
  for (var i = 0; i < sheets.length; i++) {
    var head = sheets[i].getRange(1, 1, 1, Math.max(1, sheets[i].getLastColumn())).getValues()[0].map(norm_);
    if (head.indexOf('identifiant') >= 0) return sheets[i];
  }
  throw new Error('Aucune feuille avec une colonne "Identifiant".');
}

function installHourlyTrigger() {
  removeTriggers();
  ScriptApp.newTrigger('fillConnectionDates').timeBased().everyHours(1).create();
  SpreadsheetApp.getActive().toast('Les dates seront mises à jour toutes les heures.', 'Wajahni', 6);
}

function removeTriggers() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'fillConnectionDates') ScriptApp.deleteTrigger(t);
  });
}

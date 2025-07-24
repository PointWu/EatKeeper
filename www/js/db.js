// db.js
let db = null;
const isCordova = typeof window.cordova !== "undefined";

function initDB() {
  return new Promise((resolve, reject) => {
    if (isCordova && window.sqlitePlugin) {
      db = window.sqlitePlugin.openDatabase({ name: 'diet.db', location: 'default' },
        () => {
          db.transaction(tx => {
            tx.executeSql(`CREATE TABLE IF NOT EXISTS records (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              date TEXT,
              mealType TEXT,
              foodName TEXT,
              mealTime TEXT,
              note TEXT,
              image TEXT
            )`, [], resolve, reject);
          });
        }, reject);
    } else {
      // Fallback: localStorage
      if (!localStorage.getItem('records')) localStorage.setItem('records', JSON.stringify([]));
      resolve();
    }
  });
}

function addRecord(record) {
  return new Promise((resolve, reject) => {
    if (db) {
      db.transaction(tx => {
        tx.executeSql(
          `INSERT INTO records (date, mealType, foodName, mealTime, note, image) VALUES (?, ?, ?, ?, ?, ?)`,
          [record.date, record.mealType, record.foodName, record.mealTime, record.note, record.image],
          (_, res) => resolve(res.insertId),
          (_, err) => reject(err)
        );
      });
    } else {
      // localStorage
      let records = JSON.parse(localStorage.getItem('records'));
      record.id = Date.now();
      records.push(record);
      localStorage.setItem('records', JSON.stringify(records));
      resolve(record.id);
    }
  });
}

function getRecordsByDate(date) {
  return new Promise((resolve, reject) => {
    if (db) {
      db.transaction(tx => {
        tx.executeSql(
          `SELECT * FROM records WHERE date = ? ORDER BY mealTime ASC`,
          [date],
          (_, res) => resolve(res.rows ? Array.from(res.rows) : []),
          (_, err) => reject(err)
        );
      });
    } else {
      let records = JSON.parse(localStorage.getItem('records'));
      resolve(records.filter(r => r.date === date));
    }
  });
}

function updateRecord(record) {
  return new Promise((resolve, reject) => {
    if (db) {
      db.transaction(tx => {
        tx.executeSql(
          `UPDATE records SET date = ?, mealType = ?, foodName = ?, mealTime = ?, note = ?, image = ? WHERE id = ?`,
          [record.date, record.mealType, record.foodName, record.mealTime, record.note, record.image, record.id],
          (_, res) => resolve(res.rowsAffected),
          (_, err) => reject(err)
        );
      });
    } else {
      let records = JSON.parse(localStorage.getItem('records'));
      let idx = records.findIndex(r => r.id === record.id);
      if (idx !== -1) {
        records[idx] = record;
        localStorage.setItem('records', JSON.stringify(records));
        resolve(1);
      } else {
        reject('Record not found');
      }
    }
  });
}

function deleteRecord(id) {
  return new Promise((resolve, reject) => {
    if (db) {
      db.transaction(tx => {
        tx.executeSql(
          `DELETE FROM records WHERE id = ?`,
          [id],
          (_, res) => resolve(res.rowsAffected),
          (_, err) => reject(err)
        );
      });
    } else {
      let records = JSON.parse(localStorage.getItem('records'));
      let newRecords = records.filter(r => r.id !== id);
      localStorage.setItem('records', JSON.stringify(newRecords));
      resolve(records.length - newRecords.length);
    }
  });
}
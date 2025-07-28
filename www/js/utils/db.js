let db = null;

export function getDB() {
  return db;
}

export async function openDB() {
  return new Promise((resolve, reject) => {
    // Wait for Cordova to be ready
    const waitForCordova = () => {
      if (window.cordova) {
        document.addEventListener('deviceready', () => {
          initializeDB(resolve, reject);
        }, false);
      } else {
        // For browser testing
        initializeDB(resolve, reject);
      }
    };

    const initializeDB = (resolve, reject) => {
      try {
        if (window.cordova && window.sqlitePlugin) {
          console.log('Using Cordova SQLite plugin');
          db = window.sqlitePlugin.openDatabase(
            { name: "foodlog.db", location: "default" },
            () => {
              db.transaction((tx) => {
                tx.executeSql(
                  `CREATE TABLE IF NOT EXISTS foods (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    mealType TEXT,
                    name TEXT,
                    time TEXT,
                    note TEXT,
                    image TEXT,
                    date TEXT
                  )`,
                  [],
                  () => {
                    console.log('Database initialized successfully');
                    resolve();
                  },
                  (error) => {
                    console.error('SQLite error:', error);
                    reject(error);
                  }
                );
              });
            },
            (error) => {
              console.error('Failed to open SQLite database:', error);
              reject(error);
            }
          );
        } else {
          console.log('Using Web SQL fallback');
          // fallback: Web SQL (for browser)
          db = window.openDatabase("foodlog", "1.0", "Food Log", 2 * 1024 * 1024);
          db.transaction((tx) => {
            tx.executeSql(
              `CREATE TABLE IF NOT EXISTS foods (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                mealType TEXT,
                name TEXT,
                time TEXT,
                note TEXT,
                image TEXT,
                date TEXT
              )`,
              [],
              () => {
                console.log('Web SQL database initialized successfully');
                resolve();
              },
              (error) => {
                console.error('Web SQL error:', error);
                reject(error);
              }
            );
          });
        }
      } catch (error) {
        console.error('Database initialization error:', error);
        reject(error);
      }
    };

    // Start the initialization process
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', waitForCordova);
    } else {
      waitForCordova();
    }
  });
}

export async function insertFood(food) {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        `INSERT INTO foods (mealType, name, time, note, image, date) VALUES (?, ?, ?, ?, ?, ?)`,
        [food.mealType, food.name, food.time, food.note, food.image, food.date],
        resolve,
        reject
      );
    });
  });
}

export async function updateFood(food) {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        `UPDATE foods SET mealType = ?, name = ?, time = ?, note = ?, image = ?, date = ? WHERE id = ?`,
        [food.mealType, food.name, food.time, food.note, food.image, food.date, food.id],
        resolve,
        reject
      );
    });
  });
}

export async function deleteFood(id) {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        `DELETE FROM foods WHERE id = ?`,
        [id],
        resolve,
        reject
      );
    });
  });
}

export async function getFoodsByDate(date) {
  const dateStr = typeof date === "string" ? date : date.toISOString().slice(0, 10);
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        `SELECT * FROM foods WHERE date = ? ORDER BY time ASC`,
        [dateStr],
        (tx, results) => {
          const rows = [];
          for (let i = 0; i < results.rows.length; i++) {
            rows.push(results.rows.item(i));
          }
          resolve(rows);
        },
        reject
      );
    });
  });
} 
let db = null;

export function getDB() {
  return db;
}

export async function openDB() {
  return new Promise((resolve, reject) => {
    // 检查是否在浏览器环境中
    const isBrowser = typeof window !== 'undefined' && !window.cordova;
    
    if (isBrowser) {
      console.log('Using Web SQL for browser');
      try {
        // 浏览器环境使用 Web SQL
        if (window.openDatabase) {
          db = window.openDatabase("foodlog", "1.0", "Food Log", 2 * 1024 * 1024);
          db.transaction((tx) => {
            // Create foods table
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
                // Create exercises table
                tx.executeSql(
                  `CREATE TABLE IF NOT EXISTS exercises (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    exerciseType TEXT,
                    name TEXT,
                    duration TEXT,
                    calories TEXT,
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
                    console.error('Web SQL exercises table error:', error);
                    reject(error);
                  }
                );
              },
              (error) => {
                console.error('Web SQL foods table error:', error);
                reject(error);
              }
            );
          });
        } else {
          console.error('Web SQL not supported');
          reject(new Error('Web SQL not supported'));
        }
      } catch (error) {
        console.error('Database initialization error:', error);
        reject(error);
      }
    } else {
      // Cordova 环境
      const waitForCordova = () => {
        if (window.cordova) {
          document.addEventListener('deviceready', () => {
            initializeDB(resolve, reject);
          }, false);
        } else {
          // 等待 Cordova 加载
          setTimeout(waitForCordova, 100);
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
                  // Create foods table
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
                      // Create exercises table
                      tx.executeSql(
                        `CREATE TABLE IF NOT EXISTS exercises (
                          id INTEGER PRIMARY KEY AUTOINCREMENT,
                          exerciseType TEXT,
                          name TEXT,
                          duration TEXT,
                          calories TEXT,
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
                          console.error('SQLite exercises table error:', error);
                          reject(error);
                        }
                      );
                    },
                    (error) => {
                      console.error('SQLite foods table error:', error);
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
            console.error('SQLite plugin not available');
            reject(new Error('SQLite plugin not available'));
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

// Exercise related functions
export async function insertExercise(exercise) {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        `INSERT INTO exercises (exerciseType, name, duration, calories, time, note, image, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [exercise.exerciseType, exercise.name, exercise.duration, exercise.calories, exercise.time, exercise.note, exercise.image, exercise.date],
        resolve,
        reject
      );
    });
  });
}

export async function updateExercise(exercise) {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        `UPDATE exercises SET exerciseType = ?, name = ?, duration = ?, calories = ?, time = ?, note = ?, image = ?, date = ? WHERE id = ?`,
        [exercise.exerciseType, exercise.name, exercise.duration, exercise.calories, exercise.time, exercise.note, exercise.image, exercise.date, exercise.id],
        resolve,
        reject
      );
    });
  });
}

export async function deleteExercise(id) {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        `DELETE FROM exercises WHERE id = ?`,
        [id],
        resolve,
        reject
      );
    });
  });
}

export async function getExercisesByDate(date) {
  const dateStr = typeof date === "string" ? date : date.toISOString().slice(0, 10);
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        `SELECT * FROM exercises WHERE date = ? ORDER BY time ASC`,
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

console.log("Starting DB debug...");
try {
    // Attempt to require the Database class
    // Using require to catch import errors
    const { Database } = require('../src/app/core/Database');
    console.log("Database class imported successfully.");

    const db = new Database('sqlite');
    console.log("Database instance created.");

    // Attempt init 
    // db.connect().then(() => console.log("Connected!")).catch(console.error); // connection requires better-sqlite3 which works

} catch (e) {
    console.error("Crash during import/init:", e);
}

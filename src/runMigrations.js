const fs = require('fs');
const path = require('path');
const { db } = require('./config/database');

// Get all migration files
const migrationFiles = fs.readdirSync(path.join(__dirname, 'migrations'))
    .filter(file => file.endsWith('.js'))
    .sort(); // Sort to ensure migrations run in order

// Run each migration
async function runMigrations() {
    try {
        console.log('Starting migrations...');
        
        for (const file of migrationFiles) {
            console.log(`Running migration: ${file}`);
            const migration = require(path.join(__dirname, 'migrations', file));
            await new Promise((resolve, reject) => {
                db.serialize(() => {
                    db.run('BEGIN TRANSACTION');
                    try {
                        migration(db);
                        db.run('COMMIT');
                        resolve();
                    } catch (error) {
                        db.run('ROLLBACK');
                        reject(error);
                    }
                });
            });
            console.log(`Completed migration: ${file}`);
        }
        
        console.log('All migrations completed successfully');
    } catch (error) {
        console.error('Error running migrations:', error);
    } finally {
        db.close();
    }
}

runMigrations(); 
import { loadDb } from './config.js';

export class VideoGames {
    async init() {
        this.db = await loadDb();
        this.conn = await this.db.connect();
        this.table = 'vgsales';
    }

    async loadData() {
        if (!this.db || !this.conn) throw new Error('DB não inicializado.');
        
        const res = await fetch('/vgsales.csv'); // Procura o CSV na pasta principal
        const buffer = await res.arrayBuffer();
        await this.db.registerFileBuffer('vgsales.csv', new Uint8Array(buffer));

        await this.conn.query(`
            CREATE OR REPLACE VIEW ${this.table} AS
            SELECT
                "Rank", "Name", "Platform",
                TRY_CAST("Year" AS INTEGER) AS "Year",
                "Genre", "Publisher", "NA_Sales", "EU_Sales", "JP_Sales", "Other_Sales", "Global_Sales"
            FROM "vgsales.csv"
            WHERE "Year" IS NOT NULL AND "Global_Sales" > 0;
        `);
    }

    async query(sql) {
        if (!this.conn) throw new Error('DB não inicializado.');
        const result = await this.conn.query(sql);
        return result.toArray().map(row => row.toJSON());
    }
}
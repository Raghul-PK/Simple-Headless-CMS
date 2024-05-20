const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const db = mysql.createConnection({
    host: "localhost",
    port: 3307,
    user: "root",
    password: "",
    database: "crud"
});

db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('MySQL Connected...');
});

// Create Entity
app.post('/create-entity', (req, res) => {
    const { entityName, attributes } = req.body;
    let sql = `CREATE TABLE ${entityName} (id INT AUTO_INCREMENT PRIMARY KEY`;
    let metadataSql = 'INSERT INTO metadata (entity_name, attribute_name, is_mandatory) VALUES ';
    let values = [];

    attributes.forEach((attr, index) => {
        sql += `, ${attr.name} ${attr.type.toUpperCase()}`;
        values.push(`('${entityName}', '${attr.name}', ${attr.mandatory})`);
    });
    sql += ')';
    metadataSql += values.join(',');

    db.query(sql, (err, result) => {
        if (err) throw err;

        db.query(metadataSql, (err, result) => {
            if (err) throw err;
            res.send(`${entityName} table created with metadata`);
        });
    });
});

// Delete Entity
app.delete('/delete-entity/:entity', (req, res) => {
    const entity = req.params.entity;
    let sql = `DROP TABLE ${entity}`;
    let metadataSql = `DELETE FROM metadata WHERE entity_name = '${entity}'`;

    db.query(sql, (err, result) => {
        if (err) {
            console.error('Error deleting entity:', err);
            res.status(500).send('Error deleting entity');
            return;
        }

        db.query(metadataSql, (err, result) => {
            if (err) {
                console.error('Error deleting metadata:', err);
                res.status(500).send('Error deleting metadata');
                return;
            }
            res.send(`${entity} table and metadata deleted`);
        });
    });
});

// Get all entities
app.get('/entities', (req, res) => {
    const sql = "SHOW TABLES";
    db.query(sql, (err, results) => {
        if (err) throw err;
        const tables = results.map(row => Object.values(row)[0]);
        const filteredTables = tables.filter(table => table !== "metadata");
        res.send(filteredTables);
    });
});

// CRUD Operations ==========================================

// Get attributes of a selected entity with mandatory info
app.get('/attributes/:entity', (req, res) => {
    const entity = req.params.entity;
    const sql = `SHOW COLUMNS FROM ${entity}`;
    const metadataSql = `SELECT attribute_name, is_mandatory FROM metadata WHERE entity_name = '${entity}'`;

    db.query(sql, (err, results) => {
        if (err) throw err;

        const attributes = results.map(row => ({
            name: row.Field,
            type: row.Type,
            mandatory: false // Default value
        }));

        db.query(metadataSql, (err, metadataResults) => {
            if (err) throw err;

            metadataResults.forEach(metadata => {
                const attribute = attributes.find(attr => attr.name === metadata.attribute_name);
                if (attribute) {
                    attribute.mandatory = metadata.is_mandatory;
                }
            });

            res.send(attributes);
        });
    });
});

app.post('/create/:entity', (req, res) => {
    const entity = req.params.entity;
    const data = req.body;

    // Fetch mandatory fields from metadata
    const metadataSql = `SELECT attribute_name FROM metadata WHERE entity_name = '${entity}' AND is_mandatory = 1`;

    db.query(metadataSql, (err, results) => {
        if (err) throw err;

        const mandatoryFields = results.map(row => row.attribute_name);

        for (let field of mandatoryFields) {
            if (!data[field]) {
                return res.status(400).send(`Missing mandatory field: ${field}`);
            }
        }

        let sql = `INSERT INTO ${entity} SET ?`;
        db.query(sql, data, (err, result) => {
            if (err) throw err;
            res.send(`${entity} entry created`);
        });
    });
});

app.get('/read/:entity', (req, res) => {
    const entity = req.params.entity;
    let sql = `SELECT * FROM ${entity}`;

    db.query(sql, (err, results) => {
        if (err) throw err;
        res.send(results);
    });
});

app.put('/update/:entity/:id', (req, res) => {
    const entity = req.params.entity;
    const id = req.params.id;
    const data = req.body;

    // Fetch mandatory fields from metadata
    const metadataSql = `SELECT attribute_name FROM metadata WHERE entity_name = '${entity}' AND is_mandatory = 1`;

    db.query(metadataSql, (err, results) => {
        if (err) throw err;

        const mandatoryFields = results.map(row => row.attribute_name);

        for (let field of mandatoryFields) {
            if (!data[field]) {
                return res.status(400).send(`Missing mandatory field: ${field}`);
            }
        }

        let sql = `UPDATE ${entity} SET ? WHERE id = ?`;
        db.query(sql, [data, id], (err, result) => {
            if (err) {
                console.error('Error updating data:', err);
                res.status(500).send('Error updating data');
                return;
            }
            res.send(`${entity} entry updated`);
        });
    });
});

app.delete('/delete/:entity/:id', (req, res) => {
    const entity = req.params.entity;
    const id = req.params.id;
    let sql = `DELETE FROM ${entity} WHERE id = ?`;

    db.query(sql, id, (err, result) => {
        if (err) throw err;
        res.send(`${entity} entry deleted`);
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

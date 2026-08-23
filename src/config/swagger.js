const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const path = require('path');

const option = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Scooter Rental API',
            version: '1.0.0',
            description: 'scooter icare sistemi ucun REST API dokumentasiyasi',
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'local server',
            },
        ],
    },
    apis: [path.join(__dirname, '../routes/*.js').replace(/\\/g, '/')],
};
const specs = swaggerJsdoc(option);
module.exports = {
    swaggerUi,
    specs,
};
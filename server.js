const http = require('http');
const url = require('url');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();

class Server {
    constructor() {
        this.dictionary = [];
        this.port = process.env.PORT || 3000;
    }

    start() {
        http.createServer((req, res) => {

            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS'); 
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

            
            if (req.method === 'OPTIONS') {
                res.writeHead(204);
                res.end();
                return;
            }
            const parsedUrl = url.parse(req.url, true);
            const { pathname, query } = parsedUrl;

            if (pathname === '/api/definitions') {
                if (req.method === 'GET') {
                    const word = query.word;
                    if (!word) {
                        this.sendResponse(res, 400, {message: 'No word provided'});
                        return;
                    }

                    const entry = this.dictionary.find((entry) => entry.word === word);
                    if (entry) {
                        this.sendResponse(res, 200, { word: entry.word, definition: entry.definition });
                    } else {
                        this.sendResponse(res, 404, { message: "word not found" });
                    }

                } else if (req.method === 'POST') {  
                    let body = '';
                    req.on('data', (chunk) => {
                        body += chunk;
                    });

                    req.on("end", () => {
                        try {
                            const { word, definition } = JSON.parse(body);
                            if (!word || !definition) {
                                this.sendResponse(res, 400, { message: "word and definition are required" });
                                return;
                            }
                            this.dictionary.push({ word, definition });
                            this.sendResponse(res, 201, { message: 'Word added successfully' });
                        } catch (error) {
                            this.sendResponse(res, 400, { message: "Invalid JSON" });
                        }
                    });

                } else {
                    this.sendResponse(res, 405, { message: "Method not allowed" });
                }

            } else {
                this.sendResponse(res, 404, { message: "Route not found" });
            }

        }).listen(this.port, () => {
            console.log(`Server is running on port ${this.port}`);
        });
    }

    sendResponse(res, status, body) {
        res.writeHead(status, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(body));
    }
}

const server = new Server();
server.start();

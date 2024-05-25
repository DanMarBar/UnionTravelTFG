import express from "express";
import bodyParser from "body-parser";
import session from 'express-session';
import passport from 'passport';
import * as path from "path";
import {dirname} from "path";
import {fileURLToPath} from 'url';
import http from 'http';
import {Server} from 'socket.io';
import db from './config/database.js';
import Payment from './routes/Payment.js';
import ChatRooms from './routes/ChatRooms.js';
import router from './routes/index.js';
import initializeSocket from './config/sockets.js';
import initializePassport from './config/passport.js';
import Auth from "./routes/Auth.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Configuraciones
app.set('port', process.env.PORT || 3000);
app.set('json spaces', 2);

app.use(session({
    resave: false,
    saveUninitialized: true,
    secret: 'SECRET'
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

// Inicializar Passport
initializePassport(passport);
app.use(passport.initialize());
app.use(passport.session());

// Rutas de los endpoints
app.use(router);
app.use(Payment);
app.use(ChatRooms)
app.use('/', Auth);

// Imagenes de los view
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const uploadsPath = path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsPath));

// Conexión a la base de datos
db.authenticate()
    .then(() => console.log('Connection has been established successfully.'))
    .catch(err => console.error('Unable to connect to the database:', err));

// Inicializar eventos de Socket.IO
initializeSocket(io);

// Iniciando el servidor, escuchando...
server.listen(app.get('port'), () => {
    console.log(`Server listening on port ${app.get('port')}`);
});

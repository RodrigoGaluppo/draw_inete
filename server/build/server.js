"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const app = require('express')();
const express_1 = __importDefault(require("express"));
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const port = process.env.PORT || 80;
var htmlPath = path_1.default.resolve("client");
app.use(express_1.default.static(htmlPath));
let words = [
    "Maquilhagem",
    "Relógio de pulso",
    "Fones bluetooth",
    "Lâmpada",
    "USB",
    "Balança digital",
    "Powerbank",
    "Gilete",
    "Câmera",
    "Barbeador elétrico",
    "Relógio inteligente",
    "Coluna",
    "Serra elétrica",
    "Aquecedor portátil",
    "Ventilador de mesa",
    "Termómetro",
    "Escova de dentes elétrica",
    "Fogão elétrico",
    "Ferro de passar roupas",
    "Torradeira",
    "Aspirador de pó",
    "Churrasqueira",
    "Frigorífico",
    "Girafa",
    "Leão",
    "Tigre",
    "Urso",
    "Zebra",
    "Cavalo",
    "Cão",
    "Gato",
    "Papagaio",
    "Águia",
    "Tartaruga",
    "Cobra",
    "Tubarão",
    "Golfinho",
    "Baleia",
    "Carregador",
    "Caranguejo",
    "Polvo",
    "Esquilo",
    "Raposa",
    "Coelho",
    "Camelo",
    "Canguru",
    "Pinguim",
    "Computador gaming",
    "Câmara de segurança",
    "Smartphone",
    "Cafeteira",
    "Laptop",
    "Nuvem de dados",
    "Robô de limpeza",
    "Impressora 3D",
    "Drone",
    "Instagram",
    "Facebook",
    "TikTok",
    "Escola",
    "Faculdade",
    "Máquina de lavar roupa",
    "Headset",
    "Tablet",
    "Smartwatch",
    "Carregador portátil",
    "Projetor",
    "Super Mario",
    "Homem-Aranha",
    "Coluna bluetooth",
    "Consola de videojogos",
    "Câmara",
    "Rato gamer",
    "Teclado mecânico",
    "Monitor",
    "Cadeira gamer",
    "TV",
    "Scanner",
    "Roteador Wi-Fi",
    "Câmera fotográfica",
    "Casa",
    "Portugal",
    "Caixa de ferramentas",
    "Mala de viagem",
    "Garrafa",
    "Guarda-chuva",
    "Caneca",
    "Óculos de realidade virtual",
    "Cadeado",
    "Maçã",
    "Banana",
    "Laranja",
    "Abacaxi",
    "Morango",
    "Pera",
    "Limão",
    "Manga",
    "Kiwi",
    "Uva",
    "Melância",
    "Melão",
    "Mamão",
    "Tangerina",
    "Cereja",
    "Ameixa",
    "Goiaba",
    "Pitaya",
    "Caju",
    "Acerola",
    "Bicicleta",
    "Girassol",
    "Pizza",
    "Guitarra",
    "Elefante",
    "Arco-Íris",
    "Castelo",
    "Praia",
    "Dragão",
    "Telescópio",
    "Piano",
    "Futebol",
    "Torre Eiffel",
    "Montanha",
    "Camêra",
    "Helicóptero",
    "Base de dados",
    "Computador",
    "Teclado",
    "Inteligencia artificial",
    "Microsoft",
    "Google",
    "Android",
];
let users = [];
let messages = [];
let drawingPlayer = '';
let generaTedWord = "";
function clearTurn() {
    drawingPlayer = "";
    generaTedWord = "";
    messages.push({
        username: "JC BOT",
        message: `ended turn`,
    });
    io.emit("messages_load", messages);
    io.emit("clearCanvaServer");
    io.emit("ended_turn");
    io.emit("openChat");
}
io.on("connection", (socket) => {
    // incrementa a pontuação do utilizador com o nome de utilizador especificado
    function addPoints(username, points) {
        const user = users.find((u) => u.userName === username);
        if (user) {
            user.score += points;
        }
        io.emit("pointsAdded", {
            users
        });
    }
    socket.on("load_messages", function (socketInfo) {
        return __awaiter(this, void 0, void 0, function* () {
            io.emit("messages_load", messages); // emit load messages to only user
        });
    });
    socket.on("message_sent", function (socketInfo) {
        return __awaiter(this, void 0, void 0, function* () {
            if (socketInfo.message.toLowerCase().trim() === "reset") {
                messages = [];
                let users2 = [];
                users.map((u) => {
                    users2.push(Object.assign(Object.assign({}, u), { score: 0 }));
                });
                users = users2;
                messages.push({
                    username: "JC BOT",
                    message: `GAME RESETED 😢`,
                });
                io.emit("message_received");
                io.emit("playerConnectedServer", users);
                io.emit("gameReseted");
                clearTurn();
                return;
            }
            if (drawingPlayer !== "" && generaTedWord !== "") // game is running
             {
                if (generaTedWord.toLowerCase().trim().includes(socketInfo.message.toLowerCase().trim()) && socketInfo.message.length > 2) {
                    const user = users.find((u) => u.userName === socketInfo.user_name);
                    const drawer = users.find((u) => u.socketId === drawingPlayer);
                    if (user && drawer) {
                        //player
                        addPoints(user.userName, socketInfo.message.length);
                        //drawer
                        addPoints(drawer.userName, socketInfo.message.length > 0 ? socketInfo.message.length - 1 : 1);
                        messages.push({
                            username: "JC BOT",
                            message: `Nice ${user.userName}!🎉 - ${user.score} points`,
                        });
                        messages.push({
                            username: "JC BOT",
                            message: `Nice ${(drawer === null || drawer === void 0 ? void 0 : drawer.userName) && "drawer"} - ${drawer.score} points`,
                        });
                        io.emit("message_received");
                        io.to(socket.id).emit("closeChat");
                        //bloquear o chat?
                    }
                }
                else {
                    //mandar msg palavra incorreta
                    messages.push({
                        username: "JC BOT",
                        message: `WRONG 😢`,
                    });
                    io.emit("message_received");
                }
                return;
            }
            messages.push({
                message: socketInfo.message,
                username: socketInfo.user_name
            });
            io.emit("message_received");
        });
    });
    socket.on("fillColorCheckedChanged", () => {
        socket.broadcast.emit("fillColorCheckedChanged");
    });
    socket.on("startDrawClient", (data) => {
        io.emit("startDrawServer", data);
    });
    socket.on("drawingClient", (data) => {
        io.emit("drawingServer", data);
    });
    socket.on("clearCanvaClient", () => {
        socket.broadcast.emit("clearCanvaServer");
        socket.emit("clearCanvaServer");
    });
    socket.on("colorChanged", (color) => {
        socket.broadcast.emit("colorChanged", color);
    });
    socket.on("changeToolClient", (btnId) => {
        socket.broadcast.emit("changeToolServer", btnId);
        socket.emit("changeToolServer", btnId);
    });
    socket.on("mouseUpClient", () => {
        io.emit("mouseUpServer");
    });
    socket.on("playerConnectedClient", (socketData) => {
        if (drawingPlayer !== "") // when game has already started
         {
            io.to(socket.id).emit("cannotConnect");
            return;
        }
        if (socketData.userName != "") {
            users.push({
                userName: socketData.userName,
                socketId: socket.id,
                score: 0
            });
        }
        io.emit("playerConnectedServer", users);
        console.log("logged users:");
        console.log(users);
    });
    socket.on("start_game", ({ user_name }) => {
        // Only allow the first player who started the game to draw
        if (drawingPlayer === "") {
            console.log('game Started');
            drawingPlayer = socket.id;
            io.to(drawingPlayer).emit("closeChat");
            messages.push({
                username: "JC BOT",
                message: `${user_name} started the game. Guess the drawing!.`,
            });
            io.emit("messages_load", messages); // emit load messages to only user
            socket.broadcast.emit("game_started", {
                userName: user_name,
                socketId: socket.id
            });
            const randomIndex = Math.floor(Math.random() * words.length);
            // select the string at the random index
            const randomWord = words[randomIndex];
            generaTedWord = randomWord;
            io.to(drawingPlayer).emit("drawing_allowed", {
                word: randomWord
            });
        }
    });
    socket.on("end_turn", () => {
        clearTurn();
        io.to(socket.id).emit("user_ended_turn");
    });
    socket.on("usernameCheck", () => {
        io.to(socket.id).emit("usernameCheckServer", users);
    });
    socket.on("playerJoinedClient", (socketData) => {
        if (socketData.userName != "") {
            users.push({
                userName: socketData.userName,
                socketId: socket.id,
                score: 0
            });
        }
        io.emit("playerJoinedServer", users);
    });
    socket.on("disconnect", (socketData) => {
        let user = users.find(u => u.socketId == socket.id);
        if (user) {
            user = Object.assign(Object.assign({}, user), { score: 0 });
        }
        let users2 = [];
        users.map((u) => {
            if (u.userName !== (user === null || user === void 0 ? void 0 : user.userName))
                users2.push(u);
        });
        if (drawingPlayer === socket.id) {
            clearTurn();
        }
        users = users2;
        console.log("users saida:");
        io.emit("playerDisconnectedServer", users);
        console.log(users);
    });
});
app.get('/', function (req, res) {
    return res.sendfile(path_1.default.resolve("client", "index.html"));
});
server.listen(port, "192.168.1.67", function () {
    console.log(`Listening on port ${port}`);
});

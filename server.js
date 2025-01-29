import "dotenv/config";
import mysql from "mysql2/promise";
import { Server } from "socket.io";
import express from "express";
import * as http from "http";
import ViteExpress from "vite-express";
import { v4 as uuidv4 } from 'uuid'; // UUID 생성기 임포트

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

//  MySQL 연결 풀 생성
const pool = mysql.createPool({
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    port: process.env.MYSQLPORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

//  DB 연결 확인
async function DB() {
    try {
        const connection = await pool.getConnection();
        console.log(" DB 연결 성공");
        connection.release();
    } catch (error) {
        console.error(" DB 연결 실패:", error);
    }
}
DB();

// 테이블 조건 변경
async function alterTable() {
    try {
        await pool.query(`
            ALTER TABLE messages MODIFY room_id VARCHAR(255) NOT NULL;
        `);
        console.log("room_id 컬럼 길이 변경 완료!");

        await pool.query(`
            ALTER TABLE messages MODIFY username VARCHAR(50) NOT NULL;
        `);
        console.log("username 컬럼 길이 변경 완료!");

        await pool.query(`
            ALTER TABLE messages MODIFY timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL;
        `);
        console.log("timestamp 컬럼 기본값 추가 완료!");

    } catch (error) {
        console.error("room_id 컬럼 길이 변경 실패:", error);
    }
}

// 서버 시작 시 `ALTER TABLE` 실행
alterTable();

// 클라이언트가 접속했을 때
io.on("connection", async (client) => {
    console.log(" 클라이언트 접속:", client.id);

    const connectedUsername = client.handshake.query.username;
    console.log(`👤 ${connectedUsername}님이 접속하셨습니다.`);

    //  기존 메시지 로드하여 클라이언트에게 전송
    try {
        const [messages] = await pool.query(
            "SELECT id, room_id, username, message, timestamp FROM messages ORDER BY timestamp ASC"
        );
        client.emit("load_messages", messages); // 기존 메시지 로드
        console.log(messages);
    } catch (error) {
        console.error(" 기존 메시지 불러오기 실패:", error);
    }

    const entryMessage = {
        id: uuidv4(),
        username: "관리자",
        message: `${connectedUsername}님이 채팅에 참가하셨습니다.`,
        room_id: 'default_room'
    }

    // 관리자 입장 메시지 브로드캐스트
    client.broadcast.emit('message', entryMessage);

    //  클라이언트가 메시지를 보낼 때
    client.on('message', async (data) => {
        const messageWithId = { id: uuidv4(), ...data };
        console.log(" 메시지 수신:", messageWithId);

        // 🚀 room_id가 없을 경우 기본값 설정
        const roomId = data.room_id || 'default_room';

        //  DB에 메시지 저장
        try {
            await pool.query(
                "INSERT INTO messages (room_id, username, message) VALUES (?, ?, ?)",
                [roomId, data.username, data.message]
            );
        } catch (error) {
            console.error("메시지 저장 실패:", error);
        }

        // 메시지 클라이언트들에게 전송
        io.emit('message', messageWithId);
    });

    // 클라이언트가 접속을 해제했을 때
    client.on('disconnect', async () => {
        console.log(`${connectedUsername}님이 접속을 해제하셨습니다.`);

        const exitMessage = {
            id: uuidv4(),
            username: "관리자",
            message: `${connectedUsername}님이 채팅에서 퇴장하셨습니다.`,
            room_id: "default_room"
        };

        // ✅ 관리자 퇴장 메시지 DB에 저장
        try {
            await pool.query(
                "INSERT INTO messages (room_id, username, message) VALUES (?, ?, ?)",
                [exitMessage.room_id, exitMessage.username, exitMessage.message]
            );
            console.log(" 관리자 퇴장 메시지 저장 완료!");
        } catch (error) {
            console.error("관리자 퇴장 메시지 저장 실패:", error);
        }

        // 관리자 메시지를 모든 클라이언트에게 전송
        io.emit('message', exitMessage);
    });

    // 현재 연결된 모든 클라이언트 출력 (오류 수정)
    console.log("현재 연결된 클라이언트들:", [...io.sockets.sockets.keys()]);
});

// 서버 실행
server.listen(3000, () => {
    console.log(" 서버 실행 중 (포트 3000)");
});

//  Express API 엔드포인트 (테스트용)
app.get("/message", (_, res) => res.send("Hello from express!"));
app.get("/api", (_, res) => res.send("Hello from API"));

//  ViteExpress를 Express 서버에 바인딩
ViteExpress.bind(app, server);

# Real-Time Chat Application

## Introduction
This is a scalable and secure real-time chat application built using Node.js, WebSockets, and Redis. It supports one-on-one messaging, group chats, online presence indicators, offline message storage, and push notifications. Designed for performance and reliability, the application ensures seamless communication with geo-location-based server allocation, end-to-end encryption, and fault-tolerant architecture.

---

## Requirements
<img width="1140" alt="Screenshot 2024-12-12 at 8 46 33 PM" src="https://github.com/user-attachments/assets/d1e0701f-66e3-4567-abe8-23dcdaf8aa7e" />

## System Design 
![image](https://github.com/user-attachments/assets/5b8160b0-9a13-4144-8fca-663da40e89eb)

## Tech Stack

### **Backend**
- **Node.js**: Server runtime for handling chat logic and APIs.
- **TypeScript**: Server Side Language for application.
- **WebSockets**: Real-time bi-directional communication.
- **Redis**: Pub/Sub system for managing online users and routing messages.
- **PostgreSQL**: Database for storing user data, messages, and group details.
- **Firebase Cloud Messaging (FCM)**: Push notifications for offline users.
- **JWT**: Authentication and authorization.
- **WebRTC**: For Vedio calling feature.

### **DevOps**
- **Docker**: Containerization of backend services.
- **Kubernetes**: Orchestrating containerized services for scalability.
- **NGINX**: Load balancer for WebSocket servers.

### **Security**
- **End-to-End Encryption (AES)**: Protects message content.
- **HTTPS**: Ensures secure API communications.

---

## Application Flow
1. **User Connection**: Users connect to WebSocket servers distributed across geo-locations for optimal performance.
2. **Message Routing**: WebSocket servers use Redis to identify where the recipient is connected and deliver messages in real time.
3. **Offline Messages**: Messages for offline users are stored in MongoDB and delivered when the recipient reconnects.
4. **Push Notifications**: Firebase Cloud Messaging notifies offline users of pending messages.
5. **Scalability**: Kubernetes ensures horizontal scaling, handling increased traffic efficiently.
6. **Security**: All communications are encrypted, and sensitive user data is protected with secure protocols.

---

## Summary
This chat application is built to handle real-time communication needs with a focus on scalability, security, and performance. It is ideal for modern applications requiring seamless and reliable chat systems.

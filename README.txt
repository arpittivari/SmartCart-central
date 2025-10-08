# 🛒 SmartCart Central

A futuristic, real-time, multi-tenant management system for a fleet of smart shopping carts. This project includes a backend server, a frontend web application, and firmware for the ESP8266/ESP32-based smart carts, all containerized with Docker for easy setup and deployment.

![Screenshot](https://i.imgur.com/your-screenshot-url.png) 
*(You can replace this with a link to your own screenshot)*

## ✨ Features

* **Real-Time Dashboard:** Monitor cart status (Idle, Shopping, Offline), battery levels, and location instantly.
* **Multi-Tenant Architecture:** Securely supports multiple malls, each with its own private admin accounts, carts, and data.
* **Secure ESP Communication:** Each cart authenticates with the MQTT broker using unique, dynamically generated credentials.
* **Admin Management Portal:** A complete web UI for admins to:
    * Register and manage their fleet of carts.
    * Upload and view mall-specific product databases.
    * View sales and usage analytics.
    * Update their profile and upload a custom avatar.
* **Dockerized Environment:** The entire application stack (Backend, Frontend, MQTT Broker) is containerized for a one-command startup, eliminating "it works on my machine" issues.

## 🛠️ Tech Stack

* **Backend:** Node.js, Express, MongoDB, Mongoose, MQTT.js, Socket.IO, JWT, Multer
* **Frontend:** React, TypeScript, Vite, Material-UI (MUI), Axios, Socket.IO Client
* **Hardware (ESP):** ESP8266/ESP32, Arduino C++, PubSubClient, ArduinoJson
* **DevOps:** Docker, Docker Compose

## 🚀 Getting Started

### Prerequisites

* [Node.js](https://nodejs.org/) (v18 or later)
* [Docker Desktop](https://www.docker.com/products/docker-desktop/)
* An MQTT Broker (e.g., [Mosquitto](https://mosquitto.org/download/)) installed on your machine or network.
* MongoDB Database (e.g., a free tier from [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)).

### 1. Initial Setup

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd smartcart-central
    ```

2.  **Configure the MQTT Broker (Mosquitto):**
    * Install Mosquitto and configure it to run as a service.
    * Edit its `mosquitto.conf` file to require authentication (`allow_anonymous false`) and point to a password file.
    * Create the password file and add a user for the backend (e.g., `backend_user`).
    * Ensure the broker is running and port `1883` is open in your firewall.

3.  **Configure Environment Variables:**
    * Navigate to the `/backend` directory.
    * Create a copy of `.env.example` and name it `.env`.
    * Fill in your `MONGO_URI`, `JWT_SECRET`, and the `MQTT_` credentials for the `backend_user` you created.

4.  **Install All Dependencies:**
    * From the **root `smartcart-central` directory**, run the command to install all dependencies for the root, backend, and frontend projects.
    ```bash
    npm run install-all
    ```

### 2. Running the Application

This project is managed with Docker Compose for a simple, unified workflow.

1.  **Start the Entire System:**
    * Make sure Docker Desktop is running.
    * From the **root `smartcart-central` directory**, run:
    ```bash
    docker-compose up --build
    ```
    *The `--build` flag is only needed the first time or after you change dependencies. For subsequent starts, you can just use `docker-compose up`.*

2.  **Access the Application:**
    * **Frontend Web App:** [http://localhost:5173](http://localhost:5173)
    * **Backend API:** [http://localhost:5000](http://localhost:5000)

3.  **Stopping the Application:**
    * Press `Ctrl+C` in the terminal where the application is running.
    * Alternatively, open a new terminal in the same directory and run `docker-compose down`.

### 3. ESP (Hardware) Workflow

1.  Log in to the web application as an admin.
2.  Navigate to the "Cart Management" page and register a new cart.
3.  Click the "View" button to get the unique MQTT credentials generated for that cart.
4.  Copy and paste these credentials into the appropriate variables in your `.ino` sketch.
5.  Upload the sketch to your ESP device and power it on. It will now securely connect and send data.
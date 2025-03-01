<div align=center>

# Video Categorizer

</div>

<div align=center>
    <a href="#back">⚙️ Backend | </a>
    <a href="#front">🌈 Frontend  </a>
</div>

<br><br>

<div align=center>

<div id="back"></div>

# Backend Python FastAPI

</div>

<div align=center>
    <a href="#about"> ❓About  | </a>
    <a href="#requirements"> 📃 Requirements  | </a>
    <a href="#run"> 🚀 Run | </a>
    <a href="#endpoints"> 🔗 Endpoints </a>
</div>

<div id="about"></div>

---

#### ❓About 

This project is an API designed to store and categorize videos using ***Google Cloud Video Intelligence***, enabling fast and efficient video labeling and classification with AI.

#### Technologies Used
- **Python:** Used as the primary language for developing the API backend.
- **FastAPI:** A Python framework for building fast web APIs.
- **Google Cloud Intelligence**: Service that analyzes videos using AI, detecting objects, scenes, faces, text, and more.
- **Google Cloud Storage**: Storage service used for storing videos.
- **SQLite**: A lightweight, self-contained SQL database engine to store video labels.
---
<div id="requirements"></div>

#### 📃 Requirements 

The following is a list of the requirements necessary to successfully run this project.

##### Docker compose

Docker Compose is used to manage this application. It must be installed separately. You can install it by following the instructions on the official Docker documentation for your operating system. 

[![Install  Compose](https://img.shields.io/badge/Install-Docker_Compose-blue)](https://docs.docker.com/compose/install/)


##### Google Cloud Platform Key

A `key.json` file for Google Cloud Platform (GCP) must be generated and placed in the API folder to enable access to services such as the Google Cloud Video Intelligence API.

---

<div id="run"></div>

#### 🚀 Run

To start the project, navigate to the API folder and run Docker Compose.
```
docker compose up -d --build
```

- `up`: Starts the containers defined in docker-compose.yml.
- `-d`: Runs the containers in the background (detached mode).
- `--build`: Forces the rebuild of images before starting the containers.

<div id="endpoints"></div>

#### 🔗 Endpoints


| **Endpoint**         | **Method** | **Description**                                         | **Responses**                                |
|----------------------|-----------|---------------------------------------------------------|----------------------------------------------|
| `/upload`           | `POST`    | Uploads a file to `videobucket-ai` and processes it.   | - `200 OK` – Returns upload result <br> - `400/422` – Validation errors <br> |
| `/bucket/files`     | `GET`     | Retrieves a list of all files in the bucket.          | - `200 OK` – Returns a list of files        |
| `/bucket/labels`    | `GET`     | Fetches processed JSON metadata for stored videos.    | - `200 OK` – Returns a list of JSON metadata |

---

<br><br>

<div id="front"></div>

<div align=center>

# Frontend JS React

</div>

<div align=center>
    <a href="#about"> ❓About  | </a>
    <a href="#requirements"> 📃 Requirements  | </a>
    <a href="#run"> 🚀 Run | </a>
</div>

---

#### ❓About 

This project is a React application designed to provide user interaction features for an optimized user experience.

#### Technologies Used
- **React:** A JavaScript library for building user interfaces.
- **Vite:** A fast build tool that serves the React app in development.
- **Javascript:** Programing language for development experience.

---

<div id="requirements"></div>

#### 📃 Requirements 

##### Node JS

Ensure that Node.js is installed on your system. You can download it from the official website: 

[![Install Node.js](https://img.shields.io/badge/Install-Node.js-blue)](https://nodejs.org/)

##### NPM 

You will require to use `npm` as the package manager.

---

<div id="run"></div>

#### 🚀 Run
To start the project in development mode, navigate to the project folder and run the following commands.


For install the dependencies.

```
npm install
```

For run the project in Development mode.

```
npm run dev
```



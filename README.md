# Draw INETE
![drawINETE](https://github.com/RodrigoGaluppo/draw_inete/assets/68329584/61a20eeb-2382-41df-96a7-b8c3c86485be)


**draw_inete** is a collaborative drawing project inspired by the popular web game Gartic. Developed by Rodrigo Galuppo and Maksym Grebeniuk, this project allows users to create virtual rooms and engage in real-time drawing and guessing activities with friends.

## Overview

In **draw_inete**, users can create a room and invite friends to join by sharing a link. Once inside the room, participants can set their usernames and begin the game. When it's someone's turn to draw, they are provided with a random word to illustrate, while others try to guess the word based on the drawing. Players earn points for correctly guessing the word, with the point value determined by the length of the word.

## Demo
https://youtu.be/JIdud2YnOuQ

## Features

- **Room Creation**: Users can create virtual rooms and share links for friends to join.
- **Real-time Drawing**: Drawing and guessing happen in real-time, allowing for seamless interaction between participants.
- **Username Customization**: Participants can set their usernames before starting the game.
- **Dynamic Drawing Tools**: Users have access to various drawing tools such as colors and shapes to create their illustrations.

## Structure

The project is structured with separate frontend and backend components:

- **Frontend**:
  - Developed using HTML, CSS, and JavaScript.
  - Provides the user interface for creating rooms, setting usernames, and engaging in drawing activities.
  
- **Backend**:
  - Built with TypeScript and Express API.
  - Utilizes websockets with the Socket.IO library to enable real-time communication between clients.
  - Handles game logic, point calculations, and communication with the frontend.

## Exhibition

This project was developed to be showcased at Futuralia 2023, a national fair of schools and universities in Portugal. It was exhibited at the INETE stand, demonstrating its capabilities to visitors.

## Contributors

- Rodrigo Galuppo
- Maksym Grebeniuk

## License

This project is licensed under the [MIT License](link-to-license).


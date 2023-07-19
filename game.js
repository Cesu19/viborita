// Obtener el elemento del canvas y su contexto
var canvas = document.getElementById("gameCanvas");
var context = canvas.getContext("2d");

// Tamaño del tablero
var gridSize = 20;
var gridWidth = Math.floor(canvas.width / gridSize);
var gridHeight = Math.floor(canvas.height / gridSize);

// Posición inicial y tamaño de la serpiente
var snake = [{ x: Math.floor(gridWidth / 2), y: Math.floor(gridHeight / 2) }];
var snakeSize = 1;

// Posición inicial de la segunda serpiente
var enemySnake = [{ x: 5, y: 5 }];
// Tamaño inicial de la segunda serpiente
var enemySnakeSize = 2;

// Dirección inicial de la serpiente
var direction = "right";

// Posición y estado de la comida
var food = { x: 0, y: 0, eaten: true };

// Niveles de colores para los obstáculos
var obstacleColors = [
  "gold", "blue", "green", "yellow", "purple",
  "orange", "pink", "cyan", "magenta", "lime",
  "teal", "maroon", "navy", "olive", "silver",
  "aqua", "fuchsia", "gray", "indigo", "coral"
];
var currentLevel = 0;

// Obstáculos
var obstacles = generateObstacles(35);

// Función para generar obstáculos de forma aleatoria
function generateObstacles(count) {
  var generatedObstacles = [];
  for (var i = 0; i < count; i++) {
    var obstacle = {
      x: Math.floor(Math.random() * gridWidth),
      y: Math.floor(Math.random() * gridHeight),
      color: obstacleColors[currentLevel]
    };
    generatedObstacles.push(obstacle);
  }
  return generatedObstacles;
}

// Reproductor de audio
var audio = new Audio("DUKI - NCLNC.mp3");

function playAudio() {
  audio.play();
}

// Función para dibujar el juego en el canvas
function draw() {
  // Establecer el color de fondo
  context.fillStyle = "black";
  context.fillRect(0, 0, canvas.width, canvas.height);

  // Dibujar los obstáculos
  obstacles.forEach(function(obstacle) {
    context.fillStyle = obstacle.color;
    context.fillRect(
      obstacle.x * gridSize,
      obstacle.y * gridSize,
      gridSize,
      gridSize
    );
  });

  // Dibujar la serpiente
  context.fillStyle = "lightskyblue";
  snake.forEach(function(segment) {
    context.fillRect(
      segment.x * gridSize,
      segment.y * gridSize,
      gridSize,
      gridSize
    );
  });

  // Dibujar la serpiente enemiga
  context.fillStyle = "red";
  enemySnake.forEach(function(segment) {
    context.fillRect(
      segment.x * gridSize,
      segment.y * gridSize,
      gridSize,
      gridSize
    );
  });

  // Dibujar la comida
  if (food.eaten) {
    food.x = Math.floor(Math.random() * gridWidth);
    food.y = Math.floor(Math.random() * gridHeight);
    food.eaten = false;
  }

  context.fillStyle = "red";
  context.fillRect(
    food.x * gridSize,
    food.y * gridSize,
    gridSize,
    gridSize
  );
}

// Función para actualizar la posición de la serpiente y verificar colisiones
function update() {
  // Obtener la posición de la cabeza de la serpiente
  var head = { x: snake[0].x, y: snake[0].y };

  // Actualizar la posición de la cabeza según la dirección
  if (direction === "up") head.y--;
  if (direction === "down") head.y++;
  if (direction === "left") head.x--;
  if (direction === "right") head.x++;

  // Verificar colisión con los obstáculos
  if (isCollision(head.x, head.y, obstacles)) {
    // Fin del juego
    showAlert("Pedazo de BOLUUUUUUUUU");
    resetGame();
    return;
  }

  // Agregar la nueva cabeza a la serpiente
  snake.unshift(head);

  // Verificar colisión de la serpiente del jugador con la comida
  if (snake[0].x === food.x && snake[0].y === food.y) {
    // La serpiente come la comida y crece
    food.eaten = true;
    snakeSize++;

    // Cambiar el color de los obstáculos al siguiente nivel
    currentLevel = (currentLevel + 1) % obstacleColors.length;
    obstacles.forEach(function(obstacle) {
      obstacle.color = obstacleColors[currentLevel];
    });
  }

  // Verificar colisión con los límites del tablero
  if (
    head.x < 0 ||
    head.x >= gridWidth ||
    head.y < 0 ||
    head.y >= gridHeight
  ) {
    // Permitir que la serpiente salga por el otro lado del tablero
    if (head.x < 0) head.x = gridWidth - 1;
    if (head.x >= gridWidth) head.x = 0;
    if (head.y < 0) head.y = gridHeight - 1;
    if (head.y >= gridHeight) head.y = 0;
  }

  // Verificar colisión con el propio cuerpo de la serpiente
  for (var i = 1; i < snake.length; i++) {
    if (head.x === snake[i].x && head.y === snake[i].y) {
      // Fin del juego
      showAlert("Cagon, como los del rojo resultaste.");
      resetGame();
      return;
    }
  }

  // Reducir la serpiente al tamaño adecuado
  while (snake.length > snakeSize) {
    snake.pop();
  }

  // Movimiento de la serpiente enemiga
  var enemyHead = { x: enemySnake[0].x, y: enemySnake[0].y };
  var enemyDirection = getEnemyDirection(enemyHead, snake[0]);

  enemyHead.x += enemyDirection.x;
  enemyHead.y += enemyDirection.y;

  // Restricción de movimiento de la serpiente enemiga para evitar que retroceda
  if (enemyDirection.x === -1 && enemyHead.x < 0) enemyHead.x = gridWidth - 1;
  if (enemyDirection.x === 1 && enemyHead.x >= gridWidth) enemyHead.x = 0;
  if (enemyDirection.y === -1 && enemyHead.y < 0) enemyHead.y = gridHeight - 1;
  if (enemyDirection.y === 1 && enemyHead.y >= gridHeight) enemyHead.y = 0;

  // Verificar colisión con el propio cuerpo de la serpiente para la serpiente enemiga
  for (var i = 1; i < enemySnake.length; i++) {
    if (enemyHead.x === enemySnake[i].x && enemyHead.y === enemySnake[i].y) {
      // Fin del juego para la serpiente enemiga
      resetEnemySnake();
      break;
    }
  }

  // Actualizar la posición de la serpiente enemiga
  enemySnake.unshift(enemyHead);

  // Verificar colisión de la serpiente del jugador con la serpiente enemiga
  if (isCollision(snake[0].x, snake[0].y, enemySnake)) {
    // Fin del juego para el jugador
    showAlert("Te caiste mas que el peso pa!");
    resetGame();
    return;
  }

  // Reducir la serpiente enemiga al tamaño adecuado
  while (enemySnake.length > enemySnakeSize) {
    enemySnake.pop();
  }
}

// Función para obtener la dirección de movimiento de la serpiente enemiga
function getEnemyDirection(enemyHead, playerHead) {
  var dx = playerHead.x - enemyHead.x;
  var dy = playerHead.y - enemyHead.y;

  // Escoger una dirección aleatoria para la serpiente enemiga
  var directions = [];
  if (dx !== 0) {
    directions.push({ x: dx > 0 ? 1 : -1, y: 0 });
  }
  if (dy !== 0) {
    directions.push({ x: 0, y: dy > 0 ? 1 : -1 });
  }

  var randomIndex = Math.floor(Math.random() * directions.length);
  return directions[randomIndex];
}

// Función para verificar colisión con los obstáculos
function isCollision(x, y, obstacles) {
  for (var i = 0; i < obstacles.length; i++) {
    if (x === obstacles[i].x && y === obstacles[i].y) {
      return true;
    }
  }
  return false;
}

// Función para reiniciar el juego
function resetGame() {
  snake = [{ x: Math.floor(gridWidth / 2), y: Math.floor(gridHeight / 2) }];
  snakeSize = 1;
  direction = "right";
  food.eaten = true;

  enemySnake = [{ x: 5, y: 5 }];
  enemySnakeSize = 2;

  obstacles = generateObstacles(35); // Generar nuevos obstáculos aleatoriamente
}

// Función para reiniciar la serpiente enemiga
function resetEnemySnake() {
  enemySnake = [{ x: 5, y: 5 }];
  enemySnakeSize = 2;
}

// Función para manejar los eventos de teclado
function handleKeydown(event) {
  var key = event.key;

  // Cambiar la dirección de la serpiente según la tecla presionada
  if (key === "ArrowUp" && direction !== "down") direction = "up";
  if (key === "ArrowDown" && direction !== "up") direction = "down";
  if (key === "ArrowLeft" && direction !== "right") direction = "left";
  if (key === "ArrowRight" && direction !== "left") direction = "right";
}

// Bucle principal del juego
function gameLoop() {
  update();
  draw();
}

// Configurar el manejo de eventos de teclado
document.addEventListener("keydown", handleKeydown);

// Centrar el canvas en la pantalla
canvas.style.margin = "auto";
canvas.style.display = "block";

// Configurar el manejo de eventos de teclado
document.addEventListener("keydown", function(event) {
  if (event.key === " ") {
    playAudio();
  }
});

function showAlert(message) {
  // Crear el elemento de alerta
  var alertElement = document.createElement("div");
  alertElement.classList.add("alert");
  alertElement.textContent = message;

  // Agregar el elemento de alerta al documento
  document.body.appendChild(alertElement);

  // Función para eliminar la alerta y reiniciar el juego
  function removeAlert() {
    document.body.removeChild(alertElement);
    resetGame();
  }

  // Agregar el evento de escucha de teclado para detectar la tecla "Enter"
  document.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
      removeAlert();
    }
  });
}

// Obtén una referencia al elemento del menú y al botón de inicio
var menu = document.getElementById("menu");
var startButton = document.getElementById("startButton");
var playButton; // Variable para almacenar la referencia al botón "MODO DIABLO"

// Función para ocultar el menú de inicio y comenzar el juego
function startGame() {
  menu.style.display = "none"; // Oculta el menú

  if (!playButton) { // Si el botón "MODO DIABLO" no existe, crearlo y agregarlo
    playButton = document.createElement("button");
    playButton.textContent = "MODO DIABLO";
    playButton.addEventListener("click", playAudio);
    playButton.addEventListener("keydown", function(event) {
      if (event.key === " ") {
        playAudio();
      }
    });
    playButton.classList.add("modoDiablo");
    document.body.appendChild(playButton);
  }

  document.addEventListener("keydown", handleKeydown); // Agrega el manejo de eventos de teclado
  setInterval(gameLoop, 100); // Inicia el bucle principal del juego
}

// Agrega el evento de clic al botón de inicio
startButton.addEventListener("click", startGame);
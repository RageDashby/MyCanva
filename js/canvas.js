import { Cuadrado, Circulo, Linea, Corazon, LineaContinua, Sticker } from "./figuras.js";

const canvas = document.querySelector('#canvas');
const ctx = canvas.getContext("2d");

//Variables de uso constante
//Trazado de las figuras
let trazoIniciado = false;
//Herramienta con default
let herramientaActual = 'cuadrado'; 
//Arreglo que almacena todas las figuras dibujadas
let figurasEnCanvas = []; 
//Almacena la imagen cargada por el usuario
let imagenFondo = null; 
//Almacena la imagen para sticker actual
let imagenSticker = null; 

// Colores base para las figuras (variables para poder actualizarlas con los pickers)
let COLOR_LINEA = "#4B0082";
let COLOR_RELLENO = "rgba(106, 90, 205, 0.3)";
const GROSOR_LINEA = 3;
// Pila para rehacer (figuras desechas)
let figurasDesechas = [];
//Posiciones del cursor en diferentes estados
let posicionCursor = {
    iniciales: { x: '', y: '' },
    actuales: { x: '', y: '' },
    finales: { x: '', y: '' }
}

//QuerySelector de los bototes
const toolButtons = document.querySelectorAll('.tool-button[data-tool]');
const inputImagen = document.getElementById('upload-img');
const inputSticker = document.getElementById('upload-sticker');
const pickerRelleno = document.getElementById('pckr-Relleno');
const pickerContorno = document.getElementById('pckr-Contorno');
const btnUndo = document.getElementById('btn-CtrlZ');
const btnRedo = document.getElementById('btn-Rehacer');
const btnRefresh = document.getElementById('btn-Refresh');
const btnSticker = document.getElementById('btn-Sticker');

//Eventos Principales

//Metodo al hacer click
canvas.addEventListener('mousedown', (event) => {
    trazoIniciado = true;
    posicionCursor.iniciales = registrarPosicionCursor(event);

    if (herramientaActual === 'linea') {
        ctx.beginPath(); // Inicia un nuevo trazo para el pincel
        ctx.moveTo(posicionCursor.iniciales.x, posicionCursor.iniciales.y);
    }
    // Para la herramienta 'linea-continua' dejamos solo la captura del punto inicial aquí;
    // la figura final se crea en mouseup.

});

//Metodo al mover el mouse 
canvas.addEventListener('mousemove', (event) => {
    if (!trazoIniciado) return;
    //Posiciones de los cursores temporales
    posicionCursor.actuales = registrarPosicionCursor(event);
    const inicio = posicionCursor.iniciales;
    const actual = posicionCursor.actuales;
    //El caso linea para una linea continua
    if (herramientaActual === 'linea') {
        //Para el pincel, dibujamos directamente y guardamos cada segmento
        const linea = new Linea(inicio.x, inicio.y, actual.x, actual.y, COLOR_LINEA, GROSOR_LINEA);
        linea.dibujar(ctx);
        // Guardamos el segmento para que se redibuje si es necesario
        figurasEnCanvas.push(linea);
        // Cualquier dibujo nuevo invalida la pila de rehacer
        figurasDesechas = [];
        //Actualizamos el punto de inicio para el siguiente segmento
        posicionCursor.iniciales = actual;
        return; // ya dibujamos el segmento, no necesitamos preview
    } else {
        //Para otras figuras, redibujamos todo y mostramos la previsualización
        //Limpia y redibuja todo lo guardado
        redibujarCanvas(); 

        //Variables de preview
        let preview;
        const x = Math.min(inicio.x, actual.x);
        const y = Math.min(inicio.y, actual.y);
        const ancho = Math.abs(actual.x - inicio.x);
        const alto = Math.abs(actual.y - inicio.y);
        //Eleccion en cada caso de las figuras
        
        switch (herramientaActual) {
            case 'cuadrado':
                preview = new Cuadrado(x, y, actual.x, actual.y, ancho, alto, COLOR_LINEA, COLOR_RELLENO, GROSOR_LINEA);
                break;
            case 'circulo':
                //El radio es la distancia desde el inicio al punto actual
                const radio = Math.sqrt(Math.pow(actual.x - inicio.x, 2) + Math.pow(actual.y - inicio.y, 2));
                preview = new Circulo(inicio.x, inicio.y, radio, COLOR_LINEA, COLOR_RELLENO, GROSOR_LINEA);
                break;
            case 'corazon':
                //Para la previsualizacion, usar el mismo cálculo
                const tamanoPreview = Math.max(ancho, alto) / 2;
                const centroXPreview = inicio.x + ancho / 2;
                const centroYPreview = inicio.y + alto / 2;
                preview = new Corazon(centroXPreview, centroYPreview, tamanoPreview, COLOR_LINEA, COLOR_RELLENO, GROSOR_LINEA);
                break;
            case 'linea-continua':
                //Mostrar preview de la linea entre el punto inicial y el actual
                preview = new LineaContinua(inicio.x, inicio.y, actual.x, actual.y, COLOR_LINEA, GROSOR_LINEA);
                break;
            case 'sticker':
                if (imagenSticker) {
                    const stickerAncho = Math.abs(actual.x - inicio.x);
                    const stickerAlto = Math.abs(actual.y - inicio.y);
                    if (stickerAncho > 10 && stickerAlto > 10) {
                        preview = new Sticker(x, y, stickerAncho, stickerAlto, imagenSticker);
                    }
                }
                break;
        }

        if (preview) {
            //Dibuja solo la previsualizacion
            preview.dibujar(ctx);
        }
    }
});

//Metodo al levantar el click del mouse
canvas.addEventListener('mouseup', (event) => {
    if (!trazoIniciado) return;
    trazoIniciado = false;
    posicionCursor.finales = registrarPosicionCursor(event);

    //Si es el pincel, ya hemos guardado los segmentos en 'mousemove'
    if (herramientaActual === 'linea') {
        return;
    }
    //Figura final despues de la preview de esta
    const inicio = posicionCursor.iniciales;
    const final = posicionCursor.finales;
    let figuraNueva;

    const x = Math.min(inicio.x, final.x);
    const y = Math.min(inicio.y, final.y);
    const ancho = Math.abs(final.x - inicio.x);
    const alto = Math.abs(final.y - inicio.y);

    //Se crea la figura final
    switch (herramientaActual) {
        case 'cuadrado':
            figuraNueva = new Cuadrado(x, y, final.x, final.y, ancho, alto, COLOR_LINEA, COLOR_RELLENO, GROSOR_LINEA);
            break;
        case 'circulo':
            const radio = Math.sqrt(Math.pow(final.x - inicio.x, 2) + Math.pow(final.y - inicio.y, 2));
            figuraNueva = new Circulo(inicio.x, inicio.y, radio, COLOR_LINEA, COLOR_RELLENO, GROSOR_LINEA);
            break;
        case 'corazon':
            //Usar el promedio del ancho y alto para un tamaño mas uniforme
            const tamano = Math.max(ancho, alto) / 2;
            //Posicionamiento del corazon 
            const centroX = inicio.x + ancho / 2;
            const centroY = inicio.y + alto / 2;
            figuraNueva = new Corazon(centroX, centroY, tamano, COLOR_LINEA, COLOR_RELLENO, GROSOR_LINEA);
            break;
        case 'linea-continua':
            figuraNueva = new LineaContinua(inicio.x, inicio.y, final.x, final.y, COLOR_LINEA, GROSOR_LINEA);
            break;
        case 'sticker':
            if (imagenSticker) {
                const stickerAncho = Math.abs(final.x - inicio.x);
                const stickerAlto = Math.abs(final.y - inicio.y);
                if (stickerAncho > 10 && stickerAlto > 10) {
                    figuraNueva = new Sticker(x, y, stickerAncho, stickerAlto, imagenSticker);
                }
            }
            break;
    }

    if (figuraNueva) {
        //Se guarda la figura final en el arreglo
        figurasEnCanvas.push(figuraNueva);
        // Al crear una nueva figura, invalidamos la pila de rehacer
        figurasDesechas = [];
    }
       
   
    
 //Redibujamos todo para mostrar la figura final confirmada
    redibujarCanvas();
});

//Interfaz de uasuario

// Event listener para los botones de herramientas
toolButtons.forEach(button => {
    button.addEventListener('click', () => {
        //Para modificar el color de los botones
        //Quita la clase 'active' de todos los botones
        document.querySelector('.tool-button.active')?.classList.remove('active');
        //Añade 'active' al botón clickeado
        button.classList.add('active');
        //Actualiza la herramienta actual
        herramientaActual = button.dataset.tool;
        console.log("Herramienta seleccionada:", herramientaActual);
    });
});

// Event listener para el input de imagen
inputImagen.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        imagenFondo = new Image();
        imagenFondo.onload = () => {
            // Cuando la imagen esté cargada, la dibujamos y redibujamos el resto
            console.log("Imagen cargada. Redibujando canvas.");
            redibujarCanvas();
        };
        imagenFondo.src = event.target.result;
    };
    reader.readAsDataURL(file);
});

// Event listener para cargar imagen de sticker
if (inputSticker) {
    inputSticker.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            imagenSticker = new Image();
            imagenSticker.onload = () => {
                console.log("Imagen de sticker cargada. Listo para dibujar.");
            };
            imagenSticker.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });
}

// Evento para el botón de sticker
if (btnSticker) {
    btnSticker.addEventListener('click', () => {
        inputSticker.click();
    });
}

//Conectar los pickers de color para que actualicen los colores usados al dibujar
if (pickerRelleno) {
    pickerRelleno.addEventListener('input', (e) => {
        COLOR_RELLENO = e.target.value;
    });
}
if (pickerContorno) {
    pickerContorno.addEventListener('input', (e) => {
        COLOR_LINEA = e.target.value;
    });
}
// Botones undo / redo / clear
if (btnUndo) {
    btnUndo.addEventListener('click', () => {
        if (figurasEnCanvas.length > 0) {
            const f = figurasEnCanvas.pop();
            figurasDesechas.push(f);
            redibujarCanvas();
        }
    });
}
if (btnRedo) {
    btnRedo.addEventListener('click', () => {
        if (figurasDesechas.length > 0) {
            const f = figurasDesechas.pop();
            figurasEnCanvas.push(f);
            redibujarCanvas();
        }
    });
}
if (btnRefresh) {
    btnRefresh.addEventListener('click', () => {
        // Mover todo a la pila de rehacer para posible recuperación
        if (figurasEnCanvas.length > 0) {
            figurasDesechas.push(...figurasEnCanvas);
            figurasEnCanvas = [];
        }
        // Limpiar imagen de fondo también
        imagenFondo = null;
        // Resetear input file
        try { inputImagen.value = ''; } catch (e) { /* ignore */ }
        redibujarCanvas();
    });
}


//Funciones globales
//Redibujo del canvas/limpiar canvas en cada caso
function redibujarCanvas() {
    //Limpiar el canvas completamente
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    //Dibujar la imagen de fondo si existe
    if (imagenFondo) {
        //Dibuja la imagen para que cubra el canvas 
        const hRatio = canvas.width / imagenFondo.width;
        const vRatio = canvas.height / imagenFondo.height;
        const ratio = Math.min(hRatio, vRatio);
        const centerShift_x = (canvas.width - imagenFondo.width * ratio) / 2;
        const centerShift_y = (canvas.height - imagenFondo.height * ratio) / 2;

        ctx.drawImage(imagenFondo, 0, 0, imagenFondo.width, imagenFondo.height,
            centerShift_x, centerShift_y, imagenFondo.width * ratio, imagenFondo.height * ratio);
    }

    //Redibujar todas las figuras guardadas
    for (const figura of figurasEnCanvas) {
        figura.dibujar(ctx);
    }
}

//Función original para registrar la posicion
function registrarPosicionCursor(event) {
    const rect = canvas.getBoundingClientRect();
    const posicion = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };
    return posicion;
}

//Pincel
//Sticker 
//Color de relleno
//Color de liniea
//Deshacer
//Rehacer
//Limpiar Canvas
class Figura {
    constructor(posicionX, posicionY, colorLinea, colorRelleno, grosorLinea) {
        this.colorLinea = colorLinea;
        this.colorRelleno = colorRelleno;
        this.grosorLinea = grosorLinea;
        this.posicionX = posicionX;
        this.posicionY = posicionY;
    }
}

export class Cuadrado extends Figura {
    constructor(posicionX, posicionY, finX, finY, ancho, alto, colorLinea, colorRelleno, grosorLinea) {
        super(posicionX, posicionY, colorLinea, colorRelleno, grosorLinea);
        this.ancho = ancho;
        this.alto = alto;
        this.finX = finX;
        this.finY = finY;
    }

    dibujar(ctx) {
        ctx.beginPath();
        ctx.strokeStyle = this.colorLinea;
        ctx.fillStyle = this.colorRelleno;
        ctx.lineWidth = this.grosorLinea;

        ctx.fillRect(this.posicionX, this.posicionY, this.ancho, this.alto);
        ctx.strokeRect(this.posicionX, this.posicionY, this.ancho, this.alto);
    }
}

export class Circulo extends Figura {
    constructor(posicionX, posicionY, radio, colorLinea, colorRelleno, grosorLinea) {
        super(posicionX, posicionY, colorLinea, colorRelleno, grosorLinea);
        this.radio = radio;
    }

    dibujar(ctx) {
        ctx.beginPath();
        ctx.strokeStyle = this.colorLinea;
        ctx.fillStyle = this.colorRelleno;
        ctx.lineWidth = this.grosorLinea;

        ctx.arc(this.posicionX, this.posicionY, this.radio, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
    }
}

export class Linea extends Figura {
    constructor(posicionX, posicionY, puntoFinalX, puntoFinalY, colorLinea, grosorLinea) {
        super(posicionX, posicionY, colorLinea, null, grosorLinea);
        this.puntoFinalX = puntoFinalX;
        this.puntoFinalY = puntoFinalY;
    }

    dibujar(ctx) {
        ctx.beginPath();
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.strokeStyle = this.colorLinea;
        ctx.lineWidth = this.grosorLinea;

        ctx.moveTo(this.posicionX, this.posicionY);
        ctx.lineTo(this.puntoFinalX, this.puntoFinalY);
        ctx.stroke();
    }
}

export class LineaContinua extends Figura {
    constructor(posicionX, posicionY, puntoFinalX, puntoFinalY, colorLinea, grosorLinea) {
        super(posicionX, posicionY, colorLinea, null, grosorLinea);
        this.puntoFinalX = puntoFinalX;
        this.puntoFinalY = puntoFinalY;
    }

    dibujar(ctx) {
        ctx.beginPath();
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.strokeStyle = this.colorLinea;
        ctx.lineWidth = this.grosorLinea;

        ctx.moveTo(this.posicionX, this.posicionY);
        ctx.lineTo(this.puntoFinalX, this.puntoFinalY);
        ctx.stroke();
    }
}

export class Corazon extends Figura {
    constructor(posicionX, posicionY, tamano, colorLinea, colorRelleno, grosorLinea) {
        super(posicionX, posicionY, colorLinea, colorRelleno, grosorLinea);
        this.tamano = tamano;
    }
    
    dibujar(ctx) {
    ctx.beginPath();
    ctx.strokeStyle = this.colorLinea;
    ctx.fillStyle = this.colorRelleno;
    ctx.lineWidth = this.grosorLinea;

    const x = this.posicionX;
    const y = this.posicionY;
    const s = this.tamano;

    // Punto inferior
    ctx.moveTo(x, y + s * 0.4);

    // Lóbulo izquierdo
    ctx.bezierCurveTo(
        x - s,      y - s * 0.01,   // Control 1
        x - s,      y - s,         // Control 2
        x,          y - s * 0.5   // Punto final
    );

    // Lóbulo derecho
    ctx.bezierCurveTo(
        x + s,      y - s,         // Control 1
        x + s,      y - s * 0.01,   // Control 2
        x,          y + s * 0.4    // Punto final (punta inferior)
    );

    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}

}

export class Sticker extends Figura {
    constructor(posicionX, posicionY, ancho, alto, imagen) {
        super(posicionX, posicionY, null, null, null);
        this.ancho = ancho;
        this.alto = alto;
        this.imagen = imagen;
    }

    dibujar(ctx) {
        // Dibuja la imagen en el canvas en la posición y tamaño especificados
        if (this.imagen && this.imagen.complete) {
            ctx.drawImage(this.imagen, this.posicionX, this.posicionY, this.ancho, this.alto);
        }
    }
}
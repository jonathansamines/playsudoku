/**
 * playsudoku.js
 * Controlador principal del juego
 * @author Jonathan Samines
 */

function TableroSudoku(config){
	this.cantidadBase = config.cantidadBase;

	this.limiteMenor = 1;
	this.limiteMayor = 9;
	this.limiteGrupo = 3;
	this.mapaCoordenadas = [];

	// contenedor principal del sudoku
	this.tablero = this.crearTablero();
	var holder = document.getElementById(config.holderId);
	holder.appendChild(this.tablero);
}

/**
 * Genera un número aleatorio entre un rango de numeros.
 * @param  {Number} minimo Número mínimo permitido.
 * @param  {Number} maximo Número máximo permitido.
 * @return {Number}        Número aleatorio generado.
 */
TableroSudoku.prototype.generarNumeroAleatorio = function(minimo, maximo){
	var aleatorio = Math.random() * ( maximo - minimo ) + minimo;

	return Math.floor(aleatorio);
};

/**
 * Genera una posicion aleatoria en el tablero de sudoku
 * @return {[type]} Posición del tablero generada aleatoriamente.
 */
TableroSudoku.prototype.generarPosicionAleatoria = function(){
	var posicion = {
		x : this.generarNumeroAleatorio(this.limiteMenor - 1, this.limiteMayor - 1),
		y : this.generarNumeroAleatorio(this.limiteMenor - 1, this.limiteMayor - 1)
	};

	return posicion
};

/**
 * Genera un mapa (matriz) de posiciones aleatorias
 * @param  {Number} cantidad Cantidad de posiciones aleatorias a generar.
 * @return {Array}           Array de posiciones aleatorias.
 */
TableroSudoku.prototype.generarMapaPosicionesAleatorias = function(cantidad){
	var indice = 0;

	// se crea el mapa de coordenadas vacio
	for(var coordX = 0; coordX <= this.limiteMayor - 1; coordX++){
		this.mapaCoordenadas[coordX] = [];
		for(var coordY = 0; coordY <= this.limiteMayor - 1; coordY++){
			this.mapaCoordenadas[coordX][coordY] = undefined;
		}
	}

	// se genera solo la cantidad de valores indicada.
	while(indice < cantidad){
		var posicion = this.generarPosicionAleatoria(),
			valor = this.generarNumeroAleatorio(this.limiteMenor, this.limiteMayor);
		var valido = this.verificarPosicionValida(valor, posicion.x, posicion.y);

		if(valido){ 
			this.mapaCoordenadas[posicion.x][posicion.y] = valor;
			indice++;
		}
	}
};

/**
 * Obtiene el intervalor de coordenadas absolutas para un grupo.
 * @param  {[type]} x [description]
 * @param  {[type]} y [description]
 * @return {[type]}   [description]
 */
TableroSudoku.prototype.obtenerIntervaloGrupo = function(x, y){
	return {
		x : Math.floor(x / this.limiteGrupo) * this.limiteGrupo,
		y : Math.floor(y / this.limiteGrupo) * this.limiteGrupo
	};
};


/**
 * Obtiene las coordenadas de posicion relativas respecto a las coordenadas absolutas.
 * @param  {Number} x Posición absoluta en el eje de coordenadas x
 * @param  {Number} y Posición absoluta en el eje de coordenadas y
 * @return {Object}   Coordenadas de posicion relativas
 */
TableroSudoku.prototype.obtenerPosicionRelativa = function(x, y){
	return {
		x : Math.abs(Math.floor(x / this.limiteGrupo) * this.limiteGrupo - x),
		y : Math.abs(Math.floor(y / this.limiteGrupo) * this.limiteGrupo - y)
	};
};

/**
 * Verifica si una posición del tablero es válida, en base a sus coordenadas.
 * @param {String} valor Valor a validar en el mapa de coordenadas.
 * @param  {Number} x Posicion en el eje de coordenadas x
 * @param  {Number} y Posicion en el eje de coordenadas y
 * @return {Boolean}   Indica si el valor es válido.
 */
TableroSudoku.prototype.verificarPosicionValida = function(valor, x, y){
	
	// se obtienen las coordenadas de posición relativas, para poder verificar
	// si en el cuadro que le corresponde hay elementos repetidos
	var posicionRelativa = this.obtenerPosicionRelativa(x, y);

	// se verifica que no haya ningun elemento en la posicion absoluta
	if(this.mapaCoordenadas[x][y] !== undefined){
		return false;
	}

	// se busca en toda la fila correspondiente a la coordenada X
	for(var coordX = 0; coordX <= this.limiteMayor - 1; coordX++){
		if(valor == this.mapaCoordenadas[coordX][y]){
			return false;
		}
	}

	// se busca en toda la columna correspondiente a la coordenada X
	for(var coordY = 0; coordY <= this.limiteMayor - 1; coordY++){
		if(valor == this.mapaCoordenadas[x][coordY]){
			return false;
		}
	}

	// se busca solo en el cuadrante relativo
	var intervaloGrupo = this.obtenerIntervaloGrupo(x, y);
	for(var intX = intervaloGrupo.x; intX <= intervaloGrupo.x + this.limiteGrupo - 1; intX++){

		for(var intY = intervaloGrupo.y; intY <= intervaloGrupo.y + this.limiteGrupo - 1; intY++){
			if(valor == this.mapaCoordenadas[intX][intY]){
				return false;
			}
		}
	}

	return true;
};

TableroSudoku.prototype.crearTablero = function(){
	var tablero = document.createElement('section');
	tablero.setAttribute('class', 'gameboard');

	return tablero;
};

TableroSudoku.prototype.crearFila = function(){
	var row = document.createElement('div');
	row.setAttribute('class', 'row');

	return row;
};

TableroSudoku.prototype.crearItem = function(x, y, valor, estado){
	var col = document.createElement('span');
	col.setAttribute('class', 'column');
	col.setAttribute('data-coordinates', x + '-' +  y);

	var input = document.createElement('input');
	input.setAttribute('type', 'text');
	input.disabled = estado;
	input.value = valor;

	col.appendChild(input);

	return col;
};

TableroSudoku.prototype.validarNumerosIngresados = function(){
	var that = this;
	this.tablero.addEventListener('keydown', function(event){
		// se verifica que el elemento que lanzó el evento
		// sea un item del sudoku
		if(event.target instanceof HTMLInputElement){
			var valor = Number(String.fromCharCode(event.keyCode));
			// coordenadas
			var coordenadas = event.target.parentNode.getAttribute('data-coordinates').split('-');
				
			if(/^[1-9]$/.test(valor)){
				
				if( that.verificarPosicionValida(valor, coordenadas[0], coordenadas[1])){
					event.target.setAttribute('class', 'valid');
					that.mapaCoordenadas[ coordenadas[0] ][ coordenadas[1] ] = valor;
				}else{
					that.mapaCoordenadas[ coordenadas[0] ][ coordenadas[1] ] = undefined;
					event.target.setAttribute('class', 'invalid');
				}
			
			// permite backspace, pero ningun caracter alfabetico
			}else if(event.keyCode !== 8){
				event.preventDefault();
				that.mapaCoordenadas[ coordenadas[0] ][ coordenadas[1] ] = undefined;
			}else{
				event.target.setAttribute('class', '');
				that.mapaCoordenadas[ coordenadas[0] ][ coordenadas[1] ] = undefined;
			}
		}
	});
};

TableroSudoku.prototype.dibujarTablero = function(){
	console.log(this.mapaCoordenadas);
	for(var x = 0; x <= this.limiteMayor - 1; x++){
		var fila = this.crearFila();

		for(var y = 0; y <= this.limiteMayor - 1; y++){
			var col;

			if(this.mapaCoordenadas[x][y] === undefined){
				col = this.crearItem(x, y, '', false);
			}else{
				col = this.crearItem(x, y, this.mapaCoordenadas[x][y], true);
				
			}
			fila.appendChild(col);
		}

		this.tablero.appendChild(fila);
	}
};


var tablero = new TableroSudoku({
	cantidadBase : 10,
	holderId : 'gameholder'
});

tablero.generarMapaPosicionesAleatorias(10);
tablero.dibujarTablero();
tablero.validarNumerosIngresados();
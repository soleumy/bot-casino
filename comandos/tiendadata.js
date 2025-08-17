// tiendadata.js

export const tienda = [
    // ON ROL ; LOW COST
    {
        nombre: 'Alcohol',
        clave: 'alcohol',
        precio: 18000,
        descripcion: 'Una botella de espirituosos para relajar las tensiones o bajarlas del todo.'
    },
    {
        nombre: 'Droga (una broma, uso único y no letal)',
        clave: 'droga',
        precio: 25000,
        descripcion: 'Una sustancia lúdica para una situación inesperada, sin consecuencias graves.'
    },
    {
        nombre: 'Canje para hacer que todo el grupo deba rolear un escenario absurdo a elección',
        clave: 'rol-absurdo',
        precio: 30000,
        descripcion: 'Desencadena una situación hilarante e inesperada para el disfrute de todos.'
    },
    {
        nombre: 'Somníferos',
        clave: 'somniferos',
        precio: 40000,
        descripcion: 'Pequeñas píldoras para asegurar un descanso profundo... o un sueño no deseado para otros.'
    },
    {
        nombre: 'Token favor de administración',
        clave: 'favor-adm',
        precio: 50000,
        descripcion: 'Canjea un pequeño favor discreto por parte de la administración. Uso limitado.'
    },

    // ON ROL ; MEDIUM COST
    {
        nombre: 'Acceso a cámaras (Válido en 3 ocasiones)',
        clave: 'camaras',
        precio: 70000,
        descripcion: 'Observa lo que ocurre en áreas clave del casino, válido para tres usos.'
    },
    {
        nombre: 'Armas blancas',
        clave: 'arma-blanca',
        precio: 85000,
        descripcion: 'Un surtido de cuchillos, navajas u otras armas de mano para defensa personal o ataque discreto.'
    },
    {
        nombre: 'Veneno no letal',
        clave: 'veneno-nol', // Ojo: Hay dos ítems con 'veneno'. Asegúrate de que las claves sean únicas si se usan para !comprar. Podría ser 'veneno-nol'
        precio: 100000,
        descripcion: 'Causa efectos incapacitantes temporales sin riesgo de muerte.'
    },
    {
        nombre: 'Información exclusiva',
        clave: 'info-exclusiva',
        precio: 120000,
        descripcion: 'Un dato crucial que podría cambiar el rumbo de tus planes o los de otros.'
    },
    {
        nombre: 'Doble personaje',
        clave: 'doble-personaje',
        precio: 130000,
        descripcion: 'Controla un personaje adicional dentro de la trama del juego.'
    },

    // ON ROL ; HIGH COST
    {
        nombre: 'Armas de fuego',
        clave: 'arma-fuego',
        precio: 160000,
        descripcion: 'Acceso a armamento de mayor calibre para situaciones de alto riesgo.'
    },
    {
        nombre: 'Veneno letal',
        clave: 'veneno-letal', // Se ha cambiado la clave para evitar duplicidad con el veneno no letal.
        precio: 200000,
        descripcion: 'Una dosis potente para eliminar a un oponente. Uso con extrema precaución.'
    },
    {
        nombre: 'Inmunidad a muerte (una vez)',
        clave: 'inmunidad-muerte', // Se ha cambiado la clave. El texto original decía 'veneno' aquí.
        precio: 500000,
        descripcion: 'Protección absoluta contra una muerte inminente en el juego, de un solo uso.'
    },
    {
        nombre: 'Obliga a una persona para rolear una acción y/o escenario de tu preferencia sin importar su opinión',
        clave: 'escenario',
        precio: 600000,
        descripcion: 'Control total sobre la acción de otro personaje en un escenario específico. Requiere aprobación del staff para evitar abusos.'
    },

    // OFF ROL ; ALL COSTS
    {
        nombre: 'Cambio de personaje',
        clave: 'nuevo-pj',
        precio: 45000,
        descripcion: 'Reemplaza tu personaje actual por uno completamente nuevo.'
    },
    {
        nombre: 'Elegir actividad semanal',
        clave: 'actividad-semanal',
        precio: 75000,
        descripcion: 'Selecciona la temática o tipo de actividad para la próxima semana del juego.'
    },
    {
        nombre: 'Influenciar la trama del grupo (una vez)',
        clave: 'trama',
        precio: 140000,
        descripcion: 'Un evento o giro argumental menor a tu elección, con impacto directo en la historia.'
    },
    {
        nombre: 'Derecho de ausencia prolongada sin sanción',
        clave: 'ausencia',
        precio: 200000,
        descripcion: 'Te permite tomar un descanso del juego por un tiempo extendido sin penalizaciones.'
    },
    {
        nombre: 'Salvación de eliminación',
        clave: 'salvacion',
        precio: 400000,
        descripcion: 'Evita la eliminación de tu personaje del juego, incluso en situaciones críticas.'
    }
];
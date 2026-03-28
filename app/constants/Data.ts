export const CITIES = [
"Esperanza, Santa Fe", "Humboldt, Santa Fe", "Frank, Santa Fe", "San Justo, Santa Fe", "Ciudad Autónoma de Buenos Aires, CABA", "Córdoba, Córdoba", "Rosario, Santa Fe", "La Plata, Buenos Aires", "San Miguel de Tucumán, Tucumán", "Mar del Plata, Buenos Aires", "Salta, Salta", "Santa Fe, Santa Fe", "Corrientes, Corrientes", "Bahía Blanca, Buenos Aires", "Resistencia, Chaco", "Posadas, Misiones", "San Salvador de Jujuy, Jujuy", "Santiago del Estero, Santiago del Estero",
"Paraná, Entre Ríos", "Neuquén, Neuquén", "Formosa, Formosa", "San Fernando del Valle de Catamarca, Catamarca",
"San Luis, San Luis", "San Juan, San Juan", "La Rioja, La Rioja", "Santa Rosa, La Pampa", "Río Gallegos, Santa Cruz", "Viedma, Río Negro", "Ushuaia, Tierra del Fuego", "Rawson, Chubut", "Merlo, Buenos Aires", "Quilmes, Buenos Aires", "Banfield, Buenos Aires", "Lanús, Buenos Aires", "José C. Paz, Buenos Aires", "San Martín, Buenos Aires", "Tigre, Buenos Aires", "Avellaneda, Buenos Aires", "Olivos, Buenos Aires", "Pilar, Buenos Aires", "Lomas de Zamora, Buenos Aires", "Caseros, Buenos Aires", "Ramos Mejía, Buenos Aires", "San Isidro, Buenos Aires", "Morón, Buenos Aires", "Escobar, Buenos Aires", "Ituzaingó, Buenos Aires", "Moreno, Buenos Aires", "Florencio Varela, Buenos Aires", "Berazategui, Buenos Aires", "Ezeiza, Buenos Aires", "Campana, Buenos Aires", "Zárate, Buenos Aires", "Luján, Buenos Aires", "Pergamino, Buenos Aires", "Junín, Buenos Aires", "Tandil, Buenos Aires", "Olavarría, Buenos Aires", "Necochea, Buenos Aires", "Chivilcoy, Buenos Aires", "Azul, Buenos Aires", "Mercedes, Buenos Aires", "San Nicolás de los Arroyos, Buenos Aires",
"Río Cuarto, Córdoba", "Villa María, Córdoba", "San Francisco, Córdoba", "Villa Carlos Paz, Córdoba", "Río Tercero, Córdoba", "Alta Gracia, Córdoba", "Venado Tuerto, Santa Fe", "Rafaela, Santa Fe", "Villa Constitución, Santa Fe", "Santo Tomé, Santa Fe", "Reconquista, Santa Fe", "San Lorenzo, Santa Fe", "Gualeguaychú, Entre Ríos", "Concordia, Entre Ríos", "Concepción del Uruguay, Entre Ríos", "Goya, Corrientes", "Paso de los Libres, Corrientes", "Oberá, Misiones", "Eldorado, Misiones", "Presidencia Roque Sáenz Peña, Chaco", "Clorinda, Formosa", "San Ramón de la Nueva Orán, Salta", "Tartagal, Salta", "San Pedro de Jujuy, Jujuy", "Villa Mercedes, San Luis", "Mendoza, Mendoza", "Guaymallén, Mendoza", "Godoy Cruz, Mendoza", "Las Heras, Mendoza", "San Rafael, Mendoza", "Maipú, Mendoza", "Crivasdavia, Mendoza", "San Martín, Mendoza", "General Roca, Río Negro", "San Carlos de Bariloche, Río Negro", "Cipolletti, Río Negro", "Comodoro Rivadavia, Chubut", "Trelew, Chubut", "Puerto Madryn, Chubut", "Esquel, Chubut", "Caleta Olivia, Santa Cruz", "Río Grande, Tierra del Fuego",
  ].sort(); // Los ordena alfabéticamente
  
  export const INSTRUMENTS = [
    "Acordeón", "Armónica", "Arpa", "Bajo", "Bandoneón", "Batería", "Charango", "Clarinete", 
    "Contrabajo", "DJ", "Flauta Traversa", "Guitarra Acústica", "Guitarra Eléctrica", "Órgano", 
    "Percusión", "Piano", "Placas", "Saxo", "Teclado", "Trombón", "Trompeta", "Viola", "Violín", 
    "Violoncelo", "Voz", "Otros"
  ];
  
  export const GENRES = [
    "Blues", "Cumbia", "Electrónica", "Folclore", "Funk", "Jazz", 
    "Metal", "Pop", "Punk", "Rock", "Tango", "Trap/Urbano", "Clásico", "Romántico", "Música de Brasil", "Otros"
  ];

  export const ENTITY_TYPES = [
    "Bar / Restaurante",
    "Salón de Eventos",
    "Productora",
    "Wedding Planner",
    "Particular (Evento privado)",
    "Festival",
    "Institución Pública"
  ];

// 1. Primero define los tipos (opcional pero recomendado)
export interface Musician {
    id: number;
    name: string;
    city: string;
    info: string;
    rating: number;
    reviews: number;
    avatar: string;
    groups?: { name: string; genre: string }[];
  }
  
  export interface Venue {
    id: number;
    name: string;
    city: string;
    info: string;
    rating: number;
    reviews: number;
    avatar: string;
  }
  
  // 2. Exporta los arrays de datos (Esto es lo que te pedía el código)
  export const musicians: Musician[] = [
    { 
      id: 1, 
      name: 'Julián Gómez', 
      city: 'Esperanza', 
      info: 'Guitarrista • Rock', 
      rating: 4.8, 
      reviews: 12, 
      avatar: 'https://i.pravatar.cc/150?u=julian',
      groups: [{ name: 'Los Blues Brothers', genre: 'Blues' }]
    },
    { 
      id: 2, 
      name: 'Ana Luz', 
      city: 'Santa Fe', 
      info: 'Vocalista • Jazz', 
      rating: 5.0, 
      reviews: 8, 
      avatar: 'https://i.pravatar.cc/150?u=ana' 
    },
  ];
  
  export const venues: Venue[] = [
    { 
      id: 101, 
      name: 'The Cavern Pub', 
      city: 'Esperanza', 
      info: 'Bar / Restaurante', 
      rating: 4.5, 
      reviews: 45, 
      avatar: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=150' 
    },
    { 
      id: 102, 
      name: 'Teatro Municipal', 
      city: 'Santa Fe', 
      info: 'Centro Cultural', 
      rating: 4.9, 
      reviews: 120, 
      avatar: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=150' 
    },
  ];
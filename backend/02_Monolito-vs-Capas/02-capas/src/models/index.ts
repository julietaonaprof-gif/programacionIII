export interface Alumno {
    id: number;
    nombre: string;
}

export interface Calificacion {
    id: number;
    alumno_id: number;
    nota: number;
}

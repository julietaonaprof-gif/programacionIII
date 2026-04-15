import { CalificacionRepository } from '../repositories/CalificacionRepository';
import { AlumnoRepository } from '../repositories/AlumnoRepository';
import { Calificacion } from '../models';

export class CalificacionService {
    constructor(
        private calificacionRepository: CalificacionRepository,
        private alumnoRepository: AlumnoRepository
    ) {}

    public async cargarNota(alumno_id: number, nota: number): Promise<Calificacion> {
        if (nota < 0 || nota > 10) throw new Error("La nota debe estar entre 0 y 10");

        const alumno = await this.alumnoRepository.findById(alumno_id);
        if (!alumno) throw new Error("No se puede calificar a un alumno que no existe");

        return await this.calificacionRepository.save(alumno_id, nota);
    }
}

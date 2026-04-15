import { AlumnoRepository } from '../repositories/AlumnoRepository';
import { Alumno } from '../models';

export class AlumnoService {
    constructor(private alumnoRepository: AlumnoRepository) {}

    public async registrarNuevoAlumno(nombre: string): Promise<Alumno> {
        if (!nombre || nombre.length < 3) {
          throw new Error("Nombre demasiado corto");
        }
        return await this.alumnoRepository.save(nombre);
    }

    public async obtenerListado(): Promise<Alumno[]> {
        return await this.alumnoRepository.findAll();
    }

    public async obtenerPorId(id: number): Promise<Alumno | undefined> {
        return await this.alumnoRepository.findById(id);
    }
}

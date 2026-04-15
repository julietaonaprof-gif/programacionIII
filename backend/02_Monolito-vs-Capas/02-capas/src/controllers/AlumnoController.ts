import { Request, Response } from 'express';
import { AlumnoService } from '../services/AlumnoService';

export class AlumnoController {
    constructor(private alumnoService: AlumnoService) {
        this.getAlumnos = this.getAlumnos.bind(this);
        this.createAlumno = this.createAlumno.bind(this);
    }

    public async getAlumnos(req: Request, res: Response) {
        const alumnos = await this.alumnoService.obtenerListado();
        res.json(alumnos);
    }

    public async createAlumno(req: Request, res: Response) {
        try {
            const { nombre } = req.body;
            const nuevo = await this.alumnoService.registrarNuevoAlumno(nombre);
            res.status(201).json(nuevo);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }
}

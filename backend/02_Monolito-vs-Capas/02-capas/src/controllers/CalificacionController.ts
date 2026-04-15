import { Request, Response } from 'express';
import { CalificacionService } from '../services/CalificacionService';

export class CalificacionController {
    constructor(private calificacionService: CalificacionService) {
        this.createNota = this.createNota.bind(this);
    }

    public async createNota(req: Request, res: Response) {
        try {
            const { alumno_id, nota } = req.body;
            const nueva = await this.calificacionService.cargarNota(alumno_id, nota);
            res.status(201).json(nueva);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }
}

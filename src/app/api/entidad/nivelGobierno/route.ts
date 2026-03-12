import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
    host: 'localhost',
    user: 'subnacionales',
    password: 'Zt2jzS3dNn6FfRRk',
    database: 'subnacionales',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const nivelGobierno = searchParams.get('nivelGobierno') || 'GAM';

    // Traducción del 'nivelGobierno' recibido al campo 'tipo' de la tabla 'entidadesautonomas'
    let tipoTabla = '';
    switch (nivelGobierno) {
        case 'GAM':
            tipoTabla = 'Municipio';
            break;
        case 'GAD':
            tipoTabla = 'Gobernacion';
            break;
        case 'GAR':
            tipoTabla = 'Regional';
            break;
        case 'GAIOC':
            tipoTabla = 'Indigena';
            break;
        default:
            tipoTabla = 'Municipio'; // Fallback
    }

    try {
        const query = `SELECT * FROM entidadesautonomas WHERE tipo = ?`;
        const [rows] = await pool.query(query, [tipoTabla]);

        // Mapear los resultados al formato requerido por el frontend
        // El frontend espera { datos: [...] } donde cada elemento tiene código, nombre, etc.
        const datos = (rows as any[]).map(row => {
            // Convertimos posibles valores numéricos null a string vacío, como hacía el backend PHP
            const safeRow: any = {};
            for (const key in row) {
                safeRow[key] = row[key] === null ? '' : String(row[key]);
            }
            
            // Ajustamos las variables para que el Frontend detecte correctamente el codigoEntidad (c_ut_dep)
            return {
                ...safeRow,
                codigoEntidad: safeRow.id,
                nombre: safeRow.eta
            };
        });

        // Retornamos el formato { datos: [...] } 
        return NextResponse.json({ datos });

    } catch (e: any) {
        console.error('Error fetching entidades:', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

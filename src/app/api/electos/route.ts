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
    const gestion = searchParams.get('gestion') || '2021';
    const tipo = searchParams.get('tipo') || 'GAD'; // GAD or GAM
    
    // El usuario también puede pedir filtrar por departamento al buscar municipios
    const depto = searchParams.get('depto'); 

    const table = gestion === '2015' ? 'electos2015' : 'electos2021';

    try {
        let query = '';
        let params: any[] = [];

        if (tipo === 'GAD') {
            query = `
                SELECT e.id_eta, p.color, e.id_sigla AS sigla, e.nombre_exautoridad 
                FROM ${table} AS e 
                JOIN partidos AS p ON e.id_sigla = p.id_sigla 
                WHERE e.cargo LIKE 'Gobernador%'
            `;
        } else if (tipo === 'GAM') {
            query = `
                SELECT e.id_eta, p.color, e.id_sigla AS sigla, e.nombre_exautoridad 
                FROM ${table} AS e 
                JOIN partidos AS p ON e.id_sigla = p.id_sigla 
                WHERE e.cargo LIKE 'Alcalde%'
            `;
            if (depto) {
                query += ` AND e.depto = ?`;
                params.push(depto);
            }
        } else {
            return NextResponse.json({ data: [] });
        }

        const [rows] = await pool.query(query, params);
        
        // Mapear id_eta a c_ut_dep de nuestro GeoJSON
        // En departamentales, id_eta por ejemplo es '92' (La Paz), nosotros usamos '2'
        // En municipales, id_eta es '020101', nosotros usamos '020101'
        const coloredData = (rows as any[]).map(row => {
            let codigoEta = row.id_eta;
            if (tipo === 'GAD' && codigoEta.startsWith('9')) {
                codigoEta = codigoEta.substring(1); // '92' -> '2'
            }
            return {
                ...row,
                codigoEta
            };
        });

        return NextResponse.json({ data: coloredData });

    } catch (e: any) {
        console.error('Error fetching electos:', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

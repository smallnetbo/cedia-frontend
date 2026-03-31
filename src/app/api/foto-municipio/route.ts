import { NextResponse } from 'next/server';
import fs from 'fs';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        return new NextResponse('Missing ID parameter', { status: 400 });
    }

    const dirPath = process.env.MUNICIPIO_IMG_DIR || '/www/wwwroot/seamovil.com/app/observatorio/img/etas';

    try {
        if (!fs.existsSync(dirPath)) {
            return new NextResponse('Image directory not found on server', { status: 404 });
        }

        const files = fs.readdirSync(dirPath);
        
        // Find the first file that matches the pattern "ID-something.jpg" or "ID.jpg"
        const match = files.find(file => {
            const isTarget = file.startsWith(`${id}-`) || file === `${id}.jpg` || file === `${id}.png`;
            return isTarget;
        });

        if (match) {
            // Redirect to the actual remote URL hosted by seamovil.com so the browser caches it properly
            const baseUrl = process.env.MUNICIPIO_IMG_URL || 'https://seamovil.com/app/observatorio/img/etas';
            const fileUrl = `${baseUrl}/${encodeURIComponent(match)}`;
            return NextResponse.redirect(fileUrl);
        } else {
            return new NextResponse('Image not found for this municipality', { status: 404 });
        }
    } catch (error) {
        console.error('Error reading municipality image directory:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

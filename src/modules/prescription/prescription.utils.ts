import status from 'http-status';
import PDFDocument from 'pdfkit';
import { cloudinaryInstance } from '../../config/cloudinary.config';
import { IUploadPdfFailedResult, IUploadPdfSuccessResult } from './prescription.interface';

export const generatePrescriptionBuffer = (data: any): Promise<Buffer> => {
    return new Promise((resolve, reject) => {
        // Create Document
        const doc = new PDFDocument({ 
            size: 'A4', 
            margin: 50,
            bufferPages: true 
        });

        const chunks: Buffer[] = [];

        // Collect data chunks
        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', (err) => reject(err));

        // --- Branding & Colors ---
        const primaryColor = '#0070f3'; // Health Blue
        const secondaryColor = '#444444';
        const lightGray = '#f3f4f6';

        // --- 1. Header (Clinic Information) ---
        doc
            .fillColor(primaryColor)
            .fontSize(22)
            .text('PH Health Care', { align: 'right' })
            .fontSize(10)
            .fillColor(secondaryColor)
            .text('Your Trusted Medical Partner', { align: 'right' })
            .text('123 Health St, Dhaka | +880 1234-567890', { align: 'right' });

        doc.moveDown(1);
        doc.moveTo(50, 100).lineTo(550, 100).strokeColor(lightGray).stroke();

        // --- 2. Information Section ---
        // Doctor Side
        doc
            .fillColor(primaryColor)
            .fontSize(14)
            .text(`Dr. ${data.doctor.name}`, 50, 120)
            .fontSize(10)
            .fillColor(secondaryColor)
            .text(data.doctor.specialization || 'Specialist Physician');

        // Patient Side (Right Aligned)
        doc
            .fillColor(secondaryColor)
            .text('Patient:', 380, 120, { continued: true })
            .fillColor('#000')
            .text(` ${data.patient.name}`)
            .fillColor(secondaryColor)
            .text('Date:', 380, 135, { continued: true })
            .fillColor('#000')
            .text(` ${new Date().toLocaleDateString()}`);

        doc.moveDown(4);

        // --- 3. Medical Symbol (Rx) ---
        doc
            .fillColor(primaryColor)
            .fontSize(28)
            .text('Rx', 50, 200);

        // --- 4. Prescription Body ---
        doc
            .fillColor('#000')
            .fontSize(12)
            .font('Helvetica')
            .text(data.instructions, 50, 240, {
                width: 500,
                align: 'left',
                lineGap: 6
            });

        // --- 5. Follow-up Section ---
        if (data.followUpDate) {
            const yPos = doc.y + 40;
            doc
                .rect(50, yPos, 500, 30)
                .fill(lightGray);
            
            doc
                .fillColor(primaryColor)
                .fontSize(11)
                .text(`Next Follow-up Date: ${new Date(data.followUpDate).toLocaleDateString()}`, 65, yPos + 10);
        }

        // --- 6. Footer & Signature Area ---
        const footerTop = 750;
        doc
            .moveTo(50, footerTop)
            .lineTo(200, footerTop)
            .strokeColor(secondaryColor)
            .stroke();

        doc
            .fillColor(secondaryColor)
            .fontSize(10)
            .text("Doctor's Digital Signature", 50, footerTop + 5);

        doc
            .fontSize(8)
            .fillColor('#999')
            .text('This prescription is valid only with a digital verification link.', 50, 785, { align: 'center' });

        // Finalize the PDF
        doc.end();
    });
};


import { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import httpStatus from 'http-status'; // Assuming you use a library like this for 'status'



export const uploadPdfBufferToCloudinary = (
    pdfBuffer: Buffer, 
    prescriptionId: string
): Promise<IUploadPdfSuccessResult> => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinaryInstance.uploader.upload_stream(
            { 
                folder: 'ph-health-care/images/prescriptions', 
                resource_type: 'raw', 
                public_id: `prescription_${prescriptionId}` 
            },
            (error: UploadApiErrorResponse | undefined, cloudinaryResult: UploadApiResponse | undefined) => {
                if (error) {
                    const errorResult: IUploadPdfFailedResult = {
                        message: error.message || "failed to upload prescription pdf buffer in cloudinary",
                        statusCode: httpStatus.BAD_REQUEST
                    };
                    return reject(errorResult);
                }

                if (cloudinaryResult) {
                    const successResult: IUploadPdfSuccessResult = {
                        secure_url: cloudinaryResult.secure_url,
                        public_id: cloudinaryResult.public_id,
                        original_filename: cloudinaryResult.original_filename,
                    };
                    resolve(successResult);
                } else {
                    reject({
                        message: "Cloudinary returned no result",
                        statusCode: httpStatus.INTERNAL_SERVER_ERROR
                    } as IUploadPdfFailedResult);
                }
            }
        );

        uploadStream.end(pdfBuffer);
    });
};
   
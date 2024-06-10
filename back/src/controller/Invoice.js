import User from "../model/UserModel.js";
import InvoiceModel from "../model/InvoiceModel.js";
import sendEmail from "../config/Mailer.js";

// Crea la factura de los usuarios que hayan hehco una transaccion exitosa y la envia por correo
export const createInvoiceUsingUserEmail = async (req, res) => {
    const {email} = req.params;
    const {amount, currency, status, created, invoiceNumber} = req.body;

    try {
        // Verificar que el usuario existe
        const user = await User.findOne({where: {email: email}});
        if (!user) {
            return res.status(404).json({error: "Usuario no encontrado"});
        }

        // Verificar que 'created' es una fecha válida
        const createdDate = new Date(parseInt(created));
        if (isNaN(createdDate.getTime())) {
            return res.status(400).json({error: "Fecha de creación inválida"});
        }

        // Crear la factura en la base de datos
        const invoice = await InvoiceModel.create({
            userId: user.id,
            invoiceNumber,
            amount,
            currency,
            status,
            created: createdDate
        });

        // Crear el contenido del correo en formato de texto plano
        const emailContent =
            `Hola ${user.name},
            Gracias por tu pago de ${(amount / 100).toFixed(2)} ${currency.toUpperCase()}. Tu factura ha sido creada con éxito.

            Detalles del pago:
            - Número de Factura: ${invoiceNumber}
            - Monto: ${(amount / 100).toFixed(2)} ${currency.toUpperCase()}
            - Estado: ${status}
            - Fecha: ${createdDate.toLocaleString()}

            Si tienes alguna pregunta, no dudes en contactarnos.

            Saludos,
            El equipo de nuestra aplicación
        `;

        // Enviar correo de recordatorio
        await sendEmail(email, 'Factura Creada', emailContent);

        return res.status(201).json({message: "Factura creada correctamente", invoice});
    } catch (error) {
        console.error("Error creando la factura:", error);
        return res.status(500).json({error: "Error creando la factura"});
    }
};

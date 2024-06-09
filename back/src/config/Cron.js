import cron from 'node-cron';
import User from '../model/UserModel.js';
import { Op } from 'sequelize';

cron.schedule('0 0 * * *', async () => { // Ejecutar cada día a medianoche
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    try {
        await User.update(
            { tempPassword: '', tempPasswordCreatedAt: null },
            {
                where: {
                    tempPasswordCreatedAt: {
                        [Op.lt]: oneDayAgo
                    }
                }
            }
        );
        console.log('Contraseñas temporales limpiadas');
    } catch (error) {
        console.error('Error limpiando las contraseñas temporales:', error);
    }
});
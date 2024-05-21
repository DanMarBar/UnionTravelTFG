import Place from "../model/PlaceModel.js";

// Crea un lugar
export const createPlace = async (req, res) => {
    const {name, localization, description, image} = req.body;
    try {
        const newPlace = await Place.create({
            name,
            localization,
            description,
            image
        });
        return res.json(newPlace);
    } catch (error) {
        console.error(error);
        return res.status(500).send("Error al crear el lugar");
    }
};

// Obtiene todos los lugares
export const getAllPlaces = async (req, res) => {
    try {
        const places = await Place.findAll();
        return res.json(places);
    } catch (error) {
        console.error(error);
        return res.status(500).send("Error al obtener los lugares");
    }
};

// Obtiene un lugar por ID
export const getPlaceById = async (req, res) => {
    const {id} = req.params;
    try {
        const place = await Place.findByPk(id);
        return res.json(place);
    } catch (error) {
        console.error(error);
        return res.status(500).send("Error al obtener el lugar");
    }
};

// Actualiza un lugar
export const updatePlace = async (req, res) => {
    const {id, name, localization, description, image} = req.body;
    try {
        await Place.update({
            name: name,
            localization: localization,
            description: description,
            image: image
        }, {
            where: {id}
        });
        return res.send("Actualización del lugar exitosa");
    } catch (error) {
        console.error(error);
        return res.status(500).send("Error al actualizar el lugar");
    }
};

// Elimina un lugar
export const deletePlace = async (req, res) => {
    const {id} = req.params;
    try {
        await Place.destroy({
            where: {id}
        });
        return res.send("Lugar eliminado exitosamente");
    } catch (error) {
        console.error(error);
        return res.status(500).send("Error al eliminar el lugar");
    }
};

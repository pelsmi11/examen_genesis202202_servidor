const Proyecto = require('../models/Proyecto');
const { validationResult } = require('express-validator');
const router = require('../routes/proyectos');

exports.crearProyecto = async (req, res, next) => {

    // Revisar si hay errores
    const errores = validationResult(req);
    if(!errores.isEmpty()){
        return res.status(400).json({errores: errores.array()});
    }

    try {
        // Crear un nuevo proyecto
        const proyecto = new Proyecto(req.body);
        //guardar el creador via JWT
        proyecto.creador = req.usuario.id;
        // guardar el proyecto
        proyecto.save();
        res.json(proyecto);
        
    } catch (error) {
        console.log(error);
        res.estatus(500).send('Hubo un error en proyectos crear proyectos');
        
    }

}

// Obtiene todos los proyectos del usuario actual
exports.obternerProyectos = async (req, res, next) =>{
    try {
        //console.log(req.usuario);
        const proyectos = await Proyecto.find({ creador: req.usuario.id}).sort({creado: -1});
        res.json({proyectos});
    } catch (error) {
        console.log(error);
        res.status(500).send('Hubo un error en proyecto get')
    }
}

// Actualiza un proyecto 
exports.actualizarProyecto =  async (req, res, next) => {

    // Revisar si hay errores
    const errores = validationResult(req);
    if(!errores.isEmpty()){
        return res.status(400).json({errores: errores.array()});
    }

    // Extraer la informacion del proyecto
    const {nombre} = req.body;

    const nuevoProyecto = {};

    if(nombre){
        nuevoProyecto.nombre = nombre;
    }

    try {
        // revisar el ID del proyecto
        let proyecto = await Proyecto.findById(req.params.id);

        // si el proyecto existe o no
        if(!proyecto){
            return res.status(404).json({msg: 'Proyecto no encontrado'})
        }

        // verificar el creador del proyecto
        if(proyecto.creador.toString() !== req.usuario.id){
            return res.status(401).json({msg :'No Autorizado'});
        }

        // actualizar 
        proyecto = await Proyecto.findByIdAndUpdate({_id: req.params.id}, { $set : nuevoProyecto}, {new: true});

        res.json({proyecto});
        
    } catch (error) {
        console.log(error);
        res.status(500).send('Error en el servidor: proyectocontroller put');
    }
}

// Eliminar un Proyecto por su id
exports.eliminarProyecto= async  (req, res) => {
    try {
        // revisar el ID del proyecto
        let proyecto = await Proyecto.findById(req.params.id);

        // si el proyecto existe o no
        if(!proyecto){
            return res.status(404).json({msg: 'Proyecto no encontrado'})
        }

        // verificar el creador del proyecto
        if(proyecto.creador.toString() !== req.usuario.id){
            return res.status(401).json({msg :'No Autorizado'});
        }

        //eliminar
        await Proyecto.findOneAndRemove({_id: req.params.id});
        res.json({msg: `Proyecto Eliminado : ${req.params.id}`})
    } catch (error) {
        console.log(error);
        res.status(500).send('Error en el servidor: proyectocontroller delete');
    }
}
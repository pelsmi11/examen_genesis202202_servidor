const Usuario = require('../models/Usuario');
const bcryptjs = require('bcryptjs');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');

exports.crearUsuario = async (req, res) => {

    // revisar si hay errores
    const errores = validationResult(req);
    if(!errores.isEmpty()){
        return res.status(400).json({errores: errores.array()});
    }

    // extraer email y password
    const {email,password} = req.body;

    try {
        //Revisar que el usuario registrado sea unico
        let usuario= await Usuario.findOne({email});

        if(usuario){
            return res.status(400).json({
                msg: 'El usuario ya existe'
            });
        }

        // crea el nuevo usuario 
        usuario = new Usuario(req.body);

        // Hashear el password 
        const salt = await bcryptjs.genSalt(10);
        usuario.password = await bcryptjs.hash(password,salt);

        //guardar usuario
        await usuario.save()

        // Crear y firmar el JWT 
        const payload = {
            usuario: {
                id: usuario.id,
                tipo_usuario: usuario.tipo_usuario
            }
        };

        //firmar el JWT 
        jwt.sign(payload, process.env.SECRETA,{
            expiresIn: 3600000
        }, (error, token)=>{
            if(error) throw error;

            // Mensaje de confirmación 
        res.json({token});
        }); 

        // Mensaje de confirmación 
        //res.json('Usuario creado correctamente');
    } catch (error) {
        console.log(error);
        res.status(400).send('Hubo un error');
    }
}


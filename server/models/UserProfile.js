var mongoose = require('mongoose')
	,Schema = mongoose.Schema;

//SCHEMA - MODELO CONVITE
var Convite = new mongoose.Schema({
    createdAt : { type: Date, default: Date.now },
    ingressos: Number
});

//SCHEMA - MODELO PET
var Pet = new mongoose.Schema({
    createdAt : { type: Date, default: Date.now },
    nome: String ,
    tipo: String ,
    raca: String ,
    sexo: String,
    nascim:  Date
});

//SCHEMA - MODELO PROFILE
var UserProfileSchema = new mongoose.Schema({
	user: {type : Schema.ObjectId, ref : 'User', index: { unique: true }},
    name: {
        first: String,
        last: String
    },
    birthday: Date,
    gender: String,
    avatar: {type: String, default: 'default-avatar.png' },
    bio: String,
    address:{
    	country: {type: String, default: 'Brazil' },
    	state: String,
    	city: String,    
        district: String,
    	street: String,
    	number: String,
    	complement: String,
    	geoLoc:{type: [Number], index: '2d'}
    },
    pets: [Pet],   //Pets do usuário
    petikets: Number,
    step1: {type: Boolean, default: false }, // PASSOS PROMOCIONAIS DA LANDING
    step2: {type: Boolean, default: false },
    step3: {type: Boolean, default: false }


});

//---- Métodos do perfil -----------------------------------------
UserProfileSchema.methods.newPet = function(petObj, callback){
    var pet = {
        name: petObj.name,
        tipo: petObj.tipo,
        raca: petObj.raca,
        raca: petObj.sexo,
        nascim: petObj.nascim
    };
    this.pets.push(pet);
    this.save();
    callback(null, this);
};



//------- Exporta as funções --------------------------------------
module.exports = {
    //Exporta o modelo
    UserProfile: mongoose.model('UserProfile', UserProfileSchema),

    //Cria perfil ao cadastrar novo usuario
    addProfile:  function(user, callback) {
        var profile = new module.exports.UserProfile({
            user: user,
            petikets : 25
        });
        profile.save(function(err){
            console.log(err);
            if(err)
              return callback("ErrorCreatingProfile");
        });
        callback(null, profile);
    },
    addProfileSocial:  function(profileSocial, user, callback) {
        var profile = new module.exports.UserProfile({
            user: user,
            petikets : 25,
            name:{
                first: profileSocial.givenName,
                last: profileSocial.familyName
            }
        });
        profile.save(function(err){
            console.log(err);
            if(err)
              return callback("ErrorCreatingProfile");
        });
        callback(null, profile);
    }
};
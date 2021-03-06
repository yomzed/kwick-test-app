/* ----------------------
Utilisation de l'API Kwick
Contrôleur Chat
Ecole multimédia - 30/01/2017
Yoan Martinez
------------------------- */

/* Contrôleur du chat */
app.controller('ChatCtrl', ['$http', '$scope', '$rootScope', '$localStorage', '$interval', 'kwFactory', 'kwConst', function($http, $scope, $rootScope, $localStorage, $interval, kwFactory, kwConst){
	let chat 				 = this;
	chat.messages 	 = [];
	chat.membersList = [];

	/* Scroll auto */
	chat.glue = true;

	/* Update auto */
	chat.tec = function(){
		chat.members(); // Mise à jour de la liste des membres
		chat.content(); // Mise à jour des messages
	}

	/* Update auto si connecté */
	$scope.$watch(function(rootScope){ return rootScope.logStatus; },
								function(newValue, oldValue){
									if(newValue == true){
										$rootScope.interval = $interval(chat.tec, 1000);
									}
								});
		

	/* Récupération des messages du chat */
	chat.content = function(){
		/* Définition du timestamp pour afficher les messages des deux derniers jours */
		let lastWeek = new Date();
   	lastWeek.setDate(lastWeek.getDate() - 7);
   	let timestamp = Math.round(lastWeek.getTime() / 1000);

		let url = kwConst.url + "talk/list/" + $localStorage.token + "/" + timestamp;
		
		/* Appel API */
		$http.jsonp(url).then(function(rep){
			if(chat.messages.length == rep.data.result.talk.length){
				/* Pas d'update si pas de nouveaux messages */
				return false;
			} else {
				/* Injection des messages */
				chat.messages = rep.data.result.talk;

				/* Traitement de la date */
				chat.messages.forEach(function(elem){
					elem.date = kwFactory.dateFormat(elem.timestamp);
					/* Déclaration du paramètre en ligne ou non */
					elem.online = false;
				});

				/* Ajout d'un flag si membre connecté */
				$scope.$watch(chat.membersList,
											function(newValue, oldValue){
												chat.messages.forEach(function(elem){
													let pos = chat.membersList.map(function(e){return e.name}).indexOf(elem.user_name);
													if(pos != -1){
														elem.online = true;
													}
												});
											});	
			}

			kwFactory.verifToken($localStorage.token);
		});
	} /* Fin récupération des messages */

	/* Liste des membres actifs */
	chat.members = function(){
		let url = kwConst.url + "user/logged/" + $localStorage.token;
		kwFactory.verifToken($localStorage.token);
		/* Appel API */
		$http.jsonp(url).then(function(rep){
			if(rep.data.result.status == "done"){
				chat.membersList = [];
				/* Vérification pour poser un flag lorsque le membre est l'utilisateur */
				rep.data.result.user.forEach(function(elem){
					let user = false;
					if(elem == $localStorage.user.login) { user = true; }
					chat.membersList.push({name : elem, you : user});
				});
			}
		});
	} /* Fin liste des membres */

	/* Envoi d'un nouveau message */
	chat.send = function(){
		if(chat.newMess){
			let newMess = encodeURIComponent(chat.newMess);
			let url = kwConst.url + "say/" + $localStorage.token + "/" + $localStorage.user.id + "/" + newMess;

			/* Appel API */
			$http.jsonp(url).then(function(rep){
				let form = document.getElementById('formSend');
				form.reset();
				/* Update des messages */
				chat.tec();
				chat.glue = true;
			});
		}
	} /* Fin envoi de message */

}]);
//Ensure the User namespace exists
if(window.User == null){
	User = {};
};

//Create the ResetPassword namespace
User.ResetPassword = {
	
	//Config
	passwordId: null,
	passwordConfirmId: null,
	submitId: null,
	feedbackId: null,
	resetHash: '',
	processingPage: '/user/process/ResetPassword.php',
	loginPage: '/',
	
	//Elements
	passwordEl: null,
	posswordConfirmEl: null,
	submitEl: null,
	feedbackEl: null,
	
	//Init Functions
	init: function(config){
		//Apply the config to this object
		$.extend(this, config);
		
		//Init Elements
		this.initElements();
		
		//Init the submit button
		this.initSubmit();
	},
	
	initElements: function(){
		this.passwordEl = $("#" + this.passwordId);
		this.passwordConfirmEl = $("#" + this.passwordConfirmId);
		this.submitEl = $("#" + this.submitId);
		this.feedbackEl = $("#" + this.feedbackId);
	},
	
	initSubmit: function(){
		this.submitEl.click($.proxy(this.submit, this));
	},
	
	submit: function(){
		//Hide the submit button
		this.submitEl.hide();
		
		//Make the request
		$.ajax({
			url: this.processingPage,
			context: this,
			dataType: 'json',
			type: 'post',
			data: {
				resetHash: this.resetHash,
				password: this.passwordEl.val(),
				password2: this.passwordConfirmEl.val()
			},
			success: function(response){
				if(response.good){
					this.feedbackEl.html(response.message);
					setTimeout($.proxy(function(){
						location.href = this.loginPage;
					}, this), 3000);
				}
				else{
					var errors = '<ul>';
					$.each(response.errors, function(index, error){
						errors += "<li>" + error + "</li>";
					});
					errors += "</ul>";
					this.feedbackEl.html(errors);
				}
			}
		});
	}

};
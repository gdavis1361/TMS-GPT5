//Ensure the User namespace exists
if(window.User == null){
	User = {};
};

//Create the ForgotPassword namespace
User.ForgotPassword = {
	
	//Config
	containerId: null,
	inputId: null,
	submitId: null,
	feedbackId: null,
	processingPage: '/user/process/ForgotPassword.php',
	
	//Elements
	containerEl: null,
	inputEl: null,
	submitEl: null,
	feedbackEl: null,
	
	//Init Functions
	init: function(config){
		//Apply the config to this object
		$.extend(this, config);
		
		//Init main container
		this.initContainerEl();
		
		//Init input el
		this.initInputEl();
		
		//Init feedback el
		this.initFeedbackEl();
		
		//Init the submit button
		this.initSubmit();
	},
	
	initContainerEl: function(){
		this.containerEl = $("#" + this.containerId);
	},
	
	initInputEl: function(){
		this.inputEl = $("#" + this.inputId);
	},
	
	initFeedbackEl: function(){
		this.feedbackEl = $("#" + this.feedbackId);
	},
	
	initSubmit: function(){
		this.submitEl = $("#" + this.submitId);
		$("#" + this.submitId).click($.proxy(this.submit, this));
	},
	
	submit: function(){
		$.ajax({
			url: this.processingPage,
			context: this,
			dataType: 'json',
			type: 'post',
			data: {
				user: this.inputEl.val()
			},
			success: function(response){
				if(response.good){
					this.containerEl.html(response.message);
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
var publickey;

//로그인 상태라면 로그아웃 버튼을 렌더링
function setLogin(){
	$("#menu_login").css({"display":"none"});
	$("#menu_join").css({"display":"none"});

	$("#menu_logout").css({"display":"block"});
	$("#menu_info").css({"display":"block"});
}

//로그아웃 상태라면 로그인, 회원가입 버튼을 렌더링
function setLogout(){
	$("#menu_logout").css({"display":"none"});
	$("#menu_info").css({"display":"none"});
	
	$("#menu_login").css({"display":"block"});
	$("#menu_join").css({"display":"block"});
}

function checkBytes(text, MAX_BYTES){
	var sum = 0;
	for(var i=0;i<text.length;i++){
		if(escape(text.charAt(i)).length>4){
			sum=sum+3;
		}else{
			sum++;
		}
	}
	if(sum>MAX_BYTES){
		return false;
	}else{
		return true;
	}
}


function check(str) {
	var regExp = /^[a-z0-9_]{6,16}$/;		
	if(str.length==0||!regExp.test(str)) {
		return false; 
	} else { 
		return true; 
	} 
}

function checkEmail(str) {
	var regExp = /^[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/i;
	if(str.length==0||!regExp.test(str)) {
		return false; 
	} else { 
		return true; 
	} 
}

function closeForm(target){
	$("#form_cover").remove();
}

function refreshTokens(){
	return $.ajax({
		"url":"/restapi/tokens",
		"type":"put"
	})
}

function openForm(form){
	$("#fullpage").append("<div id='form_cover'></div>");
	$("#form_cover").append(form);
	$("#form_cover").on("click",function(e){
		if($(e.target).attr("id")=="form_cover"){
			closeForm();
		}
	});
}

function openAlert(message){
	$("#fullpage").append("<div id='alert_cover' class='touchable'></div>");
	$("#alert_cover").append("<div id='alert_box' class='touchable'><div id='alert_message' class='touchable'>"+message+"</div></div>");
	$("#alert_cover").on("click",function(e){
		if($(e.target).attr("id")=="alert_cover"){
			closeAlert();
		}
	});
}

function closeAlert(){
	$("#alert_cover").remove();
}

function getInfo(){
	return $.ajax({
		"url":"/restapi/users",
		"type":"get"
	})
}

function getPublickey(){
	return $.ajax({
		"url":"/restapi/users/publickeys",
		"type":"get"
	})
}

function login(publickey){
	return $.ajax({
		"url":"/restapi/tokens",
		"type":"post",
		"data":{
			"user_id":$("#user_id").val(),
			"user_pw":encryptByRSA2048($("#user_pw").val(),publickey),
			"publickey":publickey
		}
	});
}

function getQuestions(){
	return 	$.ajax({
		"url":"/restapi/users/questions",
		"type":"get",
		"dataType":"json"
	});
}

function join(publickey){
	return $.ajax({
		"url":"/restapi/users",
		"type":"post",
		"dataType":"json",
		"data":{
			"user_id":$("#user_id").val(),
			"user_pw":encryptByRSA2048($("#user_pw").val(),publickey),
			"publickey":publickey,
			"user_name":$("#user_name").val(),
			"user_email":$("#user_email").val(),
			"question_id":$("#question_id").val(),
			"question_answer":encryptByRSA2048($("#question_answer").val(),publickey)
		}
	})
}

function scaleup() {
	var docElm = document.documentElement;
	if (docElm.requestFullscreen) {
		docElm.requestFullscreen();
	}
	else if (docElm.mozRequestFullScreen) {
		docElm.mozRequestFullScreen();
	}
	else if (docElm.webkitRequestFullScreen) {
		docElm.webkitRequestFullScreen();
	}
	$("#menu_scaleup").css({
		"display":"none"
	});
	$("#menu_scaledown").css({
		"display":"block"
	})
}

function scaledown() {
	if(document.exitFullscreen) {
		document.exitFullscreen();
	} else if(document.mozCancelFullScreen) {
	    document.mozCancelFullScreen();
	} else if(document.webkitExitFullscreen) {
		document.webkitExitFullscreen();
	}
	$("#menu_scaledown").css({
		"display":"none"
	});
	$("#menu_scaleup").css({
		"display":"block"
	})
}

$(document).ready(function(){
	
	var fullpage = $("#fullpage").initialize({});
	
	//임시주석처리
	$(document).on("click","#menu_scaleup",scaleup);
	$(document).on("click","#menu_scaledown",scaledown);
	
	//로그인 인증 여부를 검사하여 초기에 렌더링
	getInfo().done(function(result){
		setLogin();
	}).fail(function(){
		console.log("액세스 토큰에 문제가 있어 재발급 요청");
		refreshTokens().done(function(){
			console.log("액세스, 리프레쉬토큰 재발급 성공");
			getInfo().done(function(result){
				var user_info = result.user_info;
				console.log("정상적인 액세스 토큰으로 요청 성공");
				setLogin();
			})
		}).fail(function(xhr,status,error){
			setLogout();
		})
	})
	
	//로그아웃 이벤트 처리
	$(document).on("click","#menu_logout",function(){
		$.ajax({
			"url":"/restapi/tokens",
			"type":"delete"
		}).done(function(){
			setLogout();
		}).fail(function(xhr,status,error){
			openAlert(xhr.responseJSON.content);
			setLogout();
		})
	})
	
	//문제가 있는 입력은 클릭시 자동으로 초기화 되게 설정
	$(document).on("click",".input",function(e){
		if($(this).hasClass("wrong")){
			$(this).removeClass("wrong");
			$(this).val("");
			$("#error_message").text("");
		}
	})
	
	//로그인 이벤트 처리
    $(document).on("click","#login_button",function(e){
    	if(!check($("#user_id").val())){
    		$("#user_id").addClass("wrong");
    		$("#error_message").text("아이디는 6 - 16자리이하의 알파벳, 숫자로 구성되어야 합니다.");
    		return;
    	}else if(!check($("#user_pw").val())){
    		$("#user_pw").addClass("wrong");
    		$("#error_message").text("비밀번호는 6 - 16자리이하의 알파벳, 숫자로 구성되어야 합니다.");
    		return;
    	}
    	getPublickey()
    	.done(function(result){
    		var publickey = result.publickey;
    		login(publickey)
    		.done(function(result){
    			setLogin();
    			$("#form_cover").remove();
    		})
    		.fail(function(xhr, status, error){
        		$("#user_id").addClass("wrong");
        		$("#user_pw").addClass("wrong");
        		$("#error_message").text(xhr.responseJSON.content);
    		})
    	})
    	.fail(function(xhr, status, error){
    		$("#user_id").addClass("wrong");
    		$("#user_pw").addClass("wrong");
    		$("#error_message").text(xhr.responseJSON.content);
    	})
    });
	
	//회원가입 이벤트 처리
    $(document).on("click","#join_button",function(e){
    	if(!check($("#user_id").val())){
    		$("#user_id").addClass("wrong");
    		$("#error_message").text("아이디는 6 - 16자리이하의 알파벳, 숫자로 구성되어야 합니다.");
    		return;
    	}else if(!check($("#user_pw").val())){
    		$("#user_pw").addClass("wrong");
    		$("#error_message").text("비밀번호는 6 - 16자리이하의 알파벳, 숫자로 구성되어야 합니다.");
    		return;
    	}else if($("#user_pw").val()!= $("#user_pw_check").val()){
    		$("#user_pw").addClass("wrong");
    		$("#user_pw_check").addClass("wrong");
    		$("#error_message").text("비밀번호가 서로 일치하지 않습니다.");
    		return;
    	}else if(!checkBytes($("#user_name").val(),60)){
    		$("#user_name").addClass("wrong");
    		$("#error_message").text("이름은 영어로 60, 한글로 20자 이하여야 합니다.");
    		return;
    	}else if($("#user_name").val().length==0){
    		$("#user_name").addClass("wrong");
    		$("#error_message").text("이름은 공백일 수 없습니다.");
    		return;
    	}else if(!checkEmail($("#user_email").val())){
    		$("#user_email").addClass("wrong");
    		$("#error_message").text("이메일 형식이 올바르지 않습니다.");
    		return;
    	}else if($("#question_answer").length==0){
    		$("#question_answer").addClass("wrong");
    		$("#error_message").text("비밀번호 찾기 질문의 답은 반드시 입력해야 합니다.");
    		return;
    	}
    getPublickey()
    	.done(function(result){
    		var publickey = result.publickey;
    		join(publickey)
    		.done(function(result){
		    	$("#form_cover").remove();
    		})
    		.fail(function(xhr, status, error){
        		$("#error_message").text(xhr.responseJSON.content);
    		})
    	})
    	.fail(function(xhr, status, error){
    		$("#error_message").text(xhr.responseJSON.content);
    	})
    });
	
    $(document).on("click","#menu_login",function(e){
		var loginForm = $("<form id='loginForm'></form>");
		var innerBox = $("<div id='loginFormInnerBox'></div>");
		
		innerBox.append("<div class='subtitle'>로그인 정보</div><input id='user_id' class='input' name='user_id' type='text' autocomplete='off' placeholder='아이디'>");
		innerBox.append("<input id='user_pw' class='input' name='user_pw' type='password' autocomplete='off' placeholder='비밀번호'>");
		innerBox.append("<div id='error_message'></div>");
		innerBox.append("<input id='login_button' type='button' value='로그인'>");
		
		loginForm.append(innerBox);
		
		openForm(loginForm);
    });
    
    //회원가입창 렌더링
    $(document).on("click","#menu_join",function(e){		
		var joinForm = $("<form id='joinForm'></form>");
		var innerBox = $("<div id='joinFormInnerBox'></div>");
		
		innerBox.append("<div class='subtitle'>로그인 정보</div><input id='user_id' class='input' name='user_id' type='text' autocomplete='off' placeholder='아이디'>");
		innerBox.append("<input id='user_pw' class='input' name='user_pw' type='password' autocomplete='off' placeholder='비밀번호'>");
		innerBox.append("<input id='user_pw_check'class='input' name='user_pw_check' type='password' autocomplete='off' placeholder='비밀번호 확인'>");
		innerBox.append("<div class='subtitle'>개인 정보</div><input id='user_name' class='input' name='user_name' type='text' autocomplete='off' placeholder='이름'>");
		innerBox.append("<input id='user_email' class='input' name='user_email' type='text' autocomplete='off' placeholder='이메일'>");
		innerBox.append("<div class='subtitle'>비밀번호 찾기 질문</div><select id='question_id' class='input' name='question_id'></select>");
		innerBox.append("<input id='question_answer' class='input' name='question_answer' type='text' autocomplete='off' placeholder='비밀번호 찾기 질문의 정답'>");
		innerBox.append("<p id='error_message'></p>");
		innerBox.append("<input id='join_button' type='button' value='회원가입'>");

		joinForm.append(innerBox);
		
		//서버로부터 질문 목록을 발급받음
		getQuestions()
		.done(function(result){
			var i, list = result.list;
			for(i=0;i<list.length;i++){
				$("#question_id").append("<option value='"+list[i].question_id+"' label='"+list[i].question_content+"'></option>")
			}
		})
		.fail(function(xhr, status, error){
			openAlert(xhr.responseJSON.content);
		})
		openForm(joinForm);
    });
    
    $(document).on("click","#update_start_button",function(e){
    	$("#user_pw,#user_pw_check,#user_name,#user_email,#question_answer,#old_question_answer").prop("readonly",false);
    	$("#question_id").prop("disabled",false);
    	$("#update_start_button").css({"display":"none"});
    	$("#update_button,#update_cancel_button").css({"display":"block"});
    });
    
    $(document).on("click","#update_cancel_button",function(e){
    	$("#user_pw,#user_pw_check,#user_name,#user_email,#question_answer,#old_question_answer").prop("readonly",true);
    	$("#question_id").prop("disabled",true);
    	$("#update_start_button").css({"display":"block"});
    	$("#update_button,#update_cancel_button").css({"display":"none"});
    });
    
    $(document).on("click","#menu_info",function(e){
    	var infoForm = $("<form id='infoForm'></form>");
		var innerBox = $("<div id='infoFormInnerBox'></div>");
		
		innerBox.append("<div class='subtitle'>신규 로그인 정보</div><input id='user_id' class='input' name='user_id' type='text' autocomplete='off' placeholder='아이디' readonly>");
		innerBox.append("<input id='user_pw' class='input' name='user_pw' type='password' autocomplete='off' placeholder='신규 비밀번호' readonly>");
		innerBox.append("<input id='user_pw_check'class='input' name='user_pw_check' type='password' autocomplete='off' placeholder='신규 비밀번호 확인' readonly>");
		innerBox.append("<div class='subtitle'>신규 개인 정보</div><input id='user_name' class='input' name='user_name' type='text' autocomplete='off' placeholder='이름' readonly>");
		innerBox.append("<input id='user_email' class='input' name='user_email' type='text' autocomplete='off' placeholder='신규 이메일' readonly>");
		innerBox.append("<div class='subtitle'>신규 비밀번호 찾기 질문</div><select id='question_id' class='input' name='question_id' disabled></select>");
		innerBox.append("<input id='question_answer' class='input' name='question_answer' type='text' autocomplete='off' placeholder='신규 비밀번호 찾기 질문의 정답' readonly>");
		
		innerBox.append("<div class='subtitle'>기존 비밀번호 찾기 질문</div>");
		innerBox.append("<div id='old_question_id' class='input' name='old_question_id'></div>");
		innerBox.append("<input id='old_question_answer' class='input' name='question_answer' type='text' autocomplete='off' placeholder='기존 비밀번호 찾기 질문의 정답' readonly>");
		
		innerBox.append("<p id='error_message'></p>");
		innerBox.append("<input id='update_start_button' type='button' value='정보 변경 시작'>");
		innerBox.append("<div style='display:flex;'><input id='update_button' type='button' value='정보 변경 완료'><input id='update_cancel_button' type='button' value='정보 변경 취소'></div>")

		
		infoForm.append(innerBox);
		
		//서버로부터 질문 목록을 발급받음
		getQuestions()
		.done(function(result){
			var i, list = result.list;
			for(i=0;i<list.length;i++){
				$("#question_id").append("<option value='"+list[i].question_id+"' label='"+list[i].question_content+"'></option>")
			}
			
			$.ajax({
				"url":"/restapi/users",
				"type":"get",
				"dataType":"json"
			}).done(function(result){
				var user = result.user;
				$("#infoForm #user_id").val(user.user_id);
				$("#infoForm #user_name").val(user.user_name);
				$("#infoForm #user_email").val(user.user_email);
				$("#infoForm #question_id option[value='"+user.question_id+"']").prop("selected",true);
				$("#infoForm #old_question_id").text(user.question_content);
			}).fail(function(xhr,status,error){
				if(xhr.status==401){
					refreshTokens()
					.done(function(result){
						$.ajax({
							"url":"/restapi/users",
							"type":"get",
							"dataType":"json"
						})
						.done(function(result){
							var user = result.user;
							$("#infoForm #user_id").val(user.user_id);
							$("#infoForm #user_name").val(user.user_name);
							$("#infoForm #user_email").val(user.user_email);
							$("#infoForm #question_id option[value='"+user.question_id+"']").prop("selected",true);
							$("#infoForm #old_question_id").text(user.question_content);
						})
						.fail(function(xhr, status, error){
							openAlert(xhr.responseJSON.content);
							setLogout();								
						})
					})
					.fail(function(xhr, status, error){
						openAlert(xhr.responseJSON.content);
						setLogout();						
					})
				}else{
					openAlert(xhr.responseJSON.content);
					setLogout();
				}
			})			
		})
		.fail(function(xhr, status, error){
			openAlert(xhr.responseJSON.content);
		})
		openForm(infoForm);
    })
    
    $(document).on("click","#update_button",function(e){
    	var data = {};
    	
    	if($("#user_pw").val().length!=0&&!check($("#user_pw").val())){
    		$("#user_pw").addClass("wrong");
    		$("#error_message").text("비밀번호는 6 - 16자리이하의 알파벳, 숫자로 구성되어야 합니다.");
    		return;
    	}else if($("#user_pw").val()!= $("#user_pw_check").val()){
    		$("#user_pw").addClass("wrong");
    		$("#user_pw_check").addClass("wrong");
    		$("#error_message").text("비밀번호가 서로 일치하지 않습니다.");
    		return;
    	}else if($("#user_name").val().length!=0&&!checkBytes($("#user_name").val(),60)){
    		$("#user_name").addClass("wrong");
    		$("#error_message").text("이름은 영어로 60, 한글로 20자 이하여야 합니다.");
    		return;
    	}else if($("#user_email").val().length!=0&&!checkEmail($("#user_email").val())){
    		$("#user_email").addClass("wrong");
    		$("#error_message").text("이메일 형식이 올바르지 않습니다.");
    		return;
    	}else if($("#old_question_answer").val().length==0){
    		$("#old_question_answer").addClass("wrong");
    		$("#error_message").text("비밀번호 찾기 질문의 답은 반드시 입력해야 합니다.");
    		return;
    	}else if(!(($("#user_pw").val().length==0&&$("#user_pw_check").val().length==0&&$("#question_answer").val().length==0)||($("#user_pw").val().length!=0&&$("#user_pw_check").val().length!=0&&$("#question_answer").val().length!=0))){
    		$("#user_pw").addClass("wrong");
    		$("#user_pw_check").addClass("wrong");
    		$("#question_answer").addClass("wrong");
    		$("#error_message").text("비밀번호를 변경하려면 반드시 다른 정보도 변경되어야 합니다.");
    		console.log($("#user_pw").val().length+"\n"+$("#user_pw_check").val().length+"\n"+$("#question_answer").val().length);
    		return;
    	}
    	
   	
    	
    	getPublickey()
    	.done(function(result){
    		var publickey = result.publickey;
    		data.publickey = publickey;
    		data.old_question_answer = encryptByRSA2048($("#old_question_answer").val(),publickey)
    		
        	if((($("#user_pw").val().length==0&&$("#user_pw_check").val().length==0&&$("#question_answer").val().length==0)||($("#user_pw").val().length!=0&&$("#user_pw_check").val().length!=0&&$("#question_answer").val().length!=0))){
        		data.user_pw = encryptByRSA2048($("#user_pw").val(),publickey);
        		data.question_answer = encryptByRSA2048($("#question_answer").val(),publickey);
        		data.question_id = $("#question_id").val();
        	}
        	
        	if($("#user_name").length!=0){
        		data.user_name = $("#user_name").val();
        	}
        	
        	if($("#user_email").length!=0){
        		data.user_email = $("#user_email").val();
        	} 
    		
    		$.ajax({
    			"url" : "/restapi/users",
    			"type" : "put",
    			"dataType" : "json",
    			"data" : data
    		})
    		.done(function(result){
    			openAlert(result.content);
    			$("#update_cancel_button").click();
    		})
    		.fail(function(xhr, status, error){
    			if(xhr.status == 401){
    				refreshTokens()
    				.done(function(result){
    		    		$.ajax({
    		    			"url" : "/restapi/users",
    		    			"type" : "put",
    		    			"dataType" : "json",
    		    			"data" : data
    		    		})
    		    		.done(function(result){
    		    			openAlert(result.content);
    		    			$("#update_cancel_button").click();
    		    		})
    		    		.fail(function(xhr, status, error){
    		    			openAlert(xhr.responseJSON.content);
    		    		})
    				})
    				.fail(function(xhr, status, error){
    					openAlert(xhr.responseJSON.content);
    				})
    			}else{
    				openAlert(xhr.responseJSON.content);
    			}
    		})
    	})
    })
})
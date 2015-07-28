tasksController = function() {
	function errorLogger(errorCode, errorMessage) {
		console.log(errorCode +':'+ errorMessage);
	}
	//Função que conta as linhas que está dentro de tbody
	function taskCountChanged() {
		//Conta o total de linhas linhas e diminui pela quantidade de linhas que está com tarefas completadas
	    var count = ($(taskPage).find('#tblTasks tbody tr').length)-($(taskPage).find('#tblTasks tbody tr .taskCompleted:first-child').length);
	    $('footer').find('#taskCount').text(count);
	}
	//Limpar campos
	  function clearTask() {
	    $(taskPage).find('form').fromObject({});
	  }
	//Função para marcar as tarefas que estão atrasadas
	function renderTable() {
	    $.each($(taskPage).find('#tblTasks tbody tr'), function(idx, row) {
	      var due = Date.parse($(row).find('[datetime]').text());
	      if(due.compareTo(Date.today()) < 0) {
		$(row).addClass("overdue");
	      } else if (due.compareTo((2).days().fromNow()) <= 0) {
		$(row).addClass("warning");
	      }
	    });
	  }
	var taskPage;
	var initialised = false;   
	return {
				//Acrescentado parametro para aceitar function()
				init : function(page, callback) {
				if (initialised) {
				callback();
				} else {  
						taskPage = page;
						storageEngine.init(function() {
						storageEngine.initObjectStore('task', function() {
						callback();
				  }, errorLogger)
				}, errorLogger);
				$(taskPage).find( '[required="required"]' ).prev('label').append( '<span>*</span>').children( 'span').addClass('required');
				$(taskPage).find('tbody tr:even').addClass( 'even');
				$(taskPage).find( '#btnAddTask' ).click( function(evt) {
					evt.preventDefault();
					$(taskPage ).find('#taskCreation' ).removeClass( 'not');
				});
				$(taskPage).find('tbody tr' ).click(function(evt) {
					$(evt.target ).closest('td').siblings( ).andSelf( ).toggleClass( 'rowHighlight');
				});
				//Deleta a tarefa
				$(taskPage).find('#tblTasks tbody').on('click', '.deleteRow', function(evt) { 					
						console.log('teste');
						storageEngine.delete('task', $(evt.target).data().taskId, 
							function() {
								$(evt.target).parents('tr').remove(); 
								taskCountChanged();
							}, errorLogger);
					}
				);	
				//Salva a tarefa
				$(taskPage).find('#saveTask').click(function(evt) {
					evt.preventDefault();
					if ($(taskPage).find('form').valid()) {
						var task = $(taskPage).find('form').toObject();		
						storageEngine.save('task', task, function() {
							$(taskPage).find('#tblTasks tbody').empty();
							tasksController.loadTasks();
							clearTask();
							$(':input').val('');
							$(taskPage).find('#taskCreation').addClass('not');
						}, errorLogger);
					initialised = true;
					}				
				});
				//Edita a tarefa
				$(taskPage).find('#tblTasks tbody').on('click', '.editRow',function(evt){ 
								$(taskPage).find('#taskCreation').removeClass('not');
								storageEngine.findById('task', $(evt.target).data().taskId, function(task) {
									$(taskPage).find('form').fromObject(task);
								}, errorLogger);
							}
				);
				//Realiza a limpeza
				$(taskPage).find('#clearTask').click(function(evt) {
					  evt.preventDefault();
					  clearTask();
				});
				//Verificação de tarefas realizadas aplicando as cores que está no css
			       $(taskPage).find('#tblTasks tbody').on('click', '.completeRow', function(evt) {           
				  storageEngine.findById('task', $(evt.target).data().taskId, function(task) {
				    task.complete = true;
				    storageEngine.save('task', task, function() {
				      tasksController.loadTasks();
				      clearTask();
				    },errorLogger);
				  }, errorLogger);
				});
			}
    		},
			//Realiza o carregamento das tarefas
			loadTasks : function() {
			$(taskPage).find('#tblTasks tbody').empty();
			storageEngine.findAll('task',function(tasks) {
					//Ordenação pela data da tarefa 					
					tasks.sort(function(o2, o1) {
						  return Date.parse(o1.requiredBy).compareTo(Date.parse(o2.requiredBy));
					});
					$.each(tasks, function(index, task) {
					//Carrega a conclusão da tarefa
					if (!task.complete) {
						    task.complete = false;
					 }
					$('#taskRow').tmpl(task).appendTo($(taskPage).find( '#tblTasks tbody'));
					//Realiza a chamada para fazer a contagem						
					taskCountChanged();
					renderTable();
					});
				}, 
				errorLogger);
		}
	}
}();

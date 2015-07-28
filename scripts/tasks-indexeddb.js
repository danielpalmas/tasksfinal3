storageEngine = function() {
  var initialized= false;
  return {
    init : function(successCallback, errorCallback) {
	  //Verificação se o navagor tem suporte ao IndexdDB
      if (window.indexedDB) {
		// Cria objeto que inicializa o banco
        var request = indexedDB.open(window.location.hostname+'DB');
        // Verifica se há algum erro
        request.onsuccess = function(event) {
          initialized = request.result;
          successCallback(null);
        }
        request.onerror = function(event) {
          errorCallback('storage_not_initalized', 'Não é possível realizar o armazenameto');
        }
      } else {
        errorCallback('storage_api_not_supported', 'O navegador não é suportável IndexedDB');
      }     
    },
    //Iniciando objeto de armazenamento
    initObjectStore  : function(type, successCallback, errorCallback) {
        if (!initialized) {
			errorCallback('storage_api_not_initialized', 'A API de armazenamento web não pode ser iniciado');
		}
        var exists = false;
        $.each(initialized.objectStoreNames, function(i, v) {
            if (v == type) {
              exists = true;
            }
        });
        if (exists) {
          successCallback(null);
        } else {
			var version = initialized.version+1;
			initialized.close();
			//Cria objeto que inicializa o banco
			var request = indexedDB.open(window.location.hostname+'DB', version);
			request.onsuccess = function(event) {
			  successCallback(null);
			}
			request.onerror = function(event) {
			  errorCallback('storage_not_initalized', 'Não é possível realizar o armazenameto');
			}
			//Cria a estrutura a ser utilizada
			request.onupgradeneeded = function(event) {
			  initialized = event.target.result;
			  // cria um objectStore e o ID único para o objeto criado da tarefa
				var objectStore = initialized.createObjectStore(type, { keyPath: "id", autoIncrement: true });
			}
        }
      },
      //Adiciona dados no banco
      save : function(type, obj, successCallback, errorCallback) { 
        if (!initialized) {
          errorCallback('storage_api_not_initialized', 'A API de armazenamento web não pode ser iniciado');
        }
        if (!obj.id) {
          delete obj.id ;
        } else {
          obj.id = parseInt(obj.id)
        }
        // Armazenando valores no novo objectStore.
        var tx = initialized.transaction([type], "readwrite");
        tx.oncomplete = function(event) {
          successCallback(obj);
        };
        tx.onerror = function(event) {
          errorCallback('transaction_error', 'Não é possível armazenar o objeto');
        };
        var objectStore = tx.objectStore(type);
        var request = objectStore.put(obj); //Atualiza a tarefa
        request.onsuccess = function(event) {
          obj.id = event.target.result
        }
        request.onerror = function(event) {
          errorCallback('object_not_stored', 'Não é possível armazenar o objeto');
        };
      },
      findAll : function(type, successCallback, errorCallback) { 
        if (!initialized) {
          errorCallback('storage_api_not_initialized', 'A API de armazenamento web não pode ser iniciado');
        }
        var result = [];
        var tx = initialized.transaction(type);
        var objectStore = tx.objectStore(type);
		//Realiza a pesquisa de todas tarefas
        objectStore.openCursor().onsuccess = function(event) {
			var cursor = event.target.result;
			if (cursor) {
				result.push(cursor.value);
				cursor.continue();
			} else {
				successCallback(result);
			}
        };        
      },
      //Deletando dados do banco de dados
      delete : function(type, id, successCallback, errorCallback) { 
        var obj = {};
        obj.id = id;
        // Armazenando valores no novo objectStore.
        var tx = initialized.transaction([type], "readwrite");
        tx.oncomplete = function(event) {
          successCallback(id);
        };
        tx.onerror = function(event) {
          console.log(event);
          errorCallback('transaction_error', 'Não é possível armazenar o objeto');
        };
        var objectStore = tx.objectStore(type);       
        var request = objectStore.delete(id);
        request.onsuccess = function(event) {       
        }
        request.onerror = function(event) {
          errorCallback('object_not_stored', 'Não é possível armazenar o objeto');
        };
      },
      findByProperty : function(type, propertyName, propertyValue, successCallback, errorCallback) {
        if (!initialized) {
          errorCallback('storage_api_not_initialized', 'A API de armazenamento web não pode ser iniciado');
        }
        var result = [];
        var tx = initialized.transaction(type);
        var objectStore = tx.objectStore(type);
        objectStore.openCursor().onsuccess = function(event) {
          var cursor = event.target.result;
          if (cursor) {
            if (cursor.value[propertyName] == propertyValue) {
              result.push(cursor.value);
            }
            cursor.continue();
          } else {
            successCallback(result);
          }
        };
      },
	  findById : function (type, id, successCallback, errorCallback)  {
		  if (!initialized) {
			errorCallback('storage_api_not_initialized', 'A API de armazenamento web não pode ser iniciado');
		  }
		  var tx = initialized.transaction([type]);
		  var objectStore = tx.objectStore(type);
		  var request = objectStore.get(id);
			request.onsuccess = function(event) {
			successCallback(event.target.result);
		  }
		  request.onerror = function(event) {
			errorCallback('object_not_stored', 'Não é possível armazenar o objeto');
		  };        
	  }
  }
}();

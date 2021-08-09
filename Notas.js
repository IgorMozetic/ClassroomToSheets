function importarNotaAlunos() {
    let sheet = googleSheetConnectionNotas()
     sheet.clear()
   const header = ["ID Curso",	"Nome do curso", "Data limite de entrega", "Data entrega atividade", "Status",	
     "Nome Externo",	"ID aluno", "Nome do aluno", 	"Nota","Nome Interno"];
     sendDataToSheet(sheet, header)
   let courses = getCoursesAtivos()
   courses.map((course)=> {
     let atividadesCurso = getCoursesWork(course.id);
     let x = 1
     atividadesCurso.forEach((atividade,)=>{
       let notas = getStudentGrade(atividade.id, course.id)
       notas.forEach((nota) =>{
         let dataCriacao = new Date(dueDateToDateString(atividade)).toLocaleString("pt-BR");
         let dataEnvio = "";
         if (nota.dataEnvio) {
          dataEnvio = new Date(nota.dataEnvio).toLocaleString("pt-BR");
         }
         else {
          dataEnvio = nota.dataEnvio;
         }
         let dados = [course.id, course.name,dataCriacao, dataEnvio, nota.status, atividade.title, nota.userId, nota.nome, nota.nota, `P${x}`];
       //  console.log([course.id, course.name, dataCriacao, dataEnvio, atividade.title, nota.userId, nota.nome, nota.nota, `P${x}`])
        sendDataToSheet(sheet, dados)
       });
       x += 1
     });
   });
 }
 
 
 function getCoursesWork(courseID){
   let listaAtividadesCompleta = [],
   options = {};
   do {
     let listaAtividadesRequest = Classroom.Courses.CourseWork.list(courseID, options);
     Array.prototype.push.apply(listaAtividadesCompleta, listaAtividadesRequest.courseWork)
     options.pageToken = listaAtividadesRequest.nextPageToken;
   } while(options.pageToken);
   return listaAtividadesCompleta.sort((a,b) => {
     return sortAtividadeArr(a,b);
   }).filter((atividade) => {
     if(atividade.maxPoints){
       return true;
     }else {
       return false;
     }
   });
 }
 
 function filterUndefined(element){
   if(element) return true;
   return false;
 }
 
 function sortAtividadeArr(a,b){  
   let data1 = dueDateToDateString(a);
   let data2 = dueDateToDateString(b);
   return new Date(data1) - new Date(data2);
 }
 
 function getSubmitions(courseId, courseWorkId){
   let listaSubmitionsCompleta = [],
   options = {};
   do {
     let listaSubmitionsRequest = Classroom.Courses.CourseWork.StudentSubmissions.list(courseId, courseWorkId, options);
     Array.prototype.push.apply(listaSubmitionsCompleta, listaSubmitionsRequest.studentSubmissions);
     options.pageToken = listaSubmitionsRequest.nextPageToken;
   } while(options.pageToken);
   return listaSubmitionsCompleta;
   
 }
 
 function getStudentGrade(atividadeCurso, cursoId){
     console.log("CursoID = " +cursoId+ " | atividadeID = " +atividadeCurso)
   let submissions = getSubmitions(cursoId, atividadeCurso);
   if (submissions) return submissions.map((submission)=>{
     console.log(submission)
       let data = ""
       if (submission.state != "CREATED" && submission.submissionHistory[1].stateHistory){
         data = submission.submissionHistory[1].stateHistory.stateTimestamp
       }
       let nomeAluno = Classroom.UserProfiles.get(submission.userId)
       let nota = submission.assignedGrade ? submission.assignedGrade : ""
       let status = "";
       if(data == ""){
         status = "Pendente"
       // } else if (submission.late){
       //   status = "Entregue com atrasado"
       } else{
         status = "Entregue"
       }
       return {nota:submission.assignedGrade, dataEnvio:data, nome: nomeAluno.name.fullName, userId: nomeAluno.id, status: status}
   }).filter((element) => {return filterUndefined(element)});
 }
 
 function googleSheetConnectionNotas(){
   var sheetActive = SpreadsheetApp.openById("1s0kHkj9F269N3X3ii0u0JOk--DMhGmqbsrJvzArSXqQ");
   var sheet = sheetActive.getSheetByName("Notas");
   return sheet;
 }
 
 function dueDateToDateString(atividade){
   let day = adicionarZeroAEsquerda(atividade.dueDate.day)
   let month = adicionarZeroAEsquerda(atividade.dueDate.month)
   let year = atividade.dueDate.year
   let hours = adicionarZeroAEsquerda(atividade.dueTime.hours)
   let minutes = "00";
   if(atividade.dueTime.minutes)
     minutes = adicionarZeroAEsquerda(atividade.dueTime.minutes)
   let dateString = `${year}-${month}-${day}T${hours}:${minutes}:00.000Z`
   return dateString;
 }
 
 function adicionarZeroAEsquerda(n) {
   if (n <= 9) {
     return "0" + n;
   }
   return n
 }
 
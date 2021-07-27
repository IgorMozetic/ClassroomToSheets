function importarNotaAlunos() {
    let sheet = googleSheetConnectionNotas()
    sheet.clear()
    const header = ["ID Curso", "Nome do curso", "Data de criação atividade", "Data ultima atualizacao de envio atividade",
        "Nome Externo", "ID aluno", "Nome do aluno", "Nota", "Nome Interno"];
    sendDataToSheet(sheet, header)
    let courses = getCourses()
    courses.map((course) => {
        let atividadesCurso = getCoursesWork(course.id);
        let x = 1
        atividadesCurso.forEach((atividade,) => {
            let notas = getStudentGrade(atividade.id, course.id)
            notas.forEach((nota) => {
                let dataCriacao = new Date(atividade.creationTime).toLocaleDateString("pt-BR");
                let dataEnvio = "";
                if (nota.dataEnvio) {
                    dataEnvio = new Date(nota.dataEnvio).toLocaleDateString("pt-BR");
                }
                else {
                    dataEnvio = nota.dataEnvio;
                }
                let dados = [course.id, course.name, dataCriacao, dataEnvio, atividade.title, nota.userId, nota.nome, nota.nota, `P${x}`];
                sendDataToSheet(sheet, dados)
            });
            x += 1
        });
    });
}


function getCoursesWork(courseID) {
    let listaAtividadesCompleta = [],
        options = {};
    do {
        let listaAtividadesRequest = Classroom.Courses.CourseWork.list(courseID, options);
        Array.prototype.push.apply(listaAtividadesCompleta, listaAtividadesRequest.courseWork)
        options.pageToken = listaAtividadesRequest.nextPageToken;
    } while (options.pageToken);
    return listaAtividadesCompleta.sort((a, b) => {
        return sortAtividadeArr(a, b);
    });
}

function filterUndefined(element) {
    if (element) return true;
    return false;
}

function sortAtividadeArr({ creationTime: data1 } = a, { creationTime: data2 } = b) {
    return new Date(data1) - new Date(data2);
}

function getSubmitions(courseId, courseWorkId) {
    let listaSubmitionsCompleta = [],
        options = {};
    do {
        let listaSubmitionsRequest = Classroom.Courses.CourseWork.StudentSubmissions.list(courseId, courseWorkId, options);
        Array.prototype.push.apply(listaSubmitionsCompleta, listaSubmitionsRequest.studentSubmissions);
        options.pageToken = listaSubmitionsRequest.nextPageToken;
    } while (options.pageToken);
    return listaSubmitionsCompleta;
}

function getStudentGrade(atividadeCurso, cursoId) {
    let submissions = getSubmitions(cursoId, atividadeCurso);
    if (submissions) return submissions.map((submission) => {
        let data = submission.updateTime ? submission.updateTime : submission.createdTime
        let nomeAluno = Classroom.UserProfiles.get(submission.userId)
        let nota = submission.assignedGrade ? submission.assignedGrade : ""
        return { nota: submission.assignedGrade, dataEnvio: data, nome: nomeAluno.name.fullName, userId: nomeAluno.id }
    }).filter((element) => { return filterUndefined(element) });
}

function googleSheetConnectionNotas() {
    var sheetActive = SpreadsheetApp.openById("1s0kHkj9F269N3X3ii0u0JOk--DMhGmqbsrJvzArSXqQ");
    var sheet = sheetActive.getSheetByName("Notas");
    return sheet;
}

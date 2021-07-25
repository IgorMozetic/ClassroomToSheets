function importClassroomToSheets() {
    let sheet = googleSheetsConnection();
    let data = new Date();
    //sendDataToSheet(sheet, ["Data", "CursoId", "NomeCurso", "AlunoID", "NomeAluno", EmailAluno])
    let listaCursos = getCourses();
    listaCursos.forEach((curso) => {
        let alunos = getStudents(curso.id);
        if (alunos) {
            //console.log(curso.name + " " + alunos.length)
            alunos.forEach((aluno) => {
                let sheetData = [data.toLocaleDateString("pt-BR"), curso.id, curso.name, aluno.id, aluno.nome, aluno.email]
                sendDataToSheet(sheet, sheetData)
            });
        }
    });
}

//Função para obter todos os cursos ativos do usuário Educacional Blueedtech
function getCourses() {
    let listaClassroomCompleta = [];
    let options = {};

    //Enquanto houver um nextPageToken, solicita os proximos 30 cursos
    do {
        let listaClassroomRequest = Classroom.Courses.list(options);
        //Adiciona os cursos do listaClassroomRequest no listaClassroomCompleta
        Array.prototype.push.apply(listaClassroomCompleta, listaClassroomRequest.courses);
        //Se houver um token, adiciona ao options
        options.pageToken = listaClassroomRequest.nextPageToken;
    } while (options.pageToken);
    //Filtra por cursos ativos do usuário Educacional Blueedtech
    return listaClassroomCompleta = listaClassroomCompleta.filter((classroom) => {
        if (classroom.ownerId === "107558995070093037568" && classroom.courseState === "ACTIVE") {
            return true;
        } else {
            return false;
        }
    });
}

//Função para obter todos os estudantes de um curso
function getStudents(courseID) {
    const listaAlunosCompleta = [];
    let options = {};

    //loop para buscar os estudantes enquanto houver um nextPageToken
    do {
        let alunosRequest = Classroom.Courses.Students.list(courseID, options)
        //adiciona os estudantes do alunosRequest no listaAlunosCompleta
        Array.prototype.push.apply(listaAlunosCompleta, alunosRequest.students)
        //se houver um token, adiciona ao options
        options.pageToken = alunosRequest.nextPageToken
    } while (options.pageToken);
    //verifica se existem alunos para o curso,
    //Se sim, retorna a lista com objetos alunos
    if (listaAlunosCompleta) {
        return listaAlunosCompleta.map((aluno) => {
            let id = aluno.profile.id;
            let nome = aluno.profile.name.fullName;
            let email = aluno.profile.emailAddress;
            let dadosAlunos = { id, nome, email }
            return dadosAlunos
        });
    }
}

//conecta ao sheet
function googleSheetsConnection() {
    return sheet = SpreadsheetApp.getActiveSheet()
}

//envia dados ao sheet
function sendDataToSheet(sheet, data) {
    sheet.appendRow(data);
}
